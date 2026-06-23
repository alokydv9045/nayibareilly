// Enhanced error handling and logging utilities
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as Sentry from '@sentry/node'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Error types for categorization
export const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  CONFLICT: 'CONFLICT_ERROR',
  DATABASE: 'DATABASE_ERROR',
  EXTERNAL_API: 'EXTERNAL_API_ERROR',
  FILE_UPLOAD: 'FILE_UPLOAD_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  INTERNAL: 'INTERNAL_SERVER_ERROR'
}

// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode = 500, type = ErrorTypes.INTERNAL, metadata = {}) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.type = type
    this.metadata = metadata
    this.timestamp = new Date().toISOString()
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message, fields = []) {
    super(message, 400, ErrorTypes.VALIDATION, { fields })
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, ErrorTypes.AUTHENTICATION)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, ErrorTypes.AUTHORIZATION)
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, ErrorTypes.NOT_FOUND, { resource })
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, ErrorTypes.CONFLICT)
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500, ErrorTypes.DATABASE, { originalError: originalError?.message })
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, ErrorTypes.RATE_LIMIT)
  }
}

// Error logger utility
class ErrorLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs')
    this.ensureLogDirectory()
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  getLogFileName() {
    const date = new Date().toISOString().split('T')[0]
    return path.join(this.logDir, `error-${date}.log`)
  }

  formatError(error, req = null, additionalInfo = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      type: error.type || ErrorTypes.INTERNAL,
      message: error.message,
      statusCode: error.statusCode || 500,
      stack: error.stack,
      metadata: error.metadata || {},
      ...additionalInfo
    }

    if (req) {
      errorInfo.request = {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection?.remoteAddress,
        userId: req.user?.id || null,
        body: this.sanitizeRequestBody(req.body),
        query: req.query,
        params: req.params
      }
    }

    return errorInfo
  }

  sanitizeRequestBody(body) {
    if (!body) return {}
    
    const sanitized = { ...body }
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'apiKey']
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]'
      }
    })
    
    return sanitized
  }

  async logError(error, req = null, additionalInfo = {}) {
    try {
      const errorInfo = this.formatError(error, req, additionalInfo)
      const logEntry = JSON.stringify(errorInfo) + '\n'
      
      // Console log for development
      if (process.env.NODE_ENV !== 'production') {
        console.error('ERROR:', {
          message: error.message,
          type: error.type,
          statusCode: error.statusCode,
          url: req?.url,
          userId: req?.user?.id
        })
      }
      
      // File log for all environments
      await fs.promises.appendFile(this.getLogFileName(), logEntry)
      
      // Send to external monitoring service (Sentry, etc.)
      if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
        await this.sendToMonitoringService(errorInfo, error)
      }
      
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
  }

  // Send to Sentry
  async sendToMonitoringService(errorInfo, originalError = null) {
    try {
      Sentry.withScope(scope => {
        scope.setLevel(errorInfo.level.toLowerCase());
        scope.setTags({
          type: errorInfo.type,
          statusCode: errorInfo.statusCode
        });
        scope.setExtras({
          metadata: errorInfo.metadata,
          request: errorInfo.request
        });
        
        if (errorInfo.request && errorInfo.request.userId) {
          scope.setUser({ id: errorInfo.request.userId, ip_address: errorInfo.request.ip });
        }
        
        // Use the original Error object if it was passed, otherwise capture the formatted message
        const exceptionToCapture = originalError || new Error(errorInfo.message);
        exceptionToCapture.name = errorInfo.type;
        Sentry.captureException(exceptionToCapture);
      });
    } catch (sentryError) {
      console.error('Failed to send error to Sentry:', sentryError);
    }
  }
}

// Global error logger instance
export const errorLogger = new ErrorLogger()

// Database error handler
export const handleDatabaseError = (error, operation = 'database operation') => {
  console.error(`Database error during ${operation}:`, error)
  
  // Handle specific Prisma errors
  switch (error.code) {
    case 'P2002':
      return new ConflictError('Resource already exists')
    case 'P2025':
      return new NotFoundError('Resource')
    case 'P2003':
      return new ValidationError('Invalid reference to related resource')
    case 'P2021':
      return new DatabaseError('Table does not exist')
    case 'P2022':
      return new DatabaseError('Column does not exist')
    default:
      return new DatabaseError(`Failed to ${operation}`, error)
  }
}

// HTTP error handler middleware
export const errorHandler = async (error, req, res, next) => {
  try {
    // Log the error (don't await to avoid blocking response)
    errorLogger.logError(error, req).catch(logErr => {
      console.error('[errorHandler] Failed to log error:', logErr)
    })
    
    // Handle different error types
    let statusCode = 500
    let message = 'Internal server error'
    let type = ErrorTypes.INTERNAL
    let metadata = {}

    if (error instanceof AppError) {
      statusCode = error.statusCode
      message = error.message
      type = error.type
      metadata = error.metadata
    } else if (error.status || error.statusCode) {
      statusCode = error.status || error.statusCode
      message = error.message || 'Error'
      type = statusCode === 404 ? ErrorTypes.NOT_FOUND : statusCode === 401 ? ErrorTypes.AUTHENTICATION : statusCode === 403 ? ErrorTypes.AUTHORIZATION : ErrorTypes.INTERNAL
    } else if (error.name === 'ValidationError') {
      statusCode = 400
      message = error.message
      type = ErrorTypes.VALIDATION
    } else if (error.name === 'CastError') {
      statusCode = 400
      message = 'Invalid data format'
      type = ErrorTypes.VALIDATION
    } else if (error.code?.startsWith('P')) {
      // Prisma errors
      const dbError = handleDatabaseError(error)
      statusCode = dbError.statusCode
      message = dbError.message
      type = dbError.type
    }

    // Don't leak internal errors in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
      message = 'Something went wrong'
      metadata = {}
    }

    // Ensure we haven't already sent headers
    if (res.headersSent) {
      console.error('[errorHandler] Headers already sent, cannot send error response')
      return next(error)
    }

    // Send error response (wrap in try-catch to prevent throws)
    res.status(statusCode).json({
      success: false,
      error: {
        type,
        message,
        statusCode,
        timestamp: new Date().toISOString(),
        ...(Object.keys(metadata).length > 0 && { metadata })
      }
    })
  } catch (handlerError) {
    // Ultimate fallback: if error handler itself throws, log and send minimal response
    console.error('[errorHandler] Error handler itself failed:', handlerError)
    try {
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            type: ErrorTypes.INTERNAL,
            message: 'Internal server error',
            statusCode: 500,
            timestamp: new Date().toISOString()
          }
        })
      }
    } catch (finalError) {
      console.error('[errorHandler] Final fallback failed:', finalError)
      // At this point, give up and let process-level handler deal with it
    }
  }
}

// Async error wrapper
export const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Rate limiting error handler
export const handleRateLimitError = (req, res) => {
  const error = new RateLimitError('Rate limit exceeded. Please try again later.')
  errorLogger.logError(error, req)
  
  res.status(429).json({
    success: false,
    error: {
      type: ErrorTypes.RATE_LIMIT,
      message: error.message,
      statusCode: 429,
      timestamp: new Date().toISOString(),
      retryAfter: 60 // seconds
    }
  })
}

// Health check for error monitoring
export const getErrorStats = async () => {
  try {
    const logFile = new ErrorLogger().getLogFileName()
    
    if (!fs.existsSync(logFile)) {
      return { totalErrors: 0, errorsByType: {}, lastError: null }
    }
    
    const logContent = await fs.promises.readFile(logFile, 'utf8')
    const lines = logContent.trim().split('\n').filter(Boolean)
    
    const errorsByType = {}
    let lastError = null
    
    for (const line of lines) {
      try {
        const errorInfo = JSON.parse(line)
        errorsByType[errorInfo.type] = (errorsByType[errorInfo.type] || 0) + 1
        
        if (!lastError || new Date(errorInfo.timestamp) > new Date(lastError.timestamp)) {
          lastError = {
            timestamp: errorInfo.timestamp,
            type: errorInfo.type,
            message: errorInfo.message,
            statusCode: errorInfo.statusCode
          }
        }
      } catch (parseError) {
        // Skip invalid log entries
      }
    }
    
    return {
      totalErrors: lines.length,
      errorsByType,
      lastError
    }
  } catch (error) {
    console.error('Failed to get error stats:', error)
    return { totalErrors: 0, errorsByType: {}, lastError: null }
  }
}

export default {
  ErrorTypes,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  RateLimitError,
  errorLogger,
  handleDatabaseError,
  errorHandler,
  asyncErrorHandler,
  handleRateLimitError,
  getErrorStats
}