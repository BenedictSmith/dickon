import { useState } from 'react';
import { DatabaseList } from './components/DatabaseList';
import { SchemaTree } from './components/SchemaTree';
import { DetailPanel } from './components/DetailPanel';
import { DiscoveryControlPanel } from './components/DiscoveryControlPanel';
import { RelationshipReviewPanel } from './components/RelationshipReviewPanel';
import type { Table, Column } from './types/schema';

/**
 * SiloBreaker Frontend - React + D3.js
 *
 * Main application component.
 * Epic 1.4: Schema Explorer UI - Complete!
 * Epic 2.4: Discovery Interface - Complete!
 */

export function App(): JSX.Element {
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | null>(
    null
  );
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-primary-400 mb-2">
            SiloBreaker
          </h1>
          <p className="text-gray-400">Database Schema Discovery Tool</p>
        </header>

        <main className="space-y-6">
          {/* Discovery Control Panel - Top Section */}
          <section>
            <DiscoveryControlPanel />
          </section>

          {/* Schema Explorer - Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Database List - Left Column */}
            <section className="lg:col-span-1">
              <DatabaseList onDatabaseSelect={setSelectedDatabaseId} />
            </section>

            {/* Schema Tree - Middle Column */}
            <section className="lg:col-span-1 bg-gray-800 rounded-lg">
              {selectedDatabaseId ? (
                <SchemaTree
                  databaseId={selectedDatabaseId}
                  onTableSelect={setSelectedTable}
                  onColumnSelect={setSelectedColumn}
                />
              ) : (
                <div className="p-4">
                  <p className="text-gray-400">
                    Select a database to view schema
                  </p>
                </div>
              )}
            </section>

            {/* Detail Panel - Right Column */}
            <section className="lg:col-span-1 bg-gray-800 rounded-lg">
              <DetailPanel
                table={selectedTable ?? undefined}
                column={selectedColumn ?? undefined}
              />
            </section>
          </div>

          {/* Relationship Review - Bottom Section */}
          <section>
            <RelationshipReviewPanel />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
