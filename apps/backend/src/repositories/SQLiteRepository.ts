import initSqlJs, { Database } from 'sql.js';
import * as fs from 'fs';

/**
 * Represents column information from a SQLite table
 */
export interface ColumnInfo {
  name: string;
  type: string;
  notNull: boolean;
  defaultValue: string | null;
  primaryKey: boolean;
}

/**
 * Represents foreign key information from a SQLite table
 */
export interface ForeignKeyInfo {
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

/**
 * Repository for accessing SQLite databases
 * Handles connection management and schema extraction
 */
export class SQLiteRepository {
  private db: Database | null = null;
  private dbPath: string;

  /**
   * Creates a new SQLiteRepository instance
   * @param dbPath - Path to the SQLite database file
   * @throws Error if the database file does not exist
   */
  constructor(dbPath: string) {
    // Validate that the database file exists
    if (!fs.existsSync(dbPath)) {
      throw new Error(`Database file not found: ${dbPath}`);
    }

    this.dbPath = dbPath;
  }

  /**
   * Initialize the database connection (must be called before using other methods)
   * sql.js requires async initialization
   */
  private async init(): Promise<void> {
    if (this.db) return; // Already initialized

    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(this.dbPath);
    this.db = new SQL.Database(buffer);
  }

  /**
   * Retrieves a list of all table names in the database
   * Excludes internal SQLite tables (those starting with 'sqlite_')
   * @returns Array of table names in alphabetical order
   */
  async getTables(): Promise<string[]> {
    await this.init();

    if (!this.db) {
      throw new Error('Database connection is closed');
    }

    const query = `
      SELECT name
      FROM sqlite_master
      WHERE type='table'
        AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `;

    const result = this.db.exec(query);
    if (result.length === 0) return [];

    const rows = result[0].values;
    return rows.map((row) => row[0] as string);
  }

  /**
   * Retrieves column information for a specific table
   * Uses PRAGMA table_info to get column metadata
   * @param tableName - Name of the table to query
   * @returns Array of column information
   * @throws Error if the table does not exist
   */
  async getColumns(tableName: string): Promise<ColumnInfo[]> {
    await this.init();

    if (!this.db) {
      throw new Error('Database connection is closed');
    }

    // Validate that the table exists
    const tables = await this.getTables();
    if (!tables.includes(tableName)) {
      throw new Error(`Table '${tableName}' does not exist`);
    }

    // Use PRAGMA table_info to get column information
    const query = `PRAGMA table_info("${tableName}")`;

    const result = this.db.exec(query);
    if (result.length === 0) return [];

    const columns = result[0].columns; // ['cid', 'name', 'type', 'notnull', 'dflt_value', 'pk']
    const rows = result[0].values;

    return rows.map((row) => {
      const nameIdx = columns.indexOf('name');
      const typeIdx = columns.indexOf('type');
      const notnullIdx = columns.indexOf('notnull');
      const dfltValueIdx = columns.indexOf('dflt_value');
      const pkIdx = columns.indexOf('pk');

      return {
        name: row[nameIdx] as string,
        type: row[typeIdx] as string,
        notNull: row[notnullIdx] === 1,
        defaultValue: row[dfltValueIdx] as string | null,
        primaryKey: row[pkIdx] === 1,
      };
    });
  }

  /**
   * Retrieves foreign key information for a specific table
   * Uses PRAGMA foreign_key_list to get FK metadata
   * @param tableName - Name of the table to query
   * @returns Array of foreign key information
   * @throws Error if the table does not exist
   */
  async getForeignKeys(tableName: string): Promise<ForeignKeyInfo[]> {
    await this.init();

    if (!this.db) {
      throw new Error('Database connection is closed');
    }

    // Validate that the table exists
    const tables = await this.getTables();
    if (!tables.includes(tableName)) {
      throw new Error(`Table '${tableName}' does not exist`);
    }

    // Use PRAGMA foreign_key_list to get foreign key information
    const query = `PRAGMA foreign_key_list("${tableName}")`;

    const result = this.db.exec(query);
    if (result.length === 0) return [];

    const columns = result[0].columns; // ['id', 'seq', 'table', 'from', 'to', 'on_update', 'on_delete', 'match']
    const rows = result[0].values;

    return rows.map((row) => {
      const tableIdx = columns.indexOf('table');
      const fromIdx = columns.indexOf('from');
      const toIdx = columns.indexOf('to');

      return {
        fromColumn: row[fromIdx] as string,
        toTable: row[tableIdx] as string,
        toColumn: row[toIdx] as string,
      };
    });
  }

  /**
   * Sample values from a column for overlap analysis
   * Returns up to maxSamples distinct values from the specified column
   *
   * @param tableName - Name of the table
   * @param columnName - Name of the column
   * @param maxSamples - Maximum number of samples to return (default: 1000)
   * @returns Array of distinct values (as strings)
   */
  async sampleColumnValues(
    tableName: string,
    columnName: string,
    maxSamples: number = 1000
  ): Promise<Array<string | null>> {
    await this.init();

    if (!this.db) {
      throw new Error('Database connection is closed');
    }

    const tables = await this.getTables();
    if (!tables.includes(tableName)) {
      throw new Error(`Table '${tableName}' does not exist`);
    }

    // Get distinct values, limited to maxSamples
    // CAST to TEXT to ensure all values are strings for comparison
    const query = `
      SELECT DISTINCT CAST("${columnName}" AS TEXT) as value
      FROM "${tableName}"
      WHERE "${columnName}" IS NOT NULL
      LIMIT ${maxSamples}
    `;

    const result = this.db.exec(query);
    if (result.length === 0) return [];

    const rows = result[0].values;
    return rows.map((row) => row[0] as string | null);
  }

  /**
   * Closes the database connection
   * Can be called multiple times safely
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
