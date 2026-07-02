/**
 * Moderator Routes v1
 * Content moderation and issue triage operations
 * @module routes/v1/moderator
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { auth } from '../../../middlewares/auth.js';
import { validateCSRFToken } from '../../../middlewares/csrf.js';

const router = Router();

/**
 * GET /api/v1/moderator/stats
 * Get moderator statistics
 */
router.get('/stats', [
  auth(['MODERATOR', 'DEPT_ADMIN', 'MAYOR', 'SUPER_ADMIN'])
], async (req, res, next) => {
  try {
    const { getModeratorStats } = await import('../../../controllers/admin.controller.js');
    return getModeratorStats(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/moderator/pending
 * Get pending issues for moderation
 */
router.get('/pending', [
  auth(['MODERATOR', 'DEPT_ADMIN', 'MAYOR', 'SUPER_ADMIN']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res, next) => {
  try {
    const { getPendingIssues } = await import('../../../controllers/issue.controller.js');
    return getPendingIssues(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/moderator/history
 * Get moderator review history
 */
router.get('/history', [
  auth(['MODERATOR', 'DEPT_ADMIN', 'MAYOR', 'SUPER_ADMIN']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res, next) => {
  try {
    const { getModeratorHistory } = await import('../../../controllers/moderator.controller.js');
    return getModeratorHistory(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/moderator/departments
 * Get list of departments for assignment
 */
router.get('/departments', [
  auth(['MODERATOR', 'DEPT_ADMIN', 'MAYOR', 'SUPER_ADMIN'])
], async (req, res, next) => {
  try {
    const { getDepartments } = await import('../../../controllers/moderator.controller.js');
    return getDepartments(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/moderator/performance
 * Get moderator performance metrics
 */
router.get('/performance', [
  auth(['MODERATOR', 'DEPT_ADMIN', 'MAYOR', 'SUPER_ADMIN'])
], async (req, res, next) => {
  try {
    const { getModeratorPerformance } = await import('../../../controllers/moderator.controller.js');
    return getModeratorPerformance(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/moderator/issues/:id/check-duplicates
 * Check for duplicate issues
 */
router.get('/issues/:id/check-duplicates', [
  auth(['MODERATOR', 'DEPT_ADMIN', 'MAYOR', 'SUPER_ADMIN']),
  param('id').isString()
], async (req, res, next) => {
  try {
    const { checkDuplicates } = await import('../../../controllers/moderator.controller.js');
    return checkDuplicates(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/moderator/issues/:id/approve
 * Approve an issue and assign to department
 */
router.post('/issues/:id/approve', [
  auth(['MODERATOR', 'DEPT_ADMIN', 'MAYOR', 'SUPER_ADMIN']),
  validateCSRFToken,
  param('id').isString(),
  body('departmentId').isString(),
  body('priority').optional().isString(),
  body('notes').optional().isString()
], async (req, res, next) => {
  try {
    const { approveIssue } = await import('../../../controllers/moderator.controller.js');
    return approveIssue(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/moderator/issues/:id/reject
 * Reject an issue
 */
router.post('/issues/:id/reject', [
  auth(['MODERATOR', 'DEPT_ADMIN', 'MAYOR', 'SUPER_ADMIN']),
  validateCSRFToken,
  param('id').isString(),
  body('reason').isString().isLength({ min: 10, max: 500 })
], async (req, res, next) => {
  try {
    const { rejectIssue } = await import('../../../controllers/moderator.controller.js');
    return rejectIssue(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/moderator/issues/:id/request-info
 * Request more information from reporter
 */
router.post('/issues/:id/request-info', [
  auth(['MODERATOR', 'DEPT_ADMIN', 'MAYOR', 'SUPER_ADMIN']),
  validateCSRFToken,
  param('id').isString(),
  body('message').isString().isLength({ min: 10, max: 500 }),
  body('fields').optional().isArray()
], async (req, res, next) => {
  try {
    const { requestMoreInfo } = await import('../../../controllers/moderator.controller.js');
    return requestMoreInfo(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/moderator/issues/:id/mark-spam
 * Mark an issue as spam
 */
router.post('/issues/:id/mark-spam', [
  auth(['MODERATOR', 'DEPT_ADMIN', 'MAYOR', 'SUPER_ADMIN']),
  validateCSRFToken,
  param('id').isString(),
  body('reason').optional().isString()
], async (req, res, next) => {
  try {
    const { markAsSpam } = await import('../../../controllers/moderator.controller.js');
    return markAsSpam(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * Legacy endpoint - kept for backward compatibility
 * POST /api/v1/moderator/approve-assign
 * Approve and assign issue (legacy)
 */
router.post('/approve-assign', [
  auth(['MODERATOR', 'DEPT_ADMIN', 'MAYOR', 'SUPER_ADMIN']),
  validateCSRFToken,
  body('issueId').isString(),
  body('departmentId').isString(),
  body('priority').optional().isString(),
  body('notes').optional().isString()
], async (req, res, next) => {
  try {
    const { approveIssue } = await import('../../../controllers/moderator.controller.js');
    // Map legacy request to new format
    req.params.id = req.body.issueId;
    return approveIssue(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/moderator/announcements
 * Update global announcements
 */
router.put('/announcements', [
  auth(['MODERATOR', 'DEPT_ADMIN', 'MAYOR', 'SUPER_ADMIN']),
  validateCSRFToken,
  body('announcements').isArray()
], async (req, res, next) => {
  try {
    const { updateAnnouncements } = await import('../../../controllers/moderator.controller.js');
    return updateAnnouncements(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;
