/**
 * Comprehensive audit logging system for authentication events
 * Tracks security-relevant events for monitoring and compliance
 */

/**
 * Log levels for different types of events
 */
export const LogLevel = {
  INFO: 'info',
  WARN: 'warn', 
  ERROR: 'error',
  SECURITY: 'security',
  AUDIT: 'audit'
}

/**
 * Event types for authentication audit trail
 */
export const AuthEventType = {
  // Authentication Events
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGIN_BLOCKED: 'login_blocked',
  
  // Registration Events
  REGISTER_SUCCESS: 'register_success',
  REGISTER_FAILURE: 'register_failure',
  
  // Token Events
  TOKEN_REFRESH_SUCCESS: 'token_refresh_success',
  TOKEN_REFRESH_FAILURE: 'token_refresh_failure',
  TOKEN_EXPIRED: 'token_expired',
  TOKEN_INVALID: 'token_invalid',
  TOKEN_REUSE_DETECTED: 'token_reuse_detected',
  TOKEN_VALIDATION_SUCCESS: 'token_validation_success',
  TOKEN_VALIDATION_FAILED: 'token_validation_failed',
  
  // Session Events
  LOGOUT_SUCCESS: 'logout_success',
  SESSION_EXPIRED: 'session_expired',
  CONCURRENT_SESSION: 'concurrent_session',
  SESSION_VIEW: 'session_view',
  SESSION_REVOKE: 'session_revoke',
  SESSION_REVOKE_ALL: 'session_revoke_all',
  
  // Password Events
  PASSWORD_CHANGE_SUCCESS: 'password_change_success',
  PASSWORD_CHANGE_FAILURE: 'password_change_failure',
  PASSWORD_RESET_REQUEST: 'password_reset_request',
  PASSWORD_RESET_SUCCESS: 'password_reset_success',
  PASSWORD_RESET_FAILURE: 'password_reset_failure',
  
  // Security Events
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  CSRF_VIOLATION: 'csrf_violation',
  
  // Administrative Events
  ROLE_CHANGE: 'role_change',
  ACCOUNT_LOCKED: 'account_locked',
  ACCOUNT_UNLOCKED: 'account_unlocked'
}

/**
 * Extract request metadata for logging
 */
const extractRequestMetadata = (req) => {
  // Handle cases where req might not be a proper Express request object
  if (!req || typeof req !== 'object') {
    return {
      ip: 'unknown',
      userAgent: 'unknown',
      referer: null,
      forwardedFor: null,
      method: 'unknown',
      path: 'unknown',
      timestamp: new Date().toISOString()
    }
  }

  // Safe getter function for request headers
  const safeGet = (header) => {
    try {
      if (typeof req.get === 'function') {
        return req.get(header)
      } else if (req.headers && typeof req.headers === 'object') {
        return req.headers[header.toLowerCase()]
      }
      return null
    } catch (error) {
      return null
    }
  }

  const forwardedFor = safeGet('X-Forwarded-For')
  const realIP = forwardedFor ? forwardedFor.split(',')[0].trim() : (req.ip || 'unknown')
  
  return {
    ip: realIP,
    userAgent: safeGet('User-Agent') || 'unknown',
    referer: safeGet('Referer') || null,
    forwardedFor: forwardedFor || null,
    method: req.method || 'unknown',
    path: req.path || req.url || 'unknown',
    timestamp: new Date().toISOString()
  }
}

/**
 * Main audit logging function
 */
export const auditLog = (eventType, level, message, data = {}, req = null) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level,
    eventType: eventType,
    message: message,
    data: data,
    ...(req ? { request: extractRequestMetadata(req) } : {})
  }

  // Console logging with colors for development
  if (process.env.NODE_ENV === 'development') {
    const colors = {
      [LogLevel.INFO]: '\x1b[36m',      // Cyan
      [LogLevel.WARN]: '\x1b[33m',      // Yellow  
      [LogLevel.ERROR]: '\x1b[31m',     // Red
      [LogLevel.SECURITY]: '\x1b[35m',  // Magenta
      [LogLevel.AUDIT]: '\x1b[32m'      // Green
    }
    const reset = '\x1b[0m'
    const color = colors[level] || ''
    
    console.log(`${color}[${level.toUpperCase()}]${reset} [${eventType}] ${message}`, 
      Object.keys(data).length > 0 ? data : '')
  } else {
    // Production logging (JSON format)
    console.log(JSON.stringify(logEntry))
  }

  // In production, rely on standard output forwarding (e.g., to ELK stack, CloudWatch)
  return logEntry
}

/**
 * Authentication-specific logging helpers
 */
export const authLogger = {
  // Utility to mask emails (a***@domain)
  _maskEmail(email) {
    if (!email || typeof email !== 'string') return email
    const [local, domain] = email.split('@')
    if (!domain) return email
    if (local.length <= 1) return `*@${domain}`
    return `${local[0]}***@${domain}`
  },
  // Flexible signature:
  // 1) loginSuccess(userObject, req)
  // 2) loginSuccess(req, userId, metadata)
  loginSuccess: (arg1, arg2, arg3) => {
    let req, dataForLog, emailForMsg
    if (arg1 && arg1.id && (arg1.email !== undefined)) {
      // Form 1: (userObject, req)
      const user = arg1
      req = arg2
      dataForLog = {
        userId: user.id,
        email: authLogger._maskEmail(user.email),
        roles: user.roles,
        lastLogin: user.lastLogin
      }
      emailForMsg = authLogger._maskEmail(user.email)
    } else {
      // Form 2: (req, userId, metadata)
      req = arg1
      const userId = arg2
      const meta = arg3 || {}
      dataForLog = {
        userId,
        email: authLogger._maskEmail(meta.email),
        roles: meta.roles,
        lastLogin: meta.lastLogin
      }
      emailForMsg = authLogger._maskEmail(meta.email) || 'unknown'
    }
    return auditLog(
      AuthEventType.LOGIN_SUCCESS,
      LogLevel.AUDIT,
      `User login successful: ${emailForMsg}`,
      dataForLog,
      req
    )
  },

  loginFailure: (email, reason, req, attemptCount = 1) => auditLog(
    AuthEventType.LOGIN_FAILURE,
    LogLevel.SECURITY,
    `Login failed for email: ${email}`,
    { 
      email,
      reason,
      attemptCount
    },
    req
  ),

  // Flexible signature:
  // 1) registerSuccess(userObject, req)
  // 2) registerSuccess(req, userId, metadata)
  registerSuccess: (arg1, arg2, arg3) => {
    let req, dataForLog, emailForMsg
    if (arg1 && arg1.id && (arg1.email !== undefined)) {
      const user = arg1
      req = arg2
      dataForLog = {
        userId: user.id,
        email: authLogger._maskEmail(user.email),
        requestedRole: user.requestedRole
      }
      emailForMsg = authLogger._maskEmail(user.email)
    } else {
      req = arg1
      const userId = arg2
      const meta = arg3 || {}
      dataForLog = {
        userId,
        email: authLogger._maskEmail(meta.email),
        requestedRole: meta.requestedRole
      }
      emailForMsg = authLogger._maskEmail(meta.email) || 'unknown'
    }
    return auditLog(
      AuthEventType.REGISTER_SUCCESS,
      LogLevel.AUDIT,
      `User registration successful: ${emailForMsg}`,
      dataForLog,
      req
    )
  },

  tokenRefreshSuccess: (userId, req) => auditLog(
    AuthEventType.TOKEN_REFRESH_SUCCESS,
    LogLevel.INFO,
    `Token refresh successful`,
    { userId },
    req
  ),

  tokenRefreshFailure: (reason, req) => auditLog(
    AuthEventType.TOKEN_REFRESH_FAILURE,
    LogLevel.SECURITY,
    `Token refresh failed: ${reason}`,
    { reason },
    req
  ),

  logoutSuccess: (userId, req) => auditLog(
    AuthEventType.LOGOUT_SUCCESS,
    LogLevel.AUDIT,
    `User logout successful`,
    { userId },
    req
  ),

  // Session Management Logging
  sessionView: (req, metadata = {}) => auditLog(
    AuthEventType.SESSION_VIEW,
    LogLevel.AUDIT,
    `User viewed active sessions`,
    metadata,
    req
  ),

  sessionRevoke: (req, metadata = {}) => auditLog(
    AuthEventType.SESSION_REVOKE,
    LogLevel.AUDIT,
    `Session revoked by user`,
    metadata,
    req
  ),

  sessionRevokeAll: (req, metadata = {}) => auditLog(
    AuthEventType.SESSION_REVOKE_ALL,
    LogLevel.AUDIT,
    `Multiple sessions revoked by user`,
    metadata,
    req
  ),

  passwordChangeSuccess: (userId, req) => auditLog(
    AuthEventType.PASSWORD_CHANGE_SUCCESS,
    LogLevel.AUDIT,
    `Password change successful`,
    { userId },
    req
  ),

  passwordResetRequest: (email, req) => auditLog(
    AuthEventType.PASSWORD_RESET_REQUEST,
    LogLevel.AUDIT,
    `Password reset requested for: ${email}`,
    { email },
    req
  ),

  rateLimitExceeded: (endpoint, req) => auditLog(
    AuthEventType.RATE_LIMIT_EXCEEDED,
    LogLevel.SECURITY,
    `Rate limit exceeded for endpoint: ${endpoint}`,
    { endpoint },
    req
  ),

  unauthorizedAccess: (resource, userId, req) => auditLog(
    AuthEventType.UNAUTHORIZED_ACCESS,
    LogLevel.SECURITY,
    `Unauthorized access attempt to: ${resource}`,
    { resource, userId },
    req
  ),

  suspiciousActivity: (description, data, req) => auditLog(
    AuthEventType.SUSPICIOUS_ACTIVITY,
    LogLevel.SECURITY,
    `Suspicious activity detected: ${description}`,
    data,
    req
  ),

  // Token validation logging
  tokenValidation: (req, metadata = {}) => auditLog(
    AuthEventType.TOKEN_VALIDATION_SUCCESS,
    metadata.status === 'success' ? LogLevel.AUDIT : LogLevel.SECURITY,
    `Token validation ${metadata.status || 'attempted'}`,
    metadata,
    req
  ),

  // Token refresh logging (unified method)
  tokenRefresh: (req, metadata = {}) => {
    if (metadata.status === 'success') {
      return auditLog(
        AuthEventType.TOKEN_REFRESH_SUCCESS,
        LogLevel.AUDIT,
        `Token refresh successful`,
        metadata,
        req
      )
    } else if (metadata.status === 'no_token') {
      return auditLog(
        AuthEventType.TOKEN_REFRESH_FAILURE,
        LogLevel.SECURITY,
        `Token refresh failed: no refresh token provided`,
        metadata,
        req
      )
    } else if (metadata.status === 'invalid_token') {
      return auditLog(
        AuthEventType.TOKEN_REFRESH_FAILURE,
        LogLevel.SECURITY,
        `Token refresh failed: invalid refresh token`,
        metadata,
        req
      )
    } else if (metadata.status === 'error') {
      return auditLog(
        AuthEventType.TOKEN_REFRESH_FAILURE,
        LogLevel.SECURITY,
        `Token refresh failed: ${metadata.error || 'unknown error'}`,
        metadata,
        req
      )
    } else {
      return auditLog(
        AuthEventType.TOKEN_REFRESH_FAILURE,
        LogLevel.SECURITY,
        `Token refresh failed: ${metadata.status || 'unknown reason'}`,
        metadata,
        req
      )
    }
  },

  // Password reset logging (unified method)
  passwordReset: (req, metadata = {}) => {
    if (metadata.status === 'success') {
      return auditLog(
        AuthEventType.PASSWORD_RESET_SUCCESS,
        LogLevel.AUDIT,
        `Password reset successful`,
        metadata,
        req
      )
    } else if (metadata.status === 'invalid_token') {
      return auditLog(
        AuthEventType.PASSWORD_RESET_FAILURE,
        LogLevel.SECURITY,
        `Password reset failed: invalid or expired token`,
        metadata,
        req
      )
    } else {
      return auditLog(
        AuthEventType.PASSWORD_RESET_FAILURE,
        LogLevel.SECURITY,
        `Password reset failed: ${metadata.error || metadata.status || 'unknown reason'}`,
        metadata,
        req
      )
    }
  },

  // Password change logging (unified method)
  passwordChange: (req, metadata = {}) => {
    if (metadata.status === 'success') {
      return auditLog(
        AuthEventType.PASSWORD_CHANGE_SUCCESS,
        LogLevel.AUDIT,
        `Password change successful`,
        metadata,
        req
      )
    } else if (metadata.status === 'validation_failed') {
      return auditLog(
        AuthEventType.PASSWORD_CHANGE_FAILURE,
        LogLevel.SECURITY,
        `Password change failed: validation error`,
        metadata,
        req
      )
    } else if (metadata.status === 'invalid_current_password') {
      return auditLog(
        AuthEventType.PASSWORD_CHANGE_FAILURE,
        LogLevel.SECURITY,
        `Password change failed: invalid current password`,
        metadata,
        req
      )
    } else {
      return auditLog(
        AuthEventType.PASSWORD_CHANGE_FAILURE,
        LogLevel.SECURITY,
        `Password change failed: ${metadata.error || metadata.status || 'unknown reason'}`,
        metadata,
        req
      )
    }
  },

  // Login attempt logging (unified method)
  loginAttempt: (req, metadata = {}) => {
    if (metadata.status === 'validation_failed') {
      return auditLog(
        AuthEventType.LOGIN_FAILURE,
        LogLevel.SECURITY,
        `Login attempt failed: validation error`,
        metadata,
        req
      )
    } else if (metadata.status === 'user_not_found') {
      return auditLog(
        AuthEventType.LOGIN_FAILURE,
        LogLevel.SECURITY,
        `Login attempt failed: user not found`,
        metadata,
        req
      )
    } else if (metadata.status === 'invalid_password') {
      return auditLog(
        AuthEventType.LOGIN_FAILURE,
        LogLevel.SECURITY,
        `Login attempt failed: invalid password`,
        metadata,
        req
      )
    } else if (metadata.status === 'error') {
      return auditLog(
        AuthEventType.LOGIN_FAILURE,
        LogLevel.SECURITY,
        `Login attempt failed: ${metadata.error || 'unknown error'}`,
        metadata,
        req
      )
    } else {
      return auditLog(
        AuthEventType.LOGIN_FAILURE,
        LogLevel.SECURITY,
        `Login attempt failed: ${metadata.status || 'unknown reason'}`,
        metadata,
        req
      )
    }
  },

  // Register attempt logging (unified method)
  registerAttempt: (req, metadata = {}) => {
    if (metadata.status === 'validation_failed') {
      return auditLog(
        AuthEventType.REGISTER_FAILURE,
        LogLevel.SECURITY,
        `Registration attempt failed: validation error`,
        metadata,
        req
      )
    } else if (metadata.status === 'email_exists') {
      return auditLog(
        AuthEventType.REGISTER_FAILURE,
        LogLevel.SECURITY,
        `Registration attempt failed: email already exists`,
        metadata,
        req
      )
    } else if (metadata.status === 'error') {
      return auditLog(
        AuthEventType.REGISTER_FAILURE,
        LogLevel.SECURITY,
        `Registration attempt failed: ${metadata.error || 'unknown error'}`,
        metadata,
        req
      )
    } else {
      return auditLog(
        AuthEventType.REGISTER_FAILURE,
        LogLevel.SECURITY,
        `Registration attempt failed: ${metadata.status || 'unknown reason'}`,
        metadata,
        req
      )
    }
  }
  ,
  // Token reuse detection logging
  tokenReuseDetected: (req, metadata = {}) => auditLog(
    AuthEventType.TOKEN_REUSE_DETECTED,
    LogLevel.SECURITY,
    `Refresh token reuse detected`,
    metadata,
    req
  )
}

/**
 * Middleware to log all authentication requests
 */
export const authAuditMiddleware = (req, res, next) => {
  // Log the start of auth request
  const startTime = Date.now()
  
  // Override res.send to capture response
  const originalSend = res.send
  res.send = function(data) {
    const duration = Date.now() - startTime
    const statusCode = res.statusCode
    
    // Log based on response status
    if (statusCode >= 400) {
      auditLog(
        'auth_request_error',
        LogLevel.WARN,
        `Auth request failed: ${req.method} ${req.path}`,
        { 
          statusCode,
          duration,
          responseSize: data?.length || 0
        },
        req
      )
    } else if (req.path.includes('/login') || req.path.includes('/register')) {
      auditLog(
        'auth_request_success',
        LogLevel.INFO,
        `Auth request completed: ${req.method} ${req.path}`,
        { 
          statusCode,
          duration
        },
        req
      )
    }
    
    return originalSend.call(this, data)
  }
  
  next()
}

/**
 * Security monitoring helpers
 */
export const securityMonitor = {
  trackFailedLogins: new Map(), // In-memory tracking (use Redis in production)
  
  checkSuspiciousActivity: (email, ip) => {
    const key = `${email}-${ip}`
    const current = securityMonitor.trackFailedLogins.get(key) || 0
    securityMonitor.trackFailedLogins.set(key, current + 1)
    
    if (current >= 3) {
      authLogger.suspiciousActivity(
        'Multiple failed login attempts',
        { email, ip, attemptCount: current + 1 },
        null
      )
      return true
    }
    return false
  },
  
  clearFailedLogins: (email, ip) => {
    const key = `${email}-${ip}`
    securityMonitor.trackFailedLogins.delete(key)
  },

  trackUnauthorizedAccess: (req, userId, data) => {
    authLogger.unauthorizedAccess(
      req.path || 'unknown_resource',
      userId,
      req
    )
    
    // Log additional context
    console.warn(`[Security] Unauthorized access attempt:`, {
      userId,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      ...data
    })
  },

  trackInvalidToken: (req, errorMessage) => {
    authLogger.suspiciousActivity(
      'Invalid token used',
      { 
        error: errorMessage,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      req
    )
  },

  trackFailedLogin: (req, email, userId = null) => {
    const key = `${email}-${req.ip}`
    const current = securityMonitor.trackFailedLogins.get(key) || 0
    securityMonitor.trackFailedLogins.set(key, current + 1)
    
    authLogger.loginFailure(email, 'invalid_credentials', req, current + 1)
    
    if (current >= 2) {
      authLogger.suspiciousActivity(
        'Multiple failed login attempts',
        { email, ip: req.ip, attemptCount: current + 1, userId },
        req
      )
    }
  },

  trackFailedPasswordChange: (req, userId) => {
    authLogger.suspiciousActivity(
      'Failed password change attempt',
      { 
        userId,
        reason: 'invalid_current_password',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      req
    )
  }
}