/**
 * Performance Metrics Middleware
 * Collects and tracks API performance metrics
 * @module middlewares/monitoring/metrics
 */

import { getRedisClient } from '../../config/redis.js';

/**
 * Store performance metrics
 */
const metrics = {
  requests: {
    total: 0,
    success: 0,
    errors: 0,
    byMethod: {},
    byRoute: {}
  },
  latency: {
    p50: [],
    p95: [],
    p99: []
  },
  errors: [],
  activeConnections: 0
};

/**
 * Calculate percentile
 */
function calculatePercentile(arr, percentile) {
  if (arr.length === 0) return 0;
  const sorted = arr.slice().sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

/**
 * Performance metrics middleware
 */
export function metricsMiddleware() {
  return (req, res, next) => {
    const startTime = Date.now();
    metrics.activeConnections++;
    metrics.requests.total++;

    // Track by method
    metrics.requests.byMethod[req.method] = (metrics.requests.byMethod[req.method] || 0) + 1;

    // Track by route
    const route = req.route?.path || req.path;
    metrics.requests.byRoute[route] = (metrics.requests.byRoute[route] || 0) + 1;

    // Intercept response finish
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      // Record latency
      metrics.latency.p50.push(duration);
      metrics.latency.p95.push(duration);
      metrics.latency.p99.push(duration);

      // Keep only last 1000 measurements
      if (metrics.latency.p50.length > 1000) {
        metrics.latency.p50 = metrics.latency.p50.slice(-1000);
        metrics.latency.p95 = metrics.latency.p95.slice(-1000);
        metrics.latency.p99 = metrics.latency.p99.slice(-1000);
      }

      // Track success/error
      if (res.statusCode >= 200 && res.statusCode < 400) {
        metrics.requests.success++;
      } else {
        metrics.requests.errors++;
        if (res.statusCode >= 500) {
          metrics.errors.push({
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            timestamp: new Date().toISOString()
          });
          // Keep only last 100 errors
          if (metrics.errors.length > 100) {
            metrics.errors = metrics.errors.slice(-100);
          }
        }
      }

      metrics.activeConnections--;

      // Add response headers
      res.setHeader('X-Response-Time', `${duration}ms`);

      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Get current metrics
 */
export function getMetrics() {
  return {
    requests: {
      total: metrics.requests.total,
      success: metrics.requests.success,
      errors: metrics.requests.errors,
      errorRate: metrics.requests.total > 0 
        ? ((metrics.requests.errors / metrics.requests.total) * 100).toFixed(2) + '%'
        : '0%',
      byMethod: metrics.requests.byMethod,
      topRoutes: Object.entries(metrics.requests.byRoute)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([route, count]) => ({ route, count }))
    },
    latency: {
      p50: calculatePercentile(metrics.latency.p50, 50) + 'ms',
      p95: calculatePercentile(metrics.latency.p95, 95) + 'ms',
      p99: calculatePercentile(metrics.latency.p99, 99) + 'ms',
      avg: metrics.latency.p50.length > 0
        ? (metrics.latency.p50.reduce((a, b) => a + b, 0) / metrics.latency.p50.length).toFixed(2) + 'ms'
        : '0ms'
    },
    connections: {
      active: metrics.activeConnections
    },
    recentErrors: metrics.errors.slice(-10),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
}

/**
 * Reset metrics
 */
export function resetMetrics() {
  metrics.requests.total = 0;
  metrics.requests.success = 0;
  metrics.requests.errors = 0;
  metrics.requests.byMethod = {};
  metrics.requests.byRoute = {};
  metrics.latency.p50 = [];
  metrics.latency.p95 = [];
  metrics.latency.p99 = [];
  metrics.errors = [];
}

export default metricsMiddleware;
