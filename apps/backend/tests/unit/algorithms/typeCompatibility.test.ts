import { describe, it, expect } from '@jest/globals';
import {
  areTypesCompatible,
  getTypeCompatibilityScore,
  normalizeDataType,
} from '../../../src/algorithms/typeCompatibility';

describe('Type Compatibility', () => {
  describe('normalizeDataType', () => {
    it('should normalize INTEGER types', () => {
      expect(normalizeDataType('INTEGER')).toBe('integer');
      expect(normalizeDataType('INT')).toBe('integer');
      expect(normalizeDataType('BIGINT')).toBe('integer');
      expect(normalizeDataType('SMALLINT')).toBe('integer');
      expect(normalizeDataType('TINYINT')).toBe('integer');
    });

    it('should normalize TEXT/STRING types', () => {
      expect(normalizeDataType('TEXT')).toBe('text');
      expect(normalizeDataType('VARCHAR')).toBe('text');
      expect(normalizeDataType('VARCHAR(255)')).toBe('text');
      expect(normalizeDataType('CHAR')).toBe('text');
      expect(normalizeDataType('CHAR(10)')).toBe('text');
      expect(normalizeDataType('STRING')).toBe('text');
    });

    it('should normalize REAL/FLOAT types', () => {
      expect(normalizeDataType('REAL')).toBe('real');
      expect(normalizeDataType('FLOAT')).toBe('real');
      expect(normalizeDataType('DOUBLE')).toBe('real');
      expect(normalizeDataType('NUMERIC')).toBe('real');
      expect(normalizeDataType('DECIMAL')).toBe('real');
      expect(normalizeDataType('DECIMAL(10,2)')).toBe('real');
    });

    it('should normalize DATE/TIME types', () => {
      expect(normalizeDataType('DATE')).toBe('date');
      expect(normalizeDataType('DATETIME')).toBe('datetime');
      expect(normalizeDataType('TIMESTAMP')).toBe('datetime');
      expect(normalizeDataType('TIME')).toBe('time');
    });

    it('should normalize BOOLEAN types', () => {
      expect(normalizeDataType('BOOLEAN')).toBe('boolean');
      expect(normalizeDataType('BOOL')).toBe('boolean');
    });

    it('should normalize BLOB types', () => {
      expect(normalizeDataType('BLOB')).toBe('blob');
      expect(normalizeDataType('BINARY')).toBe('blob');
    });

    it('should handle mixed case', () => {
      expect(normalizeDataType('Integer')).toBe('integer');
      expect(normalizeDataType('VarChar')).toBe('text');
      expect(normalizeDataType('DateTime')).toBe('datetime');
    });

    it('should handle types with parameters', () => {
      expect(normalizeDataType('VARCHAR(100)')).toBe('text');
      expect(normalizeDataType('DECIMAL(10, 2)')).toBe('real');
      expect(normalizeDataType('CHAR(50)')).toBe('text');
    });

    it('should return unknown for unrecognized types', () => {
      expect(normalizeDataType('CUSTOM_TYPE')).toBe('unknown');
      expect(normalizeDataType('WEIRD')).toBe('unknown');
    });
  });

  describe('areTypesCompatible', () => {
    it('should return true for identical normalized types', () => {
      expect(areTypesCompatible('INTEGER', 'INTEGER')).toBe(true);
      expect(areTypesCompatible('TEXT', 'TEXT')).toBe(true);
      expect(areTypesCompatible('REAL', 'REAL')).toBe(true);
    });

    it('should return true for compatible integer variations', () => {
      expect(areTypesCompatible('INTEGER', 'INT')).toBe(true);
      expect(areTypesCompatible('BIGINT', 'INTEGER')).toBe(true);
      expect(areTypesCompatible('SMALLINT', 'INT')).toBe(true);
      expect(areTypesCompatible('TINYINT', 'BIGINT')).toBe(true);
    });

    it('should return true for compatible text variations', () => {
      expect(areTypesCompatible('TEXT', 'VARCHAR')).toBe(true);
      expect(areTypesCompatible('VARCHAR(255)', 'TEXT')).toBe(true);
      expect(areTypesCompatible('CHAR', 'VARCHAR')).toBe(true);
      expect(areTypesCompatible('STRING', 'TEXT')).toBe(true);
    });

    it('should return true for compatible real/numeric variations', () => {
      expect(areTypesCompatible('REAL', 'FLOAT')).toBe(true);
      expect(areTypesCompatible('DOUBLE', 'REAL')).toBe(true);
      expect(areTypesCompatible('NUMERIC', 'DECIMAL')).toBe(true);
      expect(areTypesCompatible('DECIMAL(10,2)', 'FLOAT')).toBe(true);
    });

    it('should return true for compatible datetime variations', () => {
      expect(areTypesCompatible('DATETIME', 'TIMESTAMP')).toBe(true);
      expect(areTypesCompatible('TIMESTAMP', 'DATETIME')).toBe(true);
    });

    it('should return false for incompatible types', () => {
      expect(areTypesCompatible('INTEGER', 'TEXT')).toBe(false);
      expect(areTypesCompatible('TEXT', 'REAL')).toBe(false);
      expect(areTypesCompatible('DATE', 'INTEGER')).toBe(false);
      expect(areTypesCompatible('BOOLEAN', 'TEXT')).toBe(false);
    });

    it('should return false for blob types with other types', () => {
      expect(areTypesCompatible('BLOB', 'TEXT')).toBe(false);
      expect(areTypesCompatible('BLOB', 'INTEGER')).toBe(false);
      expect(areTypesCompatible('BINARY', 'VARCHAR')).toBe(false);
    });

    it('should handle case insensitivity', () => {
      expect(areTypesCompatible('integer', 'INTEGER')).toBe(true);
      expect(areTypesCompatible('VarChar', 'TEXT')).toBe(true);
      expect(areTypesCompatible('DateTime', 'TIMESTAMP')).toBe(true);
    });

    it('should return false when either type is unknown', () => {
      expect(areTypesCompatible('CUSTOM_TYPE', 'INTEGER')).toBe(false);
      expect(areTypesCompatible('TEXT', 'WEIRD_TYPE')).toBe(false);
    });
  });

  describe('getTypeCompatibilityScore', () => {
    it('should return 1.0 for identical types', () => {
      expect(getTypeCompatibilityScore('INTEGER', 'INTEGER')).toBe(1.0);
      expect(getTypeCompatibilityScore('TEXT', 'TEXT')).toBe(1.0);
      expect(getTypeCompatibilityScore('REAL', 'REAL')).toBe(1.0);
    });

    it('should return high score for exact normalized matches', () => {
      expect(getTypeCompatibilityScore('INTEGER', 'INT')).toBe(1.0);
      expect(getTypeCompatibilityScore('VARCHAR', 'TEXT')).toBe(1.0);
      expect(getTypeCompatibilityScore('FLOAT', 'REAL')).toBe(1.0);
    });

    it('should return 0.9 for compatible integer types of different sizes', () => {
      expect(getTypeCompatibilityScore('BIGINT', 'INTEGER')).toBe(0.9);
      expect(getTypeCompatibilityScore('SMALLINT', 'BIGINT')).toBe(0.9);
      expect(getTypeCompatibilityScore('TINYINT', 'INT')).toBe(0.9);
    });

    it('should return 0.95 for compatible text types with different lengths', () => {
      expect(getTypeCompatibilityScore('VARCHAR(50)', 'VARCHAR(100)')).toBe(
        0.95
      );
      expect(getTypeCompatibilityScore('CHAR(10)', 'TEXT')).toBe(0.95);
    });

    it('should return 0.0 for incompatible types', () => {
      expect(getTypeCompatibilityScore('INTEGER', 'TEXT')).toBe(0.0);
      expect(getTypeCompatibilityScore('TEXT', 'REAL')).toBe(0.0);
      expect(getTypeCompatibilityScore('DATE', 'INTEGER')).toBe(0.0);
    });

    it('should handle numeric to text compatibility (weak match)', () => {
      // In some databases, numbers can be stored as text
      // But this should have a low score
      expect(getTypeCompatibilityScore('INTEGER', 'TEXT')).toBeLessThan(0.5);
    });

    it('should return 0.0 for unknown types', () => {
      expect(getTypeCompatibilityScore('CUSTOM_TYPE', 'INTEGER')).toBe(0.0);
      expect(getTypeCompatibilityScore('TEXT', 'WEIRD_TYPE')).toBe(0.0);
    });

    it('should be symmetric', () => {
      const score1 = getTypeCompatibilityScore('INTEGER', 'TEXT');
      const score2 = getTypeCompatibilityScore('TEXT', 'INTEGER');
      expect(score1).toBe(score2);
    });

    it('should handle common foreign key patterns', () => {
      // Foreign keys are typically integers
      expect(getTypeCompatibilityScore('INTEGER', 'BIGINT')).toBeGreaterThan(
        0.8
      );
      expect(getTypeCompatibilityScore('INT', 'INTEGER')).toBe(1.0);
    });
  });
});
