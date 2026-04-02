import createError from 'http-errors'
import { errorHandler as enhancedErrorHandler, errorLogger } from '../utils/errorHandler.js'

export const notFound = (req, res, next) => {
  next(createError(404, `Not Found - ${req.originalUrl}`))
}

// Use the enhanced error handler
export const errorHandler = enhancedErrorHandler

// Legacy error handler for backward compatibility
export const legacyErrorHandler = (err, req, res, _next) => {
  const status = err.status || 500
  const response = {
    status,
    message: err.message || 'Something went wrong',
  }
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack
  }
  res.status(status).json(response)
}

// Health check endpoint error handler
export const healthCheckErrorHandler = (err, req, res, next) => {
  // For health checks, return minimal error info
  res.status(500).json({
    status: 'error',
    message: 'Health check failed',
    timestamp: new Date().toISOString()
  })
}
