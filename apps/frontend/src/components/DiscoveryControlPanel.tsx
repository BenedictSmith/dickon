import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { START_DISCOVERY, CANCEL_JOB } from '../graphql/queries';
import type { StartDiscoveryResponse } from '../types/schema';
import { JobProgressIndicator } from './JobProgressIndicator';

/**
 * DiscoveryControlPanel Component
 * Modern glassmorphism design for discovery job management
 */

interface StartDiscoveryData {
  startDiscovery: StartDiscoveryResponse;
}

interface CancelJobData {
  cancelJob: boolean;
}

export function DiscoveryControlPanel(): JSX.Element {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const [startDiscovery, { loading: startLoading, error: startError }] =
    useMutation<StartDiscoveryData>(START_DISCOVERY, {
      onCompleted: (data) => {
        if (data.startDiscovery.success && data.startDiscovery.job) {
          setCurrentJobId(data.startDiscovery.job.id);
        }
      },
    });

  const [cancelJob, { loading: cancelLoading }] =
    useMutation<CancelJobData>(CANCEL_JOB);

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
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-surface-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-cyber-500/20 border border-accent-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Relationship Discovery</h2>
              <p className="text-sm text-surface-400">Automatically discover cross-database relationships</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 rounded-xl bg-surface-800 hover:bg-surface-700 flex items-center justify-center transition-all duration-200"
            aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            <svg
              className={`w-5 h-5 text-surface-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="p-5">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left side - Action & Status */}
            <div className="flex-1 space-y-5">
              {/* Start Button & Status */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleStartDiscovery}
                  disabled={startLoading || !!currentJobId}
                  className="btn-glow flex items-center gap-2"
                >
                  {startLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Start Discovery</span>
                    </>
                  )}
                </button>

                {currentJobId && (
                  <button
                    onClick={handleCancelJob}
                    disabled={cancelLoading}
                    className="btn-danger flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{cancelLoading ? 'Cancelling...' : 'Cancel'}</span>
                  </button>
                )}
              </div>

              {startError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-400">{startError.message}</span>
                </div>
              )}

              {/* Job Progress */}
              {currentJobId && (
                <JobProgressIndicator
                  jobId={currentJobId}
                  onComplete={handleJobComplete}
                />
              )}
            </div>

            {/* Right side - Info */}
            {!currentJobId && (
              <div className="lg:w-80 p-5 rounded-xl bg-surface-800/50 border border-surface-700/50">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How it works
                </h3>
                <ul className="space-y-2">
                  {[
                    'Analyzes column names for similarity',
                    'Checks data type compatibility',
                    'Detects foreign key patterns',
                    'Creates SIMILAR_TO relationships',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-surface-300">
                      <svg className="w-4 h-4 text-accent-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
