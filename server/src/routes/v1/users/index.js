/**
 * Users Routes - API v1
 * User profile and management endpoints
 * @module routes/v1/users
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { auth } from '../../../middlewares/auth.js';
import { updateProfile, listUsers } from '../../../controllers/user.controller.js';

const router = Router();

/**
 * GET /api/v1/users
 * List all users (admin only)
 */
router.get('/', [
  auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR'])
], listUsers);

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
router.get('/:id', [
  auth()
], async (req, res) => {
  // This will be implemented in user.controller.js
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

/**
 * PATCH /api/v1/users/profile
 * Update current user's profile
 */
router.patch('/profile', [
  auth(),
  body('name').optional({ checkFalsy: true }).isString().trim().isLength({ min: 2, max: 100 }),
  body('avatarUrl').optional({ checkFalsy: true }).isURL(),
  body('email').optional({ checkFalsy: true }).isEmail()
], updateProfile);

/**
 * PATCH /api/v1/users/:id
 * Update user by ID (admin only)
 */
router.patch('/:id', [
  auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR']),
  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),
  body('roles').optional().isArray()
], async (req, res) => {
  // This will be implemented in admin.controller.js
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

/**
 * DELETE /api/v1/users/:id
 * Delete user (admin only)
 */
router.delete('/:id', [
  auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR'])
], async (req, res) => {
  // This will be implemented in admin.controller.js
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

/**
 * PATCH /api/v1/users/password
 * Update current user's password
 */
router.patch('/password', [
  auth(),
  body('currentPassword').isString().isLength({ min: 8 }),
  body('newPassword').isString().isLength({ min: 8 })
], async (req, res) => {
  // This will be implemented in user.controller.js
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

/**
 * POST /api/v1/users/avatar
 * Upload user avatar
 */
router.post('/avatar', [
  auth()
], async (req, res) => {
  // This will be implemented with multer in user.controller.js
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

export default router;
