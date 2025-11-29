import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DATABASE } from '../graphql/queries';
import type { Database, Table, Column } from '../types/schema';

/**
 * SchemaTree Component
 * Modern tree view with glassmorphism design
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
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="p-5">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-surface-800 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-red-400 mb-1">Error loading schema</p>
          <p className="text-xs text-surface-500">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data?.database) {
    return (
      <div className="p-5">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <p className="text-sm text-surface-400">Database not found</p>
        </div>
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
    setSelectedTableId(table.id);
    setSelectedColumnId(null);
    onTableSelect?.(table);
  };

  const handleColumnClick = (column: Column, e: React.MouseEvent): void => {
    e.stopPropagation();
    setSelectedColumnId(column.id);
    onColumnSelect?.(column);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-surface-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 border border-accent-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-white truncate">{database.name}</h2>
            <p className="text-xs text-surface-500 truncate">{database.path}</p>
          </div>
          <span className="badge badge-cyber text-xs">{database.tables.length} tables</span>
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="space-y-1">
          {database.tables.map((table) => {
            const isExpanded = expandedTables.has(table.id);
            const isTableSelected = selectedTableId === table.id;

            return (
              <div key={table.id} className="relative">
                {/* Table Row */}
                <button
                  onClick={() => handleTableClick(table)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 group ${
                    isTableSelected
                      ? 'bg-accent-500/10 border border-accent-500/30'
                      : 'hover:bg-surface-800/70 border border-transparent'
                  }`}
                >
                  {/* Expand Icon */}
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    isExpanded ? 'bg-accent-500/20' : 'bg-surface-700'
                  }`}>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90 text-accent-400' : 'text-surface-400'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Table Icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isTableSelected ? 'bg-emerald-500/20' : 'bg-surface-700 group-hover:bg-surface-600'
                  }`}>
                    <svg className={`w-4 h-4 ${isTableSelected ? 'text-emerald-400' : 'text-surface-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>

                  {/* Table Info */}
                  <div className="min-w-0 flex-1">
                    <span className={`font-semibold block truncate ${
                      isTableSelected ? 'text-accent-300' : 'text-white group-hover:text-white'
                    }`}>
                      {table.name}
                    </span>
                    <span className="text-xs text-surface-500">
                      {table.rowCount.toLocaleString()} rows
                    </span>
                  </div>

                  {/* Column Count Badge */}
                  <span className="text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded-full">
                    {table.columns.length}
                  </span>
                </button>

                {/* Columns (when expanded) */}
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-0.5 relative">
                    {/* Connector line */}
                    <div className="absolute left-3 top-0 bottom-2 w-px bg-surface-700" />

                    {table.columns.map((column, index) => {
                      const isColumnSelected = selectedColumnId === column.id;
                      const isLastColumn = index === table.columns.length - 1;

                      return (
                        <button
                          key={column.id}
                          onClick={(e) => handleColumnClick(column, e)}
                          className={`w-full text-left pl-8 pr-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-3 group relative ${
                            isColumnSelected
                              ? 'bg-cyber-500/10 border border-cyber-500/30'
                              : 'hover:bg-surface-800/50 border border-transparent'
                          }`}
                        >
                          {/* Horizontal connector */}
                          <div className={`absolute left-3 w-4 h-px bg-surface-700 ${isLastColumn ? 'top-1/2' : 'top-1/2'}`} />
                          {isLastColumn && (
                            <div className="absolute left-3 bottom-1/2 top-0 w-px bg-surface-950" />
                          )}

                          {/* Column Icon */}
                          {column.primaryKey ? (
                            <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                            </div>
                          ) : (
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                              isColumnSelected ? 'bg-cyber-500/20' : 'bg-surface-700/50'
                            }`}>
                              <svg className={`w-3.5 h-3.5 ${isColumnSelected ? 'text-cyber-400' : 'text-surface-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                              </svg>
                            </div>
                          )}

                          {/* Column Name */}
                          <span className={`text-sm truncate ${
                            isColumnSelected ? 'text-cyber-300 font-medium' : 'text-surface-300 group-hover:text-white'
                          }`}>
                            {column.name}
                          </span>

                          {/* Data Type */}
                          <span className="text-xs font-mono text-surface-600 ml-auto flex-shrink-0">
                            {column.dataType}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
