import { Router } from 'express'
import { auth } from '../../../middlewares/auth.js'
import {
  getMayorStats,
  getMayorDepartmentPerformance,
  getMayorRecentIssues,
  getMayorAnalytics
} from '../../../controllers/mayor.controller.js'

const router = Router()

// All mayor routes require at least MAYOR or TECH_ADMIN roles
router.use(auth(['MAYOR', 'TECH_ADMIN']))

/**
 * GET /api/v1/mayor/stats
 * Get mayor overview stats
 */
router.get('/stats', getMayorStats)

/**
 * GET /api/v1/mayor/departments/performance
 * Get department performance comparison
 */
router.get('/departments/performance', getMayorDepartmentPerformance)

/**
 * GET /api/v1/mayor/issues/recent
 * Get recent live issues
 */
router.get('/issues/recent', getMayorRecentIssues)

/**
 * GET /api/v1/mayor/analytics
 * Get deep city analytics data
 */
router.get('/analytics', getMayorAnalytics)

export default router
