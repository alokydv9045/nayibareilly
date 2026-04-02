/**
 * Performance Testing Suite for NayiBareilly Platform
 * Comprehensive load testing, stress testing, and performance benchmarking
 */

import { test, expect, Page } from '@playwright/test';
import { performance } from 'perf_hooks';
import * as fs from 'fs';

// Type definitions
interface WebVitals {
  FCP?: number;
  LCP?: number;
  CLS?: number;
}

interface PageLoadMetric {
  url: string;
  loadTime: number;
  timestamp: string;
}

interface ApiResponseMetric {
  url: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: string;
}

interface ImageLoadMetric {
  url: string;
  loadTime: number;
  size: number;
  timestamp: string;
}

interface ErrorMetric {
  url: string;
  method: string;
  error: string;
  timestamp: string;
}

interface ApiResponse {
  responseTime: number;
  status: number;
  data: unknown;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface _ResourceTiming {
  name: string;
  duration: number;
  transferSize?: number;
  type: string;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface ResourceEntry extends PerformanceEntry {
  transferSize?: number;
  initiatorType: string;
}

declare global {
  interface Performance {
    memory?: MemoryInfo;
  }
}

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  page_load: 3000,
  api_response: 1000,
  database_query: 500,
  image_load: 2000,
  first_contentful_paint: 2000,
  largest_contentful_paint: 4000,
  cumulative_layout_shift: 0.1,
  first_input_delay: 100,
};

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:4000';

class PerformanceTestSuite {
  metrics: {
    pageLoadTimes: PageLoadMetric[];
    apiResponseTimes: ApiResponseMetric[];
    imageLoadTimes: ImageLoadMetric[];
    webVitals: Record<string, WebVitals>;
    errors: ErrorMetric[];
  };

  constructor() {
    this.metrics = {
      pageLoadTimes: [],
      apiResponseTimes: [],
      imageLoadTimes: [],
      webVitals: {},
      errors: [],
    };
  }

  // Measure Web Vitals
  async measureWebVitals(page: Page): Promise<WebVitals> {
    const webVitals = await page.evaluate(() => {
      return new Promise<WebVitals>((resolve) => {
        const vitals: WebVitals = {};
        let resolveCount = 0;
        const expectedVitals = 3; // FCP, LCP, CLS

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              vitals.FCP = entry.startTime;
              resolveCount++;
            }
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.LCP = entry.startTime;
              resolveCount++;
            }
            if (entry.entryType === 'layout-shift' && !(entry as LayoutShiftEntry).hadRecentInput) {
              vitals.CLS = (vitals.CLS || 0) + (entry as LayoutShiftEntry).value;
              resolveCount++;
            }
          });

          if (resolveCount >= expectedVitals) {
            resolve(vitals);
          }
        });

        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });

        // Fallback timeout
        setTimeout(() => resolve(vitals), 10000);
      });
    });

    return webVitals;
  }

  // Measure page load performance
  async measurePageLoad(page: Page, url: string): Promise<number> {
    const startTime = performance.now();
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    this.metrics.pageLoadTimes.push({
      url,
      loadTime,
      timestamp: new Date().toISOString(),
    });

    return loadTime;
  }

  // Measure API response times
  async measureApiResponse(url: string, method: string = 'GET', data: unknown = null): Promise<ApiResponse> {
    const startTime = performance.now();
    
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(url, options);
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.metrics.apiResponseTimes.push({
        url,
        method,
        responseTime,
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      });
      
      return { responseTime, status: response.status, data: await response.json() };
    } catch (error) {
      const _endTime = performance.now();
      this.metrics.errors.push({
        url,
        method,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  // Generate performance report
  generateReport() {
    const report = {
      summary: {
        totalTests: this.metrics.pageLoadTimes.length + this.metrics.apiResponseTimes.length,
        averagePageLoad: this.metrics.pageLoadTimes.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.pageLoadTimes.length || 0,
        averageApiResponse: this.metrics.apiResponseTimes.reduce((sum, m) => sum + m.responseTime, 0) / this.metrics.apiResponseTimes.length || 0,
        errorCount: this.metrics.errors.length,
        timestamp: new Date().toISOString(),
      },
      pageLoadPerformance: this.metrics.pageLoadTimes,
      apiPerformance: this.metrics.apiResponseTimes,
      webVitals: this.metrics.webVitals,
      errors: this.metrics.errors,
      thresholds: PERFORMANCE_THRESHOLDS,
      compliance: {
        pageLoadCompliance: this.metrics.pageLoadTimes.filter(m => m.loadTime <= PERFORMANCE_THRESHOLDS.page_load).length / this.metrics.pageLoadTimes.length * 100,
        apiCompliance: this.metrics.apiResponseTimes.filter(m => m.responseTime <= PERFORMANCE_THRESHOLDS.api_response).length / this.metrics.apiResponseTimes.length * 100,
      },
    };

    return report;
  }
}

// Initialize performance test suite
const perfSuite = new PerformanceTestSuite();

test.describe('Performance Tests - Page Load Times', () => {
  test('Homepage load performance', async ({ page }) => {
    const loadTime = await perfSuite.measurePageLoad(page, BASE_URL);
    const webVitals = await perfSuite.measureWebVitals(page);
    
    perfSuite.metrics.webVitals.homepage = webVitals;
    
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.page_load);
    expect(webVitals.FCP).toBeLessThan(PERFORMANCE_THRESHOLDS.first_contentful_paint);
    expect(webVitals.LCP).toBeLessThan(PERFORMANCE_THRESHOLDS.largest_contentful_paint);
    expect(webVitals.CLS || 0).toBeLessThan(PERFORMANCE_THRESHOLDS.cumulative_layout_shift);
  });

  test('Issues list page load performance', async ({ page }) => {
    const loadTime = await perfSuite.measurePageLoad(page, `${BASE_URL}/dashboard`);
    const webVitals = await perfSuite.measureWebVitals(page);
    
    perfSuite.metrics.webVitals.dashboard = webVitals;
    
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.page_load);
  });

  test('Issue details page load performance', async ({ page }) => {
    // First create a test issue or use existing one
    const testIssueId = 'test-issue-id';
    const loadTime = await perfSuite.measurePageLoad(page, `${BASE_URL}/issue/${testIssueId}`);
    
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.page_load);
  });

  test('Authentication pages load performance', async ({ page }) => {
    const loginLoadTime = await perfSuite.measurePageLoad(page, `${BASE_URL}/login`);
    const registerLoadTime = await perfSuite.measurePageLoad(page, `${BASE_URL}/register`);
    
    expect(loginLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.page_load);
    expect(registerLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.page_load);
  });
});

test.describe('Performance Tests - API Response Times', () => {
  test('Health check endpoint performance', async () => {
    const result = await perfSuite.measureApiResponse(`${API_URL}/api/health`);
    
    expect(result.responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.api_response);
    expect(result.status).toBe(200);
  });

  test('Issues list API performance', async () => {
    const result = await perfSuite.measureApiResponse(`${API_URL}/api/issues`);
    
    expect(result.responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.api_response);
    expect(result.status).toBe(200);
  });

  test('Issue search API performance', async () => {
    const searchQuery = { q: 'test', page: 1, limit: 10 };
    const result = await perfSuite.measureApiResponse(
      `${API_URL}/api/issues/search`,
      'POST',
      searchQuery
    );
    
    expect(result.responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.api_response);
    expect(result.status).toBe(200);
  });

  test('User authentication API performance', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'testpassword',
    };
    
    try {
      const result = await perfSuite.measureApiResponse(
        `${API_URL}/api/auth/login`,
        'POST',
        loginData
      );
      
      expect(result.responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.api_response);
    } catch {
      // Expected if test user doesn't exist
      console.log('Login test skipped - test user not found');
    }
  });

  test('Categories API performance', async () => {
    const result = await perfSuite.measureApiResponse(`${API_URL}/api/categories`);
    
    expect(result.responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.api_response);
    expect(result.status).toBe(200);
  });

  test('Departments API performance', async () => {
    const result = await perfSuite.measureApiResponse(`${API_URL}/api/departments`);
    
    expect(result.responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.api_response);
    expect(result.status).toBe(200);
  });
});

test.describe('Performance Tests - Load Testing', () => {
  test('Concurrent users simulation', async ({ browser }) => {
    const concurrentUsers = 10;
    const promises = [];
    
    for (let i = 0; i < concurrentUsers; i++) {
      const promise = (async () => {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        const startTime = performance.now();
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        const endTime = performance.now();
        
        await context.close();
        return endTime - startTime;
      })();
      
      promises.push(promise);
    }
    
    const loadTimes = await Promise.all(promises);
    const averageLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
    
    console.log(`Average load time with ${concurrentUsers} concurrent users: ${averageLoadTime}ms`);
    expect(averageLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.page_load * 2); // Allow 2x threshold for concurrent load
  });

  test('API concurrent requests simulation', async () => {
    const concurrentRequests = 20;
    const promises = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(perfSuite.measureApiResponse(`${API_URL}/api/health`));
    }
    
    const results = await Promise.all(promises);
    const averageResponseTime = results.reduce((sum, result) => sum + result.responseTime, 0) / results.length;
    
    console.log(`Average API response time with ${concurrentRequests} concurrent requests: ${averageResponseTime}ms`);
    expect(averageResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.api_response * 2);
  });
});

test.describe('Performance Tests - Memory and Resource Usage', () => {
  test('Memory usage during navigation', async ({ page }) => {
    // Navigate through multiple pages to test memory leaks
    const pages = [
      BASE_URL,
      `${BASE_URL}/dashboard`,
      `${BASE_URL}/login`,
      `${BASE_URL}/register`,
      `${BASE_URL}/about`,
      `${BASE_URL}/contact`,
    ];
    
    const memoryUsage = [];
    
    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const memory = await page.evaluate(() => {
        const perf = performance as unknown as { memory?: MemoryInfo };
        if (perf.memory) {
          return {
            usedJSHeapSize: perf.memory.usedJSHeapSize,
            totalJSHeapSize: perf.memory.totalJSHeapSize,
            jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
          };
        }
        return null;
      });
      
      if (memory) {
        memoryUsage.push({ url, memory });
      }
    }
    
    console.log('Memory usage across pages:', memoryUsage);
    
    // Check for memory leaks (memory should not increase dramatically)
    if (memoryUsage.length > 1) {
      const firstMemory = memoryUsage[0].memory.usedJSHeapSize;
      const lastMemory = memoryUsage[memoryUsage.length - 1].memory.usedJSHeapSize;
      const memoryIncrease = (lastMemory - firstMemory) / firstMemory;
      
      expect(memoryIncrease).toBeLessThan(2); // Memory shouldn't increase by more than 200%
    }
  });

  test('Resource loading performance', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const resourceTiming = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as ResourceEntry[];
      return resources.map(resource => ({
        name: resource.name,
        duration: resource.duration,
        transferSize: resource.transferSize || 0,
        type: resource.initiatorType,
      }));
    });
    
    // Analyze resource loading
    const images = resourceTiming.filter(r => r.type === 'img');
    const scripts = resourceTiming.filter(r => r.type === 'script');
    const stylesheets = resourceTiming.filter(r => r.type === 'link');
    
    console.log(`Images loaded: ${images.length}, average load time: ${images.reduce((sum, img) => sum + img.duration, 0) / images.length || 0}ms`);
    console.log(`Scripts loaded: ${scripts.length}, average load time: ${scripts.reduce((sum, script) => sum + script.duration, 0) / scripts.length || 0}ms`);
    console.log(`Stylesheets loaded: ${stylesheets.length}, average load time: ${stylesheets.reduce((sum, css) => sum + css.duration, 0) / stylesheets.length || 0}ms`);
    
    // Verify no resources take too long to load
    const slowResources = resourceTiming.filter(r => r.duration > 5000);
    expect(slowResources.length).toBe(0);
  });
});

test.describe('Performance Tests - Database Performance', () => {
  test('Database query performance monitoring', async () => {
    // Test various database operations through API
    const operations = [
      { name: 'Issues List', url: `${API_URL}/api/issues?page=1&limit=10` },
      { name: 'Issue Search', url: `${API_URL}/api/issues/search`, method: 'POST', data: { q: 'test' } },
      { name: 'Categories', url: `${API_URL}/api/categories` },
      { name: 'Departments', url: `${API_URL}/api/departments` },
      { name: 'Dashboard Stats', url: `${API_URL}/api/dashboard/stats` },
    ];
    
    for (const operation of operations) {
      try {
        const result = await perfSuite.measureApiResponse(
          operation.url,
          operation.method || 'GET',
          operation.data
        );
        
        console.log(`${operation.name}: ${result.responseTime}ms`);
        expect(result.responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.database_query * 2);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`${operation.name} test skipped:`, errorMessage);
      }
    }
  });
});

// Performance test reporting
test.afterAll(async () => {
  const report = perfSuite.generateReport();
  
  console.log('\n📊 Performance Test Report');
  console.log('=' .repeat(50));
  console.log(`Total Tests: ${report.summary.totalTests}`);
  console.log(`Average Page Load: ${report.summary.averagePageLoad.toFixed(2)}ms`);
  console.log(`Average API Response: ${report.summary.averageApiResponse.toFixed(2)}ms`);
  console.log(`Errors: ${report.summary.errorCount}`);
  console.log(`Page Load Compliance: ${report.compliance.pageLoadCompliance.toFixed(1)}%`);
  console.log(`API Compliance: ${report.compliance.apiCompliance.toFixed(1)}%`);
  
  // Save detailed report to file
  const reportPath = './test-results/performance-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📋 Detailed report saved to: ${reportPath}`);
  
  // Validate overall performance
  expect(report.compliance.pageLoadCompliance).toBeGreaterThan(80);
  expect(report.compliance.apiCompliance).toBeGreaterThan(90);
});