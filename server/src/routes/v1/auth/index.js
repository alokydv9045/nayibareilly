/**
 * Authentication Routes v1
 * Handles user authentication and session management
 * @module routes/v1/auth
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { auth } from '../../../middlewares/auth.js';
import { 
  authRateLimit, 
  loginRateLimit, 
  registerRateLimit, 
  passwordResetRateLimit,
  refreshRateLimit 
} from '../../../middlewares/rateLimit.js';
import { validateCSRFToken, getCSRFToken } from '../../../middlewares/csrf.js';
import { 
  register, 
  login, 
  me, 
  forgotPassword, 
  resetPassword, 
  verifyEmail, 
  refresh, 
  logout, 
  changePassword, 
  getAuthMetrics 
} from '../../../controllers/auth.controller.js';

const router = Router();

/**
 * GET /api/v1/auth/csrf-token
 * Get CSRF token for protected operations
 */
router.get('/csrf-token', getCSRFToken);

/**
 * POST /api/v1/auth/register
 * Register a new user account
 */
router.post('/register', [
  registerRateLimit,
  validateCSRFToken,
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').optional().isString().withMessage('Name must be a string'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('requestedRole').optional().isString().withMessage('Role must be a string')
], register);

/**
 * POST /api/v1/auth/login
 * Authenticate user and create session
 */
router.post('/login', [
  loginRateLimit,
  validateCSRFToken,
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isString().withMessage('Password is required')
], login);

/**
 * GET /api/v1/auth/me
 * Get current authenticated user profile
 */
router.get('/me', auth(), me);

/**
 * POST /api/v1/auth/forgot-password
 * Initiate password reset process
 */
router.post('/forgot-password', [
  passwordResetRateLimit,
  validateCSRFToken,
  body('email').isEmail().withMessage('Valid email is required')
], forgotPassword);

/**
 * POST /api/v1/auth/reset-password
 * Complete password reset with token
 */
router.post('/reset-password', [
  authRateLimit,
  validateCSRFToken,
  body('token').isString().withMessage('Reset token is required'), 
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], resetPassword);

/**
 * POST /api/v1/auth/verify-email
 * Verify email address with token
 */
router.post('/verify-email', [
  authRateLimit,
  body('token').isString().withMessage('Verification token is required')
], verifyEmail);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', [
  refreshRateLimit,
  body('refreshToken').isString().withMessage('Refresh token is required')
], refresh);

/**
 * POST /api/v1/auth/logout
 * Terminate user session
 */
router.post('/logout', auth(), logout);

/**
 * POST /api/v1/auth/change-password
 * Change password for authenticated user
 */
router.post('/change-password', [
  auth(),
  authRateLimit,
  validateCSRFToken,
  body('currentPassword').isString().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], changePassword);

/**
 * GET /api/v1/auth/metrics
 * Get authentication metrics (admin only)
 */
router.get('/metrics', auth(['SUPER_ADMIN', 'ADMIN']), getAuthMetrics);

export default router;
