import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetailPanel } from './DetailPanel';
import type { Table, Column } from '../types/schema';

/**
 * DetailPanel Component Tests
 * Epic 1.4: Schema Explorer UI
 *
 * Displays detailed metadata for selected table or column
 * TDD approach: Write tests first, then implement
 */

describe('DetailPanel', () => {
  const mockTable: Table = {
    id: 'table-1',
    name: 'Artist',
    databaseId: 'db-1',
    rowCount: 275,
    columns: [
      {
        id: 'col-1',
        name: 'ArtistId',
        dataType: 'INTEGER',
        tableId: 'table-1',
        primaryKey: true,
        notNull: true,
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
        tableId: 'table-1',
        primaryKey: false,
        notNull: false,
        statistics: {
          distinctCount: 275,
          nullCount: 0,
        },
      },
    ],
  };

  const mockColumn: Column = {
    id: 'col-1',
    name: 'ArtistId',
    dataType: 'INTEGER',
    tableId: 'table-1',
    primaryKey: true,
    notNull: true,
    statistics: {
      distinctCount: 275,
      nullCount: 0,
      minValue: '1',
      maxValue: '275',
    },
  };

  describe('when no selection', () => {
    it('should display empty state message', () => {
      render(<DetailPanel />);
      expect(screen.getByText(/select a table or column/i)).toBeInTheDocument();
    });
  });

  describe('when table is selected', () => {
    it('should display table name', () => {
      render(<DetailPanel table={mockTable} />);
      expect(screen.getByText('Artist')).toBeInTheDocument();
    });

    it('should display table row count', () => {
      render(<DetailPanel table={mockTable} />);
      expect(screen.getByText(/275 rows/i)).toBeInTheDocument();
    });

    it('should display column count', () => {
      render(<DetailPanel table={mockTable} />);
      expect(screen.getByText(/2 columns/i)).toBeInTheDocument();
    });

    it('should display Table Details heading', () => {
      render(<DetailPanel table={mockTable} />);
      expect(screen.getByText(/table details/i)).toBeInTheDocument();
    });

    it('should list all column names', () => {
      render(<DetailPanel table={mockTable} />);
      expect(screen.getByText('ArtistId')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('should show column data types', () => {
      render(<DetailPanel table={mockTable} />);
      expect(screen.getByText(/INTEGER/i)).toBeInTheDocument();
      expect(screen.getByText(/NVARCHAR/i)).toBeInTheDocument();
    });
  });

  describe('when column is selected', () => {
    it('should display column name', () => {
      render(<DetailPanel column={mockColumn} />);
      expect(screen.getByText('ArtistId')).toBeInTheDocument();
    });

    it('should display Column Details heading', () => {
      render(<DetailPanel column={mockColumn} />);
      expect(screen.getByText(/column details/i)).toBeInTheDocument();
    });

    it('should display data type', () => {
      render(<DetailPanel column={mockColumn} />);
      expect(screen.getByText(/data type/i)).toBeInTheDocument();
      expect(screen.getByText('INTEGER')).toBeInTheDocument();
    });

    it('should indicate if column is primary key', () => {
      render(<DetailPanel column={mockColumn} />);
      expect(screen.getByText(/primary key/i)).toBeInTheDocument();
      expect(screen.getByText(/yes/i)).toBeInTheDocument();
    });

    it('should indicate if column is nullable', () => {
      render(<DetailPanel column={mockColumn} />);
      expect(screen.getByText(/nullable/i)).toBeInTheDocument();
      expect(screen.getByText(/no/i)).toBeInTheDocument();
    });

    it('should display statistics when available', () => {
      render(<DetailPanel column={mockColumn} />);
      expect(screen.getByText(/statistics/i)).toBeInTheDocument();
      expect(screen.getByText(/distinct values/i)).toBeInTheDocument();
      // Check that statistics section exists with distinct count
      const distinctValueLabel = screen.getByText(/distinct values/i);
      expect(distinctValueLabel).toBeInTheDocument();
    });

    it('should display null count', () => {
      render(<DetailPanel column={mockColumn} />);
      expect(screen.getByText(/null count/i)).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display min/max values when available', () => {
      render(<DetailPanel column={mockColumn} />);
      const minLabel = screen.getByText(/min value/i);
      const maxLabel = screen.getByText(/max value/i);

      expect(minLabel).toBeInTheDocument();
      expect(maxLabel).toBeInTheDocument();

      // Verify the statistics section contains min and max values
      expect(screen.getByText(/statistics/i)).toBeInTheDocument();
    });

    it('should handle column without statistics', () => {
      const columnNoStats: Column = {
        ...mockColumn,
        statistics: undefined,
      };

      render(<DetailPanel column={columnNoStats} />);
      expect(screen.getByText('ArtistId')).toBeInTheDocument();
      expect(screen.queryByText(/statistics/i)).not.toBeInTheDocument();
    });

    it('should display default value when present', () => {
      const columnWithDefault: Column = {
        ...mockColumn,
        defaultValue: 'AUTO_INCREMENT',
      };

      render(<DetailPanel column={columnWithDefault} />);
      expect(screen.getByText(/default value/i)).toBeInTheDocument();
      expect(screen.getByText('AUTO_INCREMENT')).toBeInTheDocument();
    });
  });

  describe('when both table and column are selected', () => {
    it('should prioritize column details', () => {
      render(<DetailPanel table={mockTable} column={mockColumn} />);
      expect(screen.getByText(/column details/i)).toBeInTheDocument();
      expect(screen.queryByText(/table details/i)).not.toBeInTheDocument();
    });
  });
});
