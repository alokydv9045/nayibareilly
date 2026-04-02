import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  delta?: number;
  id?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  rating?: 'good' | 'needs-improvement' | 'poor' | 'info';
  metadata?: Record<string, unknown>;
  deviceMemory?: number;
  connectionType?: NetworkConnection | null;
  sessionId?: string;
  connection?: {
    effectiveType: string;
    type: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
}

interface NetworkConnection {
  effectiveType: string;
  type: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

declare global {
  interface Navigator {
    connection?: NetworkConnection;
    mozConnection?: NetworkConnection;
    webkitConnection?: NetworkConnection;
    deviceMemory?: number;
  }
  
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric>;
  private observers: Map<string, PerformanceObserver>;
  private isInitialized: boolean;
  private reportEndpoint: string;
  private batchSize: number;
  private batchTimeout: number;
  private pendingMetrics: PerformanceMetric[];
  private batchTimer: NodeJS.Timeout | null;

  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isInitialized = false;
    this.reportEndpoint = '/api/v1/admin/analytics/performance';
    this.batchSize = 10;
    this.batchTimeout = 5000; // 5 seconds
    this.pendingMetrics = [];
    this.batchTimer = null;
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      this.initWebVitals();
      this.initCustomMetrics();
      this.initResourceObserver();
      this.initNavigationObserver();
      this.initErrorTracking();
      
      this.isInitialized = true;
      console.log('🚀 Performance monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  initWebVitals() {
    // Core Web Vitals - use modern API
    onCLS(this.reportMetric.bind(this));
    onINP(this.reportMetric.bind(this)); // INP replaced FID in newer versions
    onFCP(this.reportMetric.bind(this));
    onLCP(this.reportMetric.bind(this));
    onTTFB(this.reportMetric.bind(this));
  }

  /**
   * Initialize custom performance metrics
   */
  initCustomMetrics() {
    // Page load time
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.reportMetric({
        name: 'page_load_time',
        value: loadTime,
        rating: loadTime < 3000 ? 'good' : loadTime < 5000 ? 'needs-improvement' : 'poor'
      });
    }

    // DOM Content Loaded
    if (performance.timing) {
      const domContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
      this.reportMetric({
        name: 'dom_content_loaded',
        value: domContentLoaded,
        rating: domContentLoaded < 1500 ? 'good' : domContentLoaded < 2500 ? 'needs-improvement' : 'poor'
      });
    }

    // Memory usage (if available)
    if (performance.memory) {
      this.reportMetric({
        name: 'memory_used',
        value: performance.memory.usedJSHeapSize,
        rating: 'info'
      });
    }
  }

  /**
   * Initialize resource loading observer
   */
  initResourceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              this.trackResourcePerformance(entry as PerformanceResourceTiming);
            }
          });
        });

        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }
    }
  }

  /**
   * Initialize navigation observer
   */
  initNavigationObserver() {
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.trackNavigationPerformance(entry as PerformanceNavigationTiming);
            }
          });
        });

        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }
    }
  }

  /**
   * Initialize error tracking
   */
  initErrorTracking() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportMetric({
        name: 'javascript_error',
        value: 1,
        rating: 'poor',
        metadata: {
          message: event.message,
          filename: event.filename,
          line: event.lineno,
          column: event.colno,
          stack: event.error?.stack
        }
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportMetric({
        name: 'unhandled_rejection',
        value: 1,
        rating: 'poor',
        metadata: {
          reason: event.reason?.toString() || 'Unknown rejection'
        }
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        this.reportMetric({
          name: 'resource_error',
          value: 1,
          rating: 'poor',
          metadata: {
            tagName: (event.target as Element)?.tagName || 'UNKNOWN',
            source: (event.target as HTMLImageElement)?.src || 
                   (event.target as HTMLAnchorElement)?.href || 'unknown',
            type: 'load_error'
          }
        });
      }
    }, true);
  }

  /**
   * Track resource performance
   */
  trackResourcePerformance(entry: PerformanceResourceTiming) {
    const { name, transferSize, duration, responseEnd, responseStart } = entry;
    
    // Large resource detection
    if (transferSize > 500000) { // 500KB
      this.reportMetric({
        name: 'large_resource',
        value: transferSize,
        rating: 'needs-improvement',
        metadata: {
          url: name,
          size: transferSize,
          duration: duration
        }
      });
    }

    // Slow resource detection
    if (duration > 2000) { // 2 seconds
      this.reportMetric({
        name: 'slow_resource',
        value: duration,
        rating: 'poor',
        metadata: {
          url: name,
          duration: duration,
          responseTime: responseEnd - responseStart
        }
      });
    }

    // Track API response times
    if (name.includes('/api/')) {
      this.reportMetric({
        name: 'api_response_time',
        value: duration,
        rating: duration < 500 ? 'good' : duration < 1000 ? 'needs-improvement' : 'poor',
        metadata: {
          endpoint: name,
          method: 'GET' // Default method since it's not always available
        }
      });
    }
  }

  /**
   * Track navigation performance
   */
  trackNavigationPerformance(entry: PerformanceNavigationTiming) {
    const {
      domContentLoadedEventEnd,
      domContentLoadedEventStart,
      loadEventEnd,
      loadEventStart,
      responseEnd,
      responseStart,
      transferSize
    } = entry;

    // DOM processing time
    const domProcessingTime = domContentLoadedEventEnd - domContentLoadedEventStart;
    this.reportMetric({
      name: 'dom_processing_time',
      value: domProcessingTime,
      rating: domProcessingTime < 1000 ? 'good' : domProcessingTime < 2000 ? 'needs-improvement' : 'poor'
    });

    // Page load event time
    const loadEventTime = loadEventEnd - loadEventStart;
    this.reportMetric({
      name: 'load_event_time',
      value: loadEventTime,
      rating: loadEventTime < 500 ? 'good' : loadEventTime < 1000 ? 'needs-improvement' : 'poor'
    });

    // Server response time
    const serverResponseTime = responseEnd - responseStart;
    this.reportMetric({
      name: 'server_response_time',
      value: serverResponseTime,
      rating: serverResponseTime < 200 ? 'good' : serverResponseTime < 500 ? 'needs-improvement' : 'poor'
    });

    // Page size
    this.reportMetric({
      name: 'page_size',
      value: transferSize,
      rating: transferSize < 1000000 ? 'good' : transferSize < 3000000 ? 'needs-improvement' : 'poor'
    });
  }

  /**
   * Report metric with batching
   */
  reportMetric(metric: Partial<PerformanceMetric>) {
    if (!metric.name) {
      console.warn('Performance metric must have a name');
      return;
    }

    const enhancedMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value || 0,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
      deviceMemory: navigator.deviceMemory || undefined,
      sessionId: this.getSessionId(),
      ...metric
    };

    this.metrics.set(metric.name, enhancedMetric);
    this.pendingMetrics.push(enhancedMetric);

    // Batch reporting
    if (this.pendingMetrics.length >= this.batchSize) {
      this.flushMetrics();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flushMetrics(), this.batchTimeout);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance Metric: ${metric.name}`, metric);
    }
  }

  /**
   * Flush pending metrics to server
   */
  async flushMetrics() {
    if (this.pendingMetrics.length === 0) return;

    const metrics = [...this.pendingMetrics];
    this.pendingMetrics = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metrics }),
        keepalive: true
      });
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
      // Re-queue metrics on failure (with limit to prevent memory issues)
      if (this.pendingMetrics.length < 50) {
        this.pendingMetrics.unshift(...metrics);
      }
    }
  }

  /**
   * Get connection type information
   */
  getConnectionType() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      if (connection) {
        return {
          effectiveType: connection.effectiveType,
          type: connection.type,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }
    }
    return null;
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('performance_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('performance_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Mark custom performance milestone
   */
  mark(name: string, metadata: Record<string, unknown> = {}) {
    performance.mark(name);
    
    this.reportMetric({
      name: `custom_${name}`,
      value: performance.now(),
      rating: 'info',
      metadata
    });
  }

  /**
   * Measure performance between marks
   */
  measure(name: string, startMark: string, endMark: string) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      
      this.reportMetric({
        name: `measure_${name}`,
        value: measure.duration,
        rating: measure.duration < 1000 ? 'good' : measure.duration < 3000 ? 'needs-improvement' : 'poor',
        metadata: {
          startMark,
          endMark
        }
      });
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }

  /**
   * Track component render performance
   */
  trackComponentRender(componentName: string, renderTime: number) {
    this.reportMetric({
      name: 'component_render_time',
      value: renderTime,
      rating: renderTime < 16 ? 'good' : renderTime < 50 ? 'needs-improvement' : 'poor',
      metadata: {
        component: componentName
      }
    });
  }

  /**
   * Track user interactions
   */
  trackInteraction(interactionType: string, element: Element, duration = 0) {
    this.reportMetric({
      name: 'user_interaction',
      value: duration,
      rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor',
      metadata: {
        type: interactionType,
        element: element.tagName || 'unknown',
        id: element.id || null,
        className: element.className || null
      }
    });
  }

  /**
   * Cleanup observers and resources
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    
    // Flush remaining metrics
    this.flushMetrics();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performanceMonitor.init();
    });
  } else {
    performanceMonitor.init();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup();
  });

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      performanceMonitor.flushMetrics();
    }
  });
}

export default performanceMonitor;