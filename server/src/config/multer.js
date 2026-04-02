// server/src/config/multer.js
// Multer configuration for secure file uploads

import multer from 'multer'
import path from 'path'

// Allowed file types and their MIME types
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif']
}

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Maximum number of files per upload
const MAX_FILES_PER_UPLOAD = 5

/**
 * File filter to validate file types
 */
const fileFilter = (req, file, cb) => {
  // Check if MIME type is allowed
  if (ALLOWED_IMAGE_TYPES[file.mimetype]) {
    const ext = path.extname(file.originalname).toLowerCase()
    const allowedExts = ALLOWED_IMAGE_TYPES[file.mimetype]
    
    // Verify extension matches MIME type
    if (allowedExts.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file extension. Expected ${allowedExts.join(', ')} for ${file.mimetype}`), false)
    }
  } else {
    const allowedTypes = Object.keys(ALLOWED_IMAGE_TYPES).join(', ')
    cb(new Error(`Invalid file type. Only images are allowed: ${allowedTypes}`), false)
  }
}

/**
 * Memory storage configuration
 * Files are stored in memory as Buffer objects
 * Used for Firebase Storage uploads
 */
const memoryStorage = multer.memoryStorage()

/**
 * Standard upload configuration for single file
 */
export const uploadSingle = multer({
  storage: memoryStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter
})

/**
 * Upload configuration for multiple files
 */
export const uploadMultiple = multer({
  storage: memoryStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_UPLOAD
  },
  fileFilter
})

/**
 * Upload configuration for arrays of files
 * Allows up to 10 files for 'before' and 10 files for 'after'
 */
export const uploadFields = multer({
  storage: memoryStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_UPLOAD * 2 // For both before and after photos
  },
  fileFilter
})

/**
 * Error handler middleware for multer errors
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          error: 'FILE_TOO_LARGE'
        })
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: `Too many files. Maximum is ${MAX_FILES_PER_UPLOAD} files`,
          error: 'TOO_MANY_FILES'
        })
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name in file upload',
          error: 'UNEXPECTED_FIELD'
        })
      default:
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error',
          error: 'UPLOAD_ERROR'
        })
    }
  } else if (err) {
    // Custom validation errors
    return res.status(400).json({
      success: false,
      message: err.message || 'Invalid file',
      error: 'INVALID_FILE'
    })
  }
  
  next()
}

/**
 * Configuration constants (exported for use in other modules)
 */
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE,
  MAX_FILES_PER_UPLOAD,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_EXTENSIONS: Object.values(ALLOWED_IMAGE_TYPES).flat()
}
