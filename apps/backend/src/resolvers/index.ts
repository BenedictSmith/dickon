import { GraphQLScalarType, Kind } from 'graphql';
import { GraphService } from '../services/GraphService';
import { SchemaService } from '../services/SchemaService';
import { JobManager } from '../services/JobManager';
import { FederationService } from '../services/FederationService';
import { QueryCache, generateCacheKey } from '../services/QueryCache';
import { Database } from '../domain/Database';
import { Table } from '../domain/Table';
import { Column } from '../domain/Column';
import { Job } from '../domain/Job';
import { FederatedQueryInput } from '../types/federation';

/**
 * GraphQL context containing service instances
 */
export interface GraphQLContext {
  graphService: GraphService;
  schemaService: SchemaService;
  jobManager: JobManager;
  federationService: FederationService;
  queryCache: QueryCache;
}

/**
 * GraphQL resolvers for SiloBreaker API
 */
export const resolvers = {
  Query: {
    /**
     * Get all databases in the system
     */
    async databases(
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ): Promise<Database[]> {
      return await context.graphService.getAllDatabasesFromGraph();
    },

    /**
     * Get a specific database by ID
     */
    async database(
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ): Promise<Database | null> {
      return await context.graphService.getDatabaseFromGraph(args.id);
    },

    /**
     * Get all tables for a specific database
     */
    async tables(
      _parent: unknown,
      args: { databaseId: string },
      context: GraphQLContext
    ): Promise<Table[]> {
      return await context.graphService.getTablesForDatabase(args.databaseId);
    },

    /**
     * Get a specific table by ID (placeholder for now)
     */
    async table(
      _parent: unknown,
      _args: { id: string },
      _context: GraphQLContext
    ): Promise<Table | null> {
      // TODO: Implement getTable in GraphService
      return null;
    },

    /**
     * Get all jobs
     */
    async jobs(
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ): Promise<Job[]> {
      return context.jobManager.getAllJobs();
    },

    /**
     * Get a specific job by ID
     */
    async job(
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ): Promise<Job | null> {
      return context.jobManager.getJob(args.id) || null;
    },

    /**
     * Get graph data for visualization
     */
    async getGraphData(
      _parent: unknown,
      args: {
        input?: {
          databaseIds?: string[];
          minConfidence?: number;
          maxNodes?: number;
          nodeTypes?: string[];
          edgeTypes?: string[];
        };
      },
      context: GraphQLContext
    ): Promise<{
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
      return await context.graphService.getGraphData(args.input);
    },
  },

  Mutation: {
    /**
     * Add a new database to the system
     * Extracts schema from SQLite and populates Neo4j graph
     */
    async addDatabase(
      _parent: unknown,
      args: { input: { name: string; path: string } },
      context: GraphQLContext
    ): Promise<{
      success: boolean;
      database: Database | null;
      error: string | null;
    }> {
      try {
        const { name, path } = args.input;

        // Extract schema from SQLite database
        const database = await context.schemaService.extractSchema(path, name);

        // Get all tables and their structures
        const tables: Table[] = [];
        const allColumns: Column[] = [];
        const allForeignKeys: { fromColumn: string; toColumn: string }[] = [];

        // For now, we'll need to enhance SchemaService to return tables
        // This is a simplified version - in practice, SchemaService.extractSchema
        // should return more complete information

        // Populate the Neo4j graph
        await context.graphService.populateFullSchema(
          database,
          tables,
          allColumns,
          allForeignKeys
        );

        return {
          success: true,
          database,
          error: null,
        };
      } catch (error) {
        return {
          success: false,
          database: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },

    /**
     * Start a discovery job to find column relationships
     */
    async startDiscovery(
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ): Promise<{
      success: boolean;
      job: Job | null;
      error: string | null;
    }> {
      try {
        const job = await context.jobManager.startDiscovery();
        return {
          success: true,
          job,
          error: null,
        };
      } catch (error) {
        return {
          success: false,
          job: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },

    /**
     * Cancel a running job
     */
    async cancelJob(
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ): Promise<boolean> {
      return context.jobManager.cancelJob(args.id);
    },

    /**
     * Execute federated query across multiple databases
     */
    async federatedQuery(
      _parent: unknown,
      args: { input: FederatedQueryInput },
      context: GraphQLContext
    ): Promise<{
      rows: Array<Record<string, unknown>>;
      columns: string[];
      executionTimeMs: number;
      databases: string[];
    }> {
      try {
        // Generate cache key
        const cacheKey = generateCacheKey(args.input);

        // Check cache first
        const cached = await context.queryCache.get(cacheKey);
        if (cached) {
          return cached;
        }

        // Execute query
        const result = await context.federationService.executeQuery(args.input);

        // Cache result (5 minute TTL)
        const databases = args.input.tables.map((t) => t.database);
        await context.queryCache.set(cacheKey, result, databases);

        return result;
      } catch (error) {
        throw new Error(
          `Federated query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    },
  },

  /**
   * JSON scalar type for arbitrary JSON data
   */
  JSON: new GraphQLScalarType({
    name: 'JSON',
    description: 'Arbitrary JSON value',
    serialize(value: unknown): unknown {
      return value;
    },
    parseValue(value: unknown): unknown {
      return value;
    },
    parseLiteral(ast): unknown {
      const parseAst = (node: typeof ast): unknown => {
        if (node.kind === Kind.STRING) {
          return node.value;
        }
        if (node.kind === Kind.INT || node.kind === Kind.FLOAT) {
          return Number(node.value);
        }
        if (node.kind === Kind.BOOLEAN) {
          return node.value;
        }
        if (node.kind === Kind.NULL) {
          return null;
        }
        if (node.kind === Kind.LIST) {
          return node.values.map((v) => parseAst(v));
        }
        if (node.kind === Kind.OBJECT) {
          const value: Record<string, unknown> = {};
          node.fields.forEach((field) => {
            value[field.name.value] = parseAst(field.value);
          });
          return value;
        }
        return null;
      };
      return parseAst(ast);
    },
  }),

  /**
   * Field resolvers for Database type
   */
  Database: {
    /**
     * Resolve tables for a database
     */
    async tables(
      parent: Database,
      _args: unknown,
      context: GraphQLContext
    ): Promise<Table[]> {
      return await context.graphService.getTablesForDatabase(parent.id);
    },
  },

  /**
   * Field resolvers for Table type
   */
  Table: {
    /**
     * Resolve the parent database for a table
     */
    async database(
      parent: Table,
      _args: unknown,
      context: GraphQLContext
    ): Promise<Database | null> {
      return await context.graphService.getDatabaseFromGraph(parent.databaseId);
    },

    /**
     * Resolve columns for a table (placeholder)
     */
    async columns(
      _parent: Table,
      _args: unknown,
      _context: GraphQLContext
    ): Promise<Column[]> {
      // TODO: Implement getColumnsForTable in GraphService
      return [];
    },
  },

  /**
   * Field resolvers for Column type
   */
  Column: {
    /**
     * Resolve the parent table for a column
     */
    async table(
      parent: Column,
      _args: unknown,
      context: GraphQLContext
    ): Promise<Table | null> {
      // For now, we'll need to find the table by ID
      // This is inefficient - should be improved with DataLoader
      const tables = await context.graphService.getTablesForDatabase('');
      return tables.find((t) => t.id === parent.tableId) || null;
    },
  },
};
