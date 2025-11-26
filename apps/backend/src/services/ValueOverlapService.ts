/**
 * Service for calculating value overlap between columns
 * Used to detect foreign key relationships based on actual data values
 */

/**
 * Result of overlap calculation between two sets of values
 */
export interface OverlapResult {
  overlapCount: number;
  overlapPercentage1: number; // Percentage of values1 that appear in values2
  overlapPercentage2: number; // Percentage of values2 that appear in values1
  uniqueValues1: number;
  uniqueValues2: number;
}

/**
 * Service for detecting relationships based on value overlap
 */
export class ValueOverlapService {
  /**
   * Calculate overlap between two sets of column values
   *
   * @param values1 - First set of values
   * @param values2 - Second set of values
   * @returns Overlap statistics
   *
   * @example
   * const values1 = ['1', '2', '3', '4', '5'];
   * const values2 = ['2', '3', '5', '8', '9'];
   * const result = calculateOverlap(values1, values2);
   * // result.overlapCount = 3 ([2, 3, 5])
   * // result.overlapPercentage1 = 0.6 (3/5)
   */
  calculateOverlap(
    values1: Array<string | null>,
    values2: Array<string | null>
  ): OverlapResult {
    // Handle empty arrays
    if (values1.length === 0 || values2.length === 0) {
      return {
        overlapCount: 0,
        overlapPercentage1: 0,
        overlapPercentage2: 0,
        uniqueValues1: values1.length,
        uniqueValues2: values2.length,
      };
    }

    // Convert to sets for efficient lookup and to handle duplicates
    const set1 = new Set(values1);
    const set2 = new Set(values2);

    // Find intersection
    const intersection = new Set<string | null>();
    const array1 = Array.from(set1);
    for (let i = 0; i < array1.length; i++) {
      const value = array1[i];
      if (set2.has(value)) {
        intersection.add(value);
      }
    }

    const overlapCount = intersection.size;
    const uniqueValues1 = set1.size;
    const uniqueValues2 = set2.size;

    return {
      overlapCount,
      overlapPercentage1: uniqueValues1 > 0 ? overlapCount / uniqueValues1 : 0,
      overlapPercentage2: uniqueValues2 > 0 ? overlapCount / uniqueValues2 : 0,
      uniqueValues1,
      uniqueValues2,
    };
  }

  /**
   * Calculate a confidence score based on overlap results
   * Higher scores indicate stronger likelihood of a foreign key relationship
   *
   * @param overlap - Overlap calculation result
   * @returns Score from 0.0 to 1.0
   */
  calculateOverlapScore(overlap: OverlapResult): number {
    // No overlap = no relationship
    if (overlap.overlapCount === 0) {
      return 0.0;
    }

    // Use the average of both percentages as base score
    const avgPercentage =
      (overlap.overlapPercentage1 + overlap.overlapPercentage2) / 2;

    // Boost score for larger overlap counts (more confident with more data)
    // Use logarithmic scale to avoid over-weighting (0 to ~0.2 range)
    const countBoost = Math.log10(overlap.overlapCount + 1) / 5;

    // For FK patterns where one column is a subset of another,
    // give extra weight to the maximum percentage
    const maxPercentage = Math.max(
      overlap.overlapPercentage1,
      overlap.overlapPercentage2
    );

    // Weighted combination:
    // - Average percentage: 50%
    // - Max percentage (for FK subset detection): 30%
    // - Count boost: 20%
    const score = avgPercentage * 0.5 + maxPercentage * 0.3 + countBoost * 0.2;

    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Detect if overlap represents a foreign key pattern
   * FK pattern: One column's values are mostly/entirely contained in the other
   *
   * @param overlap - Overlap calculation result
   * @returns true if FK pattern detected
   */
  detectForeignKeyPattern(overlap: OverlapResult): boolean {
    const FK_THRESHOLD = 0.8; // 80% of values must overlap

    // Check if column 2 is a subset of column 1 (FK → PK pattern)
    if (overlap.overlapPercentage2 >= FK_THRESHOLD) {
      return true;
    }

    // Check if column 1 is a subset of column 2 (PK → FK pattern)
    if (overlap.overlapPercentage1 >= FK_THRESHOLD) {
      return true;
    }

    return false;
  }
}
