/**
 * Health Check Middleware
 * Monitors system health and dependencies
 * @module middlewares/monitoring/health
 */

import { PrismaClient } from '@prisma/client';
import { getRedisClient } from '../../config/redis.js';

const prisma = new PrismaClient();

/**
 * Health check status
 */
const healthStatus = {
  status: 'healthy',
  lastCheck: null,
  checks: {}
};

/**
 * Check database health
 */
async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      message: 'Database connection active',
      responseTime: Date.now()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Database connection failed',
      error: error.message
    };
  }
}

/**
 * Check Redis health
 */
async function checkRedis() {
  try {
    const redis = getRedisClient();
    if (!redis || redis.status !== 'ready') {
      return {
        status: 'degraded',
        message: 'Redis not available (caching disabled)',
        responseTime: Date.now()
      };
    }

    await redis.ping();
    return {
      status: 'healthy',
      message: 'Redis connection active',
      responseTime: Date.now()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Redis connection failed',
      error: error.message
    };
  }
}

/**
 * Check system resources
 */
function checkSystemResources() {
  const usage = process.memoryUsage();
  const memoryUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;
  
  let status = 'healthy';
  if (memoryUsagePercent > 90) {
    status = 'critical';
  } else if (memoryUsagePercent > 80) {
    status = 'degraded';
  }

  return {
    status,
    memory: {
      heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      usage: `${memoryUsagePercent.toFixed(2)}%`
    },
    uptime: `${(process.uptime() / 60).toFixed(2)} minutes`,
    pid: process.pid
  };
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck() {
  const startTime = Date.now();
  
  try {
    const [database, redis, system] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      Promise.resolve(checkSystemResources())
    ]);

    const checks = {
      database,
      redis,
      system
    };

    // Determine overall status
    let overallStatus = 'healthy';
    if (Object.values(checks).some(check => check.status === 'unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (Object.values(checks).some(check => check.status === 'degraded' || check.status === 'critical')) {
      overallStatus = 'degraded';
    }

    const result = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`,
      checks,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    // Update cached status
    healthStatus.status = overallStatus;
    healthStatus.lastCheck = result.timestamp;
    healthStatus.checks = checks;

    return result;
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      checks: {}
    };
  }
}

/**
 * Health check endpoint middleware
 */
export function healthCheckEndpoint() {
  return async (req, res) => {
    const health = await performHealthCheck();
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(health);
  };
}

/**
 * Readiness probe (for Kubernetes)
 */
export function readinessProbe() {
  return async (req, res) => {
    try {
      // Check if critical services are ready
      const dbCheck = await checkDatabase();
      
      if (dbCheck.status === 'healthy') {
        res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
      } else {
        res.status(503).json({ status: 'not ready', reason: 'database unavailable' });
      }
    } catch (error) {
      res.status(503).json({ status: 'not ready', error: error.message });
    }
  };
}

/**
 * Liveness probe (for Kubernetes)
 */
export function livenessProbe() {
  return (req, res) => {
    // Simple liveness check - if process is running, it's alive
    res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
  };
}

export default healthCheckEndpoint;
