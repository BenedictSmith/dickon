import { QueryResult } from './QueryExecutor';

/**
 * Relationship between two columns for joining
 */
export interface JoinRelationship {
  fromDatabase: string;
  fromColumn: string;
  toDatabase: string;
  toColumn: string;
}

/**
 * Options for merging results
 */
export interface MergeOptions {
  joinType: 'inner' | 'left' | 'right' | 'full';
}

/**
 * Data lineage information for a column
 */
export interface ColumnLineage {
  column: string;
  sourceDatabase: string;
  sourceColumn: string;
}

/**
 * Merged result with lineage information
 */
export interface MergedResult {
  rows: Array<Record<string, unknown>>;
  lineage: ColumnLineage[];
}

/**
 * Merges query results from multiple databases using hash join algorithm
 */
export class ResultMerger {
  /**
   * Merge results from multiple databases
   *
   * @param results - Map of database ID to query results
   * @param relationships - Join relationships between databases
   * @param options - Merge options (join type, etc.)
   * @returns Merged rows with lineage information
   */
  merge(
    results: Map<string, QueryResult>,
    relationships: JoinRelationship[],
    options: MergeOptions = { joinType: 'inner' }
  ): MergedResult {
    if (results.size === 0) {
      return { rows: [], lineage: [] };
    }

    if (results.size === 1) {
      // Single database - no join needed
      const result = Array.from(results.values())[0];
      return {
        rows: result.rows,
        lineage: this.buildLineageForSingleDatabase(result),
      };
    }

    if (results.size === 2 && relationships.length > 0) {
      // Two databases - simple hash join
      return this.mergeTwoResults(results, relationships[0], options);
    }

    // Multi-way join - build join tree and execute
    return this.mergeMultipleResults(results, relationships, options);
  }

  /**
   * Merge two result sets using hash join algorithm
   * Hash join is O(n + m) which is much faster than nested loop O(n * m)
   *
   * @param results - Two database results
   * @param relationship - Join relationship
   * @param options - Join options
   * @returns Merged result
   */
  private mergeTwoResults(
    results: Map<string, QueryResult>,
    relationship: JoinRelationship,
    options: MergeOptions
  ): MergedResult {
    const resultsArray = Array.from(results.values());
    const result1 = resultsArray[0];
    const result2 = resultsArray[1];

    // Determine which result is for which side of the join
    const [leftResult, rightResult, leftJoinCol, rightJoinCol] =
      result1.database === relationship.fromDatabase
        ? [result1, result2, relationship.fromColumn, relationship.toColumn]
        : [result2, result1, relationship.toColumn, relationship.fromColumn];

    // Build hash table from smaller result set (optimization)
    const [buildSide, probeSide, buildCol, probeCol] =
      leftResult.rows.length < rightResult.rows.length
        ? [leftResult, rightResult, leftJoinCol, rightJoinCol]
        : [rightResult, leftResult, rightJoinCol, leftJoinCol];

    const hashTable = this.buildHashTable(buildSide.rows, buildCol);

    const merged: Array<Record<string, unknown>> = [];

    // Probe hash table and join matching rows
    for (const probeRow of probeSide.rows) {
      const joinKey = probeRow[probeCol];
      const matches = hashTable.get(joinKey);

      if (matches) {
        // Found matching rows - perform join
        for (const buildRow of matches) {
          const mergedRow = { ...buildRow, ...probeRow };
          merged.push(mergedRow);
        }
      } else if (options.joinType === 'left' && probeSide === leftResult) {
        // Left join - include unmatched left rows
        merged.push(probeRow);
      } else if (options.joinType === 'right' && probeSide === rightResult) {
        // Right join - include unmatched right rows
        merged.push(probeRow);
      }
    }

    // Handle full outer join
    if (options.joinType === 'full') {
      // Add unmatched rows from build side
      const probeKeys = new Set(
        probeSide.rows.map((row) => row[probeCol])
      );

      for (const buildRow of buildSide.rows) {
        const joinKey = buildRow[buildCol];
        if (!probeKeys.has(joinKey)) {
          merged.push(buildRow);
        }
      }
    }

    return {
      rows: merged,
      lineage: this.buildLineage(results),
    };
  }

  /**
   * Build hash table for hash join
   * Maps join key values to arrays of rows with that key
   *
   * @param rows - Rows to build hash table from
   * @param joinColumn - Column to use as join key
   * @returns Hash table mapping join keys to rows
   */
  private buildHashTable(
    rows: Array<Record<string, unknown>>,
    joinColumn: string
  ): Map<unknown, Array<Record<string, unknown>>> {
    const hashTable = new Map<unknown, Array<Record<string, unknown>>>();

    for (const row of rows) {
      const key = row[joinColumn];

      if (key === null || key === undefined) {
        // Skip null join keys
        continue;
      }

      if (!hashTable.has(key)) {
        hashTable.set(key, []);
      }
      hashTable.get(key)!.push(row);
    }

    return hashTable;
  }

  /**
   * Merge multiple result sets (3+) using cascading hash joins
   *
   * @param results - Multiple database results
   * @param relationships - Join relationships
   * @param options - Join options
   * @returns Merged result
   */
  private mergeMultipleResults(
    results: Map<string, QueryResult>,
    relationships: JoinRelationship[],
    options: MergeOptions
  ): MergedResult {
    if (relationships.length === 0) {
      throw new Error('No relationships provided for multi-way join');
    }

    // Start with first two results
    const resultsArray = Array.from(results.entries());
    let currentResult = this.mergeTwoResults(
      new Map([resultsArray[0], resultsArray[1]]),
      relationships[0],
      options
    );

    // Incrementally join remaining results
    for (let i = 2; i < resultsArray.length; i++) {
      const [dbId, nextResult] = resultsArray[i];
      const relationship = relationships[i - 1];

      // Create temporary result for current merged data
      const tempResult: QueryResult = {
        rows: currentResult.rows,
        database: 'merged',
        executionTimeMs: 0,
      };

      currentResult = this.mergeTwoResults(
        new Map([
          ['merged', tempResult],
          [dbId, nextResult],
        ]),
        relationship,
        options
      );
    }

    return currentResult;
  }

  /**
   * Build data lineage for merged results
   * Tracks which database each column came from
   *
   * @param results - Database results
   * @returns Lineage information for all columns
   */
  private buildLineage(
    results: Map<string, QueryResult>
  ): ColumnLineage[] {
    const lineage: ColumnLineage[] = [];

    for (const [databaseId, result] of results) {
      if (result.rows.length === 0) {
        continue;
      }

      // Get columns from first row
      const sampleRow = result.rows[0];
      for (const column of Object.keys(sampleRow)) {
        lineage.push({
          column,
          sourceDatabase: databaseId,
          sourceColumn: column,
        });
      }
    }

    return lineage;
  }

  /**
   * Build lineage for single database query
   *
   * @param result - Query result
   * @returns Lineage information
   */
  private buildLineageForSingleDatabase(
    result: QueryResult
  ): ColumnLineage[] {
    if (result.rows.length === 0) {
      return [];
    }

    const lineage: ColumnLineage[] = [];
    const sampleRow = result.rows[0];

    for (const column of Object.keys(sampleRow)) {
      lineage.push({
        column,
        sourceDatabase: result.database,
        sourceColumn: column,
      });
    }

    return lineage;
  }

  /**
   * Get statistics about merge operation
   * Useful for optimization and debugging
   *
   * @param results - Database results
   * @param mergedRows - Merged rows
   * @returns Statistics object
   */
  getMergeStatistics(
    results: Map<string, QueryResult>,
    mergedRows: Array<Record<string, unknown>>
  ): {
    inputRowCount: number;
    outputRowCount: number;
    databaseCount: number;
    reductionRatio: number;
  } {
    const inputRowCount = Array.from(results.values()).reduce(
      (sum, r) => sum + r.rows.length,
      0
    );

    return {
      inputRowCount,
      outputRowCount: mergedRows.length,
      databaseCount: results.size,
      reductionRatio:
        inputRowCount > 0 ? mergedRows.length / inputRowCount : 0,
    };
  }
}
