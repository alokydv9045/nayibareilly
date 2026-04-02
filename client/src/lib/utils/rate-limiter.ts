/**
 * Client-side rate limiter utility
 * Implements token bucket algorithm for rate limiting sensitive operations
 */

interface RateLimiterConfig {
  maxAttempts: number
  windowMs: number
  storageKey?: string
}

interface AttemptRecord {
  timestamps: number[]
  blockedUntil?: number
}

class RateLimiter {
  private maxAttempts: number
  private windowMs: number
  private storageKey: string
  private memoryStore: Map<string, AttemptRecord>

  constructor(config: RateLimiterConfig) {
    this.maxAttempts = config.maxAttempts
    this.windowMs = config.windowMs
    this.storageKey = config.storageKey || 'rate_limiter_default'
    this.memoryStore = new Map()
  }

  /**
   * Check if an operation is allowed
   * @param key - Unique key for the operation (e.g., 'login:user@example.com')
   * @returns boolean - true if allowed, false if rate limited
   */
  check(key: string = 'default'): boolean {
    const now = Date.now()
    const record = this.getRecord(key)

    // Check if currently blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      return false
    }

    // Clear expired block
    if (record.blockedUntil && now >= record.blockedUntil) {
      record.blockedUntil = undefined
    }

    // Remove timestamps outside the window
    record.timestamps = record.timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    )

    // Check if within rate limit
    if (record.timestamps.length >= this.maxAttempts) {
      // Block for the window duration
      record.blockedUntil = now + this.windowMs
      this.saveRecord(key, record)
      return false
    }

    return true
  }

  /**
   * Record an attempt
   * @param key - Unique key for the operation
   */
  recordAttempt(key: string = 'default'): void {
    const now = Date.now()
    const record = this.getRecord(key)

    // Remove old timestamps
    record.timestamps = record.timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    )

    // Add new timestamp
    record.timestamps.push(now)

    this.saveRecord(key, record)
  }

  /**
   * Check and record in one operation
   * @param key - Unique key for the operation
   * @returns boolean - true if allowed and recorded, false if rate limited
   */
  checkAndRecord(key: string = 'default'): boolean {
    if (this.check(key)) {
      this.recordAttempt(key)
      return true
    }
    return false
  }

  /**
   * Get remaining attempts before rate limit
   * @param key - Unique key for the operation
   * @returns number - remaining attempts
   */
  getRemainingAttempts(key: string = 'default'): number {
    const record = this.getRecord(key)
    const now = Date.now()

    // Filter recent timestamps
    const recentAttempts = record.timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    )

    return Math.max(0, this.maxAttempts - recentAttempts.length)
  }

  /**
   * Get time until rate limit resets
   * @param key - Unique key for the operation
   * @returns number - milliseconds until reset, 0 if not rate limited
   */
  getResetTime(key: string = 'default'): number {
    const record = this.getRecord(key)
    const now = Date.now()

    // If blocked, return time until unblocked
    if (record.blockedUntil && now < record.blockedUntil) {
      return record.blockedUntil - now
    }

    // If at limit, return time until oldest timestamp expires
    if (record.timestamps.length >= this.maxAttempts) {
      const oldestTimestamp = Math.min(...record.timestamps)
      return Math.max(0, this.windowMs - (now - oldestTimestamp))
    }

    return 0
  }

  /**
   * Clear rate limit for a specific key
   * @param key - Unique key for the operation
   */
  clear(key: string = 'default'): void {
    this.memoryStore.delete(key)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.getStorageKey(key))
      } catch {
        // Ignore localStorage errors
      }
    }
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.memoryStore.clear()
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.startsWith(this.storageKey)) {
            localStorage.removeItem(key)
          }
        })
      } catch {
        // Ignore localStorage errors
      }
    }
  }

  /**
   * Get record from storage
   * @private
   */
  private getRecord(key: string): AttemptRecord {
    // Try memory first
    let record = this.memoryStore.get(key)
    if (record) {
      return record
    }

    // Try localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.getStorageKey(key))
        if (stored) {
          record = JSON.parse(stored) as AttemptRecord
          this.memoryStore.set(key, record)
          return record
        }
      } catch {
        // Ignore localStorage errors
      }
    }

    // Return new record
    record = { timestamps: [] }
    this.memoryStore.set(key, record)
    return record
  }

  /**
   * Save record to storage
   * @private
   */
  private saveRecord(key: string, record: AttemptRecord): void {
    // Save to memory
    this.memoryStore.set(key, record)

    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.getStorageKey(key), JSON.stringify(record))
      } catch {
        // Ignore localStorage errors (quota exceeded, etc.)
      }
    }
  }

  /**
   * Get storage key
   * @private
   */
  private getStorageKey(key: string): string {
    return `${this.storageKey}:${key}`
  }
}

// Pre-configured rate limiters for common operations
export const loginRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  storageKey: 'rate_limiter_login',
})

export const passwordResetRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  storageKey: 'rate_limiter_password_reset',
})

export const apiRateLimiter = new RateLimiter({
  maxAttempts: 100,
  windowMs: 60 * 1000, // 1 minute
  storageKey: 'rate_limiter_api',
})

export const formSubmitRateLimiter = new RateLimiter({
  maxAttempts: 10,
  windowMs: 60 * 1000, // 1 minute
  storageKey: 'rate_limiter_form_submit',
})

// Export the class for testing and custom instances
export { RateLimiter }

export default RateLimiter
