import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { START_DISCOVERY, CANCEL_JOB } from '../graphql/queries';
import type { StartDiscoveryResponse } from '../types/schema';
import { JobProgressIndicator } from './JobProgressIndicator';

/**
 * DiscoveryControlPanel Component
 * Epic 2.4: Discovery Interface
 *
 * Provides UI controls for starting and managing discovery jobs
 */

interface StartDiscoveryData {
  startDiscovery: StartDiscoveryResponse;
}

interface CancelJobData {
  cancelJob: boolean;
}

export function DiscoveryControlPanel(): JSX.Element {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const [startDiscovery, { loading: startLoading, error: startError }] =
    useMutation<StartDiscoveryData>(START_DISCOVERY, {
      onCompleted: (data) => {
        if (data.startDiscovery.success && data.startDiscovery.job) {
          setCurrentJobId(data.startDiscovery.job.id);
          setIsExpanded(true);
        }
      },
    });

  const [cancelJob, { loading: cancelLoading }] = useMutation<CancelJobData>(CANCEL_JOB);

  const handleStartDiscovery = async (): Promise<void> => {
    try {
      await startDiscovery();
    } catch (err) {
      console.error('Failed to start discovery:', err);
    }
  };

  const handleCancelJob = async (): Promise<void> => {
    if (!currentJobId) return;

    try {
      await cancelJob({ variables: { id: currentJobId } });
      setCurrentJobId(null);
    } catch (err) {
      console.error('Failed to cancel job:', err);
    }
  };

  const handleJobComplete = (): void => {
    // Job is complete, keep showing the results
    // User can start a new discovery if needed
  };

  return (
    <div className="bg-gray-800 rounded-lg mb-6">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Relationship Discovery</h2>
            <p className="text-sm text-gray-400 mt-1">
              Automatically discover relationships across databases
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            {isExpanded ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Start Discovery Button */}
          <div className="mb-6">
            <button
              onClick={handleStartDiscovery}
              disabled={startLoading || !!currentJobId}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all
                ${
                  startLoading || currentJobId
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }
              `}
            >
              {startLoading ? 'Starting Discovery...' : 'Start Discovery'}
            </button>

            {startError && (
              <p className="text-red-400 text-sm mt-2">
                Error: {startError.message}
              </p>
            )}
          </div>

          {/* Job Progress */}
          {currentJobId && (
            <div className="space-y-4">
              <JobProgressIndicator
                jobId={currentJobId}
                onComplete={handleJobComplete}
              />

              {/* Cancel Button */}
              <button
                onClick={handleCancelJob}
                disabled={cancelLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel Discovery'}
              </button>
            </div>
          )}

          {/* Information */}
          {!currentJobId && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">How it works:</h3>
              <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                <li>Analyzes column names for similarity</li>
                <li>Checks data type compatibility</li>
                <li>Detects foreign key patterns</li>
                <li>Creates SIMILAR_TO relationships with confidence scores</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
