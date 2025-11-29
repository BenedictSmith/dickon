import Database from 'better-sqlite3';
import { GeneratedSql } from './SqlGenerator';
import { Neo4jRepository } from '../repositories/Neo4jRepository';

/**
 * Result from executing a query on a single database
 */
export interface QueryResult {
  rows: Array<Record<string, unknown>>;
  database: string;
  executionTimeMs: number;
  joinKey?: string;
}

/**
 * Executes federated queries across multiple SQLite databases
 * Handles connection pooling and parallel execution
 */
export class QueryExecutor {
  private sqliteConnections = new Map<string, Database.Database>();
  private neo4jRepository: Neo4jRepository;

  constructor(neo4jRepository: Neo4jRepository) {
    this.neo4jRepository = neo4jRepository;
  }

  /**
   * Execute queries in parallel across multiple databases
   *
   * @param queries - Map of database ID to SQL query
   * @returns Map of database ID to query results
   */
  async executeQueries(
    queries: Map<string, GeneratedSql>
  ): Promise<Map<string, QueryResult>> {
    const results = new Map<string, QueryResult>();

    // Execute all queries in parallel using Promise.all
    const promises = Array.from(queries.entries()).map(
      async ([databaseId, sql]) => {
        const dbStartTime = Date.now();

        try {
          const conn = await this.getConnection(databaseId);
          const stmt = conn.prepare(sql.sql);
          const rows = stmt.all(...sql.params) as Array<Record<string, unknown>>;

          return {
            databaseId,
            result: {
              rows,
              database: databaseId,
              executionTimeMs: Date.now() - dbStartTime,
              joinKey: sql.joinKey,
            },
          };
        } catch (error) {
          throw new Error(
            `Failed to execute query on database ${databaseId}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    );

    const allResults = await Promise.all(promises);

    for (const { databaseId, result } of allResults) {
      results.set(databaseId, result);
    }

    return results;
  }

  /**
   * Get or create SQLite connection with pooling
   * Reuses existing connections to avoid overhead
   *
   * @param databaseId - Database ID from Neo4j
   * @returns SQLite database connection
   */
  private async getConnection(databaseId: string): Promise<Database.Database> {
    if (this.sqliteConnections.has(databaseId)) {
      return this.sqliteConnections.get(databaseId)!;
    }

    // Get database path from Neo4j
    const database = await this.neo4jRepository.getDatabase(databaseId);
    if (!database) {
      throw new Error(`Database not found: ${databaseId}`);
    }

    // Create new connection
    const db = new Database(database.path, { readonly: true });
    this.sqliteConnections.set(databaseId, db);

    return db;
  }

  /**
   * Execute a single query (for testing)
   *
   * @param databaseId - Database ID
   * @param sql - SQL query
   * @param params - Query parameters
   * @returns Query result
   */
  async executeSingleQuery(
    databaseId: string,
    sql: string,
    params: unknown[] = []
  ): Promise<QueryResult> {
    const startTime = Date.now();
    const conn = await this.getConnection(databaseId);
    const stmt = conn.prepare(sql);
    const rows = stmt.all(...params) as Array<Record<string, unknown>>;

    return {
      rows,
      database: databaseId,
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Get number of active connections
   * Useful for monitoring and testing
   */
  getConnectionCount(): number {
    return this.sqliteConnections.size;
  }

  /**
   * Close a specific database connection
   *
   * @param databaseId - Database ID to close
   */
  async closeConnection(databaseId: string): Promise<void> {
    const db = this.sqliteConnections.get(databaseId);
    if (db) {
      db.close();
      this.sqliteConnections.delete(databaseId);
    }
  }

  /**
   * Close all database connections
   * Should be called when shutting down the service
   */
  async closeAll(): Promise<void> {
    for (const [databaseId, db] of this.sqliteConnections) {
      try {
        db.close();
      } catch (error) {
        console.error(`Error closing database ${databaseId}:`, error);
      }
    }
    this.sqliteConnections.clear();
  }
}
