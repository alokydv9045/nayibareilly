import jwt from 'jsonwebtoken'
import prisma from '../config/prisma.js'
import redisClient from '../config/redis.js'
import logger from '../utils/logger.js'
import { authLogger, securityMonitor } from '../utils/auditLogger.js'
import { AuthenticationError, AuthorizationError } from '../utils/errorHandler.js'

// In-memory token blacklist as fallback when Redis is disabled
const inMemoryBlacklist = new Map();

// Cleanup expired tokens from in-memory blacklist
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [token, expiry] of inMemoryBlacklist.entries()) {
    if (expiry < now) {
      inMemoryBlacklist.delete(token);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    logger.debug(`Cleaned ${cleaned} expired tokens from blacklist`);
  }
}, 60000); // Run every minute

// Redis-based token blacklist for cluster-safe revocation
// Add token to blacklist with automatic expiration
export const blacklistToken = async (token) => {
  try {
    // Extract expiry from token to set appropriate TTL
    const decoded = jwt.decode(token)
    const expiresIn = decoded?.exp 
      ? Math.max(0, decoded.exp - Math.floor(Date.now() / 1000))
      : 3600 // Default 1 hour if can't decode
    
    // Use Redis if available, otherwise use in-memory store
    if (redisClient) {
      await redisClient.setex(`blacklist:${token}`, expiresIn, '1')
    } else {
      // In-memory fallback
      const expiryTime = Date.now() + (expiresIn * 1000);
      inMemoryBlacklist.set(token, expiryTime);
    }
    
    logger.info('Token blacklisted', { 
      tokenPrefix: token.substring(0, 10),
      expiresIn,
      storage: redisClient ? 'redis' : 'memory'
    })
  } catch (error) {
    logger.error('Failed to blacklist token', { error: error.message })
    // Fallback to in-memory if Redis fails
    const decoded = jwt.decode(token)
    const expiresIn = decoded?.exp 
      ? Math.max(0, decoded.exp - Math.floor(Date.now() / 1000))
      : 3600
    const expiryTime = Date.now() + (expiresIn * 1000);
    inMemoryBlacklist.set(token, expiryTime);
    logger.warn('Using in-memory blacklist as fallback');
  }
}

// Check if token is blacklisted (async for Redis)
export const isTokenBlacklisted = async (token) => {
  try {
    // Check Redis if available
    if (redisClient) {
      const result = await redisClient.get(`blacklist:${token}`)
      return result === '1'
    }
    
    // Check in-memory store
    const expiry = inMemoryBlacklist.get(token);
    if (!expiry) return false;
    
    // Check if expired
    if (expiry < Date.now()) {
      inMemoryBlacklist.delete(token);
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to check token blacklist', { error: error.message })
    // Check in-memory as fallback
    const expiry = inMemoryBlacklist.get(token);
    if (expiry && expiry >= Date.now()) return true;
    return false; // Default to allowing if both fail
  }
}

// Enhanced authentication middleware with security improvements
export const auth = (roles = []) => {
  if (typeof roles === 'string') roles = [roles]
  
  return async (req, res, next) => {
    // Extract token from multiple sources
    let token = null
    
    try {
      // 1. Authorization header (Bearer token)
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7)
      }
      
      // 2. Cookie (fallback for web requests)
      if (!token && req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken
      }
      
      // 3. Query parameter (for limited use cases like file downloads)
      if (!token && req.query.token) {
        token = req.query.token
        // Log query token usage for security monitoring
        if (securityMonitor?.trackQueryTokenUsage) {
          await securityMonitor.trackQueryTokenUsage(req)
        }
      }

      if (!token) {
        await authLogger.tokenValidation(req, { 
          status: 'no_token', 
          requiredRoles: roles,
          endpoint: req.path,
          method: req.method
        })
        throw new AuthenticationError('Authentication token required')
      }

      // Check if token is blacklisted (now async)
      const isBlacklisted = await isTokenBlacklisted(token)
      if (isBlacklisted) {
        await authLogger.tokenValidation(req, { 
          status: 'blacklisted_token',
          endpoint: req.path
        })
        if (securityMonitor?.trackBlacklistedTokenUsage) {
          await securityMonitor.trackBlacklistedTokenUsage(req, token)
        }
        throw new AuthenticationError('Token has been revoked')
      }

      // Verify and decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      // Validate token structure
      if (!decoded.id || !decoded.email) {
        await authLogger.tokenValidation(req, { 
          status: 'malformed_token',
          tokenStructure: Object.keys(decoded)
        })
        throw new AuthenticationError('Invalid token structure')
      }

      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          roles: true,
          isActive: true,
          isVerified: true,
          lockUntil: true,
          lastLogin: true,
          departmentId: true,
          department: {
            select: { id: true, name: true, isActive: true }
          }
        }
      })

      if (!user) {
        await authLogger.tokenValidation(req, { 
          status: 'user_not_found',
          userId: decoded.id
        })
        if (securityMonitor?.trackDeletedUserAccess) {
          await securityMonitor.trackDeletedUserAccess(req, decoded.id)
        }
        throw new AuthenticationError('User account not found')
      }

      // Check if user account is active
      if (!user.isActive) {
        await authLogger.tokenValidation(req, { 
          status: 'user_inactive',
          userId: user.id
        })
        if (securityMonitor?.trackInactiveUserAccess) {
          await securityMonitor.trackInactiveUserAccess(req, user.id)
        }
        throw new AuthenticationError('User account is deactivated')
      }

      // Check if user account is locked
      if (user.lockUntil && user.lockUntil > new Date()) {
        await authLogger.tokenValidation(req, { 
          status: 'user_locked',
          userId: user.id,
          lockUntil: user.lockUntil
        })
        throw new AuthenticationError('User account is temporarily locked')
      }

      // Get user roles for authorization checks (normalize to lowercase for comparison)
      const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles].filter(Boolean)
      const normalizedUserRoles = userRoles.map(r => String(r).toLowerCase())

      // Role-based authorization (case-insensitive)
      if (roles.length > 0) {
        const normalizedRequiredRoles = roles.map(r => String(r).toLowerCase())
        const hasRequiredRole = normalizedRequiredRoles.some(role => normalizedUserRoles.includes(role))
        
        if (!hasRequiredRole) {
          await authLogger.tokenValidation(req, { 
            status: 'insufficient_permissions', 
            userId: user.id,
            userRoles,
            requiredRoles: roles,
            endpoint: req.path,
            method: req.method
          })
          if (securityMonitor?.trackUnauthorizedAccess) {
            await securityMonitor.trackUnauthorizedAccess(req, user.id, { 
              requiredRoles: roles, 
              userRoles,
              endpoint: req.path
            })
          }
          throw new AuthorizationError(`Access denied. Required roles: ${roles.join(', ')}`)
        }
      }

      // Department-based authorization for department-specific endpoints
      if (req.path.includes('/department/') && !userRoles.includes('super_admin')) {
        const departmentIdFromPath = req.params.departmentId || req.query.departmentId
        if (departmentIdFromPath && user.departmentId !== departmentIdFromPath) {
          await authLogger.tokenValidation(req, { 
            status: 'department_access_denied',
            userId: user.id,
            userDepartment: user.departmentId,
            requestedDepartment: departmentIdFromPath
          })
          throw new AuthorizationError('Access denied to this department')
        }
      }

      // Attach enhanced user info to request
      req.user = {
        ...decoded,
        ...user,
        token,
        isAdmin: userRoles.includes('super_admin') || userRoles.includes('dept_admin'),
        isModerator: userRoles.includes('moderator') || userRoles.includes('super_admin'),
        isStaff: userRoles.includes('staff') || userRoles.includes('moderator') || userRoles.includes('super_admin')
      }

      // Log successful authentication
      await authLogger.tokenValidation(req, { 
        status: 'success', 
        userId: user.id,
        roles: user.roles,
        endpoint: req.path,
        method: req.method,
        department: user.department?.name
      })

      // Log successful authentication - user activity tracking
      console.log(`[Activity] User ${user.id} accessed ${req.method} ${req.path}`)
      
      next()

    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            type: error.type,
            message: error.message,
            statusCode: error.statusCode
          }
        })
      }

      // Handle JWT errors
      let message = 'Authentication failed'
      if (error.name === 'TokenExpiredError') {
        message = 'Token has expired'
        await authLogger.tokenValidation(req, { 
          status: 'expired_token',
          error: error.message
        })
      } else if (error.name === 'JsonWebTokenError') {
        message = 'Invalid token format'
        await authLogger.tokenValidation(req, { 
          status: 'invalid_token_format',
          error: error.message
        })
      } else {
        await authLogger.tokenValidation(req, { 
          status: 'auth_error',
          error: error.message,
          tokenPresent: !!token
        })
      }

      if (securityMonitor?.trackInvalidToken) {
        await securityMonitor.trackInvalidToken(req, error.message)
      }
      
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message,
          statusCode: 401
        }
      })
    }
  }
}

// Optional authentication middleware (for public endpoints that can benefit from user context)
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  try {
    const token = authHeader.slice(7)
    
    if (isTokenBlacklisted(token)) {
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        isActive: true,
        departmentId: true
      }
    })

    if (user && user.isActive) {
      req.user = { ...decoded, ...user, token }
    }
  } catch (error) {
    // Silently fail for optional auth
    console.warn('Optional auth failed:', error.message)
  }

  next()
}

// Admin role requirement middleware
export const requireAdmin = auth(['super_admin', 'dept_admin'])

// Moderator role requirement middleware  
export const requireModerator = auth(['super_admin', 'dept_admin', 'moderator'])

// Staff role requirement middleware
export const requireStaff = auth(['super_admin', 'dept_admin', 'moderator', 'staff'])

// Self or admin access middleware (for user profile endpoints)
export const requireSelfOrAdmin = async (req, res, next) => {
  const auth = auth()
  
  await auth(req, res, () => {
    const targetUserId = req.params.userId || req.params.id
    const isAdmin = req.user.roles.includes('super_admin') || req.user.roles.includes('dept_admin')
    const isSelf = req.user.id === targetUserId
    
    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          type: 'AUTHORIZATION_ERROR',
          message: 'Access denied. You can only access your own data.',
          statusCode: 403
        }
      })
    }
    
    next()
  })
}
