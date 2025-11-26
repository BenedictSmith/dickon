import * as path from 'path';

/**
 * Properties required to create a Database instance
 */
export interface DatabaseProps {
  id: string;
  name: string;
  path: string;
  addedAt?: Date;
}

/**
 * Domain entity representing a SQLite database in the system
 * Immutable value object with validation
 */
export class Database {
  public readonly id: string;
  public readonly name: string;
  public readonly path: string;
  public readonly addedAt: Date;

  constructor(props: DatabaseProps) {
    // Validation
    if (!props.id || props.id.trim() === '') {
      throw new Error('Database id cannot be empty');
    }

    if (!props.name || props.name.trim() === '') {
      throw new Error('Database name cannot be empty');
    }

    if (!props.path || props.path.trim() === '') {
      throw new Error('Database path cannot be empty');
    }

    // Set properties
    this.id = props.id;
    this.name = props.name;
    this.path = props.path;
    this.addedAt = props.addedAt || new Date();
  }

  /**
   * Serializes the database to a JSON-compatible object
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      path: this.path,
      addedAt: this.addedAt.toISOString(),
    };
  }

  /**
   * Checks equality based on database ID
   * Two databases are considered equal if they have the same ID
   */
  equals(other: Database): boolean {
    return this.id === other.id;
  }

  /**
   * Extracts the filename from the database path
   * Handles both Unix and Windows path separators
   */
  getFileName(): string {
    // Normalize path separators to handle both Unix (/) and Windows (\)
    const normalizedPath = this.path.replace(/\\/g, '/');
    return path.basename(normalizedPath);
  }
}
