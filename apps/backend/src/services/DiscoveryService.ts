import { Neo4jRepository } from '../repositories/Neo4jRepository';
import { Column } from '../domain/Column';
import {
  jaroWinklerSimilarity,
  normalizedLevenshteinSimilarity,
} from '../algorithms/similarity';
import { getTypeCompatibilityScore } from '../algorithms/typeCompatibility';

/**
 * Result of a column similarity discovery
 */
export interface SimilarityMatch {
  column1Id: string;
  column2Id: string;
  confidence: number;
  nameSimilarity: number;
  typeCompatibility: number;
  valueOverlap?: number; // Optional: value overlap score (0-1)
}

/**
 * Service for discovering relationships between columns across databases
 * Uses name similarity and type compatibility to find potential foreign key relationships
 */
export class DiscoveryService {
  private neo4jRepo: Neo4jRepository;
  private readonly CONFIDENCE_THRESHOLD = 0.6; // Minimum confidence to consider a match

  constructor(neo4jRepo: Neo4jRepository) {
    this.neo4jRepo = neo4jRepo;
  }

  /**
   * Find all similar column pairs across different tables
   * Returns pairs that exceed the confidence threshold
   */
  async findSimilarColumns(): Promise<SimilarityMatch[]> {
    // Get all columns from the graph
    const columns = await this.neo4jRepo.getAllColumns();

    const matches: SimilarityMatch[] = [];

    // Compare each pair of columns
    for (let i = 0; i < columns.length; i++) {
      for (let j = i + 1; j < columns.length; j++) {
        const col1 = columns[i];
        const col2 = columns[j];

        // Skip if columns are from the same table
        if (col1.tableId === col2.tableId) {
          continue;
        }

        // Calculate confidence score
        const confidence = this.calculateConfidence(col1, col2);

        // Only include matches above threshold
        if (confidence >= this.CONFIDENCE_THRESHOLD) {
          const nameSimilarity = this.calculateNameSimilarity(
            col1.name,
            col2.name
          );
          const typeCompatibility = getTypeCompatibilityScore(
            col1.dataType,
            col2.dataType
          );

          matches.push({
            column1Id: col1.id,
            column2Id: col2.id,
            confidence,
            nameSimilarity,
            typeCompatibility,
          });
        }
      }
    }

    return matches;
  }

  /**
   * Calculate overall confidence score for a column pair
   * Combines name similarity and type compatibility
   *
   * @param col1 - First column
   * @param col2 - Second column
   * @returns Confidence score (0.0 to 1.0)
   */
  calculateConfidence(col1: Column, col2: Column): number {
    // Type compatibility is a hard requirement
    const typeScore = getTypeCompatibilityScore(col1.dataType, col2.dataType);
    if (typeScore === 0.0) {
      return 0.0; // Incompatible types = no match
    }

    // Calculate name similarity
    const nameScore = this.calculateNameSimilarity(col1.name, col2.name);

    // Check for foreign key naming patterns
    const fkBoost = this.detectForeignKeyPattern(col1, col2);

    // Weighted combination:
    // - Type compatibility: 30%
    // - Name similarity: 50%
    // - FK pattern boost: 20%
    const confidence = typeScore * 0.3 + nameScore * 0.5 + fkBoost * 0.2;

    return Math.min(confidence, 1.0); // Cap at 1.0
  }

  /**
   * Calculate name similarity using multiple algorithms
   * Returns the maximum similarity score
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    // Use both Jaro-Winkler (good for prefixes) and normalized Levenshtein
    const jaroScore = jaroWinklerSimilarity(name1, name2);
    const levenshteinScore = normalizedLevenshteinSimilarity(name1, name2);

    // Return the maximum of the two scores
    return Math.max(jaroScore, levenshteinScore);
  }

  /**
   * Detect common foreign key naming patterns
   * Examples:
   * - "id" (primary key) vs "user_id" (foreign key)
   * - "customer_id" vs "id" in customers table
   *
   * @returns Boost score (0.0 to 1.0)
   */
  private detectForeignKeyPattern(col1: Column, col2: Column): number {
    const name1Lower = col1.name.toLowerCase();
    const name2Lower = col2.name.toLowerCase();

    // Pattern 1: One column is "id" and the other ends with "_id"
    if (
      (name1Lower === 'id' && name2Lower.endsWith('_id')) ||
      (name2Lower === 'id' && name1Lower.endsWith('_id'))
    ) {
      return 0.8;
    }

    // Pattern 2: One column is "id" and the other contains table name + "id"
    // This requires more context (table names) which we could enhance later
    if (name1Lower === 'id' || name2Lower === 'id') {
      return 0.3;
    }

    // Pattern 3: Both columns end with "_id" (common FK pattern)
    if (name1Lower.endsWith('_id') && name2Lower.endsWith('_id')) {
      return 0.4;
    }

    // Pattern 4: Both columns end with "Id" (camelCase pattern)
    if (name1Lower.endsWith('id') && name2Lower.endsWith('id')) {
      return 0.3;
    }

    return 0.0;
  }

  /**
   * Create SIMILAR_TO relationships in Neo4j for all discovered column pairs
   * Returns the number of relationships created
   */
  async createSimilarityRelationships(): Promise<number> {
    const matches = await this.findSimilarColumns();

    for (const match of matches) {
      await this.neo4jRepo.createSimilarityRelationship(
        match.column1Id,
        match.column2Id,
        match.confidence
      );
    }

    return matches.length;
  }
}
