import type { Table, Column } from '../types/schema';

/**
 * DetailPanel Component
 * Epic 1.4: Schema Explorer UI
 *
 * Displays detailed metadata for selected table or column
 * Shows statistics, constraints, and data types
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
    <div className="p-4">
      <p className="text-gray-400">Select a table or column to view details</p>
    </div>
  );
}

function TableDetails({ table }: { table: Table }): JSX.Element {
  return (
    <div className="p-4">
      <h3 className="text-xl font-bold text-white mb-4">Table Details</h3>

      <div className="space-y-4">
        {/* Table Name */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Table Name</label>
          <p className="text-lg font-semibold text-primary-400">{table.name}</p>
        </div>

        {/* Row Count */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Row Count</label>
          <p className="text-white">{table.rowCount} rows</p>
        </div>

        {/* Column Count */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Columns</label>
          <p className="text-white">{table.columns.length} columns</p>
        </div>

        {/* Column List */}
        <div>
          <label className="text-sm text-gray-400 block mb-2">
            Column List
          </label>
          <div className="space-y-2">
            {table.columns.map((col) => (
              <div
                key={col.id}
                className="bg-gray-900 rounded p-2 flex items-center gap-2"
              >
                {col.primaryKey && (
                  <span className="text-yellow-400" title="Primary Key">
                    🔑
                  </span>
                )}
                <span className="text-white font-medium">{col.name}</span>
                <span className="text-xs text-gray-500">{col.dataType}</span>
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
    <div className="p-4">
      <h3 className="text-xl font-bold text-white mb-4">Column Details</h3>

      <div className="space-y-4">
        {/* Column Name */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">
            Column Name
          </label>
          <p className="text-lg font-semibold text-primary-400">
            {column.name}
          </p>
        </div>

        {/* Data Type */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Data Type</label>
          <p className="text-white font-mono">{column.dataType}</p>
        </div>

        {/* Primary Key */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">
            Primary Key
          </label>
          <p className="text-white">
            {column.primaryKey ? (
              <span className="text-green-400">Yes 🔑</span>
            ) : (
              <span className="text-gray-500">No</span>
            )}
          </p>
        </div>

        {/* Nullable */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Nullable</label>
          <p className="text-white">
            {!column.notNull ? (
              <span className="text-gray-400">Yes</span>
            ) : (
              <span className="text-blue-400">No</span>
            )}
          </p>
        </div>

        {/* Default Value */}
        {column.defaultValue && (
          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Default Value
            </label>
            <p className="text-white font-mono">{column.defaultValue}</p>
          </div>
        )}

        {/* Statistics */}
        {column.statistics && (
          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Statistics
            </label>
            <div className="bg-gray-900 rounded p-3 space-y-2">
              {/* Distinct Count */}
              <div className="flex justify-between">
                <span className="text-gray-400">Distinct Values:</span>
                <span className="text-white font-semibold">
                  {column.statistics.distinctCount}
                </span>
              </div>

              {/* Null Count */}
              <div className="flex justify-between">
                <span className="text-gray-400">Null Count:</span>
                <span className="text-white font-semibold">
                  {column.statistics.nullCount}
                </span>
              </div>

              {/* Min Value */}
              {column.statistics.minValue !== null &&
                column.statistics.minValue !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min Value:</span>
                    <span className="text-white font-mono">
                      {column.statistics.minValue}
                    </span>
                  </div>
                )}

              {/* Max Value */}
              {column.statistics.maxValue !== null &&
                column.statistics.maxValue !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Value:</span>
                    <span className="text-white font-mono">
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
