/**
 * Federation types for multi-database querying
 * Defines the structure for federated queries across SQLite databases
 */

/**
 * Table reference in federated query
 */
export interface FederatedTableInput {
  database: string;
  table: string;
  alias?: string;
}

/**
 * Column selection in federated query
 */
export interface FederatedColumnInput {
  table: string; // Table alias or name
  column: string;
  alias?: string;
}

/**
 * WHERE clause condition
 */
export interface FederatedWhereInput {
  column: string; // Format: "tableAlias.columnName"
  operator: '=' | '!=' | '<' | '>' | '<=' | '>=' | 'LIKE' | 'IN' | 'NOT IN';
  value: unknown;
}

/**
 * JOIN specification
 */
export interface FederatedJoinInput {
  from: {
    table: string; // Table alias
    column: string;
  };
  to: {
    table: string; // Table alias
    column: string;
  };
  type: 'inner' | 'left' | 'right' | 'full';
}

/**
 * Complete federated query input
 */
export interface FederatedQueryInput {
  tables: FederatedTableInput[];
  select: FederatedColumnInput[];
  where?: FederatedWhereInput[];
  joins?: FederatedJoinInput[];
  limit?: number;
  offset?: number;
}

/**
 * Result from a federated query
 */
export interface FederatedQueryResult {
  rows: Record<string, unknown>[];
  columns: string[];
  executionTimeMs: number;
  databases: string[];
}
