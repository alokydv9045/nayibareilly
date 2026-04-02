import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { auth } from '../middlewares/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// All routes require authentication
router.use(auth());

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications with pagination and filters
 * @access  Private (any authenticated user)
 * @query   {boolean} read - Filter by read status
 * @query   {string} type - Filter by type (INFO, SUCCESS, WARNING, ERROR, ANNOUNCEMENT)
 * @query   {string} category - Filter by category (issue_status, assignment, comment, etc.)
 * @query   {string} priority - Filter by priority (LOW, NORMAL, HIGH, URGENT)
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 20)
 * @query   {string} sortBy - Sort field (default: createdAt)
 * @query   {string} sortOrder - Sort order (asc/desc, default: desc)
 */
router.get('/', asyncHandler(notificationController.getNotifications));

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private (any authenticated user)
 */
router.get('/unread-count', asyncHandler(notificationController.getUnreadCount));

/**
 * @route   PATCH /api/notifications/read
 * @desc    Mark notification(s) as read
 * @access  Private (any authenticated user)
 * @body    {string} id - Single notification ID
 * @body    {string[]} ids - Multiple notification IDs
 */
router.patch('/read', asyncHandler(notificationController.markAsRead));

/**
 * @route   PATCH /api/notifications/unread
 * @desc    Mark notification(s) as unread
 * @access  Private (any authenticated user)
 * @body    {string} id - Single notification ID
 * @body    {string[]} ids - Multiple notification IDs
 */
router.patch('/unread', asyncHandler(notificationController.markAsUnread));

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private (any authenticated user)
 */
router.patch('/read-all', asyncHandler(notificationController.markAllAsRead));

/**
 * @route   DELETE /api/notifications
 * @desc    Delete notification(s)
 * @access  Private (any authenticated user)
 * @body    {string} id - Single notification ID
 * @body    {string[]} ids - Multiple notification IDs
 */
router.delete('/', asyncHandler(notificationController.deleteNotifications));

/**
 * @route   DELETE /api/notifications/read
 * @desc    Clear all read notifications
 * @access  Private (any authenticated user)
 */
router.delete('/read', asyncHandler(notificationController.clearReadNotifications));

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get user notification preferences
 * @access  Private (any authenticated user)
 */
router.get('/preferences', asyncHandler(notificationController.getPreferences));

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update user notification preferences
 * @access  Private (any authenticated user)
 * @body    {boolean} enableInApp - Enable in-app notifications
 * @body    {boolean} enableEmail - Enable email notifications
 * @body    {boolean} enablePush - Enable push notifications
 * @body    {boolean} issueStatusUpdates - Enable issue status notifications
 * @body    {boolean} issueAssignments - Enable assignment notifications
 * @body    {boolean} issueComments - Enable comment notifications
 * @body    {boolean} issueEscalations - Enable escalation notifications
 * @body    {boolean} issueResolutions - Enable resolution notifications
 * @body    {boolean} systemAnnouncements - Enable system announcements
 * @body    {string} emailDigest - Email frequency (IMMEDIATE, HOURLY, DAILY, WEEKLY, NEVER)
 * @body    {number} quietHoursStart - Quiet hours start (0-23)
 * @body    {number} quietHoursEnd - Quiet hours end (0-23)
 */
router.put('/preferences', asyncHandler(notificationController.updatePreferences));

/**
 * @route   POST /api/notifications/test
 * @desc    Send test notification (development only)
 * @access  Private (any authenticated user)
 */
router.post('/test', asyncHandler(notificationController.sendTestNotification));

export default router;
