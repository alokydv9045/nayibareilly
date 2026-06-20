/**
 * Health and Metrics Routes
 * System monitoring and health check endpoints
 * @module routes/v1/health
 */

import { Router } from 'express';
import { healthCheckEndpoint, readinessProbe, livenessProbe } from '../../../middlewares/monitoring/health.js';
import { getMetrics } from '../../../middlewares/monitoring/metrics.js';
import metricsService from '../../../services/monitoring/MetricsService.js';
import { auth } from '../../../middlewares/auth.js';
import { asyncErrorHandler } from '../../../utils/errorHandler.js';

const router = Router();

/**
 * GET /api/v1/health
 * Comprehensive health check
 */
router.get('/', healthCheckEndpoint());

/**
 * GET /api/v1/health/ready
 * Kubernetes readiness probe
 */
router.get('/ready', readinessProbe());

/**
 * GET /api/v1/health/live
 * Kubernetes liveness probe
 */
router.get('/live', livenessProbe());

/**
 * GET /api/v1/health/metrics
 * Get performance metrics (admin only)
 */
router.get('/metrics', auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR']), (req, res) => {
  const metrics = getMetrics();
  const businessMetrics = metricsService.getMetrics();
  
  res.json({
    timestamp: new Date().toISOString(),
    performance: metrics,
    business: businessMetrics.business,
    system: businessMetrics.system
  });
});

/**
 * GET /api/v1/health/metrics/summary
 * Get metrics summary for time period
 */
router.get('/metrics/summary', auth(['SUPER_ADMIN', 'DEPT_ADMIN', 'MAYOR']), asyncErrorHandler(async (req, res) => {
  const hours = parseInt(req.query.hours) || 1;
  const summary = await metricsService.getMetricsSummary(hours);
  
  res.json({
    timestamp: new Date().toISOString(),
    summary
  });
}));

export default router;
