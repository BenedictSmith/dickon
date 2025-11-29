import { useState } from 'react';
import { DatabaseList } from './components/DatabaseList';
import { SchemaTree } from './components/SchemaTree';
import { DetailPanel } from './components/DetailPanel';
import { DiscoveryControlPanel } from './components/DiscoveryControlPanel';
import { RelationshipReviewPanel } from './components/RelationshipReviewPanel';
import { GraphVisualization } from './components/GraphVisualization';
import type { Table, Column } from './types/schema';

/**
 * SiloBreaker Frontend - React + D3.js
 * Modern UI with glassmorphism design
 */

export function App(): JSX.Element {
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | null>(
    null
  );
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);

  return (
    <div className="min-h-screen bg-surface-950 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-surface-800/50 backdrop-blur-md bg-surface-950/80 sticky top-0 z-50">
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Logo */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-cyber-500 flex items-center justify-center shadow-glow">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">SiloBreaker</h1>
                  <p className="text-sm text-surface-400">Database Schema Discovery</p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-emerald-400 font-medium">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-[1800px] mx-auto px-6 py-6 space-y-6">
          {/* Discovery Section */}
          <DiscoveryControlPanel />

          {/* Schema Explorer Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Databases Sidebar */}
            <div className="col-span-12 lg:col-span-3">
              <DatabaseList onDatabaseSelect={setSelectedDatabaseId} />
            </div>

            {/* Schema Tree */}
            <div className="col-span-12 lg:col-span-5">
              <div className="glass-card h-full min-h-[400px]">
                {selectedDatabaseId ? (
                  <SchemaTree
                    databaseId={selectedDatabaseId}
                    onTableSelect={setSelectedTable}
                    onColumnSelect={setSelectedColumn}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-surface-300 mb-2">No Database Selected</h3>
                    <p className="text-sm text-surface-500 max-w-xs">
                      Select a database from the list to explore its schema and relationships
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Detail Panel */}
            <div className="col-span-12 lg:col-span-4">
              <DetailPanel
                table={selectedTable ?? undefined}
                column={selectedColumn ?? undefined}
              />
            </div>
          </div>

          {/* Relationships Review */}
          <RelationshipReviewPanel />

          {/* Graph Visualization */}
          <GraphVisualization minConfidence={0.5} />
        </main>

        {/* Footer */}
        <footer className="border-t border-surface-800/50 mt-12">
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between text-sm text-surface-500">
              <span>SiloBreaker v0.1.0</span>
              <span>Powered by Neo4j + GraphQL</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
