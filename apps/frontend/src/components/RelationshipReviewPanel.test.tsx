import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { RelationshipReviewPanel } from './RelationshipReviewPanel';
import { GET_JOBS } from '../graphql/queries';
import type { Job } from '../types/schema';

/**
 * RelationshipReviewPanel Component Tests
 * Epic 2.4: Discovery Interface
 */

describe('RelationshipReviewPanel', () => {
  const mockCompletedJobs: Job[] = [
    {
      id: 'job-1',
      type: 'discovery',
      status: 'COMPLETED',
      progress: 100,
      createdAt: '2024-01-15T10:00:00Z',
      startedAt: '2024-01-15T10:00:05Z',
      completedAt: '2024-01-15T10:01:00Z',
      result: JSON.stringify({ relationshipsCreated: 42 }),
    },
    {
      id: 'job-2',
      type: 'discovery',
      status: 'COMPLETED',
      progress: 100,
      createdAt: '2024-01-15T11:00:00Z',
      startedAt: '2024-01-15T11:00:05Z',
      completedAt: '2024-01-15T11:01:30Z',
      result: JSON.stringify({ relationshipsCreated: 28 }),
    },
  ];

  const mockJobsQuery = {
    request: {
      query: GET_JOBS,
    },
    result: {
      data: {
        jobs: mockCompletedJobs,
      },
    },
  };

  it('should display loading state initially', () => {
    render(
      <MockedProvider mocks={[mockJobsQuery]} addTypename={false}>
        <RelationshipReviewPanel />
      </MockedProvider>
    );

    expect(screen.getByText(/loading results/i)).toBeInTheDocument();
  });

  it('should display summary statistics for completed jobs', async () => {
    render(
      <MockedProvider mocks={[mockJobsQuery]} addTypename={false}>
        <RelationshipReviewPanel />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Discovery Results')).toBeInTheDocument();
    });

    // Total discoveries: 2 jobs
    expect(screen.getByText('2')).toBeInTheDocument();

    // Total relationships: 42 + 28 = 70
    expect(screen.getByText('70')).toBeInTheDocument();
  });

  it('should display recent job history', async () => {
    render(
      <MockedProvider mocks={[mockJobsQuery]} addTypename={false}>
        <RelationshipReviewPanel />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/recent jobs/i)).toBeInTheDocument();
    });

    expect(screen.getByText('42 relationships')).toBeInTheDocument();
    expect(screen.getByText('28 relationships')).toBeInTheDocument();
  });

  it('should display message when no completed jobs exist', async () => {
    const emptyMock = {
      request: {
        query: GET_JOBS,
      },
      result: {
        data: {
          jobs: [],
        },
      },
    };

    render(
      <MockedProvider mocks={[emptyMock]} addTypename={false}>
        <RelationshipReviewPanel />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/no completed discoveries yet/i)).toBeInTheDocument();
    });
  });

  it('should ignore non-completed jobs in statistics', async () => {
    const mixedJobsMock = {
      request: {
        query: GET_JOBS,
      },
      result: {
        data: {
          jobs: [
            ...mockCompletedJobs,
            {
              id: 'job-3',
              type: 'discovery',
              status: 'RUNNING',
              progress: 50,
              createdAt: '2024-01-15T12:00:00Z',
              startedAt: '2024-01-15T12:00:05Z',
            },
            {
              id: 'job-4',
              type: 'discovery',
              status: 'FAILED',
              progress: 30,
              createdAt: '2024-01-15T13:00:00Z',
              startedAt: '2024-01-15T13:00:05Z',
              completedAt: '2024-01-15T13:00:30Z',
              error: 'Connection failed',
            },
          ],
        },
      },
    };

    render(
      <MockedProvider mocks={[mixedJobsMock]} addTypename={false}>
        <RelationshipReviewPanel />
      </MockedProvider>
    );

    await waitFor(() => {
      // Should only count completed jobs
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('70')).toBeInTheDocument();
    });
  });

  it('should display error message on query failure', async () => {
    const errorMock = {
      request: {
        query: GET_JOBS,
      },
      error: new Error('Failed to fetch jobs'),
    };

    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <RelationshipReviewPanel />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading results/i)).toBeInTheDocument();
    });
  });

  it('should display future enhancement note', async () => {
    render(
      <MockedProvider mocks={[mockJobsQuery]} addTypename={false}>
        <RelationshipReviewPanel />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/coming in phase 3/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/detailed relationship viewer with confidence scores/i)
    ).toBeInTheDocument();
  });
});
