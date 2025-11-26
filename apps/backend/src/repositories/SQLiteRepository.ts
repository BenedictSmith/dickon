import Database from 'better-sqlite3';
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
  private db: Database.Database | null = null;

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

    this.db = new Database(dbPath, { readonly: true });
  }

  /**
   * Retrieves a list of all table names in the database
   * Excludes internal SQLite tables (those starting with 'sqlite_')
   * @returns Array of table names in alphabetical order
   */
  getTables(): string[] {
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

    const rows = this.db.prepare(query).all() as Array<{ name: string }>;
    return rows.map((row) => row.name);
  }

  /**
   * Retrieves column information for a specific table
   * Uses PRAGMA table_info to get column metadata
   * @param tableName - Name of the table to query
   * @returns Array of column information
   * @throws Error if the table does not exist
   */
  getColumns(tableName: string): ColumnInfo[] {
    if (!this.db) {
      throw new Error('Database connection is closed');
    }

    // Validate that the table exists
    const tables = this.getTables();
    if (!tables.includes(tableName)) {
      throw new Error(`Table '${tableName}' does not exist`);
    }

    // Use PRAGMA table_info to get column information
    const query = `PRAGMA table_info("${tableName}")`;

    interface PragmaRow {
      cid: number;
      name: string;
      type: string;
      notnull: number;
      dflt_value: string | null;
      pk: number;
    }

    const rows = this.db.prepare(query).all() as PragmaRow[];

    return rows.map((row) => ({
      name: row.name,
      type: row.type,
      notNull: row.notnull === 1,
      defaultValue: row.dflt_value,
      primaryKey: row.pk === 1,
    }));
  }

  /**
   * Retrieves foreign key information for a specific table
   * Uses PRAGMA foreign_key_list to get FK metadata
   * @param tableName - Name of the table to query
   * @returns Array of foreign key information
   * @throws Error if the table does not exist
   */
  getForeignKeys(tableName: string): ForeignKeyInfo[] {
    if (!this.db) {
      throw new Error('Database connection is closed');
    }

    // Validate that the table exists
    const tables = this.getTables();
    if (!tables.includes(tableName)) {
      throw new Error(`Table '${tableName}' does not exist`);
    }

    // Use PRAGMA foreign_key_list to get foreign key information
    const query = `PRAGMA foreign_key_list("${tableName}")`;

    interface PragmaFKRow {
      id: number;
      seq: number;
      table: string;
      from: string;
      to: string;
      on_update: string;
      on_delete: string;
      match: string;
    }

    const rows = this.db.prepare(query).all() as PragmaFKRow[];

    return rows.map((row) => ({
      fromColumn: row.from,
      toTable: row.table,
      toColumn: row.to,
    }));
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
  sampleColumnValues(
    tableName: string,
    columnName: string,
    maxSamples: number = 1000
  ): Array<string | null> {
    if (!this.db) {
      throw new Error('Database connection is closed');
    }

    const tables = this.getTables();
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

    const rows = this.db.prepare(query).all() as Array<{ value: string | null }>;
    return rows.map((row) => row.value);
  }

  /**
   * Closes the database connection
   * Can be called multiple times safely
   */
  close(): void {
    if (this.db && this.db.open) {
      this.db.close();
      this.db = null;
    }
  }
}
