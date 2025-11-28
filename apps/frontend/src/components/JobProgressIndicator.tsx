import { useEffect } from 'react';
import { useJobPolling } from '../hooks/useJobPolling';
import type { JobStatus, JobResult } from '../types/schema';

/**
 * JobProgressIndicator Component
 * Epic 2.4: Discovery Interface
 *
 * Displays real-time progress updates for a discovery job
 * using polling to fetch job status
 */

interface JobProgressIndicatorProps {
  jobId: string;
  onComplete?: () => void;
}

export function JobProgressIndicator({
  jobId,
  onComplete,
}: JobProgressIndicatorProps): JSX.Element {
  const { job, loading, error } = useJobPolling(jobId);

  // Call onComplete when job finishes
  useEffect(() => {
    if (
      job &&
      (job.status === 'COMPLETED' ||
        job.status === 'FAILED' ||
        job.status === 'CANCELLED')
    ) {
      onComplete?.();
    }
  }, [job, onComplete]);

  if (loading && !job) {
    return (
      <div className="bg-gray-700 rounded-lg p-4">
        <p className="text-gray-400">Loading job status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
        <p className="text-red-400">Error loading job: {error.message}</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-gray-700 rounded-lg p-4">
        <p className="text-gray-400">Job not found</p>
      </div>
    );
  }

  const getStatusBadge = (status: JobStatus): JSX.Element => {
    const styles: Record<JobStatus, string> = {
      PENDING: 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
      RUNNING: 'bg-blue-900/30 text-blue-400 border-blue-700',
      COMPLETED: 'bg-green-900/30 text-green-400 border-green-700',
      FAILED: 'bg-red-900/30 text-red-400 border-red-700',
      CANCELLED: 'bg-gray-700 text-gray-400 border-gray-600',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold border ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  const parseResult = (resultJson: string | undefined): JobResult | null => {
    if (!resultJson) return null;
    try {
      return JSON.parse(resultJson) as JobResult;
    } catch {
      return null;
    }
  };

  const result = parseResult(job.result);
  const isRunning = job.status === 'RUNNING';
  const isComplete = job.status === 'COMPLETED';
  const isFailed = job.status === 'FAILED';

  return (
    <div className="bg-gray-700 rounded-lg p-4 space-y-4">
      {/* Header with Status Badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Discovery Progress</h3>
        {getStatusBadge(job.status)}
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Progress</span>
          <span className="text-sm font-semibold text-white">
            {job.progress}%
          </span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isComplete
                ? 'bg-green-500'
                : isFailed
                  ? 'bg-red-500'
                  : 'bg-primary-500'
            }`}
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Job ID</p>
          <p className="text-white font-mono text-xs truncate">{job.id}</p>
        </div>
        <div>
          <p className="text-gray-400">Type</p>
          <p className="text-white">{job.type}</p>
        </div>
        <div>
          <p className="text-gray-400">Created</p>
          <p className="text-white">
            {new Date(job.createdAt).toLocaleTimeString()}
          </p>
        </div>
        {job.completedAt && (
          <div>
            <p className="text-gray-400">Completed</p>
            <p className="text-white">
              {new Date(job.completedAt).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {/* Running Indicator */}
      {isRunning && (
        <div className="flex items-center space-x-2 text-blue-400">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-sm">Analyzing relationships...</span>
        </div>
      )}

      {/* Success Result */}
      {isComplete && result?.relationshipsCreated !== undefined && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
          <p className="text-green-400 font-semibold">Discovery Complete!</p>
          <p className="text-green-300 text-sm mt-1">
            Created {result.relationshipsCreated} similarity relationships
          </p>
        </div>
      )}

      {/* Error Display */}
      {isFailed && job.error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
          <p className="text-red-400 font-semibold">Discovery Failed</p>
          <p className="text-red-300 text-sm mt-1">{job.error}</p>
        </div>
      )}

      {/* Cancelled */}
      {job.status === 'CANCELLED' && (
        <div className="bg-gray-600 border border-gray-500 rounded-lg p-3">
          <p className="text-gray-300">Discovery was cancelled</p>
        </div>
      )}
    </div>
  );
}
