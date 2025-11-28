import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DATABASE } from '../graphql/queries';
import type { Database, Table, Column } from '../types/schema';

/**
 * SchemaTree Component
 * Epic 1.4: Schema Explorer UI
 *
 * Displays hierarchical tree: Database → Tables → Columns
 * Supports expand/collapse and selection callbacks
 */

interface GetDatabaseResponse {
  database: Database;
}

interface SchemaTreeProps {
  databaseId: string;
  onTableSelect?: (table: Table) => void;
  onColumnSelect?: (column: Column) => void;
}

export function SchemaTree({
  databaseId,
  onTableSelect,
  onColumnSelect,
}: SchemaTreeProps): JSX.Element {
  const { loading, error, data } = useQuery<GetDatabaseResponse>(GET_DATABASE, {
    variables: { id: databaseId },
  });

  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-gray-400">Loading schema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-400">Error loading schema: {error.message}</p>
      </div>
    );
  }

  if (!data?.database) {
    return (
      <div className="p-4">
        <p className="text-gray-400">Database not found</p>
      </div>
    );
  }

  const { database } = data;

  const toggleTable = (tableId: string): void => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableId)) {
      newExpanded.delete(tableId);
    } else {
      newExpanded.add(tableId);
    }
    setExpandedTables(newExpanded);
  };

  const handleTableClick = (table: Table): void => {
    toggleTable(table.id);
    onTableSelect?.(table);
  };

  const handleColumnClick = (column: Column): void => {
    onColumnSelect?.(column);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white">{database.name}</h2>
        <p className="text-sm text-gray-400">{database.path}</p>
      </div>

      <div className="space-y-1">
        {database.tables.map((table) => {
          const isExpanded = expandedTables.has(table.id);

          return (
            <div key={table.id} className="border-l-2 border-gray-700">
              {/* Table Row */}
              <button
                onClick={() => handleTableClick(table)}
                className="w-full text-left px-3 py-2 hover:bg-gray-800 transition-colors flex items-center gap-2 group"
              >
                <span className="text-gray-500">{isExpanded ? '▼' : '▶'}</span>
                <span className="font-semibold text-primary-400 group-hover:text-primary-300">
                  {table.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({table.rowCount} rows)
                </span>
              </button>

              {/* Columns (shown when expanded) */}
              {isExpanded && (
                <div className="ml-6 space-y-1">
                  {table.columns.map((column) => (
                    <button
                      key={column.id}
                      onClick={() => handleColumnClick(column)}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-800 transition-colors flex items-center gap-2 group"
                    >
                      {column.primaryKey && (
                        <span className="text-yellow-400" title="Primary Key">
                          🔑
                        </span>
                      )}
                      <span className="text-gray-300 group-hover:text-white">
                        {column.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {column.dataType}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
