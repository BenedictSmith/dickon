/**
 * Data type compatibility checking for relationship discovery
 * Determines if two columns from different tables could be related based on their data types
 */

/**
 * Normalized data type categories
 */
export type NormalizedType =
  | 'integer'
  | 'real'
  | 'text'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'time'
  | 'blob'
  | 'unknown';

/**
 * Map of SQL type patterns to normalized types
 */
const TYPE_PATTERNS: Array<[RegExp, NormalizedType]> = [
  // Integer types
  [/^(INTEGER|INT|BIGINT|SMALLINT|TINYINT|MEDIUMINT)$/i, 'integer'],

  // Real/Float types
  [/^(REAL|FLOAT|DOUBLE|NUMERIC|DECIMAL)(\(.*\))?$/i, 'real'],

  // Text types
  [/^(TEXT|VARCHAR|CHAR|STRING|CLOB|NVARCHAR|NCHAR)(\(.*\))?$/i, 'text'],

  // Boolean types
  [/^(BOOLEAN|BOOL)$/i, 'boolean'],

  // Date types
  [/^DATE$/i, 'date'],

  // DateTime types
  [/^(DATETIME|TIMESTAMP)$/i, 'datetime'],

  // Time types
  [/^TIME$/i, 'time'],

  // Blob types
  [/^(BLOB|BINARY|VARBINARY)$/i, 'blob'],
];

/**
 * Normalize a SQL data type to a standard category
 * Handles various SQL dialects and strips parameters
 *
 * @param dataType - Raw SQL data type (e.g., "VARCHAR(255)", "INTEGER", "DECIMAL(10,2)")
 * @returns Normalized type category
 *
 * @example
 * normalizeDataType('INTEGER') // returns 'integer'
 * normalizeDataType('VARCHAR(255)') // returns 'text'
 * normalizeDataType('DECIMAL(10,2)') // returns 'real'
 */
export function normalizeDataType(dataType: string): NormalizedType {
  const trimmed = dataType.trim();

  for (const [pattern, normalizedType] of TYPE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return normalizedType;
    }
  }

  return 'unknown';
}

/**
 * Check if two data types are compatible for relationship detection
 * Compatible types can potentially represent foreign key relationships
 *
 * @param type1 - First data type
 * @param type2 - Second data type
 * @returns true if types are compatible, false otherwise
 *
 * @example
 * areTypesCompatible('INTEGER', 'BIGINT') // returns true
 * areTypesCompatible('VARCHAR', 'TEXT') // returns true
 * areTypesCompatible('INTEGER', 'TEXT') // returns false
 */
export function areTypesCompatible(type1: string, type2: string): boolean {
  const normalized1 = normalizeDataType(type1);
  const normalized2 = normalizeDataType(type2);

  // Unknown types are not compatible
  if (normalized1 === 'unknown' || normalized2 === 'unknown') {
    return false;
  }

  // Same normalized type = compatible
  return normalized1 === normalized2;
}

/**
 * Calculate a compatibility score between two data types
 * Returns a score from 0.0 to 1.0 where:
 * - 1.0 = perfect match (same exact type)
 * - 0.9-0.95 = compatible but slightly different (e.g., INT vs BIGINT)
 * - 0.0 = incompatible
 *
 * @param type1 - First data type
 * @param type2 - Second data type
 * @returns Compatibility score (0.0 to 1.0)
 *
 * @example
 * getTypeCompatibilityScore('INTEGER', 'INTEGER') // returns 1.0
 * getTypeCompatibilityScore('INTEGER', 'BIGINT') // returns 0.9
 * getTypeCompatibilityScore('INTEGER', 'TEXT') // returns 0.0
 */
export function getTypeCompatibilityScore(
  type1: string,
  type2: string
): number {
  const trimmed1 = type1.trim().toUpperCase();
  const trimmed2 = type2.trim().toUpperCase();

  // Exact match (including parameters)
  if (trimmed1 === trimmed2) {
    return 1.0;
  }

  const normalized1 = normalizeDataType(type1);
  const normalized2 = normalizeDataType(type2);

  // Unknown types are incompatible
  if (normalized1 === 'unknown' || normalized2 === 'unknown') {
    return 0.0;
  }

  // Different normalized types are incompatible
  if (normalized1 !== normalized2) {
    return 0.0;
  }

  // Same normalized type but different representations
  // Check for specific compatibility rules

  // Integer types - different sizes are highly compatible
  if (normalized1 === 'integer') {
    // Strip to base type
    const base1 = trimmed1.replace(/\(.*\)/, '');
    const base2 = trimmed2.replace(/\(.*\)/, '');

    if (base1 === base2) return 1.0;

    // INT and INTEGER are equivalent
    const equivalentIntegers = ['INT', 'INTEGER'];
    if (
      equivalentIntegers.includes(base1) &&
      equivalentIntegers.includes(base2)
    ) {
      return 1.0;
    }

    // Different integer sizes (BIGINT, SMALLINT, etc.)
    const integerTypes = [
      'INT',
      'INTEGER',
      'BIGINT',
      'SMALLINT',
      'TINYINT',
      'MEDIUMINT',
    ];
    if (integerTypes.includes(base1) && integerTypes.includes(base2)) {
      return 0.9; // Slightly lower for different sizes
    }
  }

  // Text types - different lengths are highly compatible
  if (normalized1 === 'text') {
    const base1 = trimmed1.replace(/\(.*\)/, '');
    const base2 = trimmed2.replace(/\(.*\)/, '');

    // Check if base types are the same
    if (base1 === base2) {
      // If both have parameters and they're different, return 0.95
      const hasParams1 = trimmed1.includes('(');
      const hasParams2 = trimmed2.includes('(');
      if (hasParams1 && hasParams2 && trimmed1 !== trimmed2) {
        return 0.95; // Same type, different parameters
      }
      return 1.0;
    }

    // Different base types (VARCHAR vs TEXT, CHAR vs VARCHAR, etc.)
    // But one might have parameters and the other doesn't
    const hasParams1 = trimmed1.includes('(');
    const hasParams2 = trimmed2.includes('(');
    if (hasParams1 !== hasParams2) {
      return 0.95; // One with params, one without
    }

    // Both are text types without parameters but different base types
    // VARCHAR, TEXT, CHAR, STRING are all equivalent
    return 1.0;
  }

  // Real types - different precision is highly compatible
  if (normalized1 === 'real') {
    // All real/float types are essentially equivalent when normalized
    // FLOAT, REAL, DOUBLE, NUMERIC, DECIMAL are all the same category
    return 1.0;
  }

  // DateTime types - DATETIME and TIMESTAMP are equivalent
  if (normalized1 === 'datetime') {
    return 1.0;
  }

  // For all other cases with same normalized type, return 1.0
  return 1.0;
}
