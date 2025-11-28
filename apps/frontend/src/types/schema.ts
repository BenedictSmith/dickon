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

/**
 * Job types for Epic 2.4: Discovery Interface
 */

export type JobStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface Job {
  id: string;
  type: string;
  status: JobStatus;
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: string;
}

export interface StartDiscoveryResponse {
  success: boolean;
  job?: Job;
  error?: string;
}

export interface JobResult {
  relationshipsCreated?: number;
}

/**
 * Graph visualization types for Epic 3.1: D3.js Force-Directed Graph
 */

export type GraphNodeType = 'DATABASE' | 'TABLE' | 'COLUMN';

export type GraphEdgeType =
  | 'HAS_TABLE'
  | 'HAS_COLUMN'
  | 'REFERENCES'
  | 'SIMILAR_TO';

export interface GraphNodeProperties {
  path?: string;
  rowCount?: number;
  dataType?: string;
  primaryKey?: boolean;
  notNull?: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  databaseId?: string;
  tableId?: string;
  properties: GraphNodeProperties;
  // D3.js will add these during simulation
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  type: GraphEdgeType;
  confidence?: number;
  discoveredAt?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphDataInput {
  databaseIds?: string[];
  minConfidence?: number;
  maxNodes?: number;
  nodeTypes?: GraphNodeType[];
  edgeTypes?: GraphEdgeType[];
}
