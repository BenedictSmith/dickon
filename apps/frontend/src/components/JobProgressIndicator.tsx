import { useEffect } from 'react';
import { useJobPolling } from '../hooks/useJobPolling';
import type { JobStatus, JobResult } from '../types/schema';

/**
 * JobProgressIndicator Component
 * Modern progress display with animated status indicators
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
      <div className="rounded-xl bg-surface-800/50 border border-surface-700/50 p-4">
        <div className="flex items-center gap-3 text-surface-400">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm">Loading job status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
        <div className="flex items-center gap-2 text-red-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{error.message}</span>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-xl bg-surface-800/50 border border-surface-700/50 p-4">
        <p className="text-surface-400 text-sm">Job not found</p>
      </div>
    );
  }

  const getStatusConfig = (status: JobStatus): {
    icon: JSX.Element;
    label: string;
    className: string;
  } => {
    switch (status) {
      case 'PENDING':
        return {
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: 'Pending',
          className: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'RUNNING':
        return {
          icon: (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ),
          label: 'Running',
          className: 'bg-cyber-500/20 text-cyber-300 border-cyber-500/30',
        };
      case 'COMPLETED':
        return {
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          label: 'Completed',
          className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      case 'FAILED':
        return {
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          label: 'Failed',
          className: 'bg-red-500/20 text-red-300 border-red-500/30',
        };
      case 'CANCELLED':
        return {
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ),
          label: 'Cancelled',
          className: 'bg-surface-600/50 text-surface-300 border-surface-500/30',
        };
    }
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
  const statusConfig = getStatusConfig(job.status);
  const isRunning = job.status === 'RUNNING';
  const isComplete = job.status === 'COMPLETED';
  const isFailed = job.status === 'FAILED';

  return (
    <div className="rounded-xl bg-surface-800/50 border border-surface-700/50 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isRunning ? 'bg-cyber-500/20' : isComplete ? 'bg-emerald-500/20' : isFailed ? 'bg-red-500/20' : 'bg-surface-700'
          }`}>
            {isRunning ? (
              <svg className="w-4 h-4 text-cyber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Discovery Job</h3>
            <p className="text-xs text-surface-500 font-mono">{job.id.slice(0, 16)}...</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusConfig.className}`}>
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-surface-400">Progress</span>
          <span className="text-xs font-semibold text-white">{job.progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-surface-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isComplete
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : isFailed
                  ? 'bg-gradient-to-r from-red-500 to-red-400'
                  : 'bg-gradient-to-r from-accent-500 to-cyber-500'
            }`}
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>

      {/* Running Animation */}
      {isRunning && (
        <div className="flex items-center gap-2 text-cyber-400">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs">Analyzing schema relationships...</span>
        </div>
      )}

      {/* Time Info */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-surface-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Started {new Date(job.createdAt).toLocaleTimeString()}</span>
        </div>
        {job.completedAt && (
          <div className="flex items-center gap-1.5 text-surface-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Completed {new Date(job.completedAt).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Success Result */}
      {isComplete && result?.relationshipsCreated !== undefined && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-300">Discovery Complete!</p>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                Created {result.relationshipsCreated} similarity relationships
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {isFailed && job.error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-300">Discovery Failed</p>
              <p className="text-xs text-red-400/80 mt-0.5">{job.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cancelled */}
      {job.status === 'CANCELLED' && (
        <div className="rounded-lg bg-surface-700/50 border border-surface-600/50 p-4">
          <p className="text-sm text-surface-400">Discovery was cancelled</p>
        </div>
      )}
    </div>
  );
}
