import rateLimit from 'express-rate-limit'
import { handleRateLimitError } from '../utils/errorHandler.js'
import RedisStore from 'rate-limit-redis'
import redisClient from '../config/redis.js'

/**
 * Enhanced rate limiting middleware with sophisticated protections
 * Prevents brute force attacks, abuse, and provides tiered limiting
 */

// Helper to conditionally create Redis store only when Redis is available
const createRedisStore = () => {
  if (!redisClient) return {}
  return {
    store: new RedisStore({
      sendCommand: (...args) => /** @type {any} */ (redisClient).call(...args)
    })
  }
}

// In-memory store for tracking failed attempts (use Redis in production)
const failedAttempts = new Map()
const suspiciousIPs = new Set()

// Clean up old entries every 10 minutes to prevent memory buildup
setInterval(() => {
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  
  let cleanedCount = 0
  for (const [key, data] of failedAttempts.entries()) {
    if (data.lastAttempt < oneHourAgo) {
      failedAttempts.delete(key)
      cleanedCount++
    }
  }
  
  // Implement max size protection to prevent unbounded growth
  if (failedAttempts.size > 10000) {
    console.warn(`[Rate Limit] Failed attempts map size limit reached: ${failedAttempts.size}, cleaning up oldest entries`)
    
    // Keep only the most recent 5000 entries
    const sortedEntries = Array.from(failedAttempts.entries())
      .sort((a, b) => b[1].lastAttempt - a[1].lastAttempt)
      .slice(0, 5000)
    
    failedAttempts.clear()
    sortedEntries.forEach(([k, v]) => failedAttempts.set(k, v))
    
    console.info(`[Rate Limit] Cleaned up to ${failedAttempts.size} entries`)
  }
  
  if (cleanedCount > 0) {
    console.debug(`[Rate Limit] Cleaned up ${cleanedCount} old entries, remaining: ${failedAttempts.size}`)
  }
}, 10 * 60 * 1000) // Run every 10 minutes

// Redis-based suspicious IP tracking (cluster-safe) with fallback to memory
const markIPSuspicious = async (ip) => {
  try {
    if (redisClient && redisClient.setex) {
      await redisClient.setex(`suspicious:${ip}`, 24 * 60 * 60, '1') // 24 hour TTL
      console.warn(`[Security] IP marked as suspicious: ${ip}`)
    } else {
      // Fallback to in-memory when Redis is not available
      suspiciousIPs.add(ip)
      console.warn(`[Security] IP marked as suspicious (in-memory): ${ip}`)
    }
  } catch (error) {
    console.error(`[Security] Failed to mark IP as suspicious:`, error.message)
    // Fallback to in-memory
    suspiciousIPs.add(ip)
  }
}

const isIPSuspicious = async (ip) => {
  try {
    if (redisClient && redisClient.get) {
      const result = await redisClient.get(`suspicious:${ip}`)
      return result === '1'
    } else {
      // Fallback to in-memory when Redis is not available
      return suspiciousIPs.has(ip)
    }
  } catch (error) {
    console.error(`[Security] Failed to check IP suspicious status:`, error.message)
    // Fallback to in-memory check
    return suspiciousIPs.has(ip)
  }
}

// Track failed authentication attempts (now async for Redis integration)
export const trackFailedAttempt = async (req, type = 'auth') => {
  const key = `${req.ip}-${type}`
  const now = Date.now()
  const attempts = failedAttempts.get(key) || { count: 0, lastAttempt: now }
  
  attempts.count += 1
  attempts.lastAttempt = now
  
  failedAttempts.set(key, attempts)
  
  // Mark IP as suspicious after many failed attempts (Redis-based)
  if (attempts.count >= 10) {
    await markIPSuspicious(req.ip)
    // Keep local Set for backwards compatibility during transition
    suspiciousIPs.add(req.ip)
  }
}

// Custom key generator with enhanced fingerprinting
const createKeyGenerator = (includeUserAgent = true) => {
  return (req) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown'
    const userAgent = includeUserAgent ? (req.get('User-Agent') || 'unknown') : ''
    const email = req.body?.email || ''
    
    // For login attempts, include email to prevent distributed attacks
    if (req.path.includes('login') && email) {
      return `${ip}-${email}-${userAgent}`
    }
    
    return `${ip}-${userAgent}`
  }
}

// Custom handler for rate limit exceeded
const rateLimitHandler = (req, res) => {
  trackFailedAttempt(req, 'rate-limit')
  handleRateLimitError(req, res)
}

/**
 * General API rate limiter
 * Applies to all API endpoints as a baseline protection
 */
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Development mode - much higher limits
    if (process.env.NODE_ENV === 'development') {
      return 1000 // Very high limit for development
    }
    
    // Different limits based on authentication status
    if (req.user) {
      // Authenticated users get higher limits
      if (req.user.roles?.includes('tech_admin')) return 1000
      if (req.user.roles?.includes('staff')) return 500
      return 200
    }
    // Anonymous users get lower limits
    return 100
  },
  message: {
    success: false,
    message: 'Rate limit exceeded. Please slow down your requests.',
    error: 'GLOBAL_RATE_LIMIT_EXCEEDED',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator(true),
  handler: rateLimitHandler,
  // Conditionally use Redis store only when Redis is available
  ...(redisClient ? createRedisStore() : {}),
  skip: (req) => {
    // Skip rate limiting for health checks and static assets
    const skipPaths = ['/health', '/api/health', '/favicon.ico', '/robots.txt']
    return skipPaths.includes(req.path) || req.path.startsWith('/public/')
  }
})

/**
 * Authentication endpoints rate limiter
 * Moderate protection for general auth operations
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: async (req) => {
    // Development mode - higher limits
    if (process.env.NODE_ENV === 'development') {
      return 100
    }
    
    // Check Redis for suspicious IPs (cluster-safe)
    const isSuspicious = await isIPSuspicious(req.ip)
    if (isSuspicious) return 3
    
    // Check failed attempts history
    const key = `${req.ip}-auth`
    const attempts = failedAttempts.get(key)
    if (attempts && attempts.count >= 5) return 5
    
    return 50 // Increased normal limit
  },
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    error: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator(true),
  handler: rateLimitHandler,
  ...(redisClient ? createRedisStore() : {}),
  skip: (req) => {
    // Skip for refresh token requests (they have their own protection)
    return req.path === '/api/auth/refresh'
  }
})

/**
 * Strict rate limiter for login attempts
 * Very restrictive to prevent credential stuffing and brute force
 */
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // In development, be more lenient
    if (process.env.NODE_ENV === 'development') {
      return 100 // Much higher limit for development
    }
    
    const email = req.body?.email
    const ip = req.ip
    
    // Block suspicious IPs completely
    if (suspiciousIPs.has(ip)) return 0
    
    // Per-email rate limiting
    if (email) {
      const emailKey = `${email}-login`
      const emailAttempts = failedAttempts.get(emailKey)
      if (emailAttempts && emailAttempts.count >= 3) return 1
    }
    
    // Per-IP rate limiting
    const ipKey = `${ip}-login`
    const ipAttempts = failedAttempts.get(ipKey)
    if (ipAttempts && ipAttempts.count >= 5) return 2
    
    return 20 // Increased normal limit
  },
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
    error: 'LOGIN_RATE_LIMIT_EXCEEDED',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator(true),
  handler: rateLimitHandler,
  ...(redisClient ? createRedisStore() : {})
})

/**
 * Registration rate limiter
 * Prevents automated account creation
 */
export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    // Development mode
    if (process.env.NODE_ENV === 'development') {
      return 20
    }
    // Very strict for suspicious IPs
    if (suspiciousIPs.has(req.ip)) return 1
    return 5 // Increased from 3
  },
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again in 1 hour.',
    error: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...(redisClient ? createRedisStore() : {}),
  keyGenerator: createKeyGenerator(true),
  handler: rateLimitHandler
})

/**
 * Password reset rate limiter
 * Prevents abuse of password reset functionality
 */
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Maximum 3 password reset attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again in 1 hour.',
    error: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator(false), // Don't include user agent for email-based resets
  handler: rateLimitHandler
})

/**
 * Token refresh rate limiter
 * Prevents abuse of token refresh functionality
 */
export const refreshRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 500 : 30, // Higher limit in development; middleware calls refresh on every navigation
  message: {
    success: false,
    message: 'Too many token refresh attempts. Please try again in 15 minutes.',
    error: 'REFRESH_RATE_LIMIT_EXCEEDED',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator(true),
  handler: rateLimitHandler,
  // Skip rate limiting for server-side middleware calls (no Origin header, called per-navigation)
  skip: (req) => !req.headers['origin']
})

/**
 * Issue creation rate limiter
 * Prevents spam issue creation
 */
export const issueCreationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    // Authenticated users get higher limits
    if (req.user) {
      if (req.user.roles?.includes('staff')) return 50
      if (req.user.roles?.includes('citizen')) return 10
    }
    // Anonymous users get very limited issue creation
    return 2
  },
  message: {
    success: false,
    message: 'Too many issues created. Please try again later.',
    error: 'ISSUE_CREATION_RATE_LIMIT_EXCEEDED',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user ? `user-${req.user.id}` : req.ip
  },
  handler: rateLimitHandler
})

/**
 * File upload rate limiter
 * Prevents abuse of file upload endpoints
 */
export const fileUploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    if (req.user) {
      if (req.user.roles?.includes('staff')) return 100
      return 20
    }
    return 5
  },
  message: {
    success: false,
    message: 'Too many file uploads. Please try again later.',
    error: 'FILE_UPLOAD_RATE_LIMIT_EXCEEDED',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user ? `user-${req.user.id}` : req.ip,
  handler: rateLimitHandler
})

/**
 * Admin operations rate limiter
 * Protects sensitive admin endpoints
 */
export const adminRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 300, // Increased limit for admin dashboard (accommodates polling and rapid navigation)
  message: {
    success: false,
    message: 'Too many admin operations. Please slow down.',
    error: 'ADMIN_RATE_LIMIT_EXCEEDED',
    retryAfter: 300
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `admin-${req.user?.id || req.ip}`,
  handler: rateLimitHandler
})

// Rate limit logger for monitoring
export const rateLimitLogger = {
  logViolation: async (req, limit, current) => {
    console.warn('Rate limit violation:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      limit,
      current,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    })
  }
}

// Get rate limit status for monitoring dashboard
export const getRateLimitStats = () => {
  return {
    failedAttempts: failedAttempts.size,
    suspiciousIPs: suspiciousIPs.size,
    topFailedIPs: Array.from(failedAttempts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([key, data]) => ({
        key,
        count: data.count,
        lastAttempt: new Date(data.lastAttempt).toISOString()
      }))
  }
}

export default {
  globalRateLimit,
  authRateLimit,
  loginRateLimit,
  registerRateLimit,
  passwordResetRateLimit,
  refreshRateLimit,
  issueCreationRateLimit,
  fileUploadRateLimit,
  adminRateLimit,
  trackFailedAttempt,
  rateLimitLogger,
  getRateLimitStats
}