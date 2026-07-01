import { validationResult } from 'express-validator'
import { ValidationError } from '../utils/errorHandler.js'

/**
 * Middleware to intercept express-validator errors and throw a custom ValidationError.
 * This integrates seamlessly with the global errorHandler.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // Extract the field names and messages
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }))
    
    // Throw a global ValidationError which will be caught by express-async-errors
    throw new ValidationError('Validation failed', formattedErrors)
  }
  next()
}
