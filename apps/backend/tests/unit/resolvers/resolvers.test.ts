import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { resolvers } from '../../../src/resolvers';
import { GraphService } from '../../../src/services/GraphService';
import { SchemaService } from '../../../src/services/SchemaService';
import { Database } from '../../../src/domain/Database';
import { Table } from '../../../src/domain/Table';
import { Column } from '../../../src/domain/Column';

// Mock services
jest.mock('../../../src/services/GraphService');
jest.mock('../../../src/services/SchemaService');

describe('GraphQL Resolvers', () => {
  let mockGraphService: jest.Mocked<GraphService>;
  let mockSchemaService: jest.Mocked<SchemaService>;
  let context: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGraphService = {
      getAllDatabasesFromGraph: jest.fn(),
      getDatabaseFromGraph: jest.fn(),
      getTablesForDatabase: jest.fn(),
      populateFullSchema: jest.fn(),
    } as any;

    mockSchemaService = {
      extractSchema: jest.fn(),
      getTableStructure: jest.fn(),
    } as any;

    context = {
      graphService: mockGraphService,
      schemaService: mockSchemaService,
    };
  });

  describe('Query.databases', () => {
    it('should return all databases', async () => {
      // Arrange
      const databases = [
        new Database({
          id: 'db-1',
          name: 'Chinook',
          path: '/data/chinook.db',
        }),
        new Database({
          id: 'db-2',
          name: 'Northwind',
          path: '/data/northwind.db',
        }),
      ];

      mockGraphService.getAllDatabasesFromGraph.mockResolvedValue(databases);

      // Act
      const result = await resolvers.Query.databases(null, {}, context);

      // Assert
      expect(result).toEqual(databases);
      expect(mockGraphService.getAllDatabasesFromGraph).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no databases exist', async () => {
      // Arrange
      mockGraphService.getAllDatabasesFromGraph.mockResolvedValue([]);

      // Act
      const result = await resolvers.Query.databases(null, {}, context);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('Query.database', () => {
    it('should return a database by ID', async () => {
      // Arrange
      const database = new Database({
        id: 'db-1',
        name: 'Chinook',
        path: '/data/chinook.db',
      });

      mockGraphService.getDatabaseFromGraph.mockResolvedValue(database);

      // Act
      const result = await resolvers.Query.database(
        null,
        { id: 'db-1' },
        context
      );

      // Assert
      expect(result).toEqual(database);
      expect(mockGraphService.getDatabaseFromGraph).toHaveBeenCalledWith('db-1');
    });

    it('should return null for non-existent database', async () => {
      // Arrange
      mockGraphService.getDatabaseFromGraph.mockResolvedValue(null);

      // Act
      const result = await resolvers.Query.database(
        null,
        { id: 'non-existent' },
        context
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Query.tables', () => {
    it('should return all tables for a database', async () => {
      // Arrange
      const tables = [
        new Table({
          id: 'table-1',
          name: 'users',
          databaseId: 'db-1',
        }),
        new Table({
          id: 'table-2',
          name: 'posts',
          databaseId: 'db-1',
        }),
      ];

      mockGraphService.getTablesForDatabase.mockResolvedValue(tables);

      // Act
      const result = await resolvers.Query.tables(
        null,
        { databaseId: 'db-1' },
        context
      );

      // Assert
      expect(result).toEqual(tables);
      expect(mockGraphService.getTablesForDatabase).toHaveBeenCalledWith('db-1');
    });
  });

  describe('Mutation.addDatabase', () => {
    it('should successfully add a database', async () => {
      // Arrange
      const input = {
        name: 'Test Database',
        path: '/data/test.db',
      };

      const database = new Database({
        id: 'generated-id',
        name: 'Test Database',
        path: '/data/test.db',
      });

      const table = new Table({
        id: 'table-1',
        name: 'users',
        databaseId: 'generated-id',
      });

      const column = new Column({
        id: 'col-1',
        name: 'id',
        dataType: 'INTEGER',
        tableId: 'table-1',
        primaryKey: true,
      });

      mockSchemaService.extractSchema.mockResolvedValue(database);
      mockSchemaService.getTableStructure.mockResolvedValue({
        table,
        columns: [column],
        foreignKeys: [],
      });

      // Act
      const result = await resolvers.Mutation.addDatabase(
        null,
        { input },
        context
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.database).toBeDefined();
      expect(result.database?.name).toBe('Test Database');
      expect(result.error).toBeNull();
      expect(mockSchemaService.extractSchema).toHaveBeenCalled();
      expect(mockGraphService.populateFullSchema).toHaveBeenCalled();
    });

    it('should handle errors when adding database', async () => {
      // Arrange
      const input = {
        name: 'Test Database',
        path: '/invalid/path.db',
      };

      mockSchemaService.extractSchema.mockRejectedValue(
        new Error('Database file not found')
      );

      // Act
      const result = await resolvers.Mutation.addDatabase(
        null,
        { input },
        context
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.database).toBeNull();
      expect(result.error).toBe('Database file not found');
    });
  });

  describe('Database.tables', () => {
    it('should resolve tables for a database', async () => {
      // Arrange
      const database = new Database({
        id: 'db-1',
        name: 'Chinook',
        path: '/data/chinook.db',
      });

      const tables = [
        new Table({
          id: 'table-1',
          name: 'users',
          databaseId: 'db-1',
        }),
      ];

      mockGraphService.getTablesForDatabase.mockResolvedValue(tables);

      // Act
      const result = await resolvers.Database.tables(database, {}, context);

      // Assert
      expect(result).toEqual(tables);
      expect(mockGraphService.getTablesForDatabase).toHaveBeenCalledWith('db-1');
    });
  });

  describe('Table.database', () => {
    it('should resolve the parent database for a table', async () => {
      // Arrange
      const table = new Table({
        id: 'table-1',
        name: 'users',
        databaseId: 'db-1',
      });

      const database = new Database({
        id: 'db-1',
        name: 'Chinook',
        path: '/data/chinook.db',
      });

      mockGraphService.getDatabaseFromGraph.mockResolvedValue(database);

      // Act
      const result = await resolvers.Table.database(table, {}, context);

      // Assert
      expect(result).toEqual(database);
      expect(mockGraphService.getDatabaseFromGraph).toHaveBeenCalledWith('db-1');
    });
  });

  describe('Column.table', () => {
    it('should resolve the parent table for a column', async () => {
      // Arrange
      const column = new Column({
        id: 'col-1',
        name: 'id',
        dataType: 'INTEGER',
        tableId: 'table-1',
        primaryKey: true,
      });

      // Mock getTablesForDatabase to return a table that matches
      const tables = [
        new Table({
          id: 'table-1',
          name: 'users',
          databaseId: 'db-1',
        }),
      ];

      mockGraphService.getTablesForDatabase.mockResolvedValue(tables);

      // We need to mock getDatabaseFromGraph for the table lookup
      mockGraphService.getDatabaseFromGraph.mockResolvedValue(
        new Database({
          id: 'db-1',
          name: 'Test',
          path: '/test.db',
        })
      );

      // Act
      const result = await resolvers.Column.table(column, {}, context);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe('table-1');
    });
  });
});
