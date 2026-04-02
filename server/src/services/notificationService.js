import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';
import { emitNotificationToUser, emitUnreadCountToUser } from '../config/socket.js';

const prisma = new PrismaClient();

/**
 * Create a notification for a user
 * @param {Object} data - Notification data
 * @param {string} data.userId - User ID to notify
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification message
 * @param {string} data.type - Notification type (INFO, SUCCESS, WARNING, ERROR, ANNOUNCEMENT)
 * @param {string} data.category - Category (issue_status, assignment, comment, etc.)
 * @param {string} data.relatedIssueId - Related issue ID (optional)
 * @param {string} data.relatedUserId - Related user ID (optional)
 * @param {string} data.actionUrl - Deep link URL (optional)
 * @param {Object} data.metadata - Additional metadata (optional)
 * @param {string} data.priority - Priority (LOW, NORMAL, HIGH, URGENT)
 * @param {Date} data.expiresAt - Expiration date (optional)
 * @returns {Promise<Object>} Created notification
 */
export async function createNotification(data) {
  try {
    // Check if user has this category enabled in preferences
    const preferences = await getUserPreferences(data.userId);
    
    if (!shouldSendNotification(preferences, data.category)) {
      logger.info(`Notification skipped for user ${data.userId} - category ${data.category} disabled`);
      return null;
    }

    // Check quiet hours
    if (isInQuietHours(preferences)) {
      logger.info(`Notification delayed for user ${data.userId} - quiet hours active`);
      // In production, you'd queue this for later delivery
    }

    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        category: data.category,
        relatedIssueId: data.relatedIssueId,
        relatedUserId: data.relatedUserId,
        actionUrl: data.actionUrl,
        metadata: data.metadata,
        priority: data.priority || 'NORMAL',
        expiresAt: data.expiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            fcmToken: true,
          },
        },
        issue: {
          select: {
            id: true,
            reportId: true,
            title: true,
            status: true,
          },
        },
      },
    });

    logger.info(`Notification created: ${notification.id} for user ${data.userId}`);
    
    // Emit real-time notification to user
    emitNotificationToUser(data.userId, notification);
    
    // Emit updated unread count
    const unreadCount = await getUnreadCount(data.userId);
    emitUnreadCountToUser(data.userId, unreadCount);
    
    return notification;
  } catch (error) {
    logger.error(`Error creating notification:`, error);
    throw error;
  }
}

/**
 * Create bulk notifications for multiple users
 * @param {Array<string>} userIds - Array of user IDs
 * @param {Object} notificationData - Notification data (same as createNotification)
 * @returns {Promise<Array>} Created notifications
 */
export async function createBulkNotifications(userIds, notificationData) {
  try {
    const notifications = await Promise.all(
      userIds.map(userId => createNotification({ ...notificationData, userId }))
    );
    
    const successCount = notifications.filter(n => n !== null).length;
    logger.info(`Bulk notifications created: ${successCount}/${userIds.length}`);
    
    return notifications.filter(n => n !== null);
  } catch (error) {
    logger.error(`Error creating bulk notifications:`, error);
    throw error;
  }
}

/**
 * Get notifications for a user with pagination
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Notifications and pagination
 */
export async function getUserNotifications(userId, options = {}) {
  try {
    const {
      read,
      type,
      category,
      priority,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      userId,
    };

    if (read !== undefined) {
      where.read = read;
    }

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    // Filter out expired notifications
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ];

    // Get notifications with pagination
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          issue: {
            select: {
              id: true,
              reportId: true,
              title: true,
              status: true,
              priority: true,
            },
          },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        read: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + notifications.length < total,
      },
      unreadCount,
    };
  } catch (error) {
    logger.error(`Error fetching notifications for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Mark notification(s) as read
 * @param {string|Array<string>} notificationIds - Single or multiple notification IDs
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Update result
 */
export async function markAsRead(notificationIds, userId) {
  try {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

    const result = await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId, // Ensure user owns the notifications
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    logger.info(`Marked ${result.count} notifications as read for user ${userId}`);
    
    // Emit updated unread count
    const unreadCount = await getUnreadCount(userId);
    emitUnreadCountToUser(userId, unreadCount);
    
    return result;
  } catch (error) {
    logger.error(`Error marking notifications as read:`, error);
    throw error;
  }
}

/**
 * Mark notification(s) as unread
 * @param {string|Array<string>} notificationIds - Single or multiple notification IDs
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Update result
 */
export async function markAsUnread(notificationIds, userId) {
  try {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

    const result = await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId,
      },
      data: {
        read: false,
        readAt: null,
      },
    });

    logger.info(`Marked ${result.count} notifications as unread for user ${userId}`);
    return result;
  } catch (error) {
    logger.error(`Error marking notifications as unread:`, error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Update result
 */
export async function markAllAsRead(userId) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    logger.info(`Marked all ${result.count} notifications as read for user ${userId}`);
    return result;
  } catch (error) {
    logger.error(`Error marking all notifications as read:`, error);
    throw error;
  }
}

/**
 * Delete notification(s)
 * @param {string|Array<string>} notificationIds - Single or multiple notification IDs
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Delete result
 */
export async function deleteNotifications(notificationIds, userId) {
  try {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

    const result = await prisma.notification.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    });

    logger.info(`Deleted ${result.count} notifications for user ${userId}`);
    return result;
  } catch (error) {
    logger.error(`Error deleting notifications:`, error);
    throw error;
  }
}

/**
 * Delete all read notifications for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Delete result
 */
export async function clearReadNotifications(userId) {
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        read: true,
      },
    });

    logger.info(`Cleared ${result.count} read notifications for user ${userId}`);
    return result;
  } catch (error) {
    logger.error(`Error clearing read notifications:`, error);
    throw error;
  }
}

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount(userId) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    return count;
  } catch (error) {
    logger.error(`Error getting unread count for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get user notification preferences
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User preferences
 */
export async function getUserPreferences(userId) {
  try {
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: { userId },
      });
      logger.info(`Created default notification preferences for user ${userId}`);
    }

    return preferences;
  } catch (error) {
    logger.error(`Error getting user preferences for ${userId}:`, error);
    throw error;
  }
}

/**
 * Update user notification preferences
 * @param {string} userId - User ID
 * @param {Object} updates - Preference updates
 * @returns {Promise<Object>} Updated preferences
 */
export async function updateUserPreferences(userId, updates) {
  try {
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      update: updates,
      create: {
        userId,
        ...updates,
      },
    });

    logger.info(`Updated notification preferences for user ${userId}`);
    return preferences;
  } catch (error) {
    logger.error(`Error updating user preferences for ${userId}:`, error);
    throw error;
  }
}

/**
 * Clean up expired notifications
 * @returns {Promise<Object>} Delete result
 */
export async function cleanupExpiredNotifications() {
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    logger.info(`Cleaned up ${result.count} expired notifications`);
    return result;
  } catch (error) {
    logger.error(`Error cleaning up expired notifications:`, error);
    throw error;
  }
}

// ===== Helper Functions =====

/**
 * Check if notification should be sent based on user preferences
 * @param {Object} preferences - User preferences
 * @param {string} category - Notification category
 * @returns {boolean} Should send
 */
function shouldSendNotification(preferences, category) {
  if (!preferences.enableInApp) {
    return false;
  }

  const categoryMap = {
    issue_status: 'issueStatusUpdates',
    assignment: 'issueAssignments',
    comment: 'issueComments',
    escalation: 'issueEscalations',
    resolution: 'issueResolutions',
    announcement: 'systemAnnouncements',
  };

  const prefKey = categoryMap[category];
  if (prefKey && preferences[prefKey] === false) {
    return false;
  }

  return true;
}

/**
 * Check if current time is within user's quiet hours
 * @param {Object} preferences - User preferences
 * @returns {boolean} Is in quiet hours
 */
function isInQuietHours(preferences) {
  if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
    return false;
  }

  const now = new Date();
  const currentHour = now.getHours();

  const start = preferences.quietHoursStart;
  const end = preferences.quietHoursEnd;

  // Handle overnight quiet hours (e.g., 22:00 to 07:00)
  if (start > end) {
    return currentHour >= start || currentHour < end;
  }

  return currentHour >= start && currentHour < end;
}

// ===== Notification Builders (Helper functions for common notifications) =====

/**
 * Create issue status change notification
 */
export async function notifyIssueStatusChange(issueId, newStatus, userId) {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: { reporter: true },
    });

    if (!issue || !issue.reporterId) return null;

    const statusMessages = {
      ASSIGNED: 'Your issue has been assigned to a department',
      IN_PROGRESS: 'Work has started on your issue',
      RESOLVED: 'Your issue has been resolved',
      VERIFIED: 'Your issue resolution has been verified',
      CLOSED: 'Your issue has been closed',
      REJECTED: 'Your issue has been rejected',
    };

    return await createNotification({
      userId: issue.reporterId,
      title: `Issue #${issue.reportId} - ${newStatus}`,
      message: statusMessages[newStatus] || `Status changed to ${newStatus}`,
      type: newStatus === 'RESOLVED' ? 'SUCCESS' : newStatus === 'REJECTED' ? 'WARNING' : 'INFO',
      category: 'issue_status',
      relatedIssueId: issueId,
      actionUrl: `/issue/${issueId}`,
      priority: ['RESOLVED', 'REJECTED'].includes(newStatus) ? 'HIGH' : 'NORMAL',
      metadata: { previousStatus: issue.status, newStatus, changedBy: userId },
    });
  } catch (error) {
    logger.error(`Error creating status change notification:`, error);
    return null;
  }
}

/**
 * Create issue assignment notification
 */
export async function notifyIssueAssignment(issueId, assigneeId, assignedBy) {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) return null;

    return await createNotification({
      userId: assigneeId,
      title: `New Issue Assigned: #${issue.reportId}`,
      message: `You have been assigned: ${issue.title}`,
      type: 'INFO',
      category: 'assignment',
      relatedIssueId: issueId,
      actionUrl: `/issue/${issueId}`,
      priority: issue.priority === 'URGENT' ? 'HIGH' : 'NORMAL',
      metadata: { assignedBy },
    });
  } catch (error) {
    logger.error(`Error creating assignment notification:`, error);
    return null;
  }
}

/**
 * Create comment notification
 */
export async function notifyNewComment(issueId, commentId, commenterId) {
  try {
    const [issue, comment] = await Promise.all([
      prisma.issue.findUnique({
        where: { id: issueId },
      }),
      prisma.issueComment.findUnique({
        where: { id: commentId },
        include: { user: true },
      }),
    ]);

    if (!issue || !comment) return null;

    // Notify issue reporter
    const notifications = [];
    if (issue.reporterId && issue.reporterId !== commenterId) {
      notifications.push(
        createNotification({
          userId: issue.reporterId,
          title: `New comment on #${issue.reportId}`,
          message: `${comment.user.name} commented: ${comment.comment.substring(0, 100)}...`,
          type: 'INFO',
          category: 'comment',
          relatedIssueId: issueId,
          actionUrl: `/issue/${issueId}#comment-${commentId}`,
          priority: 'NORMAL',
          metadata: { commentId, commenterId },
        })
      );
    }

    // Notify assignee
    if (issue.assignedToId && issue.assignedToId !== commenterId && issue.assignedToId !== issue.reporterId) {
      notifications.push(
        createNotification({
          userId: issue.assignedToId,
          title: `New comment on assigned issue #${issue.reportId}`,
          message: `${comment.user.name} commented: ${comment.comment.substring(0, 100)}...`,
          type: 'INFO',
          category: 'comment',
          relatedIssueId: issueId,
          actionUrl: `/issue/${issueId}#comment-${commentId}`,
          priority: 'NORMAL',
          metadata: { commentId, commenterId },
        })
      );
    }

    return await Promise.all(notifications);
  } catch (error) {
    logger.error(`Error creating comment notification:`, error);
    return null;
  }
}

export default {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotifications,
  clearReadNotifications,
  getUnreadCount,
  getUserPreferences,
  updateUserPreferences,
  cleanupExpiredNotifications,
  notifyIssueStatusChange,
  notifyIssueAssignment,
  notifyNewComment,
};
