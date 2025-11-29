import { createHash } from 'crypto';
import { FederatedQueryInput, FederatedQueryResult } from '../types/federation';

/**
 * Cache entry with timestamp and metadata
 */
export interface CacheEntry {
  result: FederatedQueryResult;
  timestamp: number;
  queryHash: string;
  databases: string[];
}

/**
 * Cache for federated query results
 * Uses LRU eviction and TTL-based expiration
 */
export class QueryCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private ttlMs: number;

  constructor(maxSize = 100, ttlSeconds = 300) {
    this.maxSize = maxSize;
    this.ttlMs = ttlSeconds * 1000;
  }

  /**
   * Get cached result if available and not expired
   *
   * @param key - Cache key (query hash)
   * @returns Cached result or null
   */
  async get(key: string): Promise<FederatedQueryResult | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.result;
  }

  /**
   * Store result in cache
   *
   * @param key - Cache key (query hash)
   * @param result - Query result to cache
   * @param databases - List of databases involved
   */
  async set(
    key: string,
    result: FederatedQueryResult,
    databases: string[]
  ): Promise<void> {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      queryHash: key,
      databases,
    });
  }

  /**
   * Invalidate cache entries for a specific database
   * Called when a database is updated or re-ingested
   *
   * @param databaseId - Database ID to invalidate
   */
  async invalidateDatabase(databaseId: string): Promise<void> {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (entry.databases.includes(databaseId)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Clear all cached entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // TODO: Track hits/misses
    };
  }

  /**
   * Evict oldest (least recently used) entry
   */
  private evictOldest(): void {
    // Map preserves insertion order, so first entry is oldest
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
    }
  }
}

/**
 * Generate cache key from query input
 * Uses SHA-256 hash of normalized query
 *
 * @param input - Federated query input
 * @returns Cache key (hex string)
 */
export function generateCacheKey(input: FederatedQueryInput): string {
  // Normalize input for consistent hashing
  const normalized = {
    tables: input.tables.map((t) => ({
      database: t.database,
      table: t.table,
      alias: t.alias || null,
    })),
    select: input.select.map((s) => ({
      table: s.table,
      column: s.column,
      alias: s.alias || null,
    })),
    joins: input.joins?.map((j) => ({
      from: j.from,
      to: j.to,
      type: j.type,
    })) || [],
    where: input.where?.map((w) => ({
      column: w.column,
      operator: w.operator,
      value: w.value,
    })) || [],
    limit: input.limit || null,
    offset: input.offset || null,
  };

  return createHash('sha256')
    .update(JSON.stringify(normalized))
    .digest('hex');
}
