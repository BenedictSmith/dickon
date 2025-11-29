import { SqlGenerator } from '../../../src/services/SqlGenerator';
import {
  FederatedTableInput,
  FederatedColumnInput,
  FederatedWhereInput,
  FederatedJoinInput,
} from '../../../src/types/federation';

describe('SqlGenerator', () => {
  let generator: SqlGenerator;

  beforeEach(() => {
    generator = new SqlGenerator();
  });

  describe('Basic SQL Generation', () => {
    it('should generate simple SELECT statement', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName' },
        { table: 'c', column: 'LastName' },
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        []
      );

      expect(result.database).toBe('chinook');
      expect(result.sql).toContain('SELECT');
      expect(result.sql).toContain('c.FirstName');
      expect(result.sql).toContain('c.LastName');
      expect(result.sql).toContain('FROM Customer as c');
      expect(result.params).toEqual([]);
    });

    it('should generate SELECT with table without alias', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'Customer', column: 'FirstName' },
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        []
      );

      expect(result.sql).toContain('FROM Customer');
      expect(result.sql).not.toContain('as ');
    });

    it('should handle column aliases', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName', alias: 'first' },
        { table: 'c', column: 'LastName', alias: 'last' },
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        []
      );

      expect(result.sql).toContain('as first');
      expect(result.sql).toContain('as last');
    });
  });

  describe('Predicate Push-Down', () => {
    it('should push down WHERE predicates to correct database', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName' },
      ];
      const where: FederatedWhereInput[] = [
        { column: 'c.Country', operator: '=', value: 'USA' },
        { column: 'o.ShipCity', operator: 'LIKE', value: '%New York%' }, // Different database - should be filtered out
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        where
      );

      expect(result.sql).toContain('WHERE c.Country = ?');
      expect(result.sql).not.toContain('o.ShipCity');
      expect(result.params).toEqual(['USA']);
    });

    it('should handle multiple WHERE conditions for same database', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName' },
      ];
      const where: FederatedWhereInput[] = [
        { column: 'c.Country', operator: '=', value: 'USA' },
        { column: 'c.City', operator: 'LIKE', value: '%New York%' },
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        where
      );

      expect(result.sql).toContain('WHERE c.Country = ? AND c.City LIKE ?');
      expect(result.params).toEqual(['USA', '%New York%']);
    });

    it('should handle different comparison operators', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Invoice', alias: 'i' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'i', column: 'Total' },
      ];
      const where: FederatedWhereInput[] = [
        { column: 'i.Total', operator: '>', value: 100 },
        { column: 'i.BillingCountry', operator: '!=', value: 'USA' },
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        where
      );

      expect(result.sql).toContain('i.Total > ?');
      expect(result.sql).toContain('i.BillingCountry != ?');
      expect(result.params).toEqual([100, 'USA']);
    });
  });

  describe('Join Column Handling', () => {
    it('should include join keys in SELECT clause', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName' },
      ];
      const joinColumns = [{ table: 'c', column: 'CustomerId' }];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        [],
        undefined,
        joinColumns
      );

      expect(result.sql).toContain('c.CustomerId as _join_CustomerId');
      expect(result.joinKey).toBe('_join_CustomerId');
    });

    it('should handle multiple join columns', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName' },
      ];
      const joinColumns = [
        { table: 'c', column: 'CustomerId' },
        { table: 'c', column: 'Email' },
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        [],
        undefined,
        joinColumns
      );

      expect(result.sql).toContain('_join_CustomerId');
      expect(result.sql).toContain('_join_Email');
    });
  });

  describe('Intra-Database Joins', () => {
    it('should generate JOIN clauses for tables in same database', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
        { database: 'chinook', table: 'Invoice', alias: 'i' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName' },
        { table: 'i', column: 'Total' },
      ];
      const joins: FederatedJoinInput[] = [
        {
          from: { table: 'c', column: 'CustomerId' },
          to: { table: 'i', column: 'CustomerId' },
          type: 'inner',
        },
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        [],
        joins
      );

      expect(result.sql).toContain('INNER JOIN');
      expect(result.sql).toContain('Invoice as i');
      expect(result.sql).toContain('ON c.CustomerId = i.CustomerId');
    });

    it('should support different join types', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
        { database: 'chinook', table: 'Invoice', alias: 'i' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName' },
      ];
      const joins: FederatedJoinInput[] = [
        {
          from: { table: 'c', column: 'CustomerId' },
          to: { table: 'i', column: 'CustomerId' },
          type: 'left',
        },
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        [],
        joins
      );

      expect(result.sql).toContain('LEFT JOIN');
    });

    it('should skip joins where tables are in different databases', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName' },
      ];
      const joins: FederatedJoinInput[] = [
        {
          // This join references a table not in this database
          from: { table: 'c', column: 'CustomerId' },
          to: { table: 'o', column: 'CustomerID' },
          type: 'inner',
        },
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        [],
        joins
      );

      // Should not include the join since 'o' table is not in this database
      expect(result.sql).not.toContain('JOIN');
    });
  });

  describe('LIMIT and OFFSET', () => {
    it('should add LIMIT clause', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName' },
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        [],
        undefined,
        undefined,
        100
      );

      expect(result.sql).toContain('LIMIT 100');
    });

    it('should add OFFSET clause', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName' },
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        [],
        undefined,
        undefined,
        undefined,
        50
      );

      expect(result.sql).toContain('OFFSET 50');
    });

    it('should add both LIMIT and OFFSET', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName' },
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        [],
        undefined,
        undefined,
        100,
        50
      );

      expect(result.sql).toContain('LIMIT 100');
      expect(result.sql).toContain('OFFSET 50');
    });
  });

  describe('Complex Queries', () => {
    it('should generate complete federated query SQL', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName', alias: 'first' },
        { table: 'c', column: 'LastName', alias: 'last' },
      ];
      const where: FederatedWhereInput[] = [
        { column: 'c.Country', operator: '=', value: 'USA' },
      ];
      const joinColumns = [{ table: 'c', column: 'CustomerId' }];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        where,
        undefined,
        joinColumns,
        100,
        0
      );

      expect(result.sql).toContain('SELECT');
      expect(result.sql).toContain('c.CustomerId as _join_CustomerId');
      expect(result.sql).toContain('c.FirstName as first');
      expect(result.sql).toContain('FROM Customer as c');
      expect(result.sql).toContain('WHERE c.Country = ?');
      expect(result.sql).toContain('LIMIT 100');
      expect(result.params).toEqual(['USA']);
      expect(result.joinKey).toBe('_join_CustomerId');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty WHERE clause', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName' },
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        []
      );

      expect(result.sql).not.toContain('WHERE');
      expect(result.params).toEqual([]);
    });

    it('should filter out malformed column references in WHERE', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName' },
      ];
      const where: FederatedWhereInput[] = [
        { column: 'InvalidColumn', operator: '=', value: 'test' }, // No table prefix
        { column: 'c.Country', operator: '=', value: 'USA' },
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        where
      );

      expect(result.sql).toContain('WHERE c.Country = ?');
      expect(result.sql).not.toContain('InvalidColumn');
      expect(result.params).toEqual(['USA']);
    });

    it('should only select columns for tables in this database', () => {
      const tables: FederatedTableInput[] = [
        { database: 'chinook', table: 'Customer', alias: 'c' },
      ];
      const select: FederatedColumnInput[] = [
        { table: 'c', column: 'FirstName' },
        { table: 'o', column: 'OrderDate' }, // Different database
      ];

      const result = generator.generateSql(
        'chinook',
        tables,
        select,
        []
      );

      expect(result.sql).toContain('c.FirstName');
      expect(result.sql).not.toContain('OrderDate');
    });
  });
});
