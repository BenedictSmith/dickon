import { describe, it, expect, beforeEach } from '@jest/globals';
import { ValueOverlapService } from '../../../src/services/ValueOverlapService';

describe('ValueOverlapService', () => {
  let service: ValueOverlapService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ValueOverlapService();
  });

  describe('calculateOverlap', () => {
    it('should calculate overlap between two sets of values', () => {
      // Arrange
      const values1 = ['1', '2', '3', '4', '5'];
      const values2 = ['2', '3', '5', '8', '9'];

      // Act
      const result = service.calculateOverlap(values1, values2);

      // Assert
      expect(result.overlapCount).toBe(3); // [2, 3, 5]
      expect(result.overlapPercentage1).toBeCloseTo(0.6); // 3/5
      expect(result.overlapPercentage2).toBeCloseTo(0.6); // 3/5
    });

    it('should handle no overlap', () => {
      // Arrange
      const values1 = ['1', '2', '3'];
      const values2 = ['4', '5', '6'];

      // Act
      const result = service.calculateOverlap(values1, values2);

      // Assert
      expect(result.overlapCount).toBe(0);
      expect(result.overlapPercentage1).toBe(0);
      expect(result.overlapPercentage2).toBe(0);
    });

    it('should handle complete overlap', () => {
      // Arrange
      const values1 = ['1', '2', '3'];
      const values2 = ['1', '2', '3'];

      // Act
      const result = service.calculateOverlap(values1, values2);

      // Assert
      expect(result.overlapCount).toBe(3);
      expect(result.overlapPercentage1).toBe(1.0);
      expect(result.overlapPercentage2).toBe(1.0);
    });

    it('should handle empty arrays', () => {
      // Arrange
      const values1: string[] = [];
      const values2 = ['1', '2', '3'];

      // Act
      const result = service.calculateOverlap(values1, values2);

      // Assert
      expect(result.overlapCount).toBe(0);
      expect(result.overlapPercentage1).toBe(0);
      expect(result.overlapPercentage2).toBe(0);
    });

    it('should handle case-sensitive comparison', () => {
      // Arrange
      const values1 = ['ABC', 'def'];
      const values2 = ['abc', 'def'];

      // Act
      const result = service.calculateOverlap(values1, values2);

      // Assert
      expect(result.overlapCount).toBe(1); // Only 'def' matches
      expect(result.overlapPercentage1).toBeCloseTo(0.5);
    });

    it('should handle duplicate values in sets', () => {
      // Arrange
      const values1 = ['1', '2', '2', '3'];
      const values2 = ['2', '2', '3', '4'];

      // Act
      const result = service.calculateOverlap(values1, values2);

      // Assert
      // Unique values: [1,2,3] vs [2,3,4]
      // Overlap: [2,3]
      expect(result.overlapCount).toBe(2);
    });

    it('should handle null values', () => {
      // Arrange
      const values1 = ['1', null, '3'];
      const values2 = ['2', null, '4'];

      // Act
      const result = service.calculateOverlap(values1, values2);

      // Assert
      expect(result.overlapCount).toBe(1); // null matches
    });
  });

  describe('calculateOverlapScore', () => {
    it('should return high score for high overlap percentage', () => {
      // Arrange
      const overlapResult = {
        overlapCount: 8,
        overlapPercentage1: 0.8,
        overlapPercentage2: 0.8,
        uniqueValues1: 10,
        uniqueValues2: 10,
      };

      // Act
      const score = service.calculateOverlapScore(overlapResult);

      // Assert
      expect(score).toBeGreaterThan(0.65);
      expect(score).toBeLessThanOrEqual(1.0);
    });

    it('should return low score for low overlap', () => {
      // Arrange
      const overlapResult = {
        overlapCount: 1,
        overlapPercentage1: 0.1,
        overlapPercentage2: 0.1,
        uniqueValues1: 10,
        uniqueValues2: 10,
      };

      // Act
      const score = service.calculateOverlapScore(overlapResult);

      // Assert
      expect(score).toBeLessThan(0.3);
    });

    it('should return zero for no overlap', () => {
      // Arrange
      const overlapResult = {
        overlapCount: 0,
        overlapPercentage1: 0,
        overlapPercentage2: 0,
        uniqueValues1: 10,
        uniqueValues2: 10,
      };

      // Act
      const score = service.calculateOverlapScore(overlapResult);

      // Assert
      expect(score).toBe(0);
    });

    it('should handle asymmetric overlap (foreign key pattern)', () => {
      // Arrange - FK column has all values from PK, but PK has more
      const overlapResult = {
        overlapCount: 5,
        overlapPercentage1: 0.5, // 5/10 of PK values
        overlapPercentage2: 1.0, // 5/5 of FK values (all FK values in PK)
        uniqueValues1: 10,
        uniqueValues2: 5,
      };

      // Act
      const score = service.calculateOverlapScore(overlapResult);

      // Assert
      // High score because FK column has perfect subset relationship
      expect(score).toBeGreaterThan(0.7);
    });

    it('should boost score when overlap count is significant', () => {
      // Arrange
      const smallOverlap = {
        overlapCount: 2,
        overlapPercentage1: 0.5,
        overlapPercentage2: 0.5,
        uniqueValues1: 4,
        uniqueValues2: 4,
      };

      const largeOverlap = {
        overlapCount: 50,
        overlapPercentage1: 0.5,
        overlapPercentage2: 0.5,
        uniqueValues1: 100,
        uniqueValues2: 100,
      };

      // Act
      const scoreSmall = service.calculateOverlapScore(smallOverlap);
      const scoreLarge = service.calculateOverlapScore(largeOverlap);

      // Assert
      // Larger overlap count should have higher confidence
      expect(scoreLarge).toBeGreaterThan(scoreSmall);
    });
  });

  describe('detectForeignKeyPattern', () => {
    it('should detect subset pattern (FK → PK)', () => {
      // Arrange
      const overlapResult = {
        overlapCount: 100,
        overlapPercentage1: 0.5, // PK has more values
        overlapPercentage2: 1.0, // FK values all exist in PK
        uniqueValues1: 200,
        uniqueValues2: 100,
      };

      // Act
      const isFKPattern = service.detectForeignKeyPattern(overlapResult);

      // Assert
      expect(isFKPattern).toBe(true);
    });

    it('should not detect FK pattern for symmetric overlap', () => {
      // Arrange
      const overlapResult = {
        overlapCount: 50,
        overlapPercentage1: 0.5,
        overlapPercentage2: 0.5,
        uniqueValues1: 100,
        uniqueValues2: 100,
      };

      // Act
      const isFKPattern = service.detectForeignKeyPattern(overlapResult);

      // Assert
      expect(isFKPattern).toBe(false);
    });

    it('should require high percentage for FK pattern', () => {
      // Arrange
      const overlapResult = {
        overlapCount: 50,
        overlapPercentage1: 0.5,
        overlapPercentage2: 0.7, // Not quite high enough
        uniqueValues1: 100,
        uniqueValues2: 71,
      };

      // Act
      const isFKPattern = service.detectForeignKeyPattern(overlapResult);

      // Assert
      expect(isFKPattern).toBe(false);
    });

    it('should detect reverse FK pattern (PK → FK)', () => {
      // Arrange
      const overlapResult = {
        overlapCount: 100,
        overlapPercentage1: 1.0, // All PK values in FK
        overlapPercentage2: 0.5, // FK has more values
        uniqueValues1: 100,
        uniqueValues2: 200,
      };

      // Act
      const isFKPattern = service.detectForeignKeyPattern(overlapResult);

      // Assert
      expect(isFKPattern).toBe(true);
    });
  });
});
