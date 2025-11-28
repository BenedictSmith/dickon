import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from '@jest/globals';
import { Neo4jRepository } from '../../../src/repositories/Neo4jRepository';
import { Database } from '../../../src/domain/Database';
import { Table } from '../../../src/domain/Table';
import { Column } from '../../../src/domain/Column';

describe('Neo4jRepository Integration Tests', () => {
  let repository: Neo4jRepository;

  // Neo4j connection details for testing
  const testConfig = {
    uri: process.env.NEO4J_TEST_URI || 'bolt://localhost:7687',
    username: process.env.NEO4J_TEST_USER || 'neo4j',
    password: process.env.NEO4J_TEST_PASSWORD || 'password',
  };

  beforeAll(async () => {
    // Create repository instance
    repository = new Neo4jRepository(
      testConfig.uri,
      testConfig.username,
      testConfig.password
    );

    // Verify connection
    await repository.verifyConnection();
  });

  afterAll(async () => {
    // Close connection
    await repository.close();
  });

  afterEach(async () => {
    // Clean up all test data after each test
    await repository.deleteAll();
  });

  describe('connection management', () => {
    it('should successfully connect to Neo4j', async () => {
      // Act
      const isConnected = await repository.verifyConnection();

      // Assert
      expect(isConnected).toBe(true);
    });

    it('should handle connection errors gracefully', async () => {
      // Arrange
      const badRepository = new Neo4jRepository(
        'bolt://localhost:9999',
        'neo4j',
        'wrongpassword'
      );

      // Act & Assert
      await expect(badRepository.verifyConnection()).rejects.toThrow();

      // Cleanup
      await badRepository.close();
    });
  });

  describe('createDatabase', () => {
    it('should create a database node in Neo4j', async () => {
      // Arrange
      const database = new Database({
        id: 'test-db-1',
        name: 'Test Database',
        path: '/data/test.db',
      });

      // Act
      await repository.createDatabase(database);

      // Assert
      const retrieved = await repository.getDatabase('test-db-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Database');
      expect(retrieved?.path).toBe('/data/test.db');
    });

    it('should handle duplicate database ids', async () => {
      // Arrange
      const database = new Database({
        id: 'test-db-1',
        name: 'Test Database',
        path: '/data/test.db',
      });

      await repository.createDatabase(database);

      // Act & Assert - should either update or throw
      await expect(repository.createDatabase(database)).resolves.not.toThrow();
    });
  });

  describe('getDatabase', () => {
    it('should retrieve an existing database by id', async () => {
      // Arrange
      const database = new Database({
        id: 'test-db-1',
        name: 'Test Database',
        path: '/data/test.db',
      });

      await repository.createDatabase(database);

      // Act
      const retrieved = await repository.getDatabase('test-db-1');

      // Assert
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-db-1');
      expect(retrieved?.name).toBe('Test Database');
    });

    it('should return null for non-existent database', async () => {
      // Act
      const retrieved = await repository.getDatabase('non-existent-id');

      // Assert
      expect(retrieved).toBeNull();
    });
  });

  describe('getAllDatabases', () => {
    it('should return all databases', async () => {
      // Arrange
      const db1 = new Database({
        id: 'test-db-1',
        name: 'Database 1',
        path: '/data/db1.db',
      });

      const db2 = new Database({
        id: 'test-db-2',
        name: 'Database 2',
        path: '/data/db2.db',
      });

      await repository.createDatabase(db1);
      await repository.createDatabase(db2);

      // Act
      const databases = await repository.getAllDatabases();

      // Assert
      expect(databases).toHaveLength(2);
      expect(databases.map((db) => db.id)).toContain('test-db-1');
      expect(databases.map((db) => db.id)).toContain('test-db-2');
    });

    it('should return empty array when no databases exist', async () => {
      // Act
      const databases = await repository.getAllDatabases();

      // Assert
      expect(databases).toEqual([]);
    });
  });

  describe('createTable', () => {
    it('should create a table node linked to a database', async () => {
      // Arrange
      const database = new Database({
        id: 'test-db-1',
        name: 'Test Database',
        path: '/data/test.db',
      });

      const table = new Table({
        id: 'test-table-1',
        name: 'users',
        databaseId: 'test-db-1',
        rowCount: 100,
      });

      await repository.createDatabase(database);

      // Act
      await repository.createTable(table);

      // Assert
      const retrieved = await repository.getTable('test-table-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('users');
      expect(retrieved?.rowCount).toBe(100);
    });
  });

  describe('getTablesForDatabase', () => {
    it('should return all tables for a database', async () => {
      // Arrange
      const database = new Database({
        id: 'test-db-1',
        name: 'Test Database',
        path: '/data/test.db',
      });

      const table1 = new Table({
        id: 'test-table-1',
        name: 'users',
        databaseId: 'test-db-1',
      });

      const table2 = new Table({
        id: 'test-table-2',
        name: 'posts',
        databaseId: 'test-db-1',
      });

      await repository.createDatabase(database);
      await repository.createTable(table1);
      await repository.createTable(table2);

      // Act
      const tables = await repository.getTablesForDatabase('test-db-1');

      // Assert
      expect(tables).toHaveLength(2);
      expect(tables.map((t) => t.name)).toContain('users');
      expect(tables.map((t) => t.name)).toContain('posts');
    });
  });

  describe('createColumn', () => {
    it('should create a column node linked to a table', async () => {
      // Arrange
      const database = new Database({
        id: 'test-db-1',
        name: 'Test Database',
        path: '/data/test.db',
      });

      const table = new Table({
        id: 'test-table-1',
        name: 'users',
        databaseId: 'test-db-1',
      });

      const column = new Column({
        id: 'test-col-1',
        name: 'id',
        dataType: 'INTEGER',
        tableId: 'test-table-1',
        primaryKey: true,
        notNull: true,
      });

      await repository.createDatabase(database);
      await repository.createTable(table);

      // Act
      await repository.createColumn(column);

      // Assert
      const retrieved = await repository.getColumn('test-col-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('id');
      expect(retrieved?.dataType).toBe('INTEGER');
      expect(retrieved?.primaryKey).toBe(true);
    });
  });

  describe('createForeignKeyRelationship', () => {
    it('should create a REFERENCES relationship between columns', async () => {
      // Arrange
      const database = new Database({
        id: 'test-db-1',
        name: 'Test Database',
        path: '/data/test.db',
      });

      const usersTable = new Table({
        id: 'test-table-1',
        name: 'users',
        databaseId: 'test-db-1',
      });

      const postsTable = new Table({
        id: 'test-table-2',
        name: 'posts',
        databaseId: 'test-db-1',
      });

      const userIdColumn = new Column({
        id: 'test-col-1',
        name: 'id',
        dataType: 'INTEGER',
        tableId: 'test-table-1',
        primaryKey: true,
      });

      const postUserIdColumn = new Column({
        id: 'test-col-2',
        name: 'user_id',
        dataType: 'INTEGER',
        tableId: 'test-table-2',
      });

      await repository.createDatabase(database);
      await repository.createTable(usersTable);
      await repository.createTable(postsTable);
      await repository.createColumn(userIdColumn);
      await repository.createColumn(postUserIdColumn);

      // Act
      await repository.createForeignKeyRelationship('test-col-2', 'test-col-1');

      // Assert
      const relationships =
        await repository.getForeignKeyRelationships('test-db-1');
      expect(relationships).toHaveLength(1);
      expect(relationships[0].fromColumnId).toBe('test-col-2');
      expect(relationships[0].toColumnId).toBe('test-col-1');
    });
  });

  describe('deleteAll', () => {
    it('should delete all nodes and relationships', async () => {
      // Arrange
      const database = new Database({
        id: 'test-db-1',
        name: 'Test Database',
        path: '/data/test.db',
      });

      await repository.createDatabase(database);

      // Act
      await repository.deleteAll();

      // Assert
      const databases = await repository.getAllDatabases();
      expect(databases).toHaveLength(0);
    });
  });
});
