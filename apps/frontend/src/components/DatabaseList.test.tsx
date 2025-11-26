import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { DatabaseList } from './DatabaseList';
import { GET_DATABASES } from '../graphql/queries';

/**
 * DatabaseList Component Tests
 * Epic 1.4: Schema Explorer UI
 *
 * TDD approach: Write tests first, then implement
 */

describe('DatabaseList', () => {
  const mockDatabasesQuery = {
    request: {
      query: GET_DATABASES,
    },
    result: {
      data: {
        databases: [
          {
            id: 'db-1',
            name: 'Chinook',
            path: '/data/chinook.db',
            addedAt: '2024-01-15T10:00:00Z',
          },
          {
            id: 'db-2',
            name: 'Northwind',
            path: '/data/northwind.db',
            addedAt: '2024-01-16T11:30:00Z',
          },
        ],
      },
    },
  };

  it('should display loading state initially', () => {
    render(
      <MockedProvider mocks={[mockDatabasesQuery]} addTypename={false}>
        <DatabaseList />
      </MockedProvider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display list of databases after loading', async () => {
    render(
      <MockedProvider mocks={[mockDatabasesQuery]} addTypename={false}>
        <DatabaseList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Chinook')).toBeInTheDocument();
    });

    expect(screen.getByText('Northwind')).toBeInTheDocument();
  });

  it('should display database paths', async () => {
    render(
      <MockedProvider mocks={[mockDatabasesQuery]} addTypename={false}>
        <DatabaseList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('/data/chinook.db')).toBeInTheDocument();
    });

    expect(screen.getByText('/data/northwind.db')).toBeInTheDocument();
  });

  it('should display error message on query failure', async () => {
    const errorMock = {
      request: {
        query: GET_DATABASES,
      },
      error: new Error('Failed to fetch databases'),
    };

    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <DatabaseList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should display message when no databases exist', async () => {
    const emptyMock = {
      request: {
        query: GET_DATABASES,
      },
      result: {
        data: {
          databases: [],
        },
      },
    };

    render(
      <MockedProvider mocks={[emptyMock]} addTypename={false}>
        <DatabaseList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/no databases/i)).toBeInTheDocument();
    });
  });
});
