// server/src/middlewares/static.middleware.js
// Serve static files from uploads directory

const express = require('express')
const path = require('path')
const fs = require('fs').promises

const UPLOAD_DIR = path.join(__dirname, '../../uploads')

/**
 * Middleware to serve uploaded files
 */
const serveUploads = express.static(UPLOAD_DIR, {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true,
  index: false, // Don't serve directory listings
  fallthrough: true
})

/**
 * Security middleware to validate file access
 */
const validateFileAccess = async (req, res, next) => {
  try {
    const requestedPath = path.join(UPLOAD_DIR, req.path)
    
    // Prevent directory traversal attacks
    if (!requestedPath.startsWith(UPLOAD_DIR)) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Check if file exists
    try {
      await fs.access(requestedPath)
    } catch (error) {
      return res.status(404).json({ error: 'File not found' })
    }

    next()
  } catch (error) {
    console.error('File access validation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Combined middleware for serving static files securely
 */
const staticFileMiddleware = [validateFileAccess, serveUploads]

module.exports = staticFileMiddleware
