import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DiscoveryService } from '../../../src/services/DiscoveryService';
import { Neo4jRepository } from '../../../src/repositories/Neo4jRepository';
import { Column } from '../../../src/domain/Column';

// Mock the Neo4j repository
jest.mock('../../../src/repositories/Neo4jRepository');

describe('DiscoveryService', () => {
  let discoveryService: DiscoveryService;
  let mockNeo4jRepo: jest.Mocked<Neo4jRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Neo4j repository
    mockNeo4jRepo = {
      getAllColumns: jest.fn(),
      createSimilarityRelationship: jest.fn(),
    } as any;

    discoveryService = new DiscoveryService(mockNeo4jRepo);
  });

  describe('findSimilarColumns', () => {
    it('should find columns with similar names', async () => {
      // Arrange
      const columns = [
        new Column({
          id: 'col-1',
          name: 'user_id',
          dataType: 'INTEGER',
          tableId: 'table-1',
          primaryKey: true,
        }),
        new Column({
          id: 'col-2',
          name: 'userId',
          dataType: 'INTEGER',
          tableId: 'table-2',
          primaryKey: false,
        }),
      ];

      mockNeo4jRepo.getAllColumns.mockResolvedValue(columns);

      // Act
      const result = await discoveryService.findSimilarColumns();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].column1Id).toBe('col-1');
      expect(result[0].column2Id).toBe('col-2');
      expect(result[0].confidence).toBeGreaterThan(0.7);
    });

    it('should not match columns from the same table', async () => {
      // Arrange
      const columns = [
        new Column({
          id: 'col-1',
          name: 'user_id',
          dataType: 'INTEGER',
          tableId: 'table-1',
          primaryKey: true,
        }),
        new Column({
          id: 'col-2',
          name: 'userId',
          dataType: 'INTEGER',
          tableId: 'table-1', // Same table
          primaryKey: false,
        }),
      ];

      mockNeo4jRepo.getAllColumns.mockResolvedValue(columns);

      // Act
      const result = await discoveryService.findSimilarColumns();

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should not match columns with incompatible types', async () => {
      // Arrange
      const columns = [
        new Column({
          id: 'col-1',
          name: 'user_id',
          dataType: 'INTEGER',
          tableId: 'table-1',
          primaryKey: true,
        }),
        new Column({
          id: 'col-2',
          name: 'user_id',
          dataType: 'TEXT', // Incompatible type
          tableId: 'table-2',
          primaryKey: false,
        }),
      ];

      mockNeo4jRepo.getAllColumns.mockResolvedValue(columns);

      // Act
      const result = await discoveryService.findSimilarColumns();

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should filter out low confidence matches', async () => {
      // Arrange
      const columns = [
        new Column({
          id: 'col-1',
          name: 'abc',
          dataType: 'INTEGER',
          tableId: 'table-1',
          primaryKey: false,
        }),
        new Column({
          id: 'col-2',
          name: 'xyz',
          dataType: 'INTEGER',
          tableId: 'table-2',
          primaryKey: false,
        }),
      ];

      mockNeo4jRepo.getAllColumns.mockResolvedValue(columns);

      // Act
      const result = await discoveryService.findSimilarColumns();

      // Assert
      expect(result).toHaveLength(0); // Completely different names = low confidence
    });

    it('should handle multiple similar column pairs', async () => {
      // Arrange
      const columns = [
        new Column({
          id: 'col-1',
          name: 'user_id',
          dataType: 'INTEGER',
          tableId: 'table-1',
          primaryKey: true,
        }),
        new Column({
          id: 'col-2',
          name: 'userId',
          dataType: 'INTEGER',
          tableId: 'table-2',
          primaryKey: false,
        }),
        new Column({
          id: 'col-3',
          name: 'customer_id',
          dataType: 'INTEGER',
          tableId: 'table-1',
          primaryKey: false,
        }),
        new Column({
          id: 'col-4',
          name: 'customerId',
          dataType: 'INTEGER',
          tableId: 'table-2',
          primaryKey: false,
        }),
      ];

      mockNeo4jRepo.getAllColumns.mockResolvedValue(columns);

      // Act
      const result = await discoveryService.findSimilarColumns();

      // Assert
      expect(result.length).toBeGreaterThanOrEqual(2);
      const columnIds = result.flatMap((r) => [r.column1Id, r.column2Id]);
      expect(columnIds).toContain('col-1');
      expect(columnIds).toContain('col-2');
      expect(columnIds).toContain('col-3');
      expect(columnIds).toContain('col-4');
    });

    it('should handle empty column list', async () => {
      // Arrange
      mockNeo4jRepo.getAllColumns.mockResolvedValue([]);

      // Act
      const result = await discoveryService.findSimilarColumns();

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should handle single column', async () => {
      // Arrange
      const columns = [
        new Column({
          id: 'col-1',
          name: 'user_id',
          dataType: 'INTEGER',
          tableId: 'table-1',
          primaryKey: true,
        }),
      ];

      mockNeo4jRepo.getAllColumns.mockResolvedValue(columns);

      // Act
      const result = await discoveryService.findSimilarColumns();

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('calculateConfidence', () => {
    it('should return high confidence for similar names and compatible types', () => {
      // Arrange
      const col1 = new Column({
        id: 'col-1',
        name: 'user_id',
        dataType: 'INTEGER',
        tableId: 'table-1',
        primaryKey: true,
      });

      const col2 = new Column({
        id: 'col-2',
        name: 'userId',
        dataType: 'INTEGER',
        tableId: 'table-2',
        primaryKey: false,
      });

      // Act
      const confidence = discoveryService.calculateConfidence(col1, col2);

      // Assert
      expect(confidence).toBeGreaterThan(0.7);
      expect(confidence).toBeLessThanOrEqual(1.0);
    });

    it('should return low confidence for dissimilar names', () => {
      // Arrange
      const col1 = new Column({
        id: 'col-1',
        name: 'abc',
        dataType: 'INTEGER',
        tableId: 'table-1',
        primaryKey: false,
      });

      const col2 = new Column({
        id: 'col-2',
        name: 'xyz',
        dataType: 'INTEGER',
        tableId: 'table-2',
        primaryKey: false,
      });

      // Act
      const confidence = discoveryService.calculateConfidence(col1, col2);

      // Assert
      expect(confidence).toBeLessThan(0.5);
    });

    it('should return zero confidence for incompatible types', () => {
      // Arrange
      const col1 = new Column({
        id: 'col-1',
        name: 'user_id',
        dataType: 'INTEGER',
        tableId: 'table-1',
        primaryKey: true,
      });

      const col2 = new Column({
        id: 'col-2',
        name: 'user_id',
        dataType: 'TEXT',
        tableId: 'table-2',
        primaryKey: false,
      });

      // Act
      const confidence = discoveryService.calculateConfidence(col1, col2);

      // Assert
      expect(confidence).toBe(0.0);
    });

    it('should boost confidence when column names indicate foreign key relationships', () => {
      // Arrange
      const col1 = new Column({
        id: 'col-1',
        name: 'id',
        dataType: 'INTEGER',
        tableId: 'table-users',
        primaryKey: true,
      });

      const col2 = new Column({
        id: 'col-2',
        name: 'user_id',
        dataType: 'INTEGER',
        tableId: 'table-posts',
        primaryKey: false,
      });

      // Act
      const confidence = discoveryService.calculateConfidence(col1, col2);

      // Assert
      expect(confidence).toBeGreaterThan(0.6);
    });
  });

  describe('createSimilarityRelationships', () => {
    it('should create relationships for discovered column pairs', async () => {
      // Arrange
      const columns = [
        new Column({
          id: 'col-1',
          name: 'user_id',
          dataType: 'INTEGER',
          tableId: 'table-1',
          primaryKey: true,
        }),
        new Column({
          id: 'col-2',
          name: 'userId',
          dataType: 'INTEGER',
          tableId: 'table-2',
          primaryKey: false,
        }),
      ];

      mockNeo4jRepo.getAllColumns.mockResolvedValue(columns);
      mockNeo4jRepo.createSimilarityRelationship.mockResolvedValue(undefined);

      // Act
      const count = await discoveryService.createSimilarityRelationships();

      // Assert
      expect(count).toBeGreaterThan(0);
      expect(mockNeo4jRepo.createSimilarityRelationship).toHaveBeenCalled();
    });

    it('should return count of relationships created', async () => {
      // Arrange
      const columns = [
        new Column({
          id: 'col-1',
          name: 'user_id',
          dataType: 'INTEGER',
          tableId: 'table-1',
          primaryKey: true,
        }),
        new Column({
          id: 'col-2',
          name: 'userId',
          dataType: 'INTEGER',
          tableId: 'table-2',
          primaryKey: false,
        }),
        new Column({
          id: 'col-3',
          name: 'customer_id',
          dataType: 'INTEGER',
          tableId: 'table-1',
          primaryKey: false,
        }),
        new Column({
          id: 'col-4',
          name: 'customerId',
          dataType: 'INTEGER',
          tableId: 'table-2',
          primaryKey: false,
        }),
      ];

      mockNeo4jRepo.getAllColumns.mockResolvedValue(columns);
      mockNeo4jRepo.createSimilarityRelationship.mockResolvedValue(undefined);

      // Act
      const count = await discoveryService.createSimilarityRelationships();

      // Assert
      expect(count).toBeGreaterThanOrEqual(2);
    });

    it('should handle empty column list', async () => {
      // Arrange
      mockNeo4jRepo.getAllColumns.mockResolvedValue([]);

      // Act
      const count = await discoveryService.createSimilarityRelationships();

      // Assert
      expect(count).toBe(0);
      expect(mockNeo4jRepo.createSimilarityRelationship).not.toHaveBeenCalled();
    });
  });
});
