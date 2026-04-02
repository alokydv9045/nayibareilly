/**
 * Multi-layer Caching Service
 * Implements L1 (Memory) and L2 (Redis) caching
 */

const NodeCache = require('node-cache');
const Redis = require('ioredis');

class CacheService {
  constructor() {
    // L1 Cache: In-memory (fast but not shared)
    this.memoryCache = new NodeCache({
      stdTTL: 60,           // 1 minute default TTL
      checkperiod: 120,     // Check for expired keys every 2 minutes
      useClones: false,     // Don't clone objects (better performance)
      maxKeys: 1000         // Maximum 1000 keys in memory
    });

    // L2 Cache: Redis (shared across instances)
    this.redisClient = null;
    this.isRedisConnected = false;
    this.initRedis();

    // Cache statistics
    this.stats = {
      memoryHits: 0,
      memoryMisses: 0,
      redisHits: 0,
      redisMisses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Initialize Redis connection
   */
  initRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.redisClient = new Redis(redisUrl, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true
      });

      this.redisClient.on('connect', () => {
        this.isRedisConnected = true;
        console.log('💾 Cache ready');
      });

      this.redisClient.on('error', (err) => {
        this.isRedisConnected = false;
        console.error('❌ Redis cache error:', err.message);
      });

      this.redisClient.on('close', () => {
        this.isRedisConnected = false;
        console.warn('⚠️ Redis cache connection closed');
      });

      // Connect to Redis
      this.redisClient.connect().catch((err) => {
        console.error('Failed to connect to Redis:', err.message);
      });
    } catch (error) {
      console.error('Redis initialization error:', error.message);
      this.isRedisConnected = false;
    }
  }

  /**
   * Get value from cache (checks L1 then L2)
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    try {
      // L1: Check memory cache first
      const memoryValue = this.memoryCache.get(key);
      if (memoryValue !== undefined) {
        this.stats.memoryHits++;
        return memoryValue;
      }
      this.stats.memoryMisses++;

      // L2: Check Redis cache
      if (this.isRedisConnected) {
        const redisValue = await this.redisClient.get(key);
        if (redisValue) {
          this.stats.redisHits++;
          const parsed = JSON.parse(redisValue);
          
          // Populate L1 cache for next access
          this.memoryCache.set(key, parsed);
          
          return parsed;
        }
        this.stats.redisMisses++;
      }

      return null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Set value in cache (writes to both L1 and L2)
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   */
  async set(key, value, ttl = 300) {
    try {
      this.stats.sets++;

      // L1: Set in memory cache
      this.memoryCache.set(key, value, ttl);

      // L2: Set in Redis cache
      if (this.isRedisConnected) {
        await this.redisClient.setex(
          key,
          ttl,
          JSON.stringify(value)
        );
      }

      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Delete value from cache (removes from both L1 and L2)
   * @param {string} key - Cache key
   */
  async delete(key) {
    try {
      this.stats.deletes++;

      // L1: Delete from memory
      this.memoryCache.del(key);

      // L2: Delete from Redis
      if (this.isRedisConnected) {
        await this.redisClient.del(key);
      }

      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   * @param {string} pattern - Pattern to match (e.g., 'user:*')
   */
  async deletePattern(pattern) {
    try {
      // L1: Delete from memory (iterate through all keys)
      const memoryKeys = this.memoryCache.keys();
      memoryKeys.forEach(key => {
        if (this.matchPattern(key, pattern)) {
          this.memoryCache.del(key);
        }
      });

      // L2: Delete from Redis using SCAN
      if (this.isRedisConnected) {
        const stream = this.redisClient.scanStream({
          match: pattern,
          count: 100
        });

        stream.on('data', async (keys) => {
          if (keys.length) {
            const pipeline = this.redisClient.pipeline();
            keys.forEach(key => pipeline.del(key));
            await pipeline.exec();
          }
        });

        await new Promise((resolve, reject) => {
          stream.on('end', resolve);
          stream.on('error', reject);
        });
      }

      return true;
    } catch (error) {
      console.error(`Cache deletePattern error for pattern ${pattern}:`, error.message);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      // L1: Clear memory cache
      this.memoryCache.flushAll();

      // L2: Clear Redis cache
      if (this.isRedisConnected) {
        await this.redisClient.flushdb();
      }

      return true;
    } catch (error) {
      console.error('Cache clear error:', error.message);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memoryTotal = this.stats.memoryHits + this.stats.memoryMisses;
    const redisTotal = this.stats.redisHits + this.stats.redisMisses;
    
    return {
      memory: {
        hits: this.stats.memoryHits,
        misses: this.stats.memoryMisses,
        hitRate: memoryTotal > 0 ? (this.stats.memoryHits / memoryTotal * 100).toFixed(2) + '%' : '0%',
        keys: this.memoryCache.keys().length
      },
      redis: {
        hits: this.stats.redisHits,
        misses: this.stats.redisMisses,
        hitRate: redisTotal > 0 ? (this.stats.redisHits / redisTotal * 100).toFixed(2) + '%' : '0%',
        connected: this.isRedisConnected
      },
      operations: {
        sets: this.stats.sets,
        deletes: this.stats.deletes
      }
    };
  }

  /**
   * Check if key matches pattern
   * @private
   */
  matchPattern(key, pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(key);
  }

  /**
   * Close connections
   */
  async close() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    this.memoryCache.flushAll();
  }
}

// Singleton instance
let cacheServiceInstance = null;

module.exports = {
  getCacheService: () => {
    if (!cacheServiceInstance) {
      cacheServiceInstance = new CacheService();
    }
    return cacheServiceInstance;
  },
  CacheService
};
