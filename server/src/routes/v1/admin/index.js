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
  getDepartmentRealtimeStats,
<<<<<<< HEAD
  getSuperAdminUsers,
  createSuperAdminUser,
  updateSuperAdminUser,
  deleteSuperAdminUser
, updateUserRoles, activateUser, deactivateUser, getCategory, updateCategory, deleteCategory, getActivityLogs } from '../../../controllers/admin.controller.js';
=======
  updateUserRoles,
  activateUser,
  deactivateUser,
  getCategory,
  updateCategory,
  deleteCategory,
  getActivityLogs
} from '../../../controllers/admin.controller.js';

import techAdminRoutes from './techadmin.js';
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9

const router = Router();

/**
 * GET /api/v1/admin/dashboard
 * Get admin dashboard statistics
 */
router.get('/dashboard', [
  auth(['SUPER_ADMIN', 'TECH_ADMIN', 'DEPT_ADMIN', 'MAYOR', 'MODERATOR'])
], dashboard);

/**
 * GET /api/v1/admin/analytics
 * Get analytics data
 */
router.get('/analytics', [
  auth(['SUPER_ADMIN', 'TECH_ADMIN', 'DEPT_ADMIN', 'MAYOR']),
  query('period').optional().isIn(['day', 'week', 'month', 'year']),
  query('departmentId').optional().isString(),
  query('categoryId').optional().isString()
], analytics);

/**
 * GET /api/v1/admin/stats/issues
 * Get aggregated issue statistics for frontend dashboard
 */
router.get('/stats/issues', [
  auth(['SUPER_ADMIN', 'TECH_ADMIN', 'DEPT_ADMIN', 'MAYOR', 'MODERATOR'])
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
  auth(['SUPER_ADMIN', 'TECH_ADMIN', 'DEPT_ADMIN', 'MAYOR', 'MODERATOR'])
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
  auth(['SUPER_ADMIN', 'TECH_ADMIN', 'DEPT_ADMIN', 'MAYOR']),
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
  auth(['SUPER_ADMIN', 'TECH_ADMIN']),
  body('roles').isArray().notEmpty()
], updateUserRoles);

/**
 * PATCH /api/v1/admin/users/:userId/activate
 * Activate user account
 */
router.patch('/users/:userId/activate', [
  auth(['SUPER_ADMIN', 'TECH_ADMIN', 'DEPT_ADMIN', 'MAYOR'])
], activateUser);

/**
 * PATCH /api/v1/admin/users/:userId/deactivate
 * Deactivate user account
 */
router.patch('/users/:userId/deactivate', [
  auth(['SUPER_ADMIN', 'TECH_ADMIN', 'DEPT_ADMIN', 'MAYOR'])
], deactivateUser);

/**
 * GET /api/v1/admin/activity-logs
 * Get activity logs
 */
router.get('/activity-logs', [
  auth(['SUPER_ADMIN', 'TECH_ADMIN', 'DEPT_ADMIN', 'MAYOR']),
  query('userId').optional().isString(),
  query('issueId').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], getActivityLogs);

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
], getCategory);

/**
 * POST /api/v1/admin/categories
 * Create new category
 */
router.post('/categories', [
  auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR']),
  body('name').isString().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isString(),
  body('icon').optional().isString()
], createCategory);

/**
 * PATCH /api/v1/admin/categories/:id
 * Update category
 */
router.patch('/categories/:id', [
  auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR']),
  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isString(),
  body('icon').optional().isString()
], updateCategory);

/**
 * DELETE /api/v1/admin/categories/:id
 * Delete category
 */
router.delete('/categories/:id', [
  auth(['SUPER_ADMIN'])
], deleteCategory);

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
  auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR'])
], getRealtimeUserCount);

/**
 * GET /api/v1/admin/organization-stats
 * Get organization statistics
 */
router.get('/organization-stats', [
  auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR'])
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
<<<<<<< HEAD
 * GET /api/v1/admin/superadmin/users
 * Get all users for superadmin
 */
router.get('/superadmin/users', [
  auth(['SUPER_ADMIN'])
], getSuperAdminUsers);

/**
 * POST /api/v1/admin/superadmin/users
 * Create a new user from superadmin dashboard
 */
router.post('/superadmin/users', [
  auth(['SUPER_ADMIN'])
], createSuperAdminUser);

/**
 * PUT /api/v1/admin/superadmin/users/:userId
 * Update a user from superadmin dashboard
 */
router.put('/superadmin/users/:userId', [
  auth(['SUPER_ADMIN'])
], updateSuperAdminUser);

/**
 * DELETE /api/v1/admin/superadmin/users/:userId
 * Delete a user from superadmin dashboard
 */
router.delete('/superadmin/users/:userId', [
  auth(['SUPER_ADMIN'])
], deleteSuperAdminUser);
=======
 * GET /api/v1/admin/techadmin/stats
 * Get techadmin statistics (alias for superadmin stats)
 */
router.get('/techadmin/stats', [
  auth(['TECH_ADMIN', 'SUPER_ADMIN'])
], getSuperAdminStats);

/**
 * GET /api/v1/admin/techadmin/realtime-issues
 * Get realtime issues for techadmin (alias for superadmin realtime issues)
 */
router.get('/techadmin/realtime-issues', [
  auth(['TECH_ADMIN', 'SUPER_ADMIN'])
], getSuperAdminRealtimeIssues);

/**
 * GET /api/v1/admin/techadmin/moderator-performance
 * Get moderator performance metrics for techadmin (alias for superadmin moderator performance)
 */
router.get('/techadmin/moderator-performance', [
  auth(['TECH_ADMIN', 'SUPER_ADMIN'])
], getSuperAdminModeratorPerformance);
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9

/**
 * GET /api/v1/admin/department/:departmentId/issues
 * Get department assigned issues
 */
router.get('/department/:departmentId/issues', [
  auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR', 'MODERATOR'])
], getDepartmentAssignedIssues);

/**
 * GET /api/v1/admin/department/:departmentId/staff
 * Get department staff
 */
router.get('/department/:departmentId/staff', [
  auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR'])
], getDepartmentStaff);

/**
 * GET /api/v1/admin/department/:departmentId/stats
 * Get department statistics
 */
router.get('/department/:departmentId/stats', [
  auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR'])
], getDepartmentStats);

/**
 * GET /api/v1/admin/department/:departmentId/realtime-stats
 * Get department realtime statistics
 */
router.get('/department/:departmentId/realtime-stats', [
  auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR', 'MODERATOR'])
], getDepartmentRealtimeStats);

/**
 * GET /api/v1/admin/moderator/stats
 * Get moderator statistics
 */
router.get('/moderator/stats', [
  auth(['MODERATOR', 'DEPT_ADMIN', 'MAYOR', 'SUPER_ADMIN'])
], getModeratorStats);

/**
 * GET /api/v1/admin/moderator/pending
 * Get moderator pending tasks
 */
router.get('/moderator/pending', [
  auth(['MODERATOR', 'DEPT_ADMIN', 'MAYOR', 'SUPER_ADMIN'])
], getModeratorPending);

/**
 * Mount Tech Admin specific routes
 */
router.use('/techadmin', techAdminRoutes);

export default router;
