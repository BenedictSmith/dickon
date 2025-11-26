import { describe, it, expect } from '@jest/globals';
import { Column } from '../../../src/domain/Column';

describe('Column', () => {
  describe('constructor', () => {
    it('should create a Column instance with required properties', () => {
      // Arrange & Act
      const column = new Column({
        id: 'col-1',
        name: 'user_id',
        dataType: 'INTEGER',
        tableId: 'table-1',
      });

      // Assert
      expect(column).toBeInstanceOf(Column);
      expect(column.id).toBe('col-1');
      expect(column.name).toBe('user_id');
      expect(column.dataType).toBe('INTEGER');
      expect(column.tableId).toBe('table-1');
    });

    it('should set optional properties to defaults if not provided', () => {
      // Act
      const column = new Column({
        id: 'col-1',
        name: 'user_id',
        dataType: 'INTEGER',
        tableId: 'table-1',
      });

      // Assert
      expect(column.notNull).toBe(false);
      expect(column.primaryKey).toBe(false);
      expect(column.defaultValue).toBeNull();
    });

    it('should use provided optional properties', () => {
      // Act
      const column = new Column({
        id: 'col-1',
        name: 'user_id',
        dataType: 'INTEGER',
        tableId: 'table-1',
        notNull: true,
        primaryKey: true,
        defaultValue: '0',
      });

      // Assert
      expect(column.notNull).toBe(true);
      expect(column.primaryKey).toBe(true);
      expect(column.defaultValue).toBe('0');
    });

    it('should throw an error if id is empty', () => {
      // Act & Assert
      expect(() => {
        new Column({
          id: '',
          name: 'user_id',
          dataType: 'INTEGER',
          tableId: 'table-1',
        });
      }).toThrow('Column id cannot be empty');
    });

    it('should throw an error if name is empty', () => {
      // Act & Assert
      expect(() => {
        new Column({
          id: 'col-1',
          name: '',
          dataType: 'INTEGER',
          tableId: 'table-1',
        });
      }).toThrow('Column name cannot be empty');
    });

    it('should throw an error if dataType is empty', () => {
      // Act & Assert
      expect(() => {
        new Column({
          id: 'col-1',
          name: 'user_id',
          dataType: '',
          tableId: 'table-1',
        });
      }).toThrow('Column dataType cannot be empty');
    });

    it('should throw an error if tableId is empty', () => {
      // Act & Assert
      expect(() => {
        new Column({
          id: 'col-1',
          name: 'user_id',
          dataType: 'INTEGER',
          tableId: '',
        });
      }).toThrow('Column tableId cannot be empty');
    });
  });

  describe('toJSON', () => {
    it('should serialize column to JSON with all properties', () => {
      // Arrange
      const column = new Column({
        id: 'col-1',
        name: 'user_id',
        dataType: 'INTEGER',
        tableId: 'table-1',
        notNull: true,
        primaryKey: true,
        defaultValue: '0',
      });

      // Act
      const json = column.toJSON();

      // Assert
      expect(json).toEqual({
        id: 'col-1',
        name: 'user_id',
        dataType: 'INTEGER',
        tableId: 'table-1',
        notNull: true,
        primaryKey: true,
        defaultValue: '0',
      });
    });

    it('should serialize column with default values', () => {
      // Arrange
      const column = new Column({
        id: 'col-1',
        name: 'user_id',
        dataType: 'INTEGER',
        tableId: 'table-1',
      });

      // Act
      const json = column.toJSON();

      // Assert
      expect(json).toEqual({
        id: 'col-1',
        name: 'user_id',
        dataType: 'INTEGER',
        tableId: 'table-1',
        notNull: false,
        primaryKey: false,
        defaultValue: null,
      });
    });
  });

  describe('equals', () => {
    it('should return true for columns with the same id', () => {
      // Arrange
      const col1 = new Column({
        id: 'col-1',
        name: 'user_id',
        dataType: 'INTEGER',
        tableId: 'table-1',
      });

      const col2 = new Column({
        id: 'col-1',
        name: 'different_name',
        dataType: 'TEXT',
        tableId: 'table-2',
      });

      // Act & Assert
      expect(col1.equals(col2)).toBe(true);
    });

    it('should return false for columns with different ids', () => {
      // Arrange
      const col1 = new Column({
        id: 'col-1',
        name: 'user_id',
        dataType: 'INTEGER',
        tableId: 'table-1',
      });

      const col2 = new Column({
        id: 'col-2',
        name: 'user_id',
        dataType: 'INTEGER',
        tableId: 'table-1',
      });

      // Act & Assert
      expect(col1.equals(col2)).toBe(false);
    });
  });

  describe('isPrimaryKey', () => {
    it('should return true when primaryKey is true', () => {
      // Arrange
      const column = new Column({
        id: 'col-1',
        name: 'id',
        dataType: 'INTEGER',
        tableId: 'table-1',
        primaryKey: true,
      });

      // Act & Assert
      expect(column.isPrimaryKey()).toBe(true);
    });

    it('should return false when primaryKey is false', () => {
      // Arrange
      const column = new Column({
        id: 'col-1',
        name: 'name',
        dataType: 'TEXT',
        tableId: 'table-1',
        primaryKey: false,
      });

      // Act & Assert
      expect(column.isPrimaryKey()).toBe(false);
    });
  });

  describe('isNullable', () => {
    it('should return true when notNull is false', () => {
      // Arrange
      const column = new Column({
        id: 'col-1',
        name: 'description',
        dataType: 'TEXT',
        tableId: 'table-1',
        notNull: false,
      });

      // Act & Assert
      expect(column.isNullable()).toBe(true);
    });

    it('should return false when notNull is true', () => {
      // Arrange
      const column = new Column({
        id: 'col-1',
        name: 'email',
        dataType: 'TEXT',
        tableId: 'table-1',
        notNull: true,
      });

      // Act & Assert
      expect(column.isNullable()).toBe(false);
    });
  });

  describe('hasDefaultValue', () => {
    it('should return true when defaultValue is set', () => {
      // Arrange
      const column = new Column({
        id: 'col-1',
        name: 'status',
        dataType: 'TEXT',
        tableId: 'table-1',
        defaultValue: "'active'",
      });

      // Act & Assert
      expect(column.hasDefaultValue()).toBe(true);
    });

    it('should return false when defaultValue is null', () => {
      // Arrange
      const column = new Column({
        id: 'col-1',
        name: 'status',
        dataType: 'TEXT',
        tableId: 'table-1',
      });

      // Act & Assert
      expect(column.hasDefaultValue()).toBe(false);
    });
  });

  describe('getFullyQualifiedName', () => {
    it('should return table.column format', () => {
      // Arrange
      const column = new Column({
        id: 'col-1',
        name: 'user_id',
        dataType: 'INTEGER',
        tableId: 'users',
      });

      // Act
      const fqn = column.getFullyQualifiedName();

      // Assert
      expect(fqn).toBe('users.user_id');
    });
  });
});
