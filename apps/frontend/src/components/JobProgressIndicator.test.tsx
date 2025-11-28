import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { JobProgressIndicator } from './JobProgressIndicator';
import { GET_JOB } from '../graphql/queries';
import type { Job } from '../types/schema';

/**
 * JobProgressIndicator Component Tests
 * Epic 2.4: Discovery Interface
 */

describe('JobProgressIndicator', () => {
  const mockRunningJob: Job = {
    id: 'job-123',
    type: 'discovery',
    status: 'RUNNING',
    progress: 45,
    createdAt: '2024-01-15T10:00:00Z',
    startedAt: '2024-01-15T10:00:05Z',
  };

  const mockCompletedJob: Job = {
    id: 'job-123',
    type: 'discovery',
    status: 'COMPLETED',
    progress: 100,
    createdAt: '2024-01-15T10:00:00Z',
    startedAt: '2024-01-15T10:00:05Z',
    completedAt: '2024-01-15T10:01:00Z',
    result: JSON.stringify({ relationshipsCreated: 42 }),
  };

  const mockFailedJob: Job = {
    id: 'job-123',
    type: 'discovery',
    status: 'FAILED',
    progress: 30,
    createdAt: '2024-01-15T10:00:00Z',
    startedAt: '2024-01-15T10:00:05Z',
    completedAt: '2024-01-15T10:00:30Z',
    error: 'Neo4j connection failed',
  };

  it('should display loading state initially', () => {
    const mock = {
      request: {
        query: GET_JOB,
        variables: { id: 'job-123' },
      },
      result: {
        data: { job: mockRunningJob },
      },
    };

    render(
      <MockedProvider mocks={[mock]} addTypename={false}>
        <JobProgressIndicator jobId="job-123" />
      </MockedProvider>
    );

    expect(screen.getByText(/loading job status/i)).toBeInTheDocument();
  });

  it('should display running job with progress bar', async () => {
    const mock = {
      request: {
        query: GET_JOB,
        variables: { id: 'job-123' },
      },
      result: {
        data: { job: mockRunningJob },
      },
    };

    render(
      <MockedProvider mocks={[mock]} addTypename={false}>
        <JobProgressIndicator jobId="job-123" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('RUNNING')).toBeInTheDocument();
    });

    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText(/analyzing relationships/i)).toBeInTheDocument();
  });

  it('should display completed job with results', async () => {
    const mock = {
      request: {
        query: GET_JOB,
        variables: { id: 'job-123' },
      },
      result: {
        data: { job: mockCompletedJob },
      },
    };

    render(
      <MockedProvider mocks={[mock]} addTypename={false}>
        <JobProgressIndicator jobId="job-123" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText(/discovery complete/i)).toBeInTheDocument();
    expect(
      screen.getByText(/created 42 similarity relationships/i)
    ).toBeInTheDocument();
  });

  it('should display failed job with error message', async () => {
    const mock = {
      request: {
        query: GET_JOB,
        variables: { id: 'job-123' },
      },
      result: {
        data: { job: mockFailedJob },
      },
    };

    render(
      <MockedProvider mocks={[mock]} addTypename={false}>
        <JobProgressIndicator jobId="job-123" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('FAILED')).toBeInTheDocument();
    });

    expect(screen.getByText(/discovery failed/i)).toBeInTheDocument();
    expect(screen.getByText('Neo4j connection failed')).toBeInTheDocument();
  });

  it('should call onComplete when job finishes', async () => {
    const onComplete = vi.fn();
    const mock = {
      request: {
        query: GET_JOB,
        variables: { id: 'job-123' },
      },
      result: {
        data: { job: mockCompletedJob },
      },
    };

    render(
      <MockedProvider mocks={[mock]} addTypename={false}>
        <JobProgressIndicator jobId="job-123" onComplete={onComplete} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should display error when job query fails', async () => {
    const mock = {
      request: {
        query: GET_JOB,
        variables: { id: 'job-123' },
      },
      error: new Error('Failed to load job'),
    };

    render(
      <MockedProvider mocks={[mock]} addTypename={false}>
        <JobProgressIndicator jobId="job-123" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading job/i)).toBeInTheDocument();
    });
  });

  it('should display job not found when job is null', async () => {
    const mock = {
      request: {
        query: GET_JOB,
        variables: { id: 'job-999' },
      },
      result: {
        data: { job: null },
      },
    };

    render(
      <MockedProvider mocks={[mock]} addTypename={false}>
        <JobProgressIndicator jobId="job-999" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/job not found/i)).toBeInTheDocument();
    });
  });
});
