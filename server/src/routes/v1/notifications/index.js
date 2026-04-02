/**
 * Notifications Routes - API v1
 * User notification management endpoints
 * @module routes/v1/notifications
 */

import { Router } from 'express';
import { query, param } from 'express-validator';
import { auth } from '../../../middlewares/auth.js';
import {
  listNotifications,
  unreadCount,
  markRead,
  markAllRead
} from '../../../controllers/notification.controller.js';

const router = Router();

/**
 * GET /api/v1/notifications
 * Get user notifications
 */
router.get('/', [
  auth(),
  query('read').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], listNotifications);

/**
 * GET /api/v1/notifications/unread-count
 * Get unread notification count
 */
router.get('/unread-count', [
  auth()
], unreadCount);

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark notification as read
 */
router.patch('/:id/read', [
  auth(),
  param('id').isString().notEmpty()
], markRead);

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all', [
  auth()
], markAllRead);

/**
 * DELETE /api/v1/notifications/:id
 * Delete notification
 */
router.delete('/:id', [
  auth(),
  param('id').isString().notEmpty()
], async (req, res) => {
  // This will be implemented in notification.controller.js
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

export default router;
