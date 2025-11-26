import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GraphService } from '../../../src/services/GraphService';
import { Neo4jRepository } from '../../../src/repositories/Neo4jRepository';
import { Database } from '../../../src/domain/Database';
import { Table } from '../../../src/domain/Table';
import { Column } from '../../../src/domain/Column';

// Mock Neo4jRepository
jest.mock('../../../src/repositories/Neo4jRepository');

describe('GraphService', () => {
  let service: GraphService;
  let mockRepository: jest.Mocked<Neo4jRepository>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock repository
    mockRepository = {
      createDatabase: jest.fn(),
      createTable: jest.fn(),
      createColumn: jest.fn(),
      createForeignKeyRelationship: jest.fn(),
      getDatabase: jest.fn(),
      getAllDatabases: jest.fn(),
      getTablesForDatabase: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<Neo4jRepository>;

    service = new GraphService(mockRepository);
  });

  describe('populateDatabase', () => {
    it('should create a database node in the graph', async () => {
      // Arrange
      const database = new Database({
        id: 'test-db-1',
        name: 'Test Database',
        path: '/data/test.db',
      });

      // Act
      await service.populateDatabase(database);

      // Assert
      expect(mockRepository.createDatabase).toHaveBeenCalledWith(database);
      expect(mockRepository.createDatabase).toHaveBeenCalledTimes(1);
    });
  });

  describe('populateTable', () => {
    it('should create a table node linked to its database', async () => {
      // Arrange
      const table = new Table({
        id: 'test-table-1',
        name: 'users',
        databaseId: 'test-db-1',
        rowCount: 100,
      });

      // Act
      await service.populateTable(table);

      // Assert
      expect(mockRepository.createTable).toHaveBeenCalledWith(table);
      expect(mockRepository.createTable).toHaveBeenCalledTimes(1);
    });
  });

  describe('populateColumns', () => {
    it('should create multiple column nodes', async () => {
      // Arrange
      const columns = [
        new Column({
          id: 'col-1',
          name: 'id',
          dataType: 'INTEGER',
          tableId: 'table-1',
          primaryKey: true,
        }),
        new Column({
          id: 'col-2',
          name: 'name',
          dataType: 'TEXT',
          tableId: 'table-1',
          notNull: true,
        }),
      ];

      // Act
      await service.populateColumns(columns);

      // Assert
      expect(mockRepository.createColumn).toHaveBeenCalledTimes(2);
      expect(mockRepository.createColumn).toHaveBeenCalledWith(columns[0]);
      expect(mockRepository.createColumn).toHaveBeenCalledWith(columns[1]);
    });

    it('should handle empty column arrays', async () => {
      // Act
      await service.populateColumns([]);

      // Assert
      expect(mockRepository.createColumn).not.toHaveBeenCalled();
    });
  });

  describe('createForeignKeyRelationships', () => {
    it('should create REFERENCES relationships between columns', async () => {
      // Arrange
      const foreignKeys = [
        { fromColumn: 'col-2', toColumn: 'col-1' },
        { fromColumn: 'col-3', toColumn: 'col-1' },
      ];

      // Act
      await service.createForeignKeyRelationships(foreignKeys);

      // Assert
      expect(mockRepository.createForeignKeyRelationship).toHaveBeenCalledTimes(
        2
      );
      expect(mockRepository.createForeignKeyRelationship).toHaveBeenCalledWith(
        'col-2',
        'col-1'
      );
      expect(mockRepository.createForeignKeyRelationship).toHaveBeenCalledWith(
        'col-3',
        'col-1'
      );
    });

    it('should handle empty foreign key arrays', async () => {
      // Act
      await service.createForeignKeyRelationships([]);

      // Assert
      expect(mockRepository.createForeignKeyRelationship).not.toHaveBeenCalled();
    });
  });

  describe('populateFullSchema', () => {
    it('should populate database, tables, columns, and foreign keys', async () => {
      // Arrange
      const database = new Database({
        id: 'test-db-1',
        name: 'Test Database',
        path: '/data/test.db',
      });

      const tables = [
        new Table({
          id: 'table-1',
          name: 'users',
          databaseId: 'test-db-1',
        }),
      ];

      const columns = [
        new Column({
          id: 'col-1',
          name: 'id',
          dataType: 'INTEGER',
          tableId: 'table-1',
          primaryKey: true,
        }),
      ];

      const foreignKeys = [{ fromColumn: 'col-2', toColumn: 'col-1' }];

      // Act
      await service.populateFullSchema(database, tables, columns, foreignKeys);

      // Assert
      expect(mockRepository.createDatabase).toHaveBeenCalledWith(database);
      expect(mockRepository.createTable).toHaveBeenCalledTimes(1);
      expect(mockRepository.createColumn).toHaveBeenCalledTimes(1);
      expect(mockRepository.createForeignKeyRelationship).toHaveBeenCalledTimes(
        1
      );
    });

    it('should handle schema with no foreign keys', async () => {
      // Arrange
      const database = new Database({
        id: 'test-db-1',
        name: 'Test Database',
        path: '/data/test.db',
      });

      const tables = [
        new Table({
          id: 'table-1',
          name: 'users',
          databaseId: 'test-db-1',
        }),
      ];

      const columns = [
        new Column({
          id: 'col-1',
          name: 'id',
          dataType: 'INTEGER',
          tableId: 'table-1',
          primaryKey: true,
        }),
      ];

      // Act
      await service.populateFullSchema(database, tables, columns, []);

      // Assert
      expect(mockRepository.createDatabase).toHaveBeenCalled();
      expect(mockRepository.createTable).toHaveBeenCalled();
      expect(mockRepository.createColumn).toHaveBeenCalled();
      expect(mockRepository.createForeignKeyRelationship).not.toHaveBeenCalled();
    });
  });

  describe('getDatabaseFromGraph', () => {
    it('should retrieve a database by ID', async () => {
      // Arrange
      const expectedDatabase = new Database({
        id: 'test-db-1',
        name: 'Test Database',
        path: '/data/test.db',
      });

      mockRepository.getDatabase.mockResolvedValue(expectedDatabase);

      // Act
      const result = await service.getDatabaseFromGraph('test-db-1');

      // Assert
      expect(result).toEqual(expectedDatabase);
      expect(mockRepository.getDatabase).toHaveBeenCalledWith('test-db-1');
    });

    it('should return null for non-existent database', async () => {
      // Arrange
      mockRepository.getDatabase.mockResolvedValue(null);

      // Act
      const result = await service.getDatabaseFromGraph('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getAllDatabasesFromGraph', () => {
    it('should retrieve all databases', async () => {
      // Arrange
      const databases = [
        new Database({
          id: 'db-1',
          name: 'Database 1',
          path: '/data/db1.db',
        }),
        new Database({
          id: 'db-2',
          name: 'Database 2',
          path: '/data/db2.db',
        }),
      ];

      mockRepository.getAllDatabases.mockResolvedValue(databases);

      // Act
      const result = await service.getAllDatabasesFromGraph();

      // Assert
      expect(result).toEqual(databases);
      expect(result).toHaveLength(2);
    });
  });

  describe('getTablesForDatabase', () => {
    it('should retrieve all tables for a database', async () => {
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

      mockRepository.getTablesForDatabase.mockResolvedValue(tables);

      // Act
      const result = await service.getTablesForDatabase('db-1');

      // Assert
      expect(result).toEqual(tables);
      expect(result).toHaveLength(2);
      expect(mockRepository.getTablesForDatabase).toHaveBeenCalledWith('db-1');
    });
  });
});
