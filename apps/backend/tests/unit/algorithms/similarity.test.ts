import { describe, it, expect } from '@jest/globals';
import {
  levenshteinDistance,
  jaroWinklerSimilarity,
  normalizedLevenshteinSimilarity,
} from '../../../src/algorithms/similarity';

describe('Similarity Algorithms', () => {
  describe('levenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
      expect(levenshteinDistance('', '')).toBe(0);
      expect(levenshteinDistance('test', 'test')).toBe(0);
    });

    it('should return length of string when comparing with empty string', () => {
      expect(levenshteinDistance('hello', '')).toBe(5);
      expect(levenshteinDistance('', 'world')).toBe(5);
    });

    it('should handle single character differences', () => {
      expect(levenshteinDistance('cat', 'bat')).toBe(1);
      expect(levenshteinDistance('hello', 'hallo')).toBe(1);
    });

    it('should handle insertions', () => {
      expect(levenshteinDistance('cat', 'cart')).toBe(1);
      expect(levenshteinDistance('hello', 'helllo')).toBe(1);
    });

    it('should handle deletions', () => {
      expect(levenshteinDistance('cart', 'cat')).toBe(1);
      expect(levenshteinDistance('helllo', 'hello')).toBe(1);
    });

    it('should handle multiple operations', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(levenshteinDistance('saturday', 'sunday')).toBe(3);
    });

    it('should be case-sensitive', () => {
      expect(levenshteinDistance('Hello', 'hello')).toBe(1);
      expect(levenshteinDistance('HELLO', 'hello')).toBe(5);
    });

    it('should handle common column name transformations', () => {
      // user_id vs userId
      expect(levenshteinDistance('user_id', 'userId')).toBe(2);
      // customer_id vs customerId
      expect(levenshteinDistance('customer_id', 'customerId')).toBe(2);
      // email_address vs emailAddress
      expect(levenshteinDistance('email_address', 'emailAddress')).toBe(2);
    });

    it('should handle completely different strings', () => {
      expect(levenshteinDistance('abc', 'xyz')).toBe(3);
      expect(levenshteinDistance('hello', 'world')).toBe(4);
    });

    it('should handle strings with special characters', () => {
      expect(levenshteinDistance('user@email', 'user_email')).toBe(1);
      expect(levenshteinDistance('first-name', 'first_name')).toBe(1);
    });
  });

  describe('normalizedLevenshteinSimilarity', () => {
    it('should return 1.0 for identical strings', () => {
      expect(normalizedLevenshteinSimilarity('hello', 'hello')).toBe(1.0);
      expect(normalizedLevenshteinSimilarity('test', 'test')).toBe(1.0);
    });

    it('should return 1.0 for two empty strings', () => {
      expect(normalizedLevenshteinSimilarity('', '')).toBe(1.0);
    });

    it('should return 0.0 for completely different strings', () => {
      expect(normalizedLevenshteinSimilarity('abc', 'xyz')).toBe(0.0);
    });

    it('should return value between 0 and 1', () => {
      const similarity = normalizedLevenshteinSimilarity('kitten', 'sitting');
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
      expect(similarity).toBeCloseTo(0.571, 2); // 4/7
    });

    it('should handle single character difference', () => {
      const similarity = normalizedLevenshteinSimilarity('cat', 'bat');
      expect(similarity).toBeCloseTo(0.667, 2); // 2/3
    });

    it('should be symmetric', () => {
      const sim1 = normalizedLevenshteinSimilarity('hello', 'world');
      const sim2 = normalizedLevenshteinSimilarity('world', 'hello');
      expect(sim1).toBe(sim2);
    });
  });

  describe('jaroWinklerSimilarity', () => {
    it('should return 1.0 for identical strings', () => {
      expect(jaroWinklerSimilarity('hello', 'hello')).toBe(1.0);
      expect(jaroWinklerSimilarity('', '')).toBe(1.0);
      expect(jaroWinklerSimilarity('test', 'test')).toBe(1.0);
    });

    it('should return 0.0 for completely different strings', () => {
      expect(jaroWinklerSimilarity('abc', 'xyz')).toBe(0.0);
    });

    it('should favor strings with common prefixes', () => {
      // Jaro-Winkler gives bonus for common prefix
      const jw1 = jaroWinklerSimilarity('hello', 'hallo');
      const jw2 = jaroWinklerSimilarity('hello', 'oello');
      expect(jw1).toBeGreaterThan(jw2);
    });

    it('should return value between 0 and 1', () => {
      const similarity = jaroWinklerSimilarity('martha', 'marhta');
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('should handle common column name patterns', () => {
      // user_id vs userId - common prefix 'user'
      const sim1 = jaroWinklerSimilarity('user_id', 'userId');
      expect(sim1).toBeGreaterThan(0.8); // High similarity due to common prefix

      // customer_id vs customerId
      const sim2 = jaroWinklerSimilarity('customer_id', 'customerId');
      expect(sim2).toBeGreaterThan(0.8);
    });

    it('should handle transpositions better than Levenshtein', () => {
      // Jaro is good at detecting transpositions
      const similarity = jaroWinklerSimilarity('martha', 'marhta');
      expect(similarity).toBeGreaterThan(0.9);
    });

    it('should be symmetric', () => {
      const sim1 = jaroWinklerSimilarity('hello', 'world');
      const sim2 = jaroWinklerSimilarity('world', 'hello');
      expect(sim1).toBe(sim2);
    });

    it('should handle single character strings', () => {
      expect(jaroWinklerSimilarity('a', 'a')).toBe(1.0);
      expect(jaroWinklerSimilarity('a', 'b')).toBe(0.0);
    });

    it('should handle strings with different lengths', () => {
      const similarity = jaroWinklerSimilarity('short', 'muchlongerstring');
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThan(1);
    });

    it('should detect common database naming patterns', () => {
      // Test real-world column name similarities
      expect(jaroWinklerSimilarity('email', 'e_mail')).toBeGreaterThan(0.8);
      expect(jaroWinklerSimilarity('firstName', 'first_name')).toBeGreaterThan(0.7);
      expect(jaroWinklerSimilarity('createdAt', 'created_at')).toBeGreaterThan(0.8);
    });
  });
});
