/**
 * Redis Caching Middleware
 * Implements multi-layer caching strategy with Redis
 * @module middlewares/cache/redis
 */

import { getRedisClient } from '../../config/redis.js';

/**
 * Cache configurations for different data types
 */
const CACHE_CONFIG = {
  // Short TTL for frequently changing data
  short: 60,        // 1 minute
  medium: 300,      // 5 minutes
  long: 900,        // 15 minutes
  extended: 3600,   // 1 hour
  permanent: 86400  // 24 hours
};

/**
 * Generate cache key with prefix
 */
function getCacheKey(prefix, identifier) {
  return `cache:${prefix}:${identifier}`;
}

/**
 * Redis cache middleware
 * @param {Object} options - Cache options
 * @param {string} options.prefix - Cache key prefix
 * @param {number} options.ttl - Time to live in seconds
 * @param {Function} options.keyGenerator - Function to generate cache key
 */
export function cacheMiddleware(options = {}) {
  const { 
    prefix = 'default', 
    ttl = CACHE_CONFIG.medium,
    keyGenerator = (req) => req.originalUrl 
  } = options;

  return async (req, res, next) => {
    try {
      const redis = getRedisClient();
      if (!redis || !redis.status || redis.status !== 'ready') {
        console.warn('[Cache] Redis not available, skipping cache');
        return next();
      }

      // Generate cache key
      const identifier = keyGenerator(req);
      const cacheKey = getCacheKey(prefix, identifier);

      // Try to get cached data
      const cachedData = await redis.get(cacheKey);
      
      if (cachedData) {
        // Parse and return cached response
        const data = JSON.parse(cachedData);
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(data);
      }

      // Cache miss - intercept res.json to cache the response
      res.set('X-Cache', 'MISS');
      const originalJson = res.json.bind(res);
      
      res.json = function(data) {
        // Cache the response
        redis.setex(cacheKey, ttl, JSON.stringify(data))
          .catch(err => console.error('[Cache] Error caching response:', err));
        
        // Return original response
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('[Cache] Middleware error:', error);
      next();
    }
  };
}

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Redis key pattern
 */
export async function invalidateCache(pattern) {
  try {
    const redis = getRedisClient();
    if (!redis || redis.status !== 'ready') {
      console.warn('[Cache] Redis not available, skipping invalidation');
      return;
    }

    const keys = await redis.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[Cache] Invalidated ${keys.length} keys matching: ${pattern}`);
    }
  } catch (error) {
    console.error('[Cache] Error invalidating cache:', error);
  }
}

/**
 * Clear all cache
 */
export async function clearAllCache() {
  try {
    const redis = getRedisClient();
    if (!redis || redis.status !== 'ready') return;

    const keys = await redis.keys('cache:*');
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[Cache] Cleared ${keys.length} cache keys`);
    }
  } catch (error) {
    console.error('[Cache] Error clearing cache:', error);
  }
}

export { CACHE_CONFIG };
