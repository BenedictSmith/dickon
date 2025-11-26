import { describe, it, expect } from '@jest/globals';
import { Database } from '../../../src/domain/Database';

describe('Database', () => {
  describe('constructor', () => {
    it('should create a Database instance with required properties', () => {
      // Arrange & Act
      const database = new Database({
        id: 'db-1',
        name: 'Chinook',
        path: '/data/chinook.db',
      });

      // Assert
      expect(database).toBeInstanceOf(Database);
      expect(database.id).toBe('db-1');
      expect(database.name).toBe('Chinook');
      expect(database.path).toBe('/data/chinook.db');
    });

    it('should set addedAt to current date if not provided', () => {
      // Arrange
      const beforeCreate = new Date();

      // Act
      const database = new Database({
        id: 'db-1',
        name: 'Chinook',
        path: '/data/chinook.db',
      });

      const afterCreate = new Date();

      // Assert
      expect(database.addedAt).toBeInstanceOf(Date);
      expect(database.addedAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(database.addedAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });

    it('should use provided addedAt date if specified', () => {
      // Arrange
      const customDate = new Date('2024-01-01T00:00:00Z');

      // Act
      const database = new Database({
        id: 'db-1',
        name: 'Chinook',
        path: '/data/chinook.db',
        addedAt: customDate,
      });

      // Assert
      expect(database.addedAt).toBe(customDate);
    });

    it('should throw an error if id is empty', () => {
      // Act & Assert
      expect(() => {
        new Database({
          id: '',
          name: 'Chinook',
          path: '/data/chinook.db',
        });
      }).toThrow('Database id cannot be empty');
    });

    it('should throw an error if name is empty', () => {
      // Act & Assert
      expect(() => {
        new Database({
          id: 'db-1',
          name: '',
          path: '/data/chinook.db',
        });
      }).toThrow('Database name cannot be empty');
    });

    it('should throw an error if path is empty', () => {
      // Act & Assert
      expect(() => {
        new Database({
          id: 'db-1',
          name: 'Chinook',
          path: '',
        });
      }).toThrow('Database path cannot be empty');
    });
  });

  describe('toJSON', () => {
    it('should serialize database to JSON', () => {
      // Arrange
      const database = new Database({
        id: 'db-1',
        name: 'Chinook',
        path: '/data/chinook.db',
        addedAt: new Date('2024-01-01T00:00:00Z'),
      });

      // Act
      const json = database.toJSON();

      // Assert
      expect(json).toEqual({
        id: 'db-1',
        name: 'Chinook',
        path: '/data/chinook.db',
        addedAt: '2024-01-01T00:00:00.000Z',
      });
    });
  });

  describe('equals', () => {
    it('should return true for databases with the same id', () => {
      // Arrange
      const db1 = new Database({
        id: 'db-1',
        name: 'Chinook',
        path: '/data/chinook.db',
      });

      const db2 = new Database({
        id: 'db-1',
        name: 'Different Name',
        path: '/different/path.db',
      });

      // Act & Assert
      expect(db1.equals(db2)).toBe(true);
    });

    it('should return false for databases with different ids', () => {
      // Arrange
      const db1 = new Database({
        id: 'db-1',
        name: 'Chinook',
        path: '/data/chinook.db',
      });

      const db2 = new Database({
        id: 'db-2',
        name: 'Chinook',
        path: '/data/chinook.db',
      });

      // Act & Assert
      expect(db1.equals(db2)).toBe(false);
    });
  });

  describe('getFileName', () => {
    it('should extract filename from path', () => {
      // Arrange
      const database = new Database({
        id: 'db-1',
        name: 'Chinook',
        path: '/data/databases/chinook.db',
      });

      // Act
      const fileName = database.getFileName();

      // Assert
      expect(fileName).toBe('chinook.db');
    });

    it('should handle Windows-style paths', () => {
      // Arrange
      const database = new Database({
        id: 'db-1',
        name: 'Chinook',
        path: 'C:\\data\\databases\\chinook.db',
      });

      // Act
      const fileName = database.getFileName();

      // Assert
      expect(fileName).toBe('chinook.db');
    });

    it('should handle paths without directory', () => {
      // Arrange
      const database = new Database({
        id: 'db-1',
        name: 'Chinook',
        path: 'chinook.db',
      });

      // Act
      const fileName = database.getFileName();

      // Assert
      expect(fileName).toBe('chinook.db');
    });
  });
});
