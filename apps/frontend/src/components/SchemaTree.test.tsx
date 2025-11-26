import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { SchemaTree } from './SchemaTree';
import { GET_DATABASE } from '../graphql/queries';

/**
 * SchemaTree Component Tests
 * Epic 1.4: Schema Explorer UI
 *
 * Displays hierarchical tree: Database → Tables → Columns
 * TDD approach: Write tests first, then implement
 */

describe('SchemaTree', () => {
  const mockDatabaseData = {
    request: {
      query: GET_DATABASE,
      variables: { id: 'db-1' },
    },
    result: {
      data: {
        database: {
          id: 'db-1',
          name: 'Chinook',
          path: '/data/chinook.db',
          addedAt: '2024-01-15T10:00:00Z',
          tables: [
            {
              id: 'table-1',
              name: 'Artist',
              rowCount: 275,
              columns: [
                {
                  id: 'col-1',
                  name: 'ArtistId',
                  dataType: 'INTEGER',
                  primaryKey: true,
                  notNull: true,
                  defaultValue: null,
                  statistics: {
                    distinctCount: 275,
                    nullCount: 0,
                    minValue: '1',
                    maxValue: '275',
                  },
                },
                {
                  id: 'col-2',
                  name: 'Name',
                  dataType: 'NVARCHAR(120)',
                  primaryKey: false,
                  notNull: false,
                  defaultValue: null,
                  statistics: {
                    distinctCount: 275,
                    nullCount: 0,
                    minValue: null,
                    maxValue: null,
                  },
                },
              ],
            },
            {
              id: 'table-2',
              name: 'Album',
              rowCount: 347,
              columns: [
                {
                  id: 'col-3',
                  name: 'AlbumId',
                  dataType: 'INTEGER',
                  primaryKey: true,
                  notNull: true,
                  defaultValue: null,
                  statistics: {
                    distinctCount: 347,
                    nullCount: 0,
                    minValue: '1',
                    maxValue: '347',
                  },
                },
              ],
            },
          ],
        },
      },
    },
  };

  it('should display loading state initially', () => {
    render(
      <MockedProvider mocks={[mockDatabaseData]} addTypename={false}>
        <SchemaTree databaseId="db-1" />
      </MockedProvider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display database name after loading', async () => {
    render(
      <MockedProvider mocks={[mockDatabaseData]} addTypename={false}>
        <SchemaTree databaseId="db-1" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Chinook')).toBeInTheDocument();
    });
  });

  it('should display table list', async () => {
    render(
      <MockedProvider mocks={[mockDatabaseData]} addTypename={false}>
        <SchemaTree databaseId="db-1" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Artist')).toBeInTheDocument();
    });

    expect(screen.getByText('Album')).toBeInTheDocument();
  });

  it('should display table row counts', async () => {
    render(
      <MockedProvider mocks={[mockDatabaseData]} addTypename={false}>
        <SchemaTree databaseId="db-1" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/275 rows/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/347 rows/i)).toBeInTheDocument();
  });

  it('should expand table to show columns when clicked', async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider mocks={[mockDatabaseData]} addTypename={false}>
        <SchemaTree databaseId="db-1" />
      </MockedProvider>
    );

    // Wait for tables to load
    await waitFor(() => {
      expect(screen.getByText('Artist')).toBeInTheDocument();
    });

    // Columns should not be visible initially
    expect(screen.queryByText('ArtistId')).not.toBeInTheDocument();

    // Click on Artist table to expand
    const artistTable = screen.getByText('Artist');
    await user.click(artistTable);

    // Columns should now be visible
    await waitFor(() => {
      expect(screen.getByText('ArtistId')).toBeInTheDocument();
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should collapse table when clicked again', async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider mocks={[mockDatabaseData]} addTypename={false}>
        <SchemaTree databaseId="db-1" />
      </MockedProvider>
    );

    // Wait for tables to load
    await waitFor(() => {
      expect(screen.getByText('Artist')).toBeInTheDocument();
    });

    // Click to expand
    const artistTable = screen.getByText('Artist');
    await user.click(artistTable);

    // Wait for columns to appear
    await waitFor(() => {
      expect(screen.getByText('ArtistId')).toBeInTheDocument();
    });

    // Click again to collapse
    await user.click(artistTable);

    // Columns should be hidden
    await waitFor(() => {
      expect(screen.queryByText('ArtistId')).not.toBeInTheDocument();
    });
  });

  it('should display column data types', async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider mocks={[mockDatabaseData]} addTypename={false}>
        <SchemaTree databaseId="db-1" />
      </MockedProvider>
    );

    // Wait and expand table
    await waitFor(() => {
      expect(screen.getByText('Artist')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Artist'));

    // Check column data types
    await waitFor(() => {
      expect(screen.getByText(/INTEGER/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/NVARCHAR/i)).toBeInTheDocument();
  });

  it('should indicate primary key columns', async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider mocks={[mockDatabaseData]} addTypename={false}>
        <SchemaTree databaseId="db-1" />
      </MockedProvider>
    );

    // Wait and expand table
    await waitFor(() => {
      expect(screen.getByText('Artist')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Artist'));

    // Should have a primary key indicator (🔑 or similar)
    await waitFor(() => {
      const artistIdRow = screen.getByText('ArtistId').closest('div');
      expect(artistIdRow?.textContent).toMatch(/🔑|PK|primary/i);
    });
  });

  it('should call onTableSelect when table is clicked', async () => {
    const user = userEvent.setup();
    const onTableSelect = vi.fn();

    render(
      <MockedProvider mocks={[mockDatabaseData]} addTypename={false}>
        <SchemaTree databaseId="db-1" onTableSelect={onTableSelect} />
      </MockedProvider>
    );

    // Wait for tables to load
    await waitFor(() => {
      expect(screen.getByText('Artist')).toBeInTheDocument();
    });

    // Click on Artist table
    await user.click(screen.getByText('Artist'));

    // Callback should be called with table data
    expect(onTableSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'table-1',
        name: 'Artist',
      })
    );
  });

  it('should call onColumnSelect when column is clicked', async () => {
    const user = userEvent.setup();
    const onColumnSelect = vi.fn();

    render(
      <MockedProvider mocks={[mockDatabaseData]} addTypename={false}>
        <SchemaTree databaseId="db-1" onColumnSelect={onColumnSelect} />
      </MockedProvider>
    );

    // Wait and expand table
    await waitFor(() => {
      expect(screen.getByText('Artist')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Artist'));

    // Wait for column to appear
    await waitFor(() => {
      expect(screen.getByText('ArtistId')).toBeInTheDocument();
    });

    // Click on column
    await user.click(screen.getByText('ArtistId'));

    // Callback should be called with column data
    expect(onColumnSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'col-1',
        name: 'ArtistId',
        dataType: 'INTEGER',
        primaryKey: true,
      })
    );
  });

  it('should display error message on query failure', async () => {
    const errorMock = {
      request: {
        query: GET_DATABASE,
        variables: { id: 'db-1' },
      },
      error: new Error('Failed to fetch database'),
    };

    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <SchemaTree databaseId="db-1" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
