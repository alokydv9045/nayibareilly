/**
 * Admin Routes - API v1
 * Administrative endpoints for dashboard, analytics, and user management
 * @module routes/v1/admin
 */

import { Router } from 'express';
import { body, query } from 'express-validator';
import { auth } from '../../../middlewares/auth.js';
import {
  dashboard,
  listUsers,
  analytics,
  getSuperAdminStats,
  getSuperAdminRealtimeIssues,
  getSuperAdminModeratorPerformance,
  getDepartmentAssignedIssues,
  getDepartmentStaff,
  getDepartmentStats,
  createCategory,
  listCategories,
  leaderboard,
  getSystemStats,
  getRealtimeUserCount,
  getOrganizationStats,
  getModeratorStats,
  getModeratorPending,
  getDepartmentRealtimeStats
} from '../../../controllers/admin.controller.js';

const router = Router();

/**
 * GET /api/v1/admin/dashboard
 * Get admin dashboard statistics
 */
router.get('/dashboard', [
  auth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR'])
], dashboard);

/**
 * GET /api/v1/admin/analytics
 * Get analytics data
 */
router.get('/analytics', [
  auth(['SUPER_ADMIN', 'ADMIN']),
  query('period').optional().isIn(['day', 'week', 'month', 'year']),
  query('departmentId').optional().isString(),
  query('categoryId').optional().isString()
], analytics);

/**
 * GET /api/v1/admin/stats/issues
 * Get aggregated issue statistics for frontend dashboard
 */
router.get('/stats/issues', [
  auth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'DEPT_ADMIN'])
], async (req, res) => {
  try {
    // Use the existing analytics controller or create a simple stats response
    const { getPublicStats } = await import('../../../controllers/public.controller.js')
    await getPublicStats(req, res)
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch issue stats', error: error.message })
  }
});

/**
 * GET /api/v1/admin/stats
 * Get general dashboard statistics (alias for /stats/issues for backward compatibility)
 */
router.get('/stats', [
  auth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'DEPT_ADMIN'])
], async (req, res) => {
  try {
    // Use the existing analytics controller or create a simple stats response
    const { getPublicStats } = await import('../../../controllers/public.controller.js')
    await getPublicStats(req, res)
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error: error.message })
  }
});

/**
 * GET /api/v1/admin/users
 * List all users with filters
 */
router.get('/users', [
  auth(['SUPER_ADMIN', 'ADMIN']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isString(),
  query('search').optional().isString()
], listUsers);

/**
 * PATCH /api/v1/admin/users/:userId/roles
 * Update user roles
 */
router.patch('/users/:userId/roles', [
  auth(['SUPER_ADMIN']),
  body('roles').isArray().notEmpty()
], async (req, res) => {
  // This will be implemented in admin.controller.js
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

/**
 * PATCH /api/v1/admin/users/:userId/activate
 * Activate user account
 */
router.patch('/users/:userId/activate', [
  auth(['SUPER_ADMIN', 'ADMIN'])
], async (req, res) => {
  // This will be implemented in admin.controller.js
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

/**
 * PATCH /api/v1/admin/users/:userId/deactivate
 * Deactivate user account
 */
router.patch('/users/:userId/deactivate', [
  auth(['SUPER_ADMIN', 'ADMIN'])
], async (req, res) => {
  // This will be implemented in admin.controller.js
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

/**
 * GET /api/v1/admin/activity-logs
 * Get activity logs
 */
router.get('/activity-logs', [
  auth(['SUPER_ADMIN', 'ADMIN']),
  query('userId').optional().isString(),
  query('issueId').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  // This will be implemented in admin.controller.js
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

/**
 * GET /api/v1/admin/categories
 * List all issue categories
 */
router.get('/categories', [
  auth()
], listCategories);

/**
 * GET /api/v1/admin/categories/:id
 * Get category by ID
 */
router.get('/categories/:id', [
  auth()
], async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

/**
 * POST /api/v1/admin/categories
 * Create new category
 */
router.post('/categories', [
  auth(['SUPER_ADMIN', 'ADMIN']),
  body('name').isString().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isString(),
  body('icon').optional().isString()
], createCategory);

/**
 * PATCH /api/v1/admin/categories/:id
 * Update category
 */
router.patch('/categories/:id', [
  auth(['SUPER_ADMIN', 'ADMIN']),
  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isString(),
  body('icon').optional().isString()
], async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

/**
 * DELETE /api/v1/admin/categories/:id
 * Delete category
 */
router.delete('/categories/:id', [
  auth(['SUPER_ADMIN'])
], async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

/**
 * GET /api/v1/admin/leaderboard
 * Get leaderboard
 */
router.get('/leaderboard', [
  auth()
], leaderboard);

/**
 * GET /api/v1/admin/system-stats
 * Get system statistics
 */
router.get('/system-stats', [
  auth(['SUPER_ADMIN'])
], getSystemStats);

/**
 * GET /api/v1/admin/realtime-users
 * Get realtime user count
 */
router.get('/realtime-users', [
  auth(['SUPER_ADMIN', 'ADMIN'])
], getRealtimeUserCount);

/**
 * GET /api/v1/admin/organization-stats
 * Get organization statistics
 */
router.get('/organization-stats', [
  auth(['SUPER_ADMIN', 'ADMIN'])
], getOrganizationStats);

/**
 * GET /api/v1/admin/superadmin/stats
 * Get superadmin statistics
 */
router.get('/superadmin/stats', [
  auth(['SUPER_ADMIN'])
], getSuperAdminStats);

/**
 * GET /api/v1/admin/superadmin/realtime-issues
 * Get realtime issues for superadmin
 */
router.get('/superadmin/realtime-issues', [
  auth(['SUPER_ADMIN'])
], getSuperAdminRealtimeIssues);

/**
 * GET /api/v1/admin/superadmin/moderator-performance
 * Get moderator performance metrics
 */
router.get('/superadmin/moderator-performance', [
  auth(['SUPER_ADMIN'])
], getSuperAdminModeratorPerformance);

/**
 * GET /api/v1/admin/department/:departmentId/issues
 * Get department assigned issues
 */
router.get('/department/:departmentId/issues', [
  auth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR'])
], getDepartmentAssignedIssues);

/**
 * GET /api/v1/admin/department/:departmentId/staff
 * Get department staff
 */
router.get('/department/:departmentId/staff', [
  auth(['SUPER_ADMIN', 'ADMIN'])
], getDepartmentStaff);

/**
 * GET /api/v1/admin/department/:departmentId/stats
 * Get department statistics
 */
router.get('/department/:departmentId/stats', [
  auth(['SUPER_ADMIN', 'ADMIN'])
], getDepartmentStats);

/**
 * GET /api/v1/admin/department/:departmentId/realtime-stats
 * Get department realtime statistics
 */
router.get('/department/:departmentId/realtime-stats', [
  auth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR'])
], getDepartmentRealtimeStats);

/**
 * GET /api/v1/admin/moderator/stats
 * Get moderator statistics
 */
router.get('/moderator/stats', [
  auth(['MODERATOR', 'ADMIN', 'SUPER_ADMIN'])
], getModeratorStats);

/**
 * GET /api/v1/admin/moderator/pending
 * Get moderator pending tasks
 */
router.get('/moderator/pending', [
  auth(['MODERATOR', 'ADMIN', 'SUPER_ADMIN'])
], getModeratorPending);

export default router;
