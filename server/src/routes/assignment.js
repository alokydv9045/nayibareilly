import express from 'express';
import * as assignmentController from '../controllers/assignmentController.js';
import { auth } from '../middlewares/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

/**
 * @route   POST /api/issues/:id/assign
 * @desc    Assign an issue to a staff member
 * @access  Moderator, Staff
 */
router.post(
  '/issues/:id/assign',
  auth(['moderator', 'staff']),
  asyncHandler(assignmentController.assignIssue)
);

/**
 * @route   POST /api/issues/:id/reassign
 * @desc    Reassign an issue to a different staff member
 * @access  Moderator, Staff
 */
router.post(
  '/issues/:id/reassign',
  auth(['moderator', 'staff']),
  asyncHandler(assignmentController.reassignIssue)
);

/**
 * @route   POST /api/issues/:id/unassign
 * @desc    Unassign an issue
 * @access  Moderator, Staff
 */
router.post(
  '/issues/:id/unassign',
  auth(['moderator', 'staff']),
  asyncHandler(assignmentController.unassignIssue)
);

/**
 * @route   GET /api/issues/:id/assignment
 * @desc    Get current assignment for an issue
 * @access  Authenticated users
 */
router.get(
  '/issues/:id/assignment',
  auth(),
  asyncHandler(assignmentController.getCurrentAssignment)
);

/**
 * @route   GET /api/issues/:id/assignment-history
 * @desc    Get assignment history for an issue
 * @access  Authenticated users
 */
router.get(
  '/issues/:id/assignment-history',
  auth(),
  asyncHandler(assignmentController.getAssignmentHistory)
);

/**
 * @route   GET /api/staff
 * @desc    Get list of staff members with workload
 * @access  Moderator, Staff
 */
router.get(
  '/staff',
  auth(['moderator', 'staff']),
  asyncHandler(assignmentController.getStaffList)
);

/**
 * @route   GET /api/staff/:id/workload
 * @desc    Get workload details for a specific staff member
 * @access  Moderator, Staff
 */
router.get(
  '/staff/:id/workload',
  auth(['moderator', 'staff']),
  asyncHandler(assignmentController.getStaffWorkload)
);

export default router;
