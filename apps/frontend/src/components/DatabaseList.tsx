import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DATABASES } from '../graphql/queries';
import type { Database } from '../types/schema';

/**
 * DatabaseList Component
 * Modern card-based database selector
 */

interface GetDatabasesResponse {
  databases: Pick<Database, 'id' | 'name' | 'path' | 'addedAt'>[];
}

interface DatabaseListProps {
  onDatabaseSelect?: (databaseId: string) => void;
}

export function DatabaseList({
  onDatabaseSelect,
}: DatabaseListProps = {}): JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { loading, error, data } =
    useQuery<GetDatabasesResponse>(GET_DATABASES);

  const handleDatabaseClick = (databaseId: string): void => {
    setSelectedId(databaseId);
    onDatabaseSelect?.(databaseId);
  };

  return (
    <div className="glass-card h-full">
      {/* Header */}
      <div className="p-5 border-b border-surface-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Databases</h2>
            <p className="text-xs text-surface-400">
              {data?.databases.length ?? 0} connected
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-surface-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-red-400 mb-1">Connection Error</p>
            <p className="text-xs text-surface-500">{error.message}</p>
          </div>
        ) : !data?.databases || data.databases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-sm text-surface-400 mb-1">No databases</p>
            <p className="text-xs text-surface-500">Add a database to get started</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {data.databases.map((database) => {
              const isSelected = selectedId === database.id;
              return (
                <li key={database.id}>
                  <button
                    onClick={() => handleDatabaseClick(database.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                      isSelected
                        ? 'bg-accent-500/10 border border-accent-500/30 shadow-glow-sm'
                        : 'bg-surface-800/50 border border-transparent hover:bg-surface-800 hover:border-surface-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-accent-500/20 text-accent-400'
                          : 'bg-surface-700 text-surface-400 group-hover:bg-surface-600'
                      }`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-semibold truncate transition-colors ${
                          isSelected ? 'text-accent-300' : 'text-white group-hover:text-white'
                        }`}>
                          {database.name}
                        </h3>
                        <p className="text-xs text-surface-500 truncate mt-0.5">
                          {database.path}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="badge badge-cyber text-[10px]">SQLite</span>
                          <span className="text-[10px] text-surface-500">
                            {new Date(database.addedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 text-accent-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
