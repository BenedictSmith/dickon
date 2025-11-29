import {
  ResultMerger,
  JoinRelationship,
} from '../../../src/services/ResultMerger';
import { QueryResult } from '../../../src/services/QueryExecutor';

describe('ResultMerger', () => {
  let merger: ResultMerger;

  beforeEach(() => {
    merger = new ResultMerger();
  });

  describe('Single Database', () => {
    it('should return rows unchanged for single database', () => {
      const results = new Map<string, QueryResult>([
        [
          'db1',
          {
            rows: [
              { id: 1, name: 'Alice' },
              { id: 2, name: 'Bob' },
            ],
            database: 'db1',
            executionTimeMs: 10,
          },
        ],
      ]);

      const result = merger.merge(results, [], { joinType: 'inner' });

      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual({ id: 1, name: 'Alice' });
      expect(result.lineage).toHaveLength(2);
      expect(result.lineage[0].sourceDatabase).toBe('db1');
    });

    it('should handle empty result set', () => {
      const results = new Map<string, QueryResult>();

      const result = merger.merge(results, [], { joinType: 'inner' });

      expect(result.rows).toHaveLength(0);
      expect(result.lineage).toHaveLength(0);
    });
  });

  describe('Two Database Inner Join', () => {
    it('should perform inner join on matching rows', () => {
      const results = new Map<string, QueryResult>([
        [
          'customers',
          {
            rows: [
              { customerId: 1, name: 'Alice' },
              { customerId: 2, name: 'Bob' },
              { customerId: 3, name: 'Charlie' },
            ],
            database: 'customers',
            executionTimeMs: 10,
          },
        ],
        [
          'orders',
          {
            rows: [
              { orderId: 101, customerId: 1, amount: 100 },
              { orderId: 102, customerId: 2, amount: 200 },
            ],
            database: 'orders',
            executionTimeMs: 15,
          },
        ],
      ]);

      const relationships: JoinRelationship[] = [
        {
          fromDatabase: 'customers',
          fromColumn: 'customerId',
          toDatabase: 'orders',
          toColumn: 'customerId',
        },
      ];

      const result = merger.merge(results, relationships, { joinType: 'inner' });

      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toMatchObject({
        customerId: 1,
        name: 'Alice',
        orderId: 101,
        amount: 100,
      });
      expect(result.rows[1]).toMatchObject({
        customerId: 2,
        name: 'Bob',
        orderId: 102,
        amount: 200,
      });
    });

    it('should exclude non-matching rows in inner join', () => {
      const results = new Map<string, QueryResult>([
        [
          'db1',
          {
            rows: [
              { id: 1, value: 'A' },
              { id: 2, value: 'B' },
              { id: 3, value: 'C' },
            ],
            database: 'db1',
            executionTimeMs: 10,
          },
        ],
        [
          'db2',
          {
            rows: [{ id: 1, data: 'X' }],
            database: 'db2',
            executionTimeMs: 10,
          },
        ],
      ]);

      const relationships: JoinRelationship[] = [
        {
          fromDatabase: 'db1',
          fromColumn: 'id',
          toDatabase: 'db2',
          toColumn: 'id',
        },
      ];

      const result = merger.merge(results, relationships, { joinType: 'inner' });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(1);
    });

    it('should handle one-to-many joins', () => {
      const results = new Map<string, QueryResult>([
        [
          'customers',
          {
            rows: [{ customerId: 1, name: 'Alice' }],
            database: 'customers',
            executionTimeMs: 10,
          },
        ],
        [
          'orders',
          {
            rows: [
              { orderId: 101, customerId: 1, amount: 100 },
              { orderId: 102, customerId: 1, amount: 200 },
              { orderId: 103, customerId: 1, amount: 300 },
            ],
            database: 'orders',
            executionTimeMs: 10,
          },
        ],
      ]);

      const relationships: JoinRelationship[] = [
        {
          fromDatabase: 'customers',
          fromColumn: 'customerId',
          toDatabase: 'orders',
          toColumn: 'customerId',
        },
      ];

      const result = merger.merge(results, relationships, { joinType: 'inner' });

      expect(result.rows).toHaveLength(3);
      expect(result.rows.every((row) => row.name === 'Alice')).toBe(true);
    });
  });

  describe('Left Join', () => {
    it('should include unmatched left rows', () => {
      const results = new Map<string, QueryResult>([
        [
          'customers',
          {
            rows: [
              { customerId: 1, name: 'Alice' },
              { customerId: 2, name: 'Bob' },
              { customerId: 3, name: 'Charlie' },
            ],
            database: 'customers',
            executionTimeMs: 10,
          },
        ],
        [
          'orders',
          {
            rows: [{ orderId: 101, customerId: 1, amount: 100 }],
            database: 'orders',
            executionTimeMs: 10,
          },
        ],
      ]);

      const relationships: JoinRelationship[] = [
        {
          fromDatabase: 'customers',
          fromColumn: 'customerId',
          toDatabase: 'orders',
          toColumn: 'customerId',
        },
      ];

      const result = merger.merge(results, relationships, { joinType: 'left' });

      expect(result.rows).toHaveLength(3);
      const alice = result.rows.find((r) => r.name === 'Alice');
      const bob = result.rows.find((r) => r.name === 'Bob');

      expect(alice).toMatchObject({ customerId: 1, orderId: 101 });
      expect(bob).toMatchObject({ customerId: 2, name: 'Bob' });
      expect(bob).not.toHaveProperty('orderId');
    });
  });

  describe('Data Lineage', () => {
    it('should track lineage for all columns', () => {
      const results = new Map<string, QueryResult>([
        [
          'db1',
          {
            rows: [{ id: 1, name: 'Alice' }],
            database: 'db1',
            executionTimeMs: 10,
          },
        ],
        [
          'db2',
          {
            rows: [{ id: 1, email: 'alice@example.com' }],
            database: 'db2',
            executionTimeMs: 10,
          },
        ],
      ]);

      const relationships: JoinRelationship[] = [
        {
          fromDatabase: 'db1',
          fromColumn: 'id',
          toDatabase: 'db2',
          toColumn: 'id',
        },
      ];

      const result = merger.merge(results, relationships, { joinType: 'inner' });

      // Lineage includes all columns from all databases, including duplicates
      expect(result.lineage).toHaveLength(4);
      const nameLineage = result.lineage.find((l) => l.column === 'name');
      const emailLineage = result.lineage.find((l) => l.column === 'email');
      const idLineages = result.lineage.filter((l) => l.column === 'id');

      expect(nameLineage?.sourceDatabase).toBe('db1');
      expect(emailLineage?.sourceDatabase).toBe('db2');
      expect(idLineages).toHaveLength(2);
      expect(idLineages.map((l) => l.sourceDatabase).sort()).toEqual(['db1', 'db2']);
    });

    it('should build lineage for single database', () => {
      const results = new Map<string, QueryResult>([
        [
          'db1',
          {
            rows: [{ id: 1, name: 'Alice', age: 30 }],
            database: 'db1',
            executionTimeMs: 10,
          },
        ],
      ]);

      const result = merger.merge(results, [], { joinType: 'inner' });

      expect(result.lineage).toHaveLength(3);
      expect(result.lineage.every((l) => l.sourceDatabase === 'db1')).toBe(
        true
      );
    });
  });

  describe('Hash Join Optimization', () => {
    it('should build hash table from smaller result set', () => {
      // This test verifies the optimization works correctly
      // even though we can't directly observe which side was hashed
      const results = new Map<string, QueryResult>([
        [
          'large',
          {
            rows: Array.from({ length: 1000 }, (_, i) => ({
              id: i,
              value: `item-${i}`,
            })),
            database: 'large',
            executionTimeMs: 50,
          },
        ],
        [
          'small',
          {
            rows: [
              { id: 1, data: 'X' },
              { id: 2, data: 'Y' },
            ],
            database: 'small',
            executionTimeMs: 5,
          },
        ],
      ]);

      const relationships: JoinRelationship[] = [
        {
          fromDatabase: 'large',
          fromColumn: 'id',
          toDatabase: 'small',
          toColumn: 'id',
        },
      ];

      const result = merger.merge(results, relationships, { joinType: 'inner' });

      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toMatchObject({ id: 1, data: 'X' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null join keys', () => {
      const results = new Map<string, QueryResult>([
        [
          'db1',
          {
            rows: [
              { id: 1, value: 'A' },
              { id: null, value: 'B' },
            ],
            database: 'db1',
            executionTimeMs: 10,
          },
        ],
        [
          'db2',
          {
            rows: [{ id: 1, data: 'X' }],
            database: 'db2',
            executionTimeMs: 10,
          },
        ],
      ]);

      const relationships: JoinRelationship[] = [
        {
          fromDatabase: 'db1',
          fromColumn: 'id',
          toDatabase: 'db2',
          toColumn: 'id',
        },
      ];

      const result = merger.merge(results, relationships, { joinType: 'inner' });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].value).toBe('A');
    });

    it('should handle empty result sets', () => {
      const results = new Map<string, QueryResult>([
        [
          'db1',
          {
            rows: [],
            database: 'db1',
            executionTimeMs: 10,
          },
        ],
        [
          'db2',
          {
            rows: [{ id: 1, data: 'X' }],
            database: 'db2',
            executionTimeMs: 10,
          },
        ],
      ]);

      const relationships: JoinRelationship[] = [
        {
          fromDatabase: 'db1',
          fromColumn: 'id',
          toDatabase: 'db2',
          toColumn: 'id',
        },
      ];

      const result = merger.merge(results, relationships, { joinType: 'inner' });

      expect(result.rows).toHaveLength(0);
    });
  });

  describe('Statistics', () => {
    it('should calculate merge statistics', () => {
      const results = new Map<string, QueryResult>([
        [
          'db1',
          {
            rows: [
              { id: 1 },
              { id: 2 },
              { id: 3 },
            ],
            database: 'db1',
            executionTimeMs: 10,
          },
        ],
        [
          'db2',
          {
            rows: [
              { id: 1 },
              { id: 2 },
            ],
            database: 'db2',
            executionTimeMs: 10,
          },
        ],
      ]);

      const mergedRows = [{ id: 1 }, { id: 2 }];

      const stats = merger.getMergeStatistics(results, mergedRows);

      expect(stats.inputRowCount).toBe(5);
      expect(stats.outputRowCount).toBe(2);
      expect(stats.databaseCount).toBe(2);
      expect(stats.reductionRatio).toBe(0.4);
    });
  });
});
