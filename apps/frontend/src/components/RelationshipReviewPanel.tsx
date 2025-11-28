import { useQuery } from '@apollo/client';
import { GET_JOBS } from '../graphql/queries';
import type { Job, JobResult } from '../types/schema';

/**
 * RelationshipReviewPanel Component
 * Modern glassmorphism design for discovery results
 */

interface GetJobsResponse {
  jobs: Job[];
}

export function RelationshipReviewPanel(): JSX.Element {
  const { data, loading, error } = useQuery<GetJobsResponse>(GET_JOBS, {
    pollInterval: 5000,
  });

  const completedJobs =
    data?.jobs.filter((job) => job.status === 'COMPLETED') || [];
  const totalRelationships = completedJobs.reduce((sum, job) => {
    if (!job.result) return sum;
    try {
      const result = JSON.parse(job.result) as JobResult;
      return sum + (result.relationshipsCreated || 0);
    } catch {
      return sum;
    }
  }, 0);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-surface-700/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Discovery Results</h2>
            <p className="text-sm text-surface-400">Relationship discovery history</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {loading && !data ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-surface-400">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading results...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-red-400 mb-1">Error loading results</p>
            <p className="text-xs text-surface-500">{error.message}</p>
          </div>
        ) : completedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-surface-300 mb-2">No Discoveries Yet</h3>
            <p className="text-sm text-surface-500 max-w-xs">
              Start a discovery job to find relationships between columns across your databases
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-gradient-to-br from-accent-500/10 to-accent-600/10 border border-accent-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-sm text-surface-400">Total Discoveries</span>
                </div>
                <p className="text-4xl font-bold gradient-text">{completedJobs.length}</p>
              </div>
              <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <span className="text-sm text-surface-400">Relationships Found</span>
                </div>
                <p className="text-4xl font-bold text-emerald-400">{totalRelationships}</p>
              </div>
            </div>

            {/* Job History */}
            <div>
              <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Jobs
              </h3>
              <div className="space-y-2">
                {completedJobs.slice(0, 5).map((job) => {
                  const result = job.result
                    ? (JSON.parse(job.result) as JobResult)
                    : null;
                  return (
                    <div
                      key={job.id}
                      className="group flex items-center justify-between p-4 rounded-xl bg-surface-800/50 border border-surface-700/50 hover:border-emerald-500/30 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {result?.relationshipsCreated || 0} relationships
                          </p>
                          <p className="text-xs text-surface-500">
                            {new Date(job.completedAt!).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="badge badge-success text-xs">Completed</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phase 3 Enhancement Note */}
            <div className="rounded-xl bg-cyber-500/10 border border-cyber-500/20 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyber-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-cyber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-cyber-300">Graph Visualization Available</p>
                  <p className="text-sm text-cyber-400/80 mt-1">
                    View the discovered relationships in the interactive graph below, with confidence scores and column details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
