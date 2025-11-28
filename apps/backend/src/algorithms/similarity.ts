/**
 * String similarity algorithms for column name matching
 * Used in relationship discovery to find potentially related columns across databases
 */

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of single-character edits (insertions, deletions, substitutions)
 * required to change one string into another
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Number of edits required (0 = identical)
 *
 * @example
 * levenshteinDistance('kitten', 'sitting') // returns 3
 * levenshteinDistance('hello', 'hello') // returns 0
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Handle empty strings
  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Create a 2D array for dynamic programming
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate normalized Levenshtein similarity (0 to 1)
 * Returns a similarity score where:
 * - 1.0 = identical strings
 * - 0.0 = completely different
 *
 * Formula: 1 - (distance / maxLength)
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score between 0.0 and 1.0
 *
 * @example
 * normalizedLevenshteinSimilarity('hello', 'hello') // returns 1.0
 * normalizedLevenshteinSimilarity('cat', 'bat') // returns ~0.667
 */
export function normalizedLevenshteinSimilarity(
  str1: string,
  str2: string
): number {
  // Handle empty strings
  if (str1.length === 0 && str2.length === 0) return 1.0;

  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  return 1 - distance / maxLength;
}

/**
 * Calculate Jaro-Winkler similarity between two strings
 * Jaro-Winkler is particularly good for short strings and gives more weight
 * to strings that match from the beginning (common prefixes)
 *
 * Returns a value between 0.0 and 1.0 where:
 * - 1.0 = identical strings
 * - 0.0 = no similarity
 *
 * This is especially useful for database column names that often share prefixes
 * (e.g., 'user_id' and 'userId', 'customer_id' and 'customerId')
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score between 0.0 and 1.0
 *
 * @example
 * jaroWinklerSimilarity('martha', 'marhta') // returns ~0.96
 * jaroWinklerSimilarity('user_id', 'userId') // returns ~0.87
 */
export function jaroWinklerSimilarity(str1: string, str2: string): number {
  // Handle identical strings
  if (str1 === str2) return 1.0;

  // Handle empty strings
  if (str1.length === 0 || str2.length === 0) return 0.0;

  // Calculate Jaro similarity first
  const jaroSimilarity = calculateJaroSimilarity(str1, str2);

  // If Jaro similarity is below threshold, return it as-is
  if (jaroSimilarity < 0.7) return jaroSimilarity;

  // Calculate common prefix length (up to 4 characters)
  let prefixLength = 0;
  const maxPrefix = Math.min(4, Math.min(str1.length, str2.length));
  for (let i = 0; i < maxPrefix; i++) {
    if (str1[i] === str2[i]) {
      prefixLength++;
    } else {
      break;
    }
  }

  // Jaro-Winkler formula: jaro + (prefix * p * (1 - jaro))
  // where p = 0.1 (standard scaling factor)
  const p = 0.1;
  return jaroSimilarity + prefixLength * p * (1 - jaroSimilarity);
}

/**
 * Calculate Jaro similarity (helper for Jaro-Winkler)
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Jaro similarity score between 0.0 and 1.0
 */
function calculateJaroSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Handle edge cases
  if (len1 === 0 && len2 === 0) return 1.0;
  if (len1 === 0 || len2 === 0) return 0.0;

  // Calculate match window
  const matchWindow = Math.max(Math.floor(Math.max(len1, len2) / 2) - 1, 0);

  // Track matches
  const str1Matches = new Array(len1).fill(false);
  const str2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);

    for (let j = start; j < end; j++) {
      if (str2Matches[j] || str1[i] !== str2[j]) continue;
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }

  // No matches found
  if (matches === 0) return 0.0;

  // Count transpositions
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }

  // Calculate Jaro similarity
  return (
    (matches / len1 +
      matches / len2 +
      (matches - transpositions / 2) / matches) /
    3
  );
}
