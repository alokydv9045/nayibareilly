import Redis from 'ioredis';

// Optimized Redis configuration
let redisClient = null;

// Force disable Redis for development testing
console.log('[Redis] Redis disabled for development testing');
redisClient = null;

/**
 * Get Redis client instance
 * @returns {Redis|null} Redis client or null if disabled
 */
export function getRedisClient() {
  return redisClient;
}

export default redisClient;
