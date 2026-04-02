/**
 * Centralized logger utility
 * Automatically strips debug logs in production builds
 */

const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * Debug logs - only in development
   */
  debug: isDev ? console.log.bind(console) : () => {},
  
  /**
   * Info logs - only in development
   */
  info: isDev ? console.info.bind(console) : () => {},
  
  /**
   * Warning logs - always logged
   */
  warn: console.warn.bind(console),
  
  /**
   * Error logs - always logged
   */
  error: console.error.bind(console),
}

/**
 * Performance logging helper
 */
export const logPerformance = (label: string, fn: () => void) => {
  if (isDev) {
    console.time(label)
    fn()
    console.timeEnd(label)
  } else {
    fn()
  }
}
