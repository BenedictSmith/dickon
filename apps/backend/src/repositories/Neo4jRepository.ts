import neo4j, { Driver } from 'neo4j-driver';
import { Database } from '../domain/Database';
import { Table } from '../domain/Table';
import { Column } from '../domain/Column';

/**
 * Foreign key relationship information
 */
export interface ForeignKeyRelationship {
  fromColumnId: string;
  toColumnId: string;
}

/**
 * Repository for Neo4j graph database operations
 * Handles creation and retrieval of graph nodes and relationships
 */
export class Neo4jRepository {
  private driver: Driver;

  constructor(uri: string, username: string, password: string) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }

  /**
   * Verifies the connection to Neo4j
   */
  async verifyConnection(): Promise<boolean> {
    const session = this.driver.session();
    try {
      await session.run('RETURN 1');
      return true;
    } finally {
      await session.close();
    }
  }

  /**
   * Creates a Database node in Neo4j
   */
  async createDatabase(database: Database): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        `
        MERGE (d:Database {id: $id})
        SET d.name = $name,
            d.path = $path,
            d.addedAt = $addedAt
        `,
        {
          id: database.id,
          name: database.name,
          path: database.path,
          addedAt: database.addedAt.toISOString(),
        }
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Retrieves a Database by ID
   */
  async getDatabase(id: string): Promise<Database | null> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        'MATCH (d:Database {id: $id}) RETURN d',
        { id }
      );

      if (result.records.length === 0) {
        return null;
      }

      const node = result.records[0].get('d');
      return new Database({
        id: node.properties.id,
        name: node.properties.name,
        path: node.properties.path,
        addedAt: new Date(node.properties.addedAt),
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Retrieves all databases
   */
  async getAllDatabases(): Promise<Database[]> {
    const session = this.driver.session();
    try {
      const result = await session.run('MATCH (d:Database) RETURN d');

      return result.records.map((record) => {
        const node = record.get('d');
        return new Database({
          id: node.properties.id,
          name: node.properties.name,
          path: node.properties.path,
          addedAt: new Date(node.properties.addedAt),
        });
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Creates a Table node in Neo4j
   */
  async createTable(table: Table): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        `
        MERGE (t:Table {id: $id})
        SET t.name = $name,
            t.rowCount = $rowCount
        WITH t
        MATCH (d:Database {id: $databaseId})
        MERGE (d)-[:CONTAINS]->(t)
        `,
        {
          id: table.id,
          name: table.name,
          databaseId: table.databaseId,
          rowCount: table.rowCount,
        }
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Retrieves a Table by ID
   */
  async getTable(id: string): Promise<Table | null> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (d:Database)-[:CONTAINS]->(t:Table {id: $id})
        RETURN t, d.id as databaseId
        `,
        { id }
      );

      if (result.records.length === 0) {
        return null;
      }

      const record = result.records[0];
      const node = record.get('t');
      const databaseId = record.get('databaseId');

      return new Table({
        id: node.properties.id,
        name: node.properties.name,
        databaseId: databaseId,
        rowCount: node.properties.rowCount,
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Retrieves all tables for a database
   */
  async getTablesForDatabase(databaseId: string): Promise<Table[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (d:Database {id: $databaseId})-[:CONTAINS]->(t:Table)
        RETURN t
        `,
        { databaseId }
      );

      return result.records.map((record) => {
        const node = record.get('t');
        return new Table({
          id: node.properties.id,
          name: node.properties.name,
          databaseId: databaseId,
          rowCount: node.properties.rowCount,
        });
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Creates a Column node in Neo4j
   */
  async createColumn(column: Column): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        `
        MERGE (c:Column {id: $id})
        SET c.name = $name,
            c.dataType = $dataType,
            c.notNull = $notNull,
            c.primaryKey = $primaryKey,
            c.defaultValue = $defaultValue
        WITH c
        MATCH (t:Table {id: $tableId})
        MERGE (t)-[:HAS_COLUMN]->(c)
        `,
        {
          id: column.id,
          name: column.name,
          dataType: column.dataType,
          tableId: column.tableId,
          notNull: column.notNull,
          primaryKey: column.primaryKey,
          defaultValue: column.defaultValue,
        }
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Retrieves a Column by ID
   */
  async getColumn(id: string): Promise<Column | null> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (t:Table)-[:HAS_COLUMN]->(c:Column {id: $id})
        RETURN c, t.id as tableId
        `,
        { id }
      );

      if (result.records.length === 0) {
        return null;
      }

      const record = result.records[0];
      const node = record.get('c');
      const tableId = record.get('tableId');

      return new Column({
        id: node.properties.id,
        name: node.properties.name,
        dataType: node.properties.dataType,
        tableId: tableId,
        notNull: node.properties.notNull,
        primaryKey: node.properties.primaryKey,
        defaultValue: node.properties.defaultValue,
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Creates a REFERENCES relationship between two columns (foreign key)
   */
  async createForeignKeyRelationship(
    fromColumnId: string,
    toColumnId: string
  ): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        `
        MATCH (from:Column {id: $fromColumnId})
        MATCH (to:Column {id: $toColumnId})
        MERGE (from)-[:REFERENCES]->(to)
        `,
        { fromColumnId, toColumnId }
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Retrieves all foreign key relationships for a database
   */
  async getForeignKeyRelationships(
    databaseId: string
  ): Promise<ForeignKeyRelationship[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (d:Database {id: $databaseId})-[:CONTAINS]->(:Table)-[:HAS_COLUMN]->(from:Column)
        MATCH (from)-[:REFERENCES]->(to:Column)
        RETURN from.id as fromColumnId, to.id as toColumnId
        `,
        { databaseId }
      );

      return result.records.map((record) => ({
        fromColumnId: record.get('fromColumnId'),
        toColumnId: record.get('toColumnId'),
      }));
    } finally {
      await session.close();
    }
  }

  /**
   * Deletes all nodes and relationships in the graph
   * WARNING: Use only for testing!
   */
  async deleteAll(): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run('MATCH (n) DETACH DELETE n');
    } finally {
      await session.close();
    }
  }

  /**
   * Closes the Neo4j driver connection
   */
  async close(): Promise<void> {
    await this.driver.close();
  }
}
