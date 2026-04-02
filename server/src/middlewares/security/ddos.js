/**
 * DDoS Protection Middleware
 * Advanced protection against distributed denial of service attacks
 * @module middlewares/security/ddos
 */

import { getRedisClient } from '../../config/redis.js';

/**
 * DDoS protection configuration
 */
const DDOS_CONFIG = {
  // Maximum burst requests
  burstLimit: 10,
  // Time window in seconds
  windowSize: 1,
  // Ban duration in seconds
  banDuration: 3600, // 1 hour
  // Threshold for suspicious activity
  suspiciousThreshold: 50
};

/**
 * Track request patterns for DDoS detection
 */
const requestTracker = new Map();

/**
 * Get client identifier (IP + User-Agent fingerprint)
 */
function getClientFingerprint(req) {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent') || 'unknown';
  return `${ip}:${userAgent.substring(0, 50)}`;
}

/**
 * Check if IP is banned
 */
async function isIPBanned(ip) {
  try {
    const redis = getRedisClient();
    if (!redis || redis.status !== 'ready') {
      // Fallback to in-memory tracking
      const fingerprint = `ban:${ip}`;
      const tracker = requestTracker.get(fingerprint);
      return tracker && tracker.bannedUntil > Date.now();
    }

    const banKey = `ddos:ban:${ip}`;
    const banned = await redis.get(banKey);
    return banned !== null;
  } catch (error) {
    console.error('[DDoS] Error checking ban status:', error);
    return false;
  }
}

/**
 * Ban an IP address
 */
async function banIP(ip, duration = DDOS_CONFIG.banDuration) {
  try {
    const redis = getRedisClient();
    if (!redis || redis.status !== 'ready') {
      // Fallback to in-memory tracking
      const fingerprint = `ban:${ip}`;
      requestTracker.set(fingerprint, {
        bannedUntil: Date.now() + (duration * 1000),
        reason: 'DDoS protection'
      });
      console.warn(`[DDoS] IP ${ip} banned for ${duration}s (in-memory)`);
      return;
    }

    const banKey = `ddos:ban:${ip}`;
    await redis.setex(banKey, duration, JSON.stringify({
      ip,
      bannedAt: new Date().toISOString(),
      reason: 'DDoS protection - excessive requests'
    }));
    
    console.warn(`[DDoS] IP ${ip} banned for ${duration}s`);
  } catch (error) {
    console.error('[DDoS] Error banning IP:', error);
  }
}

/**
 * Track request rate
 */
async function trackRequestRate(fingerprint) {
  try {
    const redis = getRedisClient();
    if (!redis || redis.status !== 'ready') {
      // Fallback to in-memory tracking
      const tracker = requestTracker.get(fingerprint) || {
        count: 0,
        windowStart: Date.now()
      };

      const now = Date.now();
      const windowElapsed = (now - tracker.windowStart) / 1000;

      if (windowElapsed > DDOS_CONFIG.windowSize) {
        // Reset window
        tracker.count = 1;
        tracker.windowStart = now;
      } else {
        tracker.count++;
      }

      requestTracker.set(fingerprint, tracker);
      return tracker.count;
    }

    const key = `ddos:rate:${fingerprint}`;
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, DDOS_CONFIG.windowSize);
    }

    return count;
  } catch (error) {
    console.error('[DDoS] Error tracking rate:', error);
    return 0;
  }
}

/**
 * DDoS protection middleware
 */
export function ddosProtection(options = {}) {
  const config = { ...DDOS_CONFIG, ...options };

  return async (req, res, next) => {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      
      // Check if IP is banned
      if (await isIPBanned(ip)) {
        console.warn(`[DDoS] Blocked request from banned IP: ${ip}`);
        return res.status(403).json({
          error: 'Access Denied',
          message: 'Your IP address has been temporarily banned due to suspicious activity',
          retryAfter: config.banDuration
        });
      }

      // Track request rate
      const fingerprint = getClientFingerprint(req);
      const requestCount = await trackRequestRate(fingerprint);

      // Check burst limit
      if (requestCount > config.burstLimit) {
        console.warn(`[DDoS] Burst limit exceeded for ${ip}: ${requestCount} requests`);
        
        // Ban if extremely suspicious
        if (requestCount > config.suspiciousThreshold) {
          await banIP(ip, config.banDuration);
          return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Excessive requests detected. Your IP has been temporarily banned.',
            retryAfter: config.banDuration
          });
        }

        // Rate limit response
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Please slow down your requests',
          retryAfter: config.windowSize
        });
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', config.burstLimit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.burstLimit - requestCount));
      res.setHeader('X-RateLimit-Window', config.windowSize);

      next();
    } catch (error) {
      console.error('[DDoS] Middleware error:', error);
      next();
    }
  };
}

/**
 * Clear all bans (admin utility)
 */
export async function clearAllBans() {
  try {
    const redis = getRedisClient();
    if (!redis || redis.status !== 'ready') {
      requestTracker.clear();
      console.log('[DDoS] Cleared all in-memory bans');
      return;
    }

    const keys = await redis.keys('ddos:ban:*');
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[DDoS] Cleared ${keys.length} bans`);
    }
  } catch (error) {
    console.error('[DDoS] Error clearing bans:', error);
  }
}

export default ddosProtection;
