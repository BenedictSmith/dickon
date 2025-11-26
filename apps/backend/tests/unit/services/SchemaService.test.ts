import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SchemaService } from '../../../src/services/SchemaService';
import { SQLiteRepository } from '../../../src/repositories/SQLiteRepository';
import { Database } from '../../../src/domain/Database';
import { Table } from '../../../src/domain/Table';
import { Column } from '../../../src/domain/Column';

// Mock SQLiteRepository
jest.mock('../../../src/repositories/SQLiteRepository');

describe('SchemaService', () => {
  let service: SchemaService;
  let mockRepository: jest.Mocked<SQLiteRepository>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock repository instance
    mockRepository = {
      getTables: jest.fn(),
      getColumns: jest.fn(),
      getForeignKeys: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<SQLiteRepository>;

    // Mock the SQLiteRepository constructor
    (SQLiteRepository as jest.MockedClass<typeof SQLiteRepository>).mockImplementation(
      () => mockRepository
    );

    service = new SchemaService();
  });

  describe('extractSchema', () => {
    it('should extract a complete database schema', async () => {
      // Arrange
      const dbPath = '/data/test.db';
      mockRepository.getTables.mockReturnValue(['users', 'posts']);

      mockRepository.getColumns.mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          return [
            {
              name: 'id',
              type: 'INTEGER',
              notNull: false,
              primaryKey: true,
              defaultValue: null,
            },
            {
              name: 'name',
              type: 'TEXT',
              notNull: true,
              primaryKey: false,
              defaultValue: null,
            },
          ];
        }
        return [];
      });

      mockRepository.getForeignKeys.mockReturnValue([]);

      // Act
      const result = await service.extractSchema(dbPath, 'test-db');

      // Assert
      expect(result).toBeInstanceOf(Database);
      expect(result.name).toBe('test-db');
      expect(result.path).toBe(dbPath);
    });

    it('should generate a unique id for the database', async () => {
      // Arrange
      const dbPath = '/data/test.db';
      mockRepository.getTables.mockReturnValue([]);

      // Act
      const result = await service.extractSchema(dbPath, 'test-db');

      // Assert
      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^[a-f0-9-]+$/); // UUID-like format
    });

    it('should extract all tables from the database', async () => {
      // Arrange
      const dbPath = '/data/test.db';
      mockRepository.getTables.mockReturnValue(['users', 'posts', 'comments']);
      mockRepository.getColumns.mockReturnValue([]);
      mockRepository.getForeignKeys.mockReturnValue([]);

      // Act
      await service.extractSchema(dbPath, 'test-db');

      // Assert
      expect(mockRepository.getTables).toHaveBeenCalledTimes(1);
    });

    it('should extract columns for each table', async () => {
      // Arrange
      const dbPath = '/data/test.db';
      mockRepository.getTables.mockReturnValue(['users', 'posts']);
      mockRepository.getColumns.mockReturnValue([
        {
          name: 'id',
          type: 'INTEGER',
          notNull: false,
          primaryKey: true,
          defaultValue: null,
        },
      ]);
      mockRepository.getForeignKeys.mockReturnValue([]);

      // Act
      await service.extractSchema(dbPath, 'test-db');

      // Assert
      expect(mockRepository.getColumns).toHaveBeenCalledWith('users');
      expect(mockRepository.getColumns).toHaveBeenCalledWith('posts');
      expect(mockRepository.getColumns).toHaveBeenCalledTimes(2);
    });

    it('should extract foreign keys for each table', async () => {
      // Arrange
      const dbPath = '/data/test.db';
      mockRepository.getTables.mockReturnValue(['users', 'posts']);
      mockRepository.getColumns.mockReturnValue([]);
      mockRepository.getForeignKeys.mockReturnValue([]);

      // Act
      await service.extractSchema(dbPath, 'test-db');

      // Assert
      expect(mockRepository.getForeignKeys).toHaveBeenCalledWith('users');
      expect(mockRepository.getForeignKeys).toHaveBeenCalledWith('posts');
      expect(mockRepository.getForeignKeys).toHaveBeenCalledTimes(2);
    });

    it('should close the repository connection after extraction', async () => {
      // Arrange
      const dbPath = '/data/test.db';
      mockRepository.getTables.mockReturnValue([]);

      // Act
      await service.extractSchema(dbPath, 'test-db');

      // Assert
      expect(mockRepository.close).toHaveBeenCalledTimes(1);
    });

    it('should close repository even if extraction fails', async () => {
      // Arrange
      const dbPath = '/data/test.db';
      mockRepository.getTables.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Act & Assert
      await expect(service.extractSchema(dbPath, 'test-db')).rejects.toThrow(
        'Database error'
      );
      expect(mockRepository.close).toHaveBeenCalledTimes(1);
    });

    it('should handle empty databases', async () => {
      // Arrange
      const dbPath = '/data/empty.db';
      mockRepository.getTables.mockReturnValue([]);

      // Act
      const result = await service.extractSchema(dbPath, 'empty-db');

      // Assert
      expect(result).toBeInstanceOf(Database);
      expect(result.name).toBe('empty-db');
    });
  });

  describe('getTableStructure', () => {
    it('should return table structure with columns', async () => {
      // Arrange
      const dbPath = '/data/test.db';
      const tableName = 'users';

      mockRepository.getColumns.mockReturnValue([
        {
          name: 'id',
          type: 'INTEGER',
          notNull: false,
          primaryKey: true,
          defaultValue: null,
        },
        {
          name: 'name',
          type: 'TEXT',
          notNull: true,
          primaryKey: false,
          defaultValue: null,
        },
      ]);

      mockRepository.getForeignKeys.mockReturnValue([]);

      // Act
      const result = await service.getTableStructure(dbPath, tableName);

      // Assert
      expect(result.table).toBeInstanceOf(Table);
      expect(result.table.name).toBe('users');
      expect(result.columns).toHaveLength(2);
      expect(result.columns[0]).toBeInstanceOf(Column);
    });

    it('should include foreign key information', async () => {
      // Arrange
      const dbPath = '/data/test.db';
      const tableName = 'posts';

      mockRepository.getColumns.mockReturnValue([
        {
          name: 'user_id',
          type: 'INTEGER',
          notNull: true,
          primaryKey: false,
          defaultValue: null,
        },
      ]);

      mockRepository.getForeignKeys.mockReturnValue([
        {
          fromColumn: 'user_id',
          toTable: 'users',
          toColumn: 'id',
        },
      ]);

      // Act
      const result = await service.getTableStructure(dbPath, tableName);

      // Assert
      expect(result.foreignKeys).toHaveLength(1);
      expect(result.foreignKeys[0].fromColumn).toBe('user_id');
      expect(result.foreignKeys[0].toTable).toBe('users');
    });

    it('should close repository after getting table structure', async () => {
      // Arrange
      const dbPath = '/data/test.db';
      mockRepository.getColumns.mockReturnValue([]);
      mockRepository.getForeignKeys.mockReturnValue([]);

      // Act
      await service.getTableStructure(dbPath, 'users');

      // Assert
      expect(mockRepository.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('analyzeDataTypes', () => {
    it('should return statistics about column data types', async () => {
      // Arrange
      const dbPath = '/data/test.db';
      mockRepository.getTables.mockReturnValue(['users', 'posts']);

      mockRepository.getColumns.mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          return [
            {
              name: 'id',
              type: 'INTEGER',
              notNull: false,
              primaryKey: true,
              defaultValue: null,
            },
            {
              name: 'name',
              type: 'TEXT',
              notNull: true,
              primaryKey: false,
              defaultValue: null,
            },
          ];
        } else if (tableName === 'posts') {
          return [
            {
              name: 'id',
              type: 'INTEGER',
              notNull: false,
              primaryKey: true,
              defaultValue: null,
            },
          ];
        }
        return [];
      });

      // Act
      const result = await service.analyzeDataTypes(dbPath);

      // Assert
      expect(result).toEqual({
        INTEGER: 2,
        TEXT: 1,
      });
    });

    it('should handle databases with no tables', async () => {
      // Arrange
      const dbPath = '/data/empty.db';
      mockRepository.getTables.mockReturnValue([]);

      // Act
      const result = await service.analyzeDataTypes(dbPath);

      // Assert
      expect(result).toEqual({});
    });

    it('should close repository after analysis', async () => {
      // Arrange
      const dbPath = '/data/test.db';
      mockRepository.getTables.mockReturnValue([]);

      // Act
      await service.analyzeDataTypes(dbPath);

      // Assert
      expect(mockRepository.close).toHaveBeenCalledTimes(1);
    });
  });
});
