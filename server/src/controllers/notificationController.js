import * as notificationService from '../services/notificationService.js';
import logger from '../utils/logger.js';

/**
 * Get user notifications with pagination and filters
 * GET /api/notifications
 */
export async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const {
      read,
      type,
      category,
      priority,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    // Parse read as boolean
    const readFilter = read !== undefined ? read === 'true' : undefined;

    const result = await notificationService.getUserNotifications(userId, {
      read: readFilter,
      type,
      category,
      priority,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    });

    res.json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
}

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
export async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    logger.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message,
    });
  }
}

/**
 * Mark notification(s) as read
 * PATCH /api/notifications/read
 * Body: { ids: string[] } or { id: string }
 */
export async function markAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { ids, id } = req.body;

    if (!ids && !id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide notification id or ids',
      });
    }

    const notificationIds = ids || [id];
    const result = await notificationService.markAsRead(notificationIds, userId);

    res.json({
      success: true,
      message: `Marked ${result.count} notification(s) as read`,
      data: result,
    });
  } catch (error) {
    logger.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
      error: error.message,
    });
  }
}

/**
 * Mark notification(s) as unread
 * PATCH /api/notifications/unread
 * Body: { ids: string[] } or { id: string }
 */
export async function markAsUnread(req, res) {
  try {
    const userId = req.user.id;
    const { ids, id } = req.body;

    if (!ids && !id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide notification id or ids',
      });
    }

    const notificationIds = ids || [id];
    const result = await notificationService.markAsUnread(notificationIds, userId);

    res.json({
      success: true,
      message: `Marked ${result.count} notification(s) as unread`,
      data: result,
    });
  } catch (error) {
    logger.error('Error marking notifications as unread:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as unread',
      error: error.message,
    });
  }
}

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
export async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;
    const result = await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: `Marked all ${result.count} notifications as read`,
      data: result,
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message,
    });
  }
}

/**
 * Delete notification(s)
 * DELETE /api/notifications
 * Body: { ids: string[] } or { id: string }
 */
export async function deleteNotifications(req, res) {
  try {
    const userId = req.user.id;
    const { ids, id } = req.body;

    if (!ids && !id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide notification id or ids',
      });
    }

    const notificationIds = ids || [id];
    const result = await notificationService.deleteNotifications(notificationIds, userId);

    res.json({
      success: true,
      message: `Deleted ${result.count} notification(s)`,
      data: result,
    });
  } catch (error) {
    logger.error('Error deleting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notifications',
      error: error.message,
    });
  }
}

/**
 * Clear all read notifications
 * DELETE /api/notifications/read
 */
export async function clearReadNotifications(req, res) {
  try {
    const userId = req.user.id;
    const result = await notificationService.clearReadNotifications(userId);

    res.json({
      success: true,
      message: `Cleared ${result.count} read notification(s)`,
      data: result,
    });
  } catch (error) {
    logger.error('Error clearing read notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing read notifications',
      error: error.message,
    });
  }
}

/**
 * Get user notification preferences
 * GET /api/notifications/preferences
 */
export async function getPreferences(req, res) {
  try {
    const userId = req.user.id;
    const preferences = await notificationService.getUserPreferences(userId);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    logger.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification preferences',
      error: error.message,
    });
  }
}

/**
 * Update user notification preferences
 * PUT /api/notifications/preferences
 */
export async function updatePreferences(req, res) {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Validate quiet hours if provided
    if (updates.quietHoursStart !== undefined || updates.quietHoursEnd !== undefined) {
      const start = updates.quietHoursStart;
      const end = updates.quietHoursEnd;

      if ((start !== null && (start < 0 || start > 23)) || 
          (end !== null && (end < 0 || end > 23))) {
        return res.status(400).json({
          success: false,
          message: 'Quiet hours must be between 0 and 23',
        });
      }
    }

    const preferences = await notificationService.updateUserPreferences(userId, updates);

    res.json({
      success: true,
      message: 'Notification preferences updated',
      data: preferences,
    });
  } catch (error) {
    logger.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification preferences',
      error: error.message,
    });
  }
}

/**
 * Test notification endpoint (development only)
 * POST /api/notifications/test
 */
export async function sendTestNotification(req, res) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Test endpoint not available in production',
      });
    }

    const userId = req.user.id;
    const notification = await notificationService.createNotification({
      userId,
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'INFO',
      category: 'announcement',
      priority: 'NORMAL',
    });

    res.json({
      success: true,
      message: 'Test notification created',
      data: notification,
    });
  } catch (error) {
    logger.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test notification',
      error: error.message,
    });
  }
}

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotifications,
  clearReadNotifications,
  getPreferences,
  updatePreferences,
  sendTestNotification,
};
