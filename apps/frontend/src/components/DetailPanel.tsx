import type { Table, Column } from '../types/schema';

/**
 * DetailPanel Component
 * Modern glassmorphism design for metadata display
 */

interface DetailPanelProps {
  table?: Table;
  column?: Column;
}

export function DetailPanel({ table, column }: DetailPanelProps): JSX.Element {
  // Prioritize column details if both are provided
  if (column) {
    return <ColumnDetails column={column} />;
  }

  if (table) {
    return <TableDetails table={table} />;
  }

  return (
    <div className="glass-card h-full min-h-[400px]">
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-surface-300 mb-2">No Selection</h3>
        <p className="text-sm text-surface-500 max-w-xs">
          Select a table or column to view detailed metadata and statistics
        </p>
      </div>
    </div>
  );
}

function TableDetails({ table }: { table: Table }): JSX.Element {
  return (
    <div className="glass-card h-full">
      {/* Header */}
      <div className="p-5 border-b border-surface-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Table Details</h2>
            <p className="text-xs text-surface-400">Schema information</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {/* Table Name */}
        <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
          <label className="text-xs font-medium text-surface-400 uppercase tracking-wider block mb-2">
            Table Name
          </label>
          <p className="text-xl font-bold gradient-text">{table.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
            <label className="text-xs font-medium text-surface-400 uppercase tracking-wider block mb-1">
              Rows
            </label>
            <p className="text-2xl font-bold text-white">{table.rowCount.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
            <label className="text-xs font-medium text-surface-400 uppercase tracking-wider block mb-1">
              Columns
            </label>
            <p className="text-2xl font-bold text-white">{table.columns.length}</p>
          </div>
        </div>

        {/* Column List */}
        <div>
          <label className="text-xs font-medium text-surface-400 uppercase tracking-wider block mb-3">
            Column Structure
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {table.columns.map((col) => (
              <div
                key={col.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 border border-surface-700/30 hover:border-surface-600/50 transition-colors"
              >
                {col.primaryKey ? (
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-white block truncate">{col.name}</span>
                  <span className="text-xs text-surface-500 font-mono">{col.dataType}</span>
                </div>
                {col.primaryKey && (
                  <span className="badge badge-warning text-[10px]">PK</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ColumnDetails({ column }: { column: Column }): JSX.Element {
  return (
    <div className="glass-card h-full">
      {/* Header */}
      <div className="p-5 border-b border-surface-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-500/20 to-cyber-600/20 border border-cyber-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-cyber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Column Details</h2>
            <p className="text-xs text-surface-400">Field properties</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Column Name */}
        <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
          <label className="text-xs font-medium text-surface-400 uppercase tracking-wider block mb-2">
            Column Name
          </label>
          <p className="text-xl font-bold gradient-text">{column.name}</p>
        </div>

        {/* Type & Constraints */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
            <label className="text-xs font-medium text-surface-400 uppercase tracking-wider block mb-2">
              Data Type
            </label>
            <p className="text-sm font-mono text-cyber-300 bg-cyber-500/10 px-2 py-1 rounded inline-block">
              {column.dataType}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
            <label className="text-xs font-medium text-surface-400 uppercase tracking-wider block mb-2">
              Primary Key
            </label>
            {column.primaryKey ? (
              <span className="inline-flex items-center gap-1.5 text-amber-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="text-sm font-semibold">Yes</span>
              </span>
            ) : (
              <span className="text-sm text-surface-500">No</span>
            )}
          </div>
        </div>

        {/* Nullable */}
        <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
          <label className="text-xs font-medium text-surface-400 uppercase tracking-wider block mb-2">
            Nullable
          </label>
          {!column.notNull ? (
            <span className="inline-flex items-center gap-1.5 text-surface-300">
              <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">Allows NULL values</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-accent-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium">NOT NULL constraint</span>
            </span>
          )}
        </div>

        {/* Default Value */}
        {column.defaultValue && (
          <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
            <label className="text-xs font-medium text-surface-400 uppercase tracking-wider block mb-2">
              Default Value
            </label>
            <p className="text-sm font-mono text-white bg-surface-700 px-3 py-2 rounded-lg">
              {column.defaultValue}
            </p>
          </div>
        )}

        {/* Statistics */}
        {column.statistics && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-accent-500/10 to-cyber-500/10 border border-accent-500/20">
            <label className="text-xs font-medium text-surface-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Statistics
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Distinct Count */}
              <div className="p-3 rounded-lg bg-surface-800/50">
                <span className="text-[10px] text-surface-500 uppercase block mb-1">Distinct</span>
                <span className="text-lg font-bold text-white">
                  {column.statistics.distinctCount.toLocaleString()}
                </span>
              </div>

              {/* Null Count */}
              <div className="p-3 rounded-lg bg-surface-800/50">
                <span className="text-[10px] text-surface-500 uppercase block mb-1">Nulls</span>
                <span className="text-lg font-bold text-white">
                  {column.statistics.nullCount.toLocaleString()}
                </span>
              </div>

              {/* Min Value */}
              {column.statistics.minValue !== null &&
                column.statistics.minValue !== undefined && (
                  <div className="p-3 rounded-lg bg-surface-800/50">
                    <span className="text-[10px] text-surface-500 uppercase block mb-1">Min</span>
                    <span className="text-sm font-mono text-emerald-400 truncate block">
                      {column.statistics.minValue}
                    </span>
                  </div>
                )}

              {/* Max Value */}
              {column.statistics.maxValue !== null &&
                column.statistics.maxValue !== undefined && (
                  <div className="p-3 rounded-lg bg-surface-800/50">
                    <span className="text-[10px] text-surface-500 uppercase block mb-1">Max</span>
                    <span className="text-sm font-mono text-red-400 truncate block">
                      {column.statistics.maxValue}
                    </span>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
