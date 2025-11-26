/**
 * Properties required to create a Table instance
 */
export interface TableProps {
  id: string;
  name: string;
  databaseId: string;
  rowCount?: number | null;
}

/**
 * Domain entity representing a table within a database
 * Contains table metadata including row counts
 */
export class Table {
  public readonly id: string;
  public readonly name: string;
  public readonly databaseId: string;
  public readonly rowCount: number | null;

  constructor(props: TableProps) {
    // Validation
    if (!props.id || props.id.trim() === '') {
      throw new Error('Table id cannot be empty');
    }

    if (!props.name || props.name.trim() === '') {
      throw new Error('Table name cannot be empty');
    }

    if (!props.databaseId || props.databaseId.trim() === '') {
      throw new Error('Table databaseId cannot be empty');
    }

    if (
      props.rowCount !== undefined &&
      props.rowCount !== null &&
      props.rowCount < 0
    ) {
      throw new Error('Table rowCount cannot be negative');
    }

    // Set properties
    this.id = props.id;
    this.name = props.name;
    this.databaseId = props.databaseId;
    this.rowCount = props.rowCount ?? null;
  }

  /**
   * Serializes the table to a JSON-compatible object
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      databaseId: this.databaseId,
      rowCount: this.rowCount,
    };
  }

  /**
   * Checks equality based on table ID
   * Two tables are considered equal if they have the same ID
   */
  equals(other: Table): boolean {
    return this.id === other.id;
  }

  /**
   * Returns the fully qualified name in database.table format
   */
  getFullyQualifiedName(): string {
    return `${this.databaseId}.${this.name}`;
  }

  /**
   * Checks if row count information is available
   */
  hasRowCount(): boolean {
    return this.rowCount !== null;
  }
}
