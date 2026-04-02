// Enhanced validation utilities for consistent input validation across controllers
import { validationResult } from 'express-validator'
import { fail } from './apiResponse.js'

/**
 * Middleware to handle validation results from express-validator
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return fail(res, 400, 'Validation failed', errors.array())
  }
  next()
}

/**
 * Validate pagination parameters
 */
export const validatePagination = (page, limit, maxLimit = 100) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const limitNum = Math.min(maxLimit, Math.max(1, parseInt(limit, 10) || 10))
  return { page: pageNum, limit: limitNum }
}

/**
 * Validate sort parameters against allowed values
 */
export const validateSort = (sort, allowedSorts, defaultSort = 'newest') => {
  return allowedSorts.includes(sort) ? sort : defaultSort
}

/**
 * Validate enum values
 */
export const validateEnum = (value, allowedValues, fieldName) => {
  const upperValue = String(value).toUpperCase()
  if (!allowedValues.includes(upperValue)) {
    throw new Error(`Invalid ${fieldName}: ${value}`)
  }
  return upperValue
}

/**
 * Validate date range
 */
export const validateDateRange = (startDate, endDate) => {
  const dates = {}
  
  if (startDate) {
    const start = new Date(startDate)
    if (isNaN(start.getTime())) {
      throw new Error('Invalid start date format')
    }
    dates.startDate = start
  }
  
  if (endDate) {
    const end = new Date(endDate)
    if (isNaN(end.getTime())) {
      throw new Error('Invalid end date format')
    }
    dates.endDate = end
  }
  
  if (dates.startDate && dates.endDate && dates.startDate > dates.endDate) {
    throw new Error('Start date cannot be after end date')
  }
  
  return dates
}

/**
 * Validate coordinates
 */
export const validateCoordinates = (latitude, longitude) => {
  if (latitude !== null && (latitude < -90 || latitude > 90)) {
    throw new Error('Latitude must be between -90 and 90')
  }
  
  if (longitude !== null && (longitude < -180 || longitude > 180)) {
    throw new Error('Longitude must be between -180 and 180')
  }
  
  return { latitude, longitude }
}

/**
 * Validate file uploads
 */
export const validateFileUploads = (files, options = {}) => {
  const {
    maxFiles = 5,
    maxFileSize = 10 * 1024 * 1024, // 10MB
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options

  if (files.length > maxFiles) {
    throw new Error(`Maximum ${maxFiles} files allowed`)
  }

  for (const file of files) {
    if (file.size > maxFileSize) {
      throw new Error(`File ${file.originalname} exceeds maximum size of ${maxFileSize / (1024 * 1024)}MB`)
    }
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`File ${file.originalname} has invalid type. Allowed types: ${allowedMimeTypes.join(', ')}`)
    }
  }

  return true
}

/**
 * Validate search query
 */
export const validateSearchQuery = (query, minLength = 2, maxLength = 100) => {
  if (!query) return null
  
  const trimmed = String(query).trim()
  
  if (trimmed.length < minLength) {
    throw new Error(`Search query must be at least ${minLength} characters`)
  }
  
  if (trimmed.length > maxLength) {
    throw new Error(`Search query must be less than ${maxLength} characters`)
  }
  
  return trimmed
}

/**
 * Sanitize text input
 */
export const sanitizeText = (text, maxLength = 5000) => {
  if (!text) return ''
  
  const sanitized = String(text).trim()
  
  if (sanitized.length > maxLength) {
    throw new Error(`Text must be less than ${maxLength} characters`)
  }
  
  return sanitized
}

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format')
  }
  return email.toLowerCase()
}

/**
 * Validate password strength
 */
export const validatePassword = (password, minLength = 8) => {
  if (!password || password.length < minLength) {
    throw new Error(`Password must be at least ${minLength} characters long`)
  }
  
  // Check for at least one uppercase, lowercase, number, and special character
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
    throw new Error('Password must contain at least one uppercase letter, lowercase letter, number, and special character')
  }
  
  return password
}

/**
 * Create standardized error response
 */
export const createErrorResponse = (error, defaultMessage = 'An error occurred') => {
  if (error.code === 'P2002') {
    return 'Resource already exists'
  }
  
  if (error.code === 'P2025') {
    return 'Resource not found'
  }
  
  if (error.code === 'P2003') {
    return 'Invalid reference to related resource'
  }
  
  return error.message || defaultMessage
}

/**
 * Async wrapper for controllers to handle errors consistently
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default {
  handleValidationErrors,
  validatePagination,
  validateSort,
  validateEnum,
  validateDateRange,
  validateCoordinates,
  validateFileUploads,
  validateSearchQuery,
  sanitizeText,
  validateEmail,
  validatePassword,
  createErrorResponse,
  asyncHandler
}