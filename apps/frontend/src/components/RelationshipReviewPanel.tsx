import { useQuery } from '@apollo/client';
import { GET_JOBS } from '../graphql/queries';
import type { Job, JobResult } from '../types/schema';

/**
 * RelationshipReviewPanel Component
 * Epic 2.4: Discovery Interface
 *
 * Displays discovered relationships and their confidence scores
 * Note: Full relationship query/display will be implemented in Phase 3
 * For now, shows job results summary
 */

interface GetJobsResponse {
  jobs: Job[];
}

export function RelationshipReviewPanel(): JSX.Element {
  const { data, loading, error } = useQuery<GetJobsResponse>(GET_JOBS, {
    pollInterval: 5000, // Refresh every 5 seconds
  });

  if (loading && !data) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-bold text-white mb-4">Discovery Results</h2>
        <p className="text-gray-400">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-bold text-white mb-4">Discovery Results</h2>
        <p className="text-red-400">Error loading results: {error.message}</p>
      </div>
    );
  }

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
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4">Discovery Results</h2>

      {completedJobs.length === 0 ? (
        <div className="text-gray-400">
          <p>No completed discoveries yet.</p>
          <p className="text-sm mt-2">
            Start a discovery job to find relationships between columns.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Total Discoveries</p>
                <p className="text-3xl font-bold text-primary-400">
                  {completedJobs.length}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Relationships Found</p>
                <p className="text-3xl font-bold text-green-400">
                  {totalRelationships}
                </p>
              </div>
            </div>
          </div>

          {/* Job History */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
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
                    className="bg-gray-700 rounded-lg p-3 border-l-4 border-green-500"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">
                          {result?.relationshipsCreated || 0} relationships
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(job.completedAt!).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-green-400">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Future Enhancement Note */}
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-blue-400 font-semibold text-sm">
                  Coming in Phase 3
                </p>
                <p className="text-blue-300 text-sm mt-1">
                  Detailed relationship viewer with confidence scores, column
                  details, and validation controls will be available in the
                  Graph Visualization phase.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
