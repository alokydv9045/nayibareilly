/**
 * Departments Routes - API v1
 * Department management endpoints
 * @module routes/v1/departments
 */

import { Router } from 'express';
import { body, query } from 'express-validator';
import { auth } from '../../../middlewares/auth.js';
import {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  getDepartmentIssues,
  getDepartmentStaff,
  assignIssueToStaff
} from '../../../controllers/department.controller.js';

const router = Router();

/**
 * GET /api/v1/departments
 * List all departments
 */
router.get('/', listDepartments);

/**
 * GET /api/v1/departments/:id
 * Get department by ID
 */
router.get('/:id', getDepartment);

/**
 * POST /api/v1/departments
 * Create new department
 */
router.post('/', [
  auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR']),
  body('name').isString().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isString(),
  body('contactEmail').optional().isEmail(),
  body('contactPhone').optional().isString()
], createDepartment);

/**
 * PATCH /api/v1/departments/:id
 * Update department
 */
router.patch('/:id', [
  auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR']),
  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isString(),
  body('contactEmail').optional().isEmail(),
  body('contactPhone').optional().isString()
], updateDepartment);

/**
 * DELETE /api/v1/departments/:id
 * Delete department
 */
router.delete('/:id', [
  auth(['SUPER_ADMIN'])
], async (req, res) => {
  // This will be implemented in department.controller.js
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

/**
 * GET /api/v1/departments/:id/issues
 * Get department issues
 */
router.get('/:id/issues', [
  auth(),
  query('status').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], getDepartmentIssues);

/**
 * GET /api/v1/departments/:id/staff
 * Get department staff
 */
router.get('/:id/staff', [
  auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR', 'MODERATOR'])
], getDepartmentStaff);

/**
 * POST /api/v1/departments/:id/assign
 * Assign issue to staff member
 */
router.post('/:id/assign', [
  auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR', 'MODERATOR']),
  body('issueId').isString().notEmpty(),
  body('staffId').isString().notEmpty()
], assignIssueToStaff);

export default router;
