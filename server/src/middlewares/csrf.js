import crypto from 'crypto'

/**
 * Simple CSRF protection middleware
 * Generates and validates CSRF tokens for state-changing operations
 */

const CSRF_HEADER = 'x-csrf-token'
const CSRF_COOKIE = 'csrf-token'
const TOKEN_LENGTH = 32

/**
 * Generate a random CSRF token
 */
export const generateCSRFToken = () => {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex')
}

/**
 * Middleware to set CSRF token in cookie
 */
export const setCSRFToken = (req, res, next) => {
  const token = generateCSRFToken()
  
  // Set token in cookie (readable by client)
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false, // Must be readable by client JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  })
  
  // Also make token available in response headers for SPAs
  res.setHeader('X-CSRF-Token', token)
  
  next()
}

/**
 * Middleware to validate CSRF token for state-changing requests
 */
export const validateCSRFToken = (req, res, next) => {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }
  
  // Skip CSRF validation for API requests with valid JWT (API-to-API communication)
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ') && req.headers['x-api-client']) {
    return next()
  }
  
  const tokenFromHeader = req.headers[CSRF_HEADER]
  const tokenFromCookie = req.cookies[CSRF_COOKIE]
  
  // Both header and cookie must be present and match
  if (!tokenFromHeader || !tokenFromCookie || tokenFromHeader !== tokenFromCookie) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
      error: 'CSRF_TOKEN_INVALID'
    })
  }
  
  next()
}

/**
 * Get CSRF token endpoint
 */
export const getCSRFToken = (req, res) => {
  const token = req.cookies[CSRF_COOKIE] || generateCSRFToken()
  
  // Set/refresh the cookie
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  })
  
  res.json({
    success: true,
    data: { csrfToken: token }
  })
}