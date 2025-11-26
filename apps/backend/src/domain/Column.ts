/**
 * Properties required to create a Column instance
 */
export interface ColumnProps {
  id: string;
  name: string;
  dataType: string;
  tableId: string;
  notNull?: boolean;
  primaryKey?: boolean;
  defaultValue?: string | null;
}

/**
 * Domain entity representing a column within a table
 * Contains column metadata including type, constraints, and default values
 */
export class Column {
  public readonly id: string;
  public readonly name: string;
  public readonly dataType: string;
  public readonly tableId: string;
  public readonly notNull: boolean;
  public readonly primaryKey: boolean;
  public readonly defaultValue: string | null;

  constructor(props: ColumnProps) {
    // Validation
    if (!props.id || props.id.trim() === '') {
      throw new Error('Column id cannot be empty');
    }

    if (!props.name || props.name.trim() === '') {
      throw new Error('Column name cannot be empty');
    }

    if (!props.dataType || props.dataType.trim() === '') {
      throw new Error('Column dataType cannot be empty');
    }

    if (!props.tableId || props.tableId.trim() === '') {
      throw new Error('Column tableId cannot be empty');
    }

    // Set properties
    this.id = props.id;
    this.name = props.name;
    this.dataType = props.dataType;
    this.tableId = props.tableId;
    this.notNull = props.notNull ?? false;
    this.primaryKey = props.primaryKey ?? false;
    this.defaultValue = props.defaultValue ?? null;
  }

  /**
   * Serializes the column to a JSON-compatible object
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      dataType: this.dataType,
      tableId: this.tableId,
      notNull: this.notNull,
      primaryKey: this.primaryKey,
      defaultValue: this.defaultValue,
    };
  }

  /**
   * Checks equality based on column ID
   * Two columns are considered equal if they have the same ID
   */
  equals(other: Column): boolean {
    return this.id === other.id;
  }

  /**
   * Checks if this column is a primary key
   */
  isPrimaryKey(): boolean {
    return this.primaryKey;
  }

  /**
   * Checks if this column can contain NULL values
   */
  isNullable(): boolean {
    return !this.notNull;
  }

  /**
   * Checks if this column has a default value
   */
  hasDefaultValue(): boolean {
    return this.defaultValue !== null;
  }

  /**
   * Returns the fully qualified name in table.column format
   */
  getFullyQualifiedName(): string {
    return `${this.tableId}.${this.name}`;
  }
}
