import { describe, it, expect } from '@jest/globals';
import { Table } from '../../../src/domain/Table';

describe('Table', () => {
  describe('constructor', () => {
    it('should create a Table instance with required properties', () => {
      // Arrange & Act
      const table = new Table({
        id: 'table-1',
        name: 'users',
        databaseId: 'db-1',
      });

      // Assert
      expect(table).toBeInstanceOf(Table);
      expect(table.id).toBe('table-1');
      expect(table.name).toBe('users');
      expect(table.databaseId).toBe('db-1');
    });

    it('should set rowCount to null if not provided', () => {
      // Act
      const table = new Table({
        id: 'table-1',
        name: 'users',
        databaseId: 'db-1',
      });

      // Assert
      expect(table.rowCount).toBeNull();
    });

    it('should use provided rowCount if specified', () => {
      // Act
      const table = new Table({
        id: 'table-1',
        name: 'users',
        databaseId: 'db-1',
        rowCount: 1500,
      });

      // Assert
      expect(table.rowCount).toBe(1500);
    });

    it('should throw an error if id is empty', () => {
      // Act & Assert
      expect(() => {
        new Table({
          id: '',
          name: 'users',
          databaseId: 'db-1',
        });
      }).toThrow('Table id cannot be empty');
    });

    it('should throw an error if name is empty', () => {
      // Act & Assert
      expect(() => {
        new Table({
          id: 'table-1',
          name: '',
          databaseId: 'db-1',
        });
      }).toThrow('Table name cannot be empty');
    });

    it('should throw an error if databaseId is empty', () => {
      // Act & Assert
      expect(() => {
        new Table({
          id: 'table-1',
          name: 'users',
          databaseId: '',
        });
      }).toThrow('Table databaseId cannot be empty');
    });

    it('should throw an error if rowCount is negative', () => {
      // Act & Assert
      expect(() => {
        new Table({
          id: 'table-1',
          name: 'users',
          databaseId: 'db-1',
          rowCount: -1,
        });
      }).toThrow('Table rowCount cannot be negative');
    });
  });

  describe('toJSON', () => {
    it('should serialize table to JSON', () => {
      // Arrange
      const table = new Table({
        id: 'table-1',
        name: 'users',
        databaseId: 'db-1',
        rowCount: 1500,
      });

      // Act
      const json = table.toJSON();

      // Assert
      expect(json).toEqual({
        id: 'table-1',
        name: 'users',
        databaseId: 'db-1',
        rowCount: 1500,
      });
    });

    it('should serialize table with null rowCount', () => {
      // Arrange
      const table = new Table({
        id: 'table-1',
        name: 'users',
        databaseId: 'db-1',
      });

      // Act
      const json = table.toJSON();

      // Assert
      expect(json).toEqual({
        id: 'table-1',
        name: 'users',
        databaseId: 'db-1',
        rowCount: null,
      });
    });
  });

  describe('equals', () => {
    it('should return true for tables with the same id', () => {
      // Arrange
      const table1 = new Table({
        id: 'table-1',
        name: 'users',
        databaseId: 'db-1',
      });

      const table2 = new Table({
        id: 'table-1',
        name: 'different_name',
        databaseId: 'db-2',
      });

      // Act & Assert
      expect(table1.equals(table2)).toBe(true);
    });

    it('should return false for tables with different ids', () => {
      // Arrange
      const table1 = new Table({
        id: 'table-1',
        name: 'users',
        databaseId: 'db-1',
      });

      const table2 = new Table({
        id: 'table-2',
        name: 'users',
        databaseId: 'db-1',
      });

      // Act & Assert
      expect(table1.equals(table2)).toBe(false);
    });
  });

  describe('getFullyQualifiedName', () => {
    it('should return database.table format', () => {
      // Arrange
      const table = new Table({
        id: 'table-1',
        name: 'users',
        databaseId: 'chinook',
      });

      // Act
      const fqn = table.getFullyQualifiedName();

      // Assert
      expect(fqn).toBe('chinook.users');
    });
  });

  describe('hasRowCount', () => {
    it('should return true when rowCount is set', () => {
      // Arrange
      const table = new Table({
        id: 'table-1',
        name: 'users',
        databaseId: 'db-1',
        rowCount: 0,
      });

      // Act & Assert
      expect(table.hasRowCount()).toBe(true);
    });

    it('should return false when rowCount is null', () => {
      // Arrange
      const table = new Table({
        id: 'table-1',
        name: 'users',
        databaseId: 'db-1',
      });

      // Act & Assert
      expect(table.hasRowCount()).toBe(false);
    });
  });
});
