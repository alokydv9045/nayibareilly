/**
 * Public Routes v1
 * No authentication required
 * @module routes/v1/public
 */

import { Router } from 'express';
import { query } from 'express-validator';
import { 
  getPublicStats, 
  getPublicReports, 
  getPublicCategories,
  getRecentActivity,
  getPublicMapData
} from '../../../controllers/public.controller.js';

const router = Router();

/**
 * GET /api/v1/public/stats
 * Get public statistics for homepage counters
 */
router.get('/stats', getPublicStats);

/**
 * GET /api/v1/public/reports
 * Get public reports feed with filtering and pagination
 */
router.get('/reports', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed', 'all']).withMessage('Invalid status'),
  query('sort').optional().isIn(['newest', 'oldest', 'votes']).withMessage('Invalid sort option'),
  query('search').optional().isString().withMessage('Search must be a string')
], getPublicReports);

/**
 * GET /api/v1/public/categories
 * Get public categories with counts
 */
router.get('/categories', getPublicCategories);

/**
 * GET /api/v1/public/activity
 * Get recent activity feed
 */
router.get('/activity', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], getRecentActivity);

/**
 * GET /api/v1/public/issues/map
 * Get public issues with location data for map visualization
 */
router.get('/issues/map', getPublicMapData);

export default router;
