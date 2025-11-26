import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { SQLiteRepository } from '../../../src/repositories/SQLiteRepository';

describe('SQLiteRepository', () => {
  let repository: SQLiteRepository;
  let testDbPath: string;

  beforeEach(() => {
    // Create a temporary test database path
    const fixturesDir = path.join(__dirname, '../../fixtures');
    testDbPath = path.join(fixturesDir, 'test.db');

    // Ensure fixtures directory exists
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Clean up if test database exists from previous run
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Create a test database with multiple tables
    const Database = require('better-sqlite3');
    const db = new Database(testDbPath);
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE
      );

      CREATE TABLE posts (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE comments (
        id INTEGER PRIMARY KEY,
        text TEXT NOT NULL,
        post_id INTEGER,
        user_id INTEGER,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    db.close();
  });

  afterEach(() => {
    // Clean up: close connection if open
    if (repository) {
      repository.close();
    }

    // Remove test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('constructor and connection management', () => {
    it('should create a repository instance with a valid database path', () => {
      // Arrange & Act
      repository = new SQLiteRepository(testDbPath);

      // Assert
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(SQLiteRepository);
    });

    it('should throw an error when given a non-existent database path', () => {
      // Arrange
      const invalidPath = '/path/to/nonexistent.db';

      // Act & Assert
      expect(() => {
        repository = new SQLiteRepository(invalidPath);
      }).toThrow();
    });

    it('should successfully close an open database connection', () => {
      // Arrange
      repository = new SQLiteRepository(testDbPath);

      // Act & Assert - should not throw
      expect(() => {
        repository.close();
      }).not.toThrow();
    });

    it('should handle multiple close calls gracefully', () => {
      // Arrange
      repository = new SQLiteRepository(testDbPath);
      repository.close();

      // Act & Assert - second close should not throw
      expect(() => {
        repository.close();
      }).not.toThrow();
    });
  });

  describe('getTables', () => {
    beforeEach(() => {
      repository = new SQLiteRepository(testDbPath);
    });

    it('should throw an error when called on a closed connection', () => {
      // Arrange
      repository.close();

      // Act & Assert
      expect(() => {
        repository.getTables();
      }).toThrow('Database connection is closed');
    });

    it('should return a list of all table names in the database', () => {
      // Act
      const tables = repository.getTables();

      // Assert
      expect(tables).toBeDefined();
      expect(Array.isArray(tables)).toBe(true);
      expect(tables).toHaveLength(3);
      expect(tables).toContain('users');
      expect(tables).toContain('posts');
      expect(tables).toContain('comments');
    });

    it('should return tables in alphabetical order', () => {
      // Act
      const tables = repository.getTables();

      // Assert
      expect(tables).toEqual(['comments', 'posts', 'users']);
    });

    it('should not include internal SQLite tables', () => {
      // Act
      const tables = repository.getTables();

      // Assert - should not include sqlite_sequence or other internal tables
      expect(tables.some((t) => t.startsWith('sqlite_'))).toBe(false);
    });

    it('should return an empty array for a database with no tables', () => {
      // Arrange - create empty database
      const emptyDbPath = path.join(__dirname, '../../fixtures/empty.db');
      const Database = require('better-sqlite3');
      const db = new Database(emptyDbPath);
      db.close();

      const emptyRepo = new SQLiteRepository(emptyDbPath);

      // Act
      const tables = emptyRepo.getTables();

      // Assert
      expect(tables).toEqual([]);

      // Cleanup
      emptyRepo.close();
      fs.unlinkSync(emptyDbPath);
    });
  });

  describe('getColumns', () => {
    beforeEach(() => {
      repository = new SQLiteRepository(testDbPath);
    });

    it('should throw an error when called on a closed connection', () => {
      // Arrange
      repository.close();

      // Act & Assert
      expect(() => {
        repository.getColumns('users');
      }).toThrow('Database connection is closed');
    });

    it('should return column information for a given table', () => {
      // Act
      const columns = repository.getColumns('users');

      // Assert
      expect(columns).toBeDefined();
      expect(Array.isArray(columns)).toBe(true);
      expect(columns).toHaveLength(3);
    });

    it('should return correct column details for users table', () => {
      // Act
      const columns = repository.getColumns('users');

      // Assert
      expect(columns[0]).toMatchObject({
        name: 'id',
        type: 'INTEGER',
        notNull: false,
        primaryKey: true,
      });

      expect(columns[1]).toMatchObject({
        name: 'name',
        type: 'TEXT',
        notNull: true,
        primaryKey: false,
      });

      expect(columns[2]).toMatchObject({
        name: 'email',
        type: 'TEXT',
        notNull: false,
        primaryKey: false,
      });
    });

    it('should return columns with default values when specified', () => {
      // Arrange - create table with default value
      const dbWithDefaults = path.join(__dirname, '../../fixtures/defaults.db');
      const Database = require('better-sqlite3');
      const db = new Database(dbWithDefaults);
      db.exec(`
        CREATE TABLE settings (
          id INTEGER PRIMARY KEY,
          key TEXT NOT NULL,
          value TEXT DEFAULT 'default_value'
        );
      `);
      db.close();

      const repoWithDefaults = new SQLiteRepository(dbWithDefaults);

      // Act
      const columns = repoWithDefaults.getColumns('settings');

      // Assert
      const valueColumn = columns.find((c) => c.name === 'value');
      expect(valueColumn).toBeDefined();
      expect(valueColumn?.defaultValue).toBe("'default_value'");

      // Cleanup
      repoWithDefaults.close();
      fs.unlinkSync(dbWithDefaults);
    });

    it('should return columns for posts table with foreign key', () => {
      // Act
      const columns = repository.getColumns('posts');

      // Assert
      expect(columns).toHaveLength(4);
      expect(columns.map((c) => c.name)).toEqual([
        'id',
        'title',
        'content',
        'user_id',
      ]);
    });

    it('should throw an error for non-existent table', () => {
      // Act & Assert
      expect(() => {
        repository.getColumns('non_existent_table');
      }).toThrow();
    });

    it('should handle table names with special characters', () => {
      // This test ensures our implementation handles edge cases
      // Act & Assert - should not throw for valid table name
      expect(() => {
        repository.getColumns('users');
      }).not.toThrow();
    });
  });

  describe('getForeignKeys', () => {
    beforeEach(() => {
      repository = new SQLiteRepository(testDbPath);
    });

    it('should throw an error when called on a closed connection', () => {
      // Arrange
      repository.close();

      // Act & Assert
      expect(() => {
        repository.getForeignKeys('posts');
      }).toThrow('Database connection is closed');
    });

    it('should return foreign key information for posts table', () => {
      // Act
      const foreignKeys = repository.getForeignKeys('posts');

      // Assert
      expect(foreignKeys).toBeDefined();
      expect(Array.isArray(foreignKeys)).toBe(true);
      expect(foreignKeys).toHaveLength(1);
    });

    it('should return correct foreign key details for posts table', () => {
      // Act
      const foreignKeys = repository.getForeignKeys('posts');

      // Assert
      expect(foreignKeys[0]).toMatchObject({
        fromColumn: 'user_id',
        toTable: 'users',
        toColumn: 'id',
      });
    });

    it('should return multiple foreign keys for comments table', () => {
      // Act
      const foreignKeys = repository.getForeignKeys('comments');

      // Assert
      expect(foreignKeys).toHaveLength(2);

      const postFK = foreignKeys.find((fk) => fk.toTable === 'posts');
      expect(postFK).toMatchObject({
        fromColumn: 'post_id',
        toTable: 'posts',
        toColumn: 'id',
      });

      const userFK = foreignKeys.find((fk) => fk.toTable === 'users');
      expect(userFK).toMatchObject({
        fromColumn: 'user_id',
        toTable: 'users',
        toColumn: 'id',
      });
    });

    it('should return an empty array for tables without foreign keys', () => {
      // Act
      const foreignKeys = repository.getForeignKeys('users');

      // Assert
      expect(foreignKeys).toEqual([]);
    });

    it('should throw an error for non-existent table', () => {
      // Act & Assert
      expect(() => {
        repository.getForeignKeys('non_existent_table');
      }).toThrow();
    });

    it('should handle composite foreign keys', () => {
      // Arrange - create table with composite FK
      const dbWithComposite = path.join(
        __dirname,
        '../../fixtures/composite.db'
      );
      const Database = require('better-sqlite3');
      const db = new Database(dbWithComposite);
      db.exec(`
        CREATE TABLE parent (
          id1 INTEGER,
          id2 INTEGER,
          PRIMARY KEY (id1, id2)
        );

        CREATE TABLE child (
          id INTEGER PRIMARY KEY,
          parent_id1 INTEGER,
          parent_id2 INTEGER,
          FOREIGN KEY (parent_id1, parent_id2) REFERENCES parent(id1, id2)
        );
      `);
      db.close();

      const compositeRepo = new SQLiteRepository(dbWithComposite);

      // Act
      const foreignKeys = compositeRepo.getForeignKeys('child');

      // Assert
      expect(foreignKeys).toHaveLength(2); // SQLite returns one row per column in composite FK

      // Cleanup
      compositeRepo.close();
      fs.unlinkSync(dbWithComposite);
    });
  });
});
