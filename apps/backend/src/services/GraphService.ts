import { Neo4jRepository } from '../repositories/Neo4jRepository';
import { Database } from '../domain/Database';
import { Table } from '../domain/Table';
import { Column } from '../domain/Column';

/**
 * Foreign key relationship for graph population
 */
export interface ForeignKeyInput {
  fromColumn: string;
  toColumn: string;
}

/**
 * Service for populating and querying the Neo4j knowledge graph
 * Coordinates between domain entities and Neo4j repository
 */
export class GraphService {
  constructor(private repository: Neo4jRepository) {}

  /**
   * Populates a database node in the graph
   */
  async populateDatabase(database: Database): Promise<void> {
    await this.repository.createDatabase(database);
  }

  /**
   * Populates a table node in the graph
   */
  async populateTable(table: Table): Promise<void> {
    await this.repository.createTable(table);
  }

  /**
   * Populates multiple column nodes in the graph
   */
  async populateColumns(columns: Column[]): Promise<void> {
    for (const column of columns) {
      await this.repository.createColumn(column);
    }
  }

  /**
   * Creates foreign key relationships between columns
   */
  async createForeignKeyRelationships(
    foreignKeys: ForeignKeyInput[]
  ): Promise<void> {
    for (const fk of foreignKeys) {
      await this.repository.createForeignKeyRelationship(
        fk.fromColumn,
        fk.toColumn
      );
    }
  }

  /**
   * Populates a complete database schema including all nodes and relationships
   * @param database - The database entity
   * @param tables - Array of table entities
   * @param columns - Array of column entities
   * @param foreignKeys - Array of foreign key relationships
   */
  async populateFullSchema(
    database: Database,
    tables: Table[],
    columns: Column[],
    foreignKeys: ForeignKeyInput[]
  ): Promise<void> {
    // Create database node
    await this.populateDatabase(database);

    // Create all table nodes
    for (const table of tables) {
      await this.populateTable(table);
    }

    // Create all column nodes
    await this.populateColumns(columns);

    // Create foreign key relationships
    await this.createForeignKeyRelationships(foreignKeys);
  }

  /**
   * Retrieves a database from the graph by ID
   */
  async getDatabaseFromGraph(id: string): Promise<Database | null> {
    return await this.repository.getDatabase(id);
  }

  /**
   * Retrieves all databases from the graph
   */
  async getAllDatabasesFromGraph(): Promise<Database[]> {
    return await this.repository.getAllDatabases();
  }

  /**
   * Retrieves all tables for a specific database
   */
  async getTablesForDatabase(databaseId: string): Promise<Table[]> {
    return await this.repository.getTablesForDatabase(databaseId);
  }
}
