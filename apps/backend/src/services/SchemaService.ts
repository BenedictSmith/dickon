import { SQLiteRepository, ColumnInfo, ForeignKeyInfo } from '../repositories/SQLiteRepository';
import { Database } from '../domain/Database';
import { Table } from '../domain/Table';
import { Column } from '../domain/Column';
import { randomUUID } from 'crypto';

/**
 * Result of extracting table structure
 */
export interface TableStructure {
  table: Table;
  columns: Column[];
  foreignKeys: ForeignKeyInfo[];
}

/**
 * Service for extracting and analyzing database schemas
 * Coordinates between SQLiteRepository and Domain entities
 */
export class SchemaService {
  /**
   * Extracts complete schema from a SQLite database
   * @param dbPath - Path to the SQLite database file
   * @param dbName - Human-readable name for the database
   * @returns Database domain entity with metadata
   */
  async extractSchema(dbPath: string, dbName: string): Promise<Database> {
    const repository = new SQLiteRepository(dbPath);

    try {
      // Extract table names
      const tableNames = repository.getTables();

      // Extract columns and foreign keys for each table
      for (const tableName of tableNames) {
        repository.getColumns(tableName);
        repository.getForeignKeys(tableName);
      }

      // Create and return Database entity
      return new Database({
        id: randomUUID(),
        name: dbName,
        path: dbPath,
      });
    } finally {
      // Always close the repository connection
      repository.close();
    }
  }

  /**
   * Extracts structure for a specific table
   * @param dbPath - Path to the SQLite database file
   * @param tableName - Name of the table to extract
   * @returns Table structure with columns and foreign keys
   */
  async getTableStructure(
    dbPath: string,
    tableName: string
  ): Promise<TableStructure> {
    const repository = new SQLiteRepository(dbPath);

    try {
      // Extract column information
      const columnInfos = repository.getColumns(tableName);

      // Extract foreign key information
      const foreignKeys = repository.getForeignKeys(tableName);

      // Create Table entity
      const table = new Table({
        id: randomUUID(),
        name: tableName,
        databaseId: dbPath, // Using path as temporary database identifier
      });

      // Transform ColumnInfo to Column entities
      const columns = columnInfos.map((colInfo: ColumnInfo) =>
        new Column({
          id: randomUUID(),
          name: colInfo.name,
          dataType: colInfo.type,
          tableId: table.id,
          notNull: colInfo.notNull,
          primaryKey: colInfo.primaryKey,
          defaultValue: colInfo.defaultValue,
        })
      );

      return {
        table,
        columns,
        foreignKeys,
      };
    } finally {
      repository.close();
    }
  }

  /**
   * Analyzes data types across all tables in the database
   * @param dbPath - Path to the SQLite database file
   * @returns Map of data types to their occurrence count
   */
  async analyzeDataTypes(dbPath: string): Promise<Record<string, number>> {
    const repository = new SQLiteRepository(dbPath);

    try {
      const tableNames = repository.getTables();
      const dataTypeCounts: Record<string, number> = {};

      for (const tableName of tableNames) {
        const columns = repository.getColumns(tableName);

        for (const column of columns) {
          const dataType = column.type;
          dataTypeCounts[dataType] = (dataTypeCounts[dataType] || 0) + 1;
        }
      }

      return dataTypeCounts;
    } finally {
      repository.close();
    }
  }
}
