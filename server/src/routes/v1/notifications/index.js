/**
 * Notifications Routes - API v1
 * User notification management endpoints
 * @module routes/v1/notifications
 */

import { Router } from 'express';
import { query, param, body } from 'express-validator';
import { auth } from '../../../middlewares/auth.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import * as notificationController from '../../../controllers/notification.controller.js';

const router = Router();

// All routes require authentication
router.use(auth());

/**
 * GET /api/v1/notifications
 * Get user notifications with pagination and filters
 */
router.get('/', [
  query('read').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], asyncHandler(notificationController.getNotifications));

/**
 * GET /api/v1/notifications/unread-count
 * Get unread notification count
 */
router.get('/unread-count', asyncHandler(notificationController.getUnreadCount));

/**
 * PATCH /api/v1/notifications/read
 * Mark notification(s) as read (supports array of ids in body or single id)
 */
router.patch('/read', asyncHandler(notificationController.markAsRead));

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a specific notification as read
 */
const markReadHandler = (req, res, next) => {
  // Map params.id to body.id to reuse the same controller logic
  req.body = { ...req.body, id: req.params.id };
  return asyncHandler(notificationController.markAsRead)(req, res, next);
};
router.patch('/:id/read', [param('id').isString().notEmpty()], markReadHandler);
router.post('/:id/read', [param('id').isString().notEmpty()], markReadHandler);

/**
 * PATCH /api/v1/notifications/unread
 * Mark notification(s) as unread
 */
router.patch('/unread', asyncHandler(notificationController.markAsUnread));
router.post('/unread', asyncHandler(notificationController.markAsUnread));

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all', asyncHandler(notificationController.markAllAsRead));
router.post('/read-all', asyncHandler(notificationController.markAllAsRead));

/**
 * DELETE /api/v1/notifications
 * Delete notification(s)
 */
router.delete('/', asyncHandler(notificationController.deleteNotifications));

/**
 * DELETE /api/v1/notifications/read
 * Clear all read notifications
 */
router.delete('/read', asyncHandler(notificationController.clearReadNotifications));

/**
 * GET /api/v1/notifications/preferences
 * Get user notification preferences
 */
router.get('/preferences', asyncHandler(notificationController.getPreferences));

/**
 * PUT /api/v1/notifications/preferences
 * Update user notification preferences
 */
router.put('/preferences', asyncHandler(notificationController.updatePreferences));

/**
 * POST /api/v1/notifications/test
 * Send test notification (development only)
 */
router.post('/test', asyncHandler(notificationController.sendTestNotification));

export default router;
