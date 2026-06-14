/**
 * Issues Routes v1
 * Issue management and workflow operations
 * @module routes/v1/issues
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { auth } from '../../../middlewares/auth.js';
import { uploadFields, handleMulterError } from '../../../config/multer.js';
import { validateCSRFToken } from '../../../middlewares/csrf.js';
import { issueCreationRateLimit } from '../../../middlewares/rateLimit.js';

const router = Router();

/**
 * GET /api/v1/issues
 * List all issues with filtering and pagination
 */
router.get('/', [
  auth(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isString(),
  query('category').optional().isString(),
  query('department').optional().isString()
], async (req, res, next) => {
  try {
    // Import controller dynamically to maintain structure
    const { listIssues } = await import('../../../controllers/issue.controller.js');
    return listIssues(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/issues/check-duplicates
 * Check for duplicate issues near a location
 */
router.get('/check-duplicates', [
  auth(),
  query('lat').isFloat(),
  query('lng').isFloat(),
  query('categoryId').optional().isString(),
  query('radius').optional().isInt({ min: 100, max: 5000 })
], async (req, res, next) => {
  try {
    const { checkDuplicates } = await import('../../../controllers/issue.controller.js');
    return checkDuplicates(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/issues/my-issues
 * Get current user's issues
 */
router.get('/my-issues', [
  auth(['CITIZEN', 'STAFF', 'ADMIN', 'SUPER_ADMIN']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isString(),
  query('category').optional().isString()
], async (req, res, next) => {
  try {
    const { myIssues } = await import('../../../controllers/issue.controller.js');
    return myIssues(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/issues
 * Create a new issue
 */
router.post('/', [
  auth(['CITIZEN', 'STAFF', 'ADMIN', 'SUPER_ADMIN']),
  issueCreationRateLimit,
  validateCSRFToken,
  uploadFields.fields([{ name: 'images', maxCount: 5 }]),
  handleMulterError,
  body('title').isString().isLength({ min: 5, max: 200 }),
  body('description').isString().isLength({ min: 10, max: 2000 }),
  body('category').isString(),
  body('location').optional().custom((value) => {
    // Allow location to be an object or a valid JSON string
    if (typeof value === 'object' && value !== null) {
      return true
    }
    if (typeof value === 'string') {
      try {
        JSON.parse(value)
        return true
      } catch {
        throw new Error('Location must be a valid JSON string or object')
      }
    }
    return true
  })
], async (req, res, next) => {
  try {
    const { createIssue } = await import('../../../controllers/issue.controller.js');
    return createIssue(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/issues/:id
 * Get issue details by ID
 */

/**
 * GET /api/v1/issues/track/:reportId
 * Public access - lookup by public tracking code (reportId)
 */
router.get('/track/:reportId', [
  param('reportId').isString()
], async (req, res, next) => {
  try {
    const { getIssueByReportId } = await import('../../../controllers/issue.controller.js');
    return getIssueByReportId(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/issues/:id
 * Get issue details by ID
 */
router.get('/:id', [
  auth(),
  param('id').isString()
], async (req, res, next) => {
  try {
    const { getIssue } = await import('../../../controllers/issue.controller.js');
    return getIssue(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/issues/track/:reportId
 * Public access - lookup by public tracking code (reportId)
 */
router.get('/track/:reportId', [
  param('reportId').isString()
], async (req, res, next) => {
  try {
    const { getIssueByReportId } = await import('../../../controllers/issue.controller.js');
    return getIssueByReportId(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/issues/:id
 * Update issue details
 */
router.patch('/:id', [
  auth(),
  validateCSRFToken,
  param('id').isString(),
  body('title').optional().isString().isLength({ min: 5, max: 200 }),
  body('description').optional().isString().isLength({ min: 10, max: 2000 }),
  body('status').optional().isString()
], async (req, res, next) => {
  try {
    const { updateIssue } = await import('../../../controllers/issue.controller.js');
    return updateIssue(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/issues/:id
 * Delete an issue (soft delete)
 */
router.delete('/:id', [
  auth(['ADMIN', 'SUPER_ADMIN']),
  validateCSRFToken,
  param('id').isString()
], async (req, res, next) => {
  try {
    const { deleteIssue } = await import('../../../controllers/issue.controller.js');
    return deleteIssue(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/issues/:id/vote
 * Vote on an issue
 */
router.post('/:id/vote', [
  auth(),
  validateCSRFToken,
  param('id').isString(),
  body('type').isIn(['up', 'down'])
], async (req, res, next) => {
  try {
    const { voteIssue } = await import('../../../controllers/issue.controller.js');
    return voteIssue(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/issues/:id/timeline
 * Get issue timeline/history
 */
router.get('/:id/timeline', [
  auth(),
  param('id').isString()
], async (req, res, next) => {
  try {
    const { getIssueTimeline } = await import('../../../controllers/issue.controller.js');
    return getIssueTimeline(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/issues/my-assigned
 * Get issues assigned to current staff member
 */
router.get('/my-assigned', [
  auth(['STAFF', 'ADMIN', 'SUPER_ADMIN']),
  query('status').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res, next) => {
  try {
    const { listAssignedToMe } = await import('../../../controllers/issue.controller.js');
    return listAssignedToMe(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/issues/:id/start
 * Start work on an assigned issue (ASSIGNED_TO_STAFF → IN_PROGRESS)
 */
router.put('/:id/start', [
  auth(['STAFF', 'ADMIN', 'SUPER_ADMIN']),
  validateCSRFToken,
  param('id').isString(),
  body('note').optional().isString()
], async (req, res, next) => {
  try {
    const { startWork } = await import('../../../controllers/issue.controller.js');
    return startWork(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/issues/:id/resolve
 * Resolve an issue with completion photos (IN_PROGRESS → RESOLVED)
 */
router.put('/:id/resolve', [
  auth(['STAFF', 'ADMIN', 'SUPER_ADMIN']),
  validateCSRFToken,
  uploadFields.fields([{ name: 'media', maxCount: 5 }]),
  handleMulterError,
  param('id').isString(),
  body('note').optional().isString()
], async (req, res, next) => {
  try {
    const { resolveIssue } = await import('../../../controllers/issue.controller.js');
    return resolveIssue(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/issues/:id/comments
 * Add a comment to an issue
 */
router.post('/:id/comments', [
  auth(),
  validateCSRFToken,
  param('id').isString(),
  body('comment').isString().isLength({ min: 1, max: 1000 })
], async (req, res, next) => {
  try {
    const { addIssueComment } = await import('../../../controllers/issue.controller.js');
    return addIssueComment(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/issues/:id/escalate
 * Escalate an issue that can't be resolved
 */
router.post('/:id/escalate', [
  auth(['STAFF', 'ADMIN', 'SUPER_ADMIN']),
  validateCSRFToken,
  param('id').isString(),
  body('reason').isString().isLength({ min: 10, max: 500 })
], async (req, res, next) => {
  try {
    const { escalateIssue } = await import('../../../controllers/issue.controller.js');
    return escalateIssue(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;
