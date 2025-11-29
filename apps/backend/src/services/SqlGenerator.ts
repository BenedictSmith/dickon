import {
  FederatedTableInput,
  FederatedColumnInput,
  FederatedWhereInput,
  FederatedJoinInput,
} from '../types/federation';

/**
 * Generated SQL for a specific database
 */
export interface GeneratedSql {
  database: string;
  sql: string;
  params: unknown[];
  joinKey?: string; // Column used for joining results
  tableAlias?: string; // Alias of the table in this database
}

/**
 * Join column specification
 */
export interface JoinColumn {
  table: string;
  column: string;
}

/**
 * SQL Generator for federated queries
 * Generates optimized SQL for each database with predicate push-down
 */
export class SqlGenerator {
  /**
   * Generate SQL for a specific database
   *
   * @param database - Database name
   * @param tables - Tables to query from this database
   * @param select - Columns to select
   * @param where - WHERE conditions
   * @param joins - JOIN specifications (for intra-database joins)
   * @param joinColumns - Columns needed for inter-database joins
   * @param limit - LIMIT clause
   * @param offset - OFFSET clause
   * @returns Generated SQL with parameters
   */
  generateSql(
    database: string,
    tables: FederatedTableInput[],
    select: FederatedColumnInput[],
    where: FederatedWhereInput[],
    joins?: FederatedJoinInput[],
    joinColumns?: JoinColumn[],
    limit?: number,
    offset?: number
  ): GeneratedSql {
    // Build SELECT clause
    const selectColumns = this.buildSelectClause(
      database,
      tables,
      select,
      joinColumns
    );

    // Build FROM clause
    const fromClause = this.buildFromClause(tables);

    // Build WHERE clause (with predicate push-down)
    const { whereClauses, params } = this.buildWhereClause(
      database,
      tables,
      where
    );

    // Build JOIN clause (for intra-database joins)
    const joinClauses = this.buildJoinClause(tables, joins);

    // Build complete SQL
    let sql = `SELECT ${selectColumns.join(', ')}\nFROM ${fromClause}`;

    if (joinClauses.length > 0) {
      sql += '\n' + joinClauses.join('\n');
    }

    if (whereClauses.length > 0) {
      sql += `\nWHERE ${whereClauses.join(' AND ')}`;
    }

    if (limit !== undefined) {
      sql += `\nLIMIT ${limit}`;
    }

    if (offset !== undefined) {
      sql += `\nOFFSET ${offset}`;
    }

    return {
      database,
      sql,
      params,
      joinKey: this.extractJoinKey(joinColumns),
      tableAlias: tables[0]?.alias || tables[0]?.table,
    };
  }

  /**
   * Build SELECT clause with column aliasing
   * Prevents conflicts when merging results from multiple databases
   */
  private buildSelectClause(
    _database: string,
    tables: FederatedTableInput[],
    select: FederatedColumnInput[],
    joinColumns?: JoinColumn[]
  ): string[] {
    const columns: string[] = [];
    const localTableAliases = new Set(
      tables.map((t) => t.alias || t.table)
    );

    // Add join key columns (needed for cross-database joins)
    if (joinColumns) {
      for (const jc of joinColumns) {
        if (localTableAliases.has(jc.table)) {
          const tableAlias = jc.table;
          columns.push(`${tableAlias}.${jc.column} as _join_${jc.column}`);
        }
      }
    }

    // Add selected columns with aliases
    for (const col of select) {
      if (localTableAliases.has(col.table)) {
        const tableAlias = col.table;
        if (col.alias) {
          columns.push(`${tableAlias}.${col.column} as ${col.alias}`);
        } else {
          columns.push(`${tableAlias}.${col.column}`);
        }
      }
    }

    return columns.length > 0 ? columns : ['*'];
  }

  /**
   * Build FROM clause with table aliases
   */
  private buildFromClause(tables: FederatedTableInput[]): string {
    if (tables.length === 0) {
      throw new Error('At least one table required');
    }

    const firstTable = tables[0];
    return firstTable.alias
      ? `${firstTable.table} as ${firstTable.alias}`
      : firstTable.table;
  }

  /**
   * Build JOIN clauses for intra-database joins
   * Only applies to tables within the same database
   */
  private buildJoinClause(
    tables: FederatedTableInput[],
    joins?: FederatedJoinInput[]
  ): string[] {
    if (!joins || joins.length === 0) {
      return [];
    }

    const localTableAliases = new Set(
      tables.map((t) => t.alias || t.table)
    );
    const joinClauses: string[] = [];

    for (const join of joins) {
      // Only include joins where both tables are in this database
      if (
        localTableAliases.has(join.from.table) &&
        localTableAliases.has(join.to.table)
      ) {
        const joinType = join.type.toUpperCase();
        const fromTable = join.from.table;
        const toTable = join.to.table;

        // Find the table definition to get the actual table name
        const toTableDef = tables.find(
          (t) => (t.alias || t.table) === toTable
        );
        if (!toTableDef) continue;

        const joinClause = `${joinType} JOIN ${toTableDef.table}${toTableDef.alias ? ` as ${toTableDef.alias}` : ''} ON ${fromTable}.${join.from.column} = ${toTable}.${join.to.column}`;
        joinClauses.push(joinClause);
      }
    }

    return joinClauses;
  }

  /**
   * Build WHERE clause with predicate push-down optimization
   *
   * Only includes predicates that apply to tables in this database.
   * This reduces data transfer by filtering at the source.
   */
  private buildWhereClause(
    _database: string,
    tables: FederatedTableInput[],
    where: FederatedWhereInput[]
  ): { whereClauses: string[]; params: unknown[] } {
    const localTableAliases = new Set(
      tables.map((t) => t.alias || t.table)
    );
    const whereClauses: string[] = [];
    const params: unknown[] = [];

    for (const condition of where) {
      // Extract table prefix from column (e.g., "c.Country" -> "c")
      const parts = condition.column.split('.');
      if (parts.length !== 2) {
        // Skip malformed column references
        continue;
      }

      const [tablePrefix, columnName] = parts;

      // Predicate push-down: only include if this table is in this database
      if (localTableAliases.has(tablePrefix)) {
        whereClauses.push(
          `${tablePrefix}.${columnName} ${condition.operator} ?`
        );
        params.push(condition.value);
      }
    }

    return { whereClauses, params };
  }

  /**
   * Extract the join key column name
   * This is used by the execution engine to merge results
   */
  private extractJoinKey(joinColumns?: JoinColumn[]): string | undefined {
    if (!joinColumns || joinColumns.length === 0) {
      return undefined;
    }

    // Return the first join column
    return `_join_${joinColumns[0].column}`;
  }
}
