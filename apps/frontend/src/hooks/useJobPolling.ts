import { useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_JOB } from '../graphql/queries';
import type { Job } from '../types/schema';

/**
 * Custom hook for polling job status
 * Epic 2.4: Discovery Interface
 *
 * Automatically polls for job updates while job is running
 * and stops when job reaches a terminal state.
 *
 * @param jobId - The ID of the job to poll
 * @param interval - Polling interval in milliseconds (default: 1500ms)
 * @returns Job data and polling status
 */

interface GetJobResponse {
  job: Job | null;
}

interface UseJobPollingResult {
  job: Job | null;
  loading: boolean;
  error: Error | undefined;
  stopPolling: () => void;
}

export function useJobPolling(
  jobId: string | null,
  interval: number = 1500
): UseJobPollingResult {
  const [getJob, { data, loading, error }] = useLazyQuery<GetJobResponse>(GET_JOB, {
    fetchPolicy: 'network-only', // Always fetch fresh data
  });

  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = (): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsPolling(false);
    }
  };

  useEffect(() => {
    if (!jobId) {
      stopPolling();
      return;
    }

    // Start polling
    const pollJob = (): void => {
      getJob({ variables: { id: jobId } });
    };

    // Initial fetch
    pollJob();
    setIsPolling(true);

    // Set up polling interval
    intervalRef.current = setInterval(pollJob, interval);

    // Cleanup on unmount or when jobId changes
    return () => {
      stopPolling();
    };
  }, [jobId, interval, getJob]);

  // Stop polling when job reaches terminal state
  useEffect(() => {
    const job = data?.job;
    if (job) {
      const isTerminal =
        job.status === 'COMPLETED' ||
        job.status === 'FAILED' ||
        job.status === 'CANCELLED';

      if (isTerminal && isPolling) {
        stopPolling();
      }
    }
  }, [data, isPolling]);

  return {
    job: data?.job ?? null,
    loading,
    error,
    stopPolling,
  };
}
