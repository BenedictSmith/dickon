import { Neo4jRepository } from '../repositories/Neo4jRepository';
import { SqlGenerator, GeneratedSql } from './SqlGenerator';
import { QueryExecutor } from './QueryExecutor';
import { ResultMerger, JoinRelationship } from './ResultMerger';
import { FederatedQueryInput, FederatedQueryResult } from '../types/federation';

/**
 * Main service for executing federated queries across multiple databases
 * Orchestrates SQL generation, execution, and result merging
 */
export class FederationService {
  private sqlGenerator: SqlGenerator;
  private queryExecutor: QueryExecutor;
  private resultMerger: ResultMerger;
  private neo4jRepository: Neo4jRepository;

  constructor(neo4jRepository: Neo4jRepository) {
    this.neo4jRepository = neo4jRepository;
    this.sqlGenerator = new SqlGenerator();
    this.queryExecutor = new QueryExecutor(neo4jRepository);
    this.resultMerger = new ResultMerger();
  }

  /**
   * Execute a federated query across multiple databases
   *
   * @param input - Federated query specification
   * @returns Query results with metadata and lineage
   */
  async executeQuery(input: FederatedQueryInput): Promise<FederatedQueryResult> {
    const startTime = Date.now();

    // 1. Group tables by database
    const tablesByDatabase = this.groupTablesByDatabase(input);

    // 2. Resolve join relationships (if not provided)
    const relationships = await this.resolveJoinRelationships(
      input,
      tablesByDatabase
    );

    // 3. Generate SQL queries for each database
    const queries = this.generateQueries(input, tablesByDatabase, relationships);

    // 4. Execute queries in parallel
    const results = await this.queryExecutor.executeQueries(queries);

    // 5. Merge results
    const mergedResult = this.resultMerger.merge(
      results,
      relationships,
      { joinType: input.joins?.[0]?.type || 'inner' }
    );

    // 6. Build final result
    const databasesQueried = Array.from(tablesByDatabase.keys());
    const executionTimeMs = Date.now() - startTime;

    return {
      rows: mergedResult.rows,
      columns: this.extractColumns(mergedResult.rows),
      executionTimeMs,
      databases: databasesQueried,
    };
  }

  /**
   * Group tables by their database
   */
  private groupTablesByDatabase(
    input: FederatedQueryInput
  ): Map<string, typeof input.tables> {
    const grouped = new Map<string, typeof input.tables>();

    for (const table of input.tables) {
      if (!grouped.has(table.database)) {
        grouped.set(table.database, []);
      }
      grouped.get(table.database)!.push(table);
    }

    return grouped;
  }

  /**
   * Resolve join relationships between tables
   * Auto-detects relationships if not explicitly provided
   */
  private async resolveJoinRelationships(
    input: FederatedQueryInput,
    tablesByDatabase: Map<string, typeof input.tables>
  ): Promise<JoinRelationship[]> {
    // If joins are explicitly provided, use them
    if (input.joins && input.joins.length > 0) {
      return this.convertToJoinRelationships(input.joins, tablesByDatabase);
    }

    // Auto-detect relationships using Neo4j graph
    // For now, return empty array - auto-detection will be implemented later
    return [];
  }

  /**
   * Convert federated join inputs to join relationships
   */
  private convertToJoinRelationships(
    joins: NonNullable<FederatedQueryInput['joins']>,
    tablesByDatabase: Map<string, typeof joins>
  ): JoinRelationship[] {
    const relationships: JoinRelationship[] = [];

    for (const join of joins) {
      // Find which database each table belongs to
      let fromDatabase = '';
      let toDatabase = '';

      for (const [dbId, tables] of tablesByDatabase) {
        const hasFrom = tables.some(
          (t) => (t.alias || t.table) === join.from.table
        );
        const hasTo = tables.some(
          (t) => (t.alias || t.table) === join.to.table
        );

        if (hasFrom) fromDatabase = dbId;
        if (hasTo) toDatabase = dbId;
      }

      if (fromDatabase && toDatabase && fromDatabase !== toDatabase) {
        // Cross-database join
        relationships.push({
          fromDatabase,
          fromColumn: `_join_${join.from.column}`,
          toDatabase,
          toColumn: `_join_${join.to.column}`,
        });
      }
    }

    return relationships;
  }

  /**
   * Generate SQL queries for each database
   */
  private generateQueries(
    input: FederatedQueryInput,
    tablesByDatabase: Map<string, typeof input.tables>,
    relationships: JoinRelationship[]
  ): Map<string, GeneratedSql> {
    const queries = new Map<string, GeneratedSql>();

    for (const [databaseId, tables] of tablesByDatabase) {
      // Determine which join columns are needed for this database
      const joinColumns = this.extractJoinColumnsForDatabase(
        databaseId,
        relationships,
        tables
      );

      // Generate SQL
      const sql = this.sqlGenerator.generateSql(
        databaseId,
        tables,
        input.select,
        input.where || [],
        input.joins,
        joinColumns,
        input.limit,
        input.offset
      );

      queries.set(databaseId, sql);
    }

    return queries;
  }

  /**
   * Extract join columns needed for a specific database
   */
  private extractJoinColumnsForDatabase(
    databaseId: string,
    relationships: JoinRelationship[],
    tables: typeof relationships
  ): Array<{ table: string; column: string }> {
    const joinColumns: Array<{ table: string; column: string }> = [];

    for (const rel of relationships) {
      if (rel.fromDatabase === databaseId) {
        // This database is the source of a join
        const columnName = rel.fromColumn.replace('_join_', '');
        const table = tables[0]?.alias || tables[0]?.table || '';
        joinColumns.push({ table, column: columnName });
      } else if (rel.toDatabase === databaseId) {
        // This database is the target of a join
        const columnName = rel.toColumn.replace('_join_', '');
        const table = tables[0]?.alias || tables[0]?.table || '';
        joinColumns.push({ table, column: columnName });
      }
    }

    return joinColumns;
  }

  /**
   * Extract column names from result rows
   */
  private extractColumns(rows: Array<Record<string, unknown>>): string[] {
    if (rows.length === 0) {
      return [];
    }

    return Object.keys(rows[0]);
  }

  /**
   * Close all database connections
   */
  async close(): Promise<void> {
    await this.queryExecutor.closeAll();
  }
}
