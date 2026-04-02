import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import performanceMonitor from '@/lib/utils/performanceMonitor';

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * Hook for lazy loading components with intersection observer
 */
export function useLazyLoad(threshold = 0.1, rootMargin = '50px') {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);
        
        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
}

/**
 * Hook for performance monitoring of component renders
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - mountTime.current;
    
    performanceMonitor.trackComponentRender(componentName, renderTime);
  });

  useEffect(() => {
    performanceMonitor.mark(`${componentName}_mount`);
    
    return () => {
      performanceMonitor.mark(`${componentName}_unmount`);
      performanceMonitor.measure(
        `${componentName}_lifecycle`,
        `${componentName}_mount`,
        `${componentName}_unmount`
      );
    };
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    markEvent: (eventName: string) => performanceMonitor.mark(`${componentName}_${eventName}`),
  };
}

/**
 * Hook for debounced values to optimize API calls
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
/**
 * Hook for throttled functions to optimize event handlers
 */
export function useThrottle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number
): (...args: TArgs) => void {
  const lastRun = useRef<number>(0);

  return useCallback((...args: TArgs) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      try {
        fn(...args);
      } finally {
        lastRun.current = now;
      }
    }
    // otherwise ignore
  }, [fn, delay]);
}

/**
 * Hook for optimized API calls with caching
 */
export function useOptimizedFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
  dependencies: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef(new Map<string, { data: T; timestamp: number }>());
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // LRU cache configuration
  const MAX_CACHE_SIZE = 50;
  const CACHE_TTL_MS = 300000; // 5 minutes

  const cacheKey = useMemo(() => {
    return `${url}_${JSON.stringify(options)}_${JSON.stringify(dependencies)}`;
  }, [url, options, dependencies]);

  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    const entriesToDelete: string[] = [];
    
    // Find expired entries
    for (const [key, value] of cacheRef.current.entries()) {
      if (now - value.timestamp > CACHE_TTL_MS) {
        entriesToDelete.push(key);
      }
    }
    
    // Delete expired entries
    entriesToDelete.forEach(key => cacheRef.current.delete(key));
    
    // If still over limit, remove oldest entries (LRU)
    if (cacheRef.current.size > MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(cacheRef.current.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedEntries.slice(0, cacheRef.current.size - MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => cacheRef.current.delete(key));
    }
  }, []);

  const fetchData = useCallback(async () => {
    // Clean expired cache entries first
    cleanExpiredCache();
    
    // Check cache first (5 minute TTL)
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const startTime = Date.now();
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      const endTime = Date.now();
      performanceMonitor.reportMetric({
        name: 'api_fetch_time',
        value: endTime - startTime,
        rating: endTime - startTime < 500 ? 'good' : 'needs-improvement',
        metadata: { url }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      cacheRef.current.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      setData(result);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
        performanceMonitor.reportMetric({
          name: 'api_fetch_error',
          value: 1,
          rating: 'poor',
          metadata: { url, error: err.message }
        });
      }
    } finally {
      setLoading(false);
    }
  }, [url, options, cacheKey, cleanExpiredCache]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, ...dependencies]);

  const refetch = useCallback(() => {
    cacheRef.current.delete(cacheKey);
    fetchData();
  }, [cacheKey, fetchData]);

  return { data, loading, error, refetch };
}

/**
 * Hook for virtual scrolling to optimize large lists
 */
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useThrottle((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, 16); // ~60fps

  return {
    scrollElementRef,
    visibleItems,
    totalHeight,
    offsetY,
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex,
    handleScroll,
  };
}

/**
 * Hook for optimized image loading with blur placeholder
 */
export function useOptimizedImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    const startTime = Date.now();

    img.onload = () => {
      const loadTime = Date.now() - startTime;
      performanceMonitor.reportMetric({
        name: 'image_load_time',
        value: loadTime,
        rating: loadTime < 1000 ? 'good' : 'needs-improvement',
        metadata: { src }
      });

      setImageSrc(src);
      setImageLoaded(true);
      setError(false);
    };

    img.onerror = () => {
      setError(true);
      performanceMonitor.reportMetric({
        name: 'image_load_error',
        value: 1,
        rating: 'poor',
        metadata: { src }
      });
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { imageSrc, imageLoaded, error };
}

/**
 * Hook for measuring component performance
 */
export function useMeasurePerformance() {
  const performanceRef = useRef<{
    startTime: number;
    markers: Map<string, number>;
  }>({
    startTime: Date.now(),
    markers: new Map(),
  });

  const mark = useCallback((name: string) => {
    const time = Date.now();
    performanceRef.current.markers.set(name, time);
    performanceMonitor.mark(name);
  }, []);

  const measure = useCallback((name: string, startMark: string, endMark: string) => {
    const startTime = performanceRef.current.markers.get(startMark);
    const endTime = performanceRef.current.markers.get(endMark);
    
    if (startTime && endTime) {
      const duration = endTime - startTime;
      performanceMonitor.reportMetric({
        name: `measure_${name}`,
        value: duration,
        rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor'
      });
    }
  }, []);

  const getDuration = useCallback((markName?: string) => {
    const endTime = Date.now();
    const startTime = markName 
      ? performanceRef.current.markers.get(markName)
      : performanceRef.current.startTime;
    
    return startTime ? endTime - startTime : 0;
  }, []);

  return { mark, measure, getDuration };
}

/**
 * Hook for route change performance monitoring
 */
export function useRoutePerformance() {
  const router = useRouter();
  const routeStartTime = useRef<number>(0);

  useEffect(() => {
    const _handleRouteStart = (url: string) => {
      routeStartTime.current = Date.now();
      performanceMonitor.mark(`route_start_${url}`);
    };

    const _handleRouteComplete = (url: string) => {
      const duration = Date.now() - routeStartTime.current;
      performanceMonitor.reportMetric({
        name: 'route_change_time',
        value: duration,
        rating: duration < 1000 ? 'good' : duration < 2000 ? 'needs-improvement' : 'poor',
        metadata: { url }
      });
    };

    // Note: Next.js 13+ app router doesn't have router events
    // This would need to be adapted based on the routing solution
    
    return () => {
      // Cleanup if needed
    };
  }, [router]);

  return {
    startRouteTracking: (url: string) => {
      routeStartTime.current = Date.now();
      performanceMonitor.mark(`route_start_${url}`);
    },
    endRouteTracking: (url: string) => {
      const duration = Date.now() - routeStartTime.current;
      performanceMonitor.reportMetric({
        name: 'route_change_time',
        value: duration,
        rating: duration < 1000 ? 'good' : 'needs-improvement',
        metadata: { url }
      });
    },
  };
}

/**
 * Hook for memory usage monitoring
 */
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as unknown as { memory: MemoryInfo }).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });

        // Report high memory usage
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercent > 80) {
          performanceMonitor.reportMetric({
            name: 'high_memory_usage',
            value: usagePercent,
            rating: 'poor',
            metadata: { memory }
          });
        }
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}