/**
 * Enhanced Application Configuration
 * Automatically handles local development and production environments
 * Provides type-safe configuration with intelligent defaults
 */

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'
const isClient = typeof window !== 'undefined'

/**
 * Smart API URL resolution
 * Automatically switches between dev and prod URLs based on environment
 */
const getApiBaseUrl = (): string => {
  // In development, prefer localhost
  if (isDevelopment) {
    return process.env.NEXT_PUBLIC_API_URL_DEV || 
           process.env.NEXT_PUBLIC_API_URL || 
           'http://localhost:4001/api'
  }
  
  // In production, use production URL
  if (isProduction) {
    return process.env.NEXT_PUBLIC_API_URL_PROD || 
           process.env.NEXT_PUBLIC_API_URL || 
           'http://localhost:4001/api'
  }
  
  // Fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'
}

/**
 * Smart Socket URL resolution
 */
const getSocketBaseUrl = (): string => {
  // In development, prefer localhost
  if (isDevelopment) {
    return process.env.NEXT_PUBLIC_SOCKET_URL_DEV || 
           process.env.NEXT_PUBLIC_SOCKET_URL || 
           'http://localhost:4001'
  }
  
  // In production, use production URL
  if (isProduction) {
    return process.env.NEXT_PUBLIC_SOCKET_URL_PROD || 
           process.env.NEXT_PUBLIC_SOCKET_URL || 
           process.env.NEXT_PUBLIC_WS_URL ||
           'http://localhost:4001'
  }
  
  // Fallback
  return process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4001'
}

/**
 * Normalize API URL (ensure /api suffix)
 */
export const getApiUrl = (): string => {
  const base = getApiBaseUrl().replace(/\/$/, '') // Remove trailing slash
  return base.endsWith('/api') ? base : `${base}/api`
}

/**
 * Normalize Socket URL (remove /api suffix)
 */
export const getSocketUrl = (): string => {
  const base = getSocketBaseUrl().replace(/\/$/, '') // Remove trailing slash
  return base.endsWith('/api') ? base.slice(0, -4) : base
}

/**
 * Get environment-specific timeout values
 */
const getTimeouts = () => ({
  api: isDevelopment ? 10000 : parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  socket: isDevelopment ? 5000 : 10000,
})

/**
 * Enhanced application configuration
 */
export const config = {
  // Environment info
  env: {
    isDevelopment,
    isProduction,
    isClient,
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // API Configuration
  api: {
    baseUrl: getApiBaseUrl(),
    fullUrl: getApiUrl(),
    timeout: getTimeouts().api,
    retries: isDevelopment ? 2 : 3,
  },
  
  // Socket Configuration  
  socket: {
    url: getSocketUrl(),
    timeout: getTimeouts().socket,
    reconnection: true,
    reconnectionAttempts: isDevelopment ? 3 : 5,
    reconnectionDelay: isDevelopment ? 500 : 1000,
    reconnectionDelayMax: isDevelopment ? 2000 : 5000,
  },
  
  // Authentication Configuration
  auth: {
    tokenKey: 'ns_token',
    userKey: 'ns_user',
    refreshTokenCookieName: 'rt',
    tokenRefreshBuffer: 5 * 60 * 1000, // 5 minutes before expiry
  },
  
  // Feature Flags (environment-aware)
  features: {
    enableRealtime: process.env.NEXT_PUBLIC_ENABLE_REALTIME !== 'false',
    enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
    enableGeoLocation: process.env.NEXT_PUBLIC_ENABLE_GEOLOCATION !== 'false',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enablePWA: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',
    enableDebugMode: isDevelopment && process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    showErrors: isDevelopment && process.env.NEXT_PUBLIC_SHOW_ERRORS === 'true',
    enableDevTools: isDevelopment && process.env.NEXT_PUBLIC_DEV_TOOLS === 'true',
  },
  
  // UI/UX Configuration
  ui: {
    itemsPerPage: parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE || '10', 10),
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760', 10), // 10MB
    supportedImageTypes: (process.env.NEXT_PUBLIC_SUPPORTED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/avif').split(','),
    imageQuality: parseInt(process.env.NEXT_PUBLIC_IMAGE_QUALITY || '85', 10),
    animationDuration: isDevelopment ? 150 : 300, // Faster in dev
  },
  
  // Maps Configuration
  maps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    defaultLat: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT || '28.367'),
    defaultLng: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG || '79.432'),
    defaultZoom: parseInt(process.env.NEXT_PUBLIC_DEFAULT_ZOOM || '13', 10),
  },
  
  // Application Information
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'NayiBareilly',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Digital Platform for Civic Engagement',
  },
  
  // Development helpers
  dev: {
    logLevel: isDevelopment ? 'debug' : 'info',
    enableHMR: isDevelopment,
    enableSourceMaps: isDevelopment,
  }
} as const

// Type exports for better TypeScript support
export type Config = typeof config
export type ApiConfig = typeof config.api
export type SocketConfig = typeof config.socket
export type FeatureFlags = typeof config.features

// Helper functions
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return config.features[feature]
}

export const getApiEndpoint = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${config.api.fullUrl}/${cleanPath}`
}

export const logConfig = (): void => {
  if (isDevelopment && isClient) {
    console.group('🔧 App Configuration')
    console.log('Environment:', config.env.nodeEnv)
    console.log('API URL:', config.api.fullUrl)
    console.log('Socket URL:', config.socket.url)
    console.log('Features:', config.features)
    console.groupEnd()
  }
}

export default config