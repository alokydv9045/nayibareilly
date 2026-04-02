/**
 * Metrics Collection Service
 * Centralized metrics collection and reporting
 * @module services/monitoring/MetricsService
 */

import { getRedisClient } from '../../config/redis.js';

class MetricsService {
  constructor() {
    this.metrics = {
      api: {
        requests: 0,
        errors: 0,
        latency: []
      },
      business: {
        issuesCreated: 0,
        issuesResolved: 0,
        usersRegistered: 0
      },
      system: {
        cpuUsage: [],
        memoryUsage: [],
        activeConnections: 0
      }
    };
  }

  /**
   * Record API request
   */
  recordRequest(method, path, statusCode, latency) {
    this.metrics.api.requests++;
    this.metrics.api.latency.push(latency);
    
    if (statusCode >= 400) {
      this.metrics.api.errors++;
    }

    // Keep only last 1000 latency records
    if (this.metrics.api.latency.length > 1000) {
      this.metrics.api.latency = this.metrics.api.latency.slice(-1000);
    }

    // Store in Redis for persistence
    this.persistMetric('api_request', {
      method,
      path,
      statusCode,
      latency,
      timestamp: Date.now()
    });
  }

  /**
   * Record business event
   */
  recordBusinessEvent(eventType, data = {}) {
    switch (eventType) {
      case 'issue_created':
        this.metrics.business.issuesCreated++;
        break;
      case 'issue_resolved':
        this.metrics.business.issuesResolved++;
        break;
      case 'user_registered':
        this.metrics.business.usersRegistered++;
        break;
    }

    this.persistMetric('business_event', {
      eventType,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Record system metrics
   */
  recordSystemMetrics() {
    const usage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.system.memoryUsage.push(usage.heapUsed);
    this.metrics.system.cpuUsage.push(cpuUsage.user + cpuUsage.system);

    // Keep only last 100 measurements
    if (this.metrics.system.memoryUsage.length > 100) {
      this.metrics.system.memoryUsage = this.metrics.system.memoryUsage.slice(-100);
      this.metrics.system.cpuUsage = this.metrics.system.cpuUsage.slice(-100);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    const avgLatency = this.metrics.api.latency.length > 0
      ? this.metrics.api.latency.reduce((a, b) => a + b, 0) / this.metrics.api.latency.length
      : 0;

    return {
      api: {
        totalRequests: this.metrics.api.requests,
        errors: this.metrics.api.errors,
        errorRate: this.metrics.api.requests > 0
          ? ((this.metrics.api.errors / this.metrics.api.requests) * 100).toFixed(2) + '%'
          : '0%',
        avgLatency: avgLatency.toFixed(2) + 'ms'
      },
      business: {
        issuesCreated: this.metrics.business.issuesCreated,
        issuesResolved: this.metrics.business.issuesResolved,
        usersRegistered: this.metrics.business.usersRegistered,
        resolutionRate: this.metrics.business.issuesCreated > 0
          ? ((this.metrics.business.issuesResolved / this.metrics.business.issuesCreated) * 100).toFixed(2) + '%'
          : '0%'
      },
      system: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        activeConnections: this.metrics.system.activeConnections
      }
    };
  }

  /**
   * Persist metric to Redis
   */
  async persistMetric(type, data) {
    try {
      const redis = getRedisClient();
      if (!redis || redis.status !== 'ready') return;

      const key = `metrics:${type}:${Date.now()}`;
      await redis.setex(key, 86400, JSON.stringify(data)); // 24 hour TTL
    } catch (error) {
      console.error('[Metrics] Error persisting metric:', error);
    }
  }

  /**
   * Get metrics summary for time period
   */
  async getMetricsSummary(hours = 1) {
    try {
      const redis = getRedisClient();
      if (!redis || redis.status !== 'ready') {
        return this.getMetrics();
      }

      const now = Date.now();
      const since = now - (hours * 60 * 60 * 1000);
      
      const keys = await redis.keys('metrics:*');
      const metrics = [];
      
      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          const metric = JSON.parse(data);
          if (metric.timestamp >= since) {
            metrics.push(metric);
          }
        }
      }

      return {
        period: `${hours} hour(s)`,
        count: metrics.length,
        metrics: this.getMetrics()
      };
    } catch (error) {
      console.error('[Metrics] Error getting summary:', error);
      return this.getMetrics();
    }
  }
}

// Singleton instance
const metricsService = new MetricsService();

// Collect system metrics every 30 seconds
setInterval(() => {
  metricsService.recordSystemMetrics();
}, 30000);

export default metricsService;
