import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

let io = null;

/**
 * Initialize Socket.IO server
 * @param {http.Server} httpServer - HTTP server instance
 * @param {Object} options - Socket.IO options
 * @returns {Server} Socket.IO server instance
 */
export function initializeSocketIO(httpServer, options = {}) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    ...options,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRoles = decoded.roles || [];
      
      logger.info(`Socket authenticated: ${socket.id} for user ${socket.userId}`);
      next();
    } catch (error) {
      logger.error(`Socket authentication failed:`, error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id} (User: ${socket.userId})`);

    // Join user-specific room for targeted notifications
    socket.join(`user:${socket.userId}`);

    // Join role-based rooms
    socket.userRoles.forEach(role => {
      socket.join(`role:${role}`);
    });

    // Handle client requests
    socket.on('join:issue', (issueId) => {
      socket.join(`issue:${issueId}`);
      logger.info(`User ${socket.userId} joined issue room: ${issueId}`);
    });

    socket.on('leave:issue', (issueId) => {
      socket.leave(`issue:${issueId}`);
      logger.info(`User ${socket.userId} left issue room: ${issueId}`);
    });

    socket.on('join:department', (departmentId) => {
      socket.join(`department:${departmentId}`);
      logger.info(`User ${socket.userId} joined department room: ${departmentId}`);
    });

    socket.on('leave:department', (departmentId) => {
      socket.leave(`department:${departmentId}`);
      logger.info(`User ${socket.userId} left department room: ${departmentId}`);
    });

    // Request notification count
    socket.on('request:unread-count', async () => {
      try {
        const { getUnreadCount } = await import('../services/notificationService.js');
        const count = await getUnreadCount(socket.userId);
        socket.emit('unread-count', { count });
      } catch (error) {
        logger.error(`Error fetching unread count for ${socket.userId}:`, error);
      }
    });

    // Mark notification as read (real-time)
    socket.on('notification:read', async (notificationId) => {
      try {
        const { markAsRead } = await import('../services/notificationService.js');
        await markAsRead(notificationId, socket.userId);
        socket.emit('notification:read:success', { id: notificationId });
      } catch (error) {
        logger.error(`Error marking notification as read:`, error);
        socket.emit('notification:read:error', { error: error.message });
      }
    });

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id} (User: ${socket.userId}) - Reason: ${reason}`);
    });

    // Error handler
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });

    // Send welcome notification
    socket.emit('connected', {
      message: 'Real-time notifications connected',
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });
  });

  logger.info('✓ Socket.IO initialized for real-time notifications');
  return io;
}

/**
 * Get Socket.IO server instance
 * @returns {Server|null} Socket.IO server instance
 */
export function getIO() {
  if (!io) {
    logger.warn('Socket.IO not initialized');
  }
  return io;
}

/**
 * Emit notification to specific user
 * @param {string} userId - User ID
 * @param {Object} notification - Notification data
 */
export function emitNotificationToUser(userId, notification) {
  if (!io) {
    logger.warn('Socket.IO not initialized, cannot emit notification');
    return false;
  }

  io.to(`user:${userId}`).emit('notification', notification);
  logger.info(`Notification emitted to user ${userId}: ${notification.id}`);
  return true;
}

/**
 * Emit notification to users with specific role
 * @param {string} role - User role
 * @param {Object} notification - Notification data
 */
export function emitNotificationToRole(role, notification) {
  if (!io) {
    logger.warn('Socket.IO not initialized, cannot emit notification');
    return false;
  }

  io.to(`role:${role}`).emit('notification', notification);
  logger.info(`Notification emitted to role ${role}`);
  return true;
}

/**
 * Emit notification to issue subscribers
 * @param {string} issueId - Issue ID
 * @param {Object} notification - Notification data
 */
export function emitNotificationToIssue(issueId, notification) {
  if (!io) {
    logger.warn('Socket.IO not initialized, cannot emit notification');
    return false;
  }

  io.to(`issue:${issueId}`).emit('notification', notification);
  logger.info(`Notification emitted to issue ${issueId} subscribers`);
  return true;
}

/**
 * Emit notification to department members
 * @param {string} departmentId - Department ID
 * @param {Object} notification - Notification data
 */
export function emitNotificationToDepartment(departmentId, notification) {
  if (!io) {
    logger.warn('Socket.IO not initialized, cannot emit notification');
    return false;
  }

  io.to(`department:${departmentId}`).emit('notification', notification);
  logger.info(`Notification emitted to department ${departmentId}`);
  return true;
}

/**
 * Broadcast notification to all connected clients
 * @param {Object} notification - Notification data
 */
export function broadcastNotification(notification) {
  if (!io) {
    logger.warn('Socket.IO not initialized, cannot broadcast notification');
    return false;
  }

  io.emit('notification', notification);
  logger.info(`Notification broadcasted to all clients`);
  return true;
}

/**
 * Emit unread count update to user
 * @param {string} userId - User ID
 * @param {number} count - Unread count
 */
export function emitUnreadCountToUser(userId, count) {
  if (!io) {
    return false;
  }

  io.to(`user:${userId}`).emit('unread-count', { count });
  return true;
}

/**
 * Get connected clients count
 * @returns {Promise<number>} Number of connected clients
 */
export async function getConnectedClientsCount() {
  if (!io) {
    return 0;
  }

  const sockets = await io.fetchSockets();
  return sockets.length;
}

/**
 * Get user's connected sockets
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User's socket instances
 */
export async function getUserSockets(userId) {
  if (!io) {
    return [];
  }

  const sockets = await io.in(`user:${userId}`).fetchSockets();
  return sockets;
}

/**
 * Check if user is online
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Is user online
 */
export async function isUserOnline(userId) {
  const sockets = await getUserSockets(userId);
  return sockets.length > 0;
}

/**
 * Disconnect user's sockets
 * @param {string} userId - User ID
 * @param {string} reason - Disconnect reason
 */
export async function disconnectUser(userId, reason = 'Server disconnect') {
  if (!io) {
    return;
  }

  const sockets = await getUserSockets(userId);
  sockets.forEach(socket => {
    socket.disconnect(true);
  });

  logger.info(`Disconnected ${sockets.length} sockets for user ${userId}: ${reason}`);
}

export default {
  initializeSocketIO,
  getIO,
  emitNotificationToUser,
  emitNotificationToRole,
  emitNotificationToIssue,
  emitNotificationToDepartment,
  broadcastNotification,
  emitUnreadCountToUser,
  getConnectedClientsCount,
  getUserSockets,
  isUserOnline,
  disconnectUser,
};
