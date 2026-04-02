// Test setup for Playwright and browser environments
// This file provides polyfills and mocks for testing

// Polyfills for Node.js environment
import { TextEncoder, TextDecoder } from 'util';

// Only set globals if they don't exist (avoid conflicts)
if (typeof globalThis.TextEncoder === 'undefined') {
  (globalThis as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  (globalThis as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder;
}

// Mock IntersectionObserver for tests
const mockIntersectionObserver = class {
  root = null;
  rootMargin = '';
  thresholds = [];
  
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
    // Mock implementation
  }
  
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
};

if (typeof globalThis.IntersectionObserver === 'undefined') {
  (globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver = mockIntersectionObserver as typeof IntersectionObserver;
}

// Mock ResizeObserver for tests
const mockResizeObserver = class {
  constructor(_callback: ResizeObserverCallback) {
    // Mock implementation
  }
  
  disconnect() {}
  observe() {}
  unobserve() {}
};

if (typeof globalThis.ResizeObserver === 'undefined') {
  (globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = mockResizeObserver as typeof ResizeObserver;
}

// Mock matchMedia for browser environment
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {}, // deprecated
  removeListener: () => {}, // deprecated
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  });
}

// Mock scrollTo
const mockScrollTo = () => {};
if (typeof globalThis.scrollTo === 'undefined') {
  globalThis.scrollTo = mockScrollTo;
}

// Mock localStorage
const createStorageMock = (): Storage => {
  const storage: Record<string, string> = {};
  return {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
    get length() { return Object.keys(storage).length; },
    key: (index: number) => Object.keys(storage)[index] || null,
  };
};

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = createStorageMock();
}

if (typeof globalThis.sessionStorage === 'undefined') {
  globalThis.sessionStorage = createStorageMock();
}

// Mock fetch for testing
const mockFetch = async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
  return new Response(JSON.stringify({}), {
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'application/json' },
  });
};

if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = mockFetch;
}

// Mock console methods for cleaner test output
const mockConsole = {
  warn: () => {},
  error: () => {},
  log: console.log, // Keep log for debugging
  info: console.info,
};

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: (success: PositionCallback, _error?: PositionErrorCallback) => {
    const position: GeolocationPosition = {
      coords: {
        latitude: 28.6139,
        longitude: 77.2090,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => ({
          latitude: 28.6139,
          longitude: 77.2090,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        }),
      },
      timestamp: Date.now(),
      toJSON: () => ({
        coords: {
          latitude: 28.6139,
          longitude: 77.2090,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      }),
    };
    success(position);
  },
  watchPosition: () => 1,
  clearWatch: () => {},
};

if (typeof navigator !== 'undefined' && !navigator.geolocation) {
  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
  });
}

// Mock FileReader
const mockFileReader = class {
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  readyState: number = 0;
  
  onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;
  onprogress: ((ev: ProgressEvent<FileReader>) => void) | null = null;
  
  readAsDataURL(file: Blob) {
    setTimeout(() => {
      this.result = `data:${file.type};base64,mock-data`;
      this.readyState = 2;
      if (this.onload) {
        this.onload({} as ProgressEvent<FileReader>);
      }
    }, 0);
  }
  
  readAsText(_file: Blob) {
    setTimeout(() => {
      this.result = 'mock text content';
      this.readyState = 2;
      if (this.onload) {
        this.onload({} as ProgressEvent<FileReader>);
      }
    }, 0);
  }
  
  abort() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return false; }
};

if (typeof globalThis.FileReader === 'undefined') {
  (globalThis as unknown as { FileReader: typeof FileReader }).FileReader = mockFileReader as unknown as typeof FileReader;
}

// Performance monitoring mock for tests
export const mockPerformanceObserver = class {
  constructor(_callback: PerformanceObserverCallback) {
    // Mock implementation
  }
  
  observe() {}
  disconnect() {}
  takeRecords(): PerformanceEntryList { return []; }
};

if (typeof globalThis.PerformanceObserver === 'undefined') {
  (globalThis as unknown as { PerformanceObserver: typeof PerformanceObserver }).PerformanceObserver = mockPerformanceObserver as unknown as typeof PerformanceObserver;
}

// Mock URL.createObjectURL and revokeObjectURL
if (typeof globalThis.URL === 'undefined') {
  globalThis.URL = class URL {
    constructor(_url: string | URL, _base?: string | URL) {
      // Mock implementation
    }
    
    static createObjectURL(): string {
      return 'blob:mock-url';
    }
    
    static revokeObjectURL(): void {
      // Mock implementation
    }
  } as unknown as typeof URL;
} else {
  if (!URL.createObjectURL) {
    URL.createObjectURL = () => 'blob:mock-url';
  }
  if (!URL.revokeObjectURL) {
    URL.revokeObjectURL = () => {};
  }
}

// Export utilities for tests
export { mockMatchMedia, createStorageMock, mockFetch, mockConsole, mockGeolocation };

// Test utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createMockFile = (name: string, content: string = 'test content', type: string = 'text/plain') => {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
};

export const createMockEvent = <T extends Event>(type: string, eventInit?: EventInit): T => {
  return new Event(type, eventInit) as T;
};

// Setup complete
console.log('Test setup initialized successfully');