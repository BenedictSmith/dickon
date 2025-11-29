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
    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
      encrypted: false,
    });
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
   * Get all columns from all databases in the graph
   * Used for relationship discovery
   */
  async getAllColumns(): Promise<Column[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (:Database)-[:CONTAINS]->(t:Table)-[:HAS_COLUMN]->(c:Column)
        RETURN c.id as id,
               c.name as name,
               c.dataType as dataType,
               t.id as tableId,
               c.notNull as notNull,
               c.primaryKey as primaryKey,
               c.defaultValue as defaultValue
        `
      );

      return result.records.map((record) => {
        return new Column({
          id: record.get('id'),
          name: record.get('name'),
          dataType: record.get('dataType'),
          tableId: record.get('tableId'),
          notNull: record.get('notNull') || false,
          primaryKey: record.get('primaryKey') || false,
          defaultValue: record.get('defaultValue'),
        });
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Create a SIMILAR_TO relationship between two columns
   * Indicates that columns are potentially related based on name/type similarity
   *
   * @param fromColumnId - Source column ID
   * @param toColumnId - Target column ID
   * @param confidence - Confidence score (0.0 to 1.0)
   */
  async createSimilarityRelationship(
    fromColumnId: string,
    toColumnId: string,
    confidence: number
  ): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        `
        MATCH (from:Column {id: $fromColumnId})
        MATCH (to:Column {id: $toColumnId})
        MERGE (from)-[r:SIMILAR_TO]->(to)
        SET r.confidence = $confidence,
            r.discoveredAt = datetime()
        `,
        { fromColumnId, toColumnId, confidence }
      );
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
   * Get graph data for visualization
   * Returns nodes and edges optimized for D3.js force-directed graph
   */
  async getGraphData(options?: {
    databaseIds?: string[];
    minConfidence?: number;
    maxNodes?: number;
    nodeTypes?: string[];
    edgeTypes?: string[];
  }): Promise<{
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      databaseId?: string;
      tableId?: string;
      properties: {
        path?: string;
        rowCount?: number;
        dataType?: string;
        primaryKey?: boolean;
        notNull?: boolean;
      };
    }>;
    edges: Array<{
      source: string;
      target: string;
      type: string;
      confidence?: number;
      discoveredAt?: string;
    }>;
  }> {
    const session = this.driver.session();
    try {
      const nodes: Array<{
        id: string;
        label: string;
        type: string;
        databaseId?: string;
        tableId?: string;
        properties: {
          path?: string;
          rowCount?: number;
          dataType?: string;
          primaryKey?: boolean;
          notNull?: boolean;
        };
      }> = [];
      const edges: Array<{
        source: string;
        target: string;
        type: string;
        confidence?: number;
        discoveredAt?: string;
      }> = [];

      // Build WHERE clauses for filtering
      const databaseFilter =
        options?.databaseIds && options.databaseIds.length > 0
          ? 'WHERE d.id IN $databaseIds'
          : '';

      // Fetch all nodes (Databases, Tables, Columns)
      const nodeQuery = `
        MATCH (d:Database)
        ${databaseFilter}
        OPTIONAL MATCH (d)-[:HAS_TABLE]->(t:Table)
        OPTIONAL MATCH (t)-[:HAS_COLUMN]->(c:Column)
        RETURN d, t, c
        ${options?.maxNodes ? 'LIMIT $maxNodes' : ''}
      `;

      const nodeResult = await session.run(nodeQuery, {
        databaseIds: options?.databaseIds || [],
        maxNodes: options?.maxNodes || 10000,
      });

      // Process nodes
      const seenDatabaseIds = new Set<string>();
      const seenTableIds = new Set<string>();
      const seenColumnIds = new Set<string>();

      for (const record of nodeResult.records) {
        const dbNode = record.get('d');
        const tableNode = record.get('t');
        const columnNode = record.get('c');

        // Add Database node
        if (dbNode && !seenDatabaseIds.has(dbNode.properties.id)) {
          if (!options?.nodeTypes || options.nodeTypes.includes('DATABASE')) {
            nodes.push({
              id: dbNode.properties.id,
              label: dbNode.properties.name,
              type: 'DATABASE',
              properties: {
                path: dbNode.properties.path,
              },
            });
          }
          seenDatabaseIds.add(dbNode.properties.id);
        }

        // Add Table node
        if (tableNode && !seenTableIds.has(tableNode.properties.id)) {
          if (!options?.nodeTypes || options.nodeTypes.includes('TABLE')) {
            nodes.push({
              id: tableNode.properties.id,
              label: tableNode.properties.name,
              type: 'TABLE',
              databaseId: dbNode.properties.id,
              properties: {
                rowCount: tableNode.properties.rowCount?.toNumber(),
              },
            });
          }
          seenTableIds.add(tableNode.properties.id);

          // Add HAS_TABLE edge
          if (!options?.edgeTypes || options.edgeTypes.includes('HAS_TABLE')) {
            edges.push({
              source: dbNode.properties.id,
              target: tableNode.properties.id,
              type: 'HAS_TABLE',
            });
          }
        }

        // Add Column node
        if (columnNode && !seenColumnIds.has(columnNode.properties.id)) {
          if (!options?.nodeTypes || options.nodeTypes.includes('COLUMN')) {
            nodes.push({
              id: columnNode.properties.id,
              label: columnNode.properties.name,
              type: 'COLUMN',
              databaseId: dbNode.properties.id,
              tableId: tableNode.properties.id,
              properties: {
                dataType: columnNode.properties.dataType,
                primaryKey: columnNode.properties.primaryKey,
                notNull: columnNode.properties.notNull,
              },
            });
          }
          seenColumnIds.add(columnNode.properties.id);

          // Add HAS_COLUMN edge
          if (
            tableNode &&
            (!options?.edgeTypes || options.edgeTypes.includes('HAS_COLUMN'))
          ) {
            edges.push({
              source: tableNode.properties.id,
              target: columnNode.properties.id,
              type: 'HAS_COLUMN',
            });
          }
        }
      }

      // Fetch REFERENCES relationships (foreign keys)
      if (!options?.edgeTypes || options.edgeTypes.includes('REFERENCES')) {
        const referencesQuery = `
          MATCH (from:Column)-[r:REFERENCES]->(to:Column)
          ${databaseFilter ? 'MATCH (from)<-[:HAS_COLUMN]-()<-[:HAS_TABLE]-(d:Database) ' + databaseFilter : ''}
          RETURN from.id as fromId, to.id as toId
        `;

        const referencesResult = await session.run(referencesQuery, {
          databaseIds: options?.databaseIds || [],
        });

        for (const record of referencesResult.records) {
          edges.push({
            source: record.get('fromId'),
            target: record.get('toId'),
            type: 'REFERENCES',
          });
        }
      }

      // Fetch SIMILAR_TO relationships
      if (!options?.edgeTypes || options.edgeTypes.includes('SIMILAR_TO')) {
        const confidenceFilter =
          options?.minConfidence !== undefined
            ? 'AND r.confidence >= $minConfidence'
            : '';

        const similarityQuery = `
          MATCH (from:Column)-[r:SIMILAR_TO]->(to:Column)
          ${databaseFilter ? 'MATCH (from)<-[:HAS_COLUMN]-()<-[:HAS_TABLE]-(d:Database) ' + databaseFilter : ''}
          WHERE 1=1 ${confidenceFilter}
          RETURN from.id as fromId, to.id as toId, r.confidence as confidence, r.discoveredAt as discoveredAt
        `;

        const similarityResult = await session.run(similarityQuery, {
          databaseIds: options?.databaseIds || [],
          minConfidence: options?.minConfidence || 0.0,
        });

        for (const record of similarityResult.records) {
          const discoveredAt = record.get('discoveredAt');
          edges.push({
            source: record.get('fromId'),
            target: record.get('toId'),
            type: 'SIMILAR_TO',
            confidence: record.get('confidence'),
            discoveredAt: discoveredAt ? discoveredAt.toString() : undefined,
          });
        }
      }

      return { nodes, edges };
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
