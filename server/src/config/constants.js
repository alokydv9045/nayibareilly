// server/src/config/constants.js
// Application-wide configuration constants
// Centralized location for all magic numbers and configuration values

/**
 * JWT Configuration
 */
export const JWT_CONFIG = {
  // Token expiry times
  ACCESS_TOKEN_EXPIRY: '1h',              // 1 hour
  REFRESH_TOKEN_EXPIRY: '7d',             // 7 days
  RESET_TOKEN_EXPIRY: 3600000,            // 1 hour in milliseconds
  VERIFY_TOKEN_EXPIRY: 24 * 3600000,      // 24 hours in milliseconds
  
  // Security
  MIN_SECRET_LENGTH: 32,                   // Minimum length for JWT secrets
  REFRESH_GRACE_WINDOW_MS: 5000,          // 5 seconds grace period for refresh
  RECENT_ROTATIONS_TTL_MS: 60000,         // 60 seconds to track token rotations
}

/**
 * Authentication & Security Configuration
 */
export const AUTH_CONFIG = {
  // Login security
  MAX_LOGIN_ATTEMPTS: 5,                   // Maximum failed login attempts
  LOCK_DURATION_MINUTES: 30,              // Account lock duration after max attempts
  ACCOUNT_LOCK_DURATION_MS: 30 * 60000,   // 30 minutes in milliseconds
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 6,                  // Minimum password length
  PASSWORD_HASH_ROUNDS: 10,               // Bcrypt salt rounds
  
  // Session management
  SESSION_TIMEOUT_MS: 24 * 60 * 60000,    // 24 hours
  REMEMBER_ME_DURATION_MS: 30 * 24 * 60 * 60000, // 30 days
}

/**
 * Rate Limiting Configuration
 */
export const RATE_LIMIT_CONFIG = {
  // Global API rate limits
  GLOBAL_WINDOW_MS: 15 * 60 * 1000,       // 15 minutes
  GLOBAL_MAX_REQUESTS: 100,               // Max requests per window (anonymous)
  GLOBAL_MAX_AUTHENTICATED: 200,          // Max requests for authenticated users
  GLOBAL_MAX_STAFF: 500,                  // Max requests for staff
  GLOBAL_MAX_ADMIN: 1000,                 // Max requests for admins
  
  // Auth endpoint rate limits
  LOGIN_WINDOW_MS: 15 * 60 * 1000,        // 15 minutes
  LOGIN_MAX_ATTEMPTS: 5,                  // Max login attempts
  
  REGISTER_WINDOW_MS: 60 * 60 * 1000,     // 1 hour
  REGISTER_MAX_ATTEMPTS: 3,               // Max registration attempts
  
  PASSWORD_RESET_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  PASSWORD_RESET_MAX_ATTEMPTS: 3,         // Max password reset requests
  
  // Issue creation rate limits
  ISSUE_CREATION_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  ISSUE_CREATION_MAX: 10,                 // Max issues per hour per user
}

/**
 * File Upload Configuration
 */
export const UPLOAD_CONFIG = {
  // File size limits
  MAX_FILE_SIZE: 5 * 1024 * 1024,         // 5MB per file
  MAX_FILES_PER_UPLOAD: 5,                // Maximum files in single upload
  MAX_JSON_BODY_SIZE: '10mb',             // Maximum JSON body size
  
  // Allowed file types
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  
  // Image processing
  THUMBNAIL_SIZE: { width: 200, height: 200 },
  MAX_IMAGE_DIMENSION: 4096,              // Maximum width/height in pixels
}

/**
 * Issue Management Configuration
 */
export const ISSUE_CONFIG = {
  // SLA (Service Level Agreement) times in hours
  DEFAULT_SLA_HOURS: 48,                  // 2 days default SLA
  CRITICAL_SLA_HOURS: 4,                  // 4 hours for critical issues
  HIGH_SLA_HOURS: 24,                     // 1 day for high priority
  MEDIUM_SLA_HOURS: 48,                   // 2 days for medium priority
  LOW_SLA_HOURS: 72,                      // 3 days for low priority
  
  // Auto-escalation
  AUTO_ESCALATE_AFTER_HOURS: 72,          // Auto-escalate after 3 days
  MAX_ESCALATION_LEVEL: 3,                // Maximum escalation levels
  
  // Quality control
  MIN_TITLE_LENGTH: 10,                   // Minimum title length
  MAX_TITLE_LENGTH: 200,                  // Maximum title length
  MIN_DESCRIPTION_LENGTH: 20,             // Minimum description length
  MAX_DESCRIPTION_LENGTH: 5000,           // Maximum description length
  
  // Voting
  MIN_QUALITY_SCORE: 0,                   // Minimum quality score
  MAX_QUALITY_SCORE: 100,                 // Maximum quality score
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,                  // Default items per page
  MAX_PAGE_SIZE: 100,                     // Maximum items per page
}

/**
 * Notification Configuration
 */
export const NOTIFICATION_CONFIG = {
  // Push notifications
  FCM_BATCH_SIZE: 500,                    // Max messages per FCM batch
  FCM_RETRY_ATTEMPTS: 3,                  // Number of retry attempts
  
  // Email notifications
  EMAIL_RETRY_ATTEMPTS: 3,                // Number of email retry attempts
  EMAIL_RETRY_DELAY_MS: 2000,             // Delay between retries (exponential)
  EMAIL_QUEUE_CONCURRENCY: 5,             // Concurrent email sending
  
  // In-app notifications
  NOTIFICATION_RETENTION_DAYS: 30,        // Keep notifications for 30 days
  MAX_NOTIFICATIONS_PER_USER: 100,        // Maximum stored notifications per user
}

/**
 * Database Configuration
 */
export const DATABASE_CONFIG = {
  // Connection pool
  POOL_MIN_SIZE: 2,                       // Minimum connection pool size
  POOL_MAX_SIZE: 10,                      // Maximum connection pool size
  CONNECTION_TIMEOUT_MS: 10000,           // 10 seconds connection timeout
  IDLE_TIMEOUT_MS: 30000,                 // 30 seconds idle timeout
  
  // Query timeouts
  DEFAULT_QUERY_TIMEOUT_MS: 5000,         // 5 seconds default query timeout
  SLOW_QUERY_THRESHOLD_MS: 1000,          // Log queries slower than 1 second
  
  // Cleanup
  CLEANUP_OLD_LOGS_DAYS: 90,              // Delete logs older than 90 days
  CLEANUP_OLD_TOKENS_DAYS: 7,             // Delete expired tokens after 7 days
}

/**
 * Logging Configuration
 */
export const LOGGING_CONFIG = {
  // Log levels
  DEFAULT_LOG_LEVEL: 'info',              // Default log level
  PRODUCTION_LOG_LEVEL: 'warn',           // Production log level
  
  // Log retention
  LOG_RETENTION_DAYS: 30,                 // Keep logs for 30 days
  ERROR_LOG_RETENTION_DAYS: 90,           // Keep error logs for 90 days
  
  // Log file sizes
  MAX_LOG_FILE_SIZE: 10 * 1024 * 1024,    // 10MB per log file
  MAX_LOG_FILES: 5,                       // Maximum number of log files
}

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  // TTL (Time To Live) in seconds
  DEFAULT_TTL: 300,                       // 5 minutes
  SHORT_TTL: 60,                          // 1 minute
  MEDIUM_TTL: 600,                        // 10 minutes
  LONG_TTL: 3600,                         // 1 hour
  
  // Cache sizes
  MAX_CACHE_SIZE: 1000,                   // Maximum cached items
  
  // Redis (if used)
  REDIS_KEY_PREFIX: 'nayibareilly:',      // Prefix for all Redis keys
}

/**
 * Geolocation Configuration
 */
export const GEO_CONFIG = {
  // Coordinate validation
  MIN_LATITUDE: -90,
  MAX_LATITUDE: 90,
  MIN_LONGITUDE: -180,
  MAX_LONGITUDE: 180,
  
  // Bareilly city bounds (approximate)
  CITY_CENTER: { lat: 28.367, lng: 79.432 },
  CITY_RADIUS_KM: 50,                     // Search radius in kilometers
  
  // Distance calculations
  NEARBY_RADIUS_KM: 5,                    // Issues within 5km considered nearby
}

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  // Features that can be toggled
  ENABLE_ANONYMOUS_REPORTING: true,
  ENABLE_VOTING: true,
  ENABLE_COMMENTS: true,
  ENABLE_EMAIL_NOTIFICATIONS: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_SMS_NOTIFICATIONS: false,        // Not implemented yet
  ENABLE_AUTO_ESCALATION: true,
  ENABLE_SPAM_DETECTION: true,
  ENABLE_QUALITY_SCORING: true,
}

/**
 * System Configuration
 */
export const SYSTEM_CONFIG = {
  // Server
  DEFAULT_PORT: 4001,
  PORT_RETRY_MAX_ATTEMPTS: 10,            // Maximum port retry attempts
  PORT_RETRY_DELAY_MS: 200,               // Delay between port retries
  
  // Graceful shutdown
  GRACEFUL_SHUTDOWN_TIMEOUT_MS: 10000,    // 10 seconds shutdown timeout
  
  // Health check
  HEALTH_CHECK_INTERVAL_MS: 30000,        // 30 seconds between health checks
}

/**
 * User Roles
 */
export const USER_ROLES = {
  CITIZEN: 'citizen',
  MODERATOR: 'moderator',
  DEPARTMENT_ADMIN: 'department_admin',
  STAFF: 'staff',
  SUPER_ADMIN: 'super_admin',
}

/**
 * Issue Statuses
 */
export const ISSUE_STATUSES = {
  PENDING: 'PENDING',
  PENDING_REVIEW: 'PENDING_REVIEW',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  VERIFIED: 'VERIFIED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
}

/**
 * Issue Priorities
 */
export const ISSUE_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
}

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account is locked due to too many failed attempts',
  ACCOUNT_INACTIVE: 'Account is inactive',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'You do not have permission to perform this action',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid or expired token',
  
  // User errors
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  INVALID_EMAIL: 'Invalid email address',
  WEAK_PASSWORD: 'Password is too weak',
  
  // Issue errors
  ISSUE_NOT_FOUND: 'Issue not found',
  INVALID_STATUS: 'Invalid issue status',
  INVALID_PRIORITY: 'Invalid issue priority',
  TITLE_TOO_SHORT: 'Title must be at least 10 characters',
  DESCRIPTION_TOO_SHORT: 'Description must be at least 20 characters',
  
  // File upload errors
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  TOO_MANY_FILES: 'Too many files uploaded',
  
  // Rate limit errors
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
  
  // Server errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database error occurred',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
}

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTER_SUCCESS: 'Registration successful',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  ISSUE_CREATED: 'Issue created successfully',
  ISSUE_UPDATED: 'Issue updated successfully',
  ISSUE_DELETED: 'Issue deleted successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
}

// Export all as default for convenience
export default {
  JWT_CONFIG,
  AUTH_CONFIG,
  RATE_LIMIT_CONFIG,
  UPLOAD_CONFIG,
  ISSUE_CONFIG,
  NOTIFICATION_CONFIG,
  DATABASE_CONFIG,
  LOGGING_CONFIG,
  CACHE_CONFIG,
  GEO_CONFIG,
  FEATURE_FLAGS,
  SYSTEM_CONFIG,
  USER_ROLES,
  ISSUE_STATUSES,
  ISSUE_PRIORITIES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
}
