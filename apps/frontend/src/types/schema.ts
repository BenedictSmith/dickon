/**
 * GraphQL schema types for SiloBreaker
 * Based on Epic 1.3 schema design
 */

export interface Database {
  id: string;
  name: string;
  path: string;
  addedAt: string;
  tables: Table[];
}

export interface Table {
  id: string;
  name: string;
  databaseId: string;
  rowCount: number;
  columns: Column[];
}

export interface Column {
  id: string;
  name: string;
  dataType: string;
  tableId: string;
  primaryKey: boolean;
  notNull: boolean;
  defaultValue?: string;
  statistics?: ColumnStatistics;
}

export interface ColumnStatistics {
  distinctCount: number;
  nullCount: number;
  minValue?: string;
  maxValue?: string;
}

export interface Relationship {
  id: string;
  fromColumnId: string;
  toColumnId: string;
  type: 'REFERENCES' | 'SIMILAR_TO' | 'LINKS_TO';
  confidence?: number;
}
