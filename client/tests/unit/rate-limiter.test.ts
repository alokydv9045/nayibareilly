/**
 * Unit tests for Rate Limiter utility
 * Tests token bucket algorithm implementation
 */

/// <reference types="jest" />

import {
  RateLimiter,
  loginRateLimiter,
  passwordResetRateLimiter,
  apiRateLimiter,
  formSubmitRateLimiter,
} from '@/lib/utils/rate-limiter'

// Mock localStorage for testing
global.localStorage = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    length: Object.keys(store).length,
    key: (index: number) => Object.keys(store)[index] || null,
  } as Storage
})()

describe('RateLimiter', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Constructor', () => {
    it('should create instance with default options', () => {
      const limiter = new RateLimiter({
        maxAttempts: 5,
        windowMs: 60000,
        storageKey: 'test',
      })
      expect(limiter).toBeInstanceOf(RateLimiter)
    })

    it('should create instance with custom options', () => {
      const limiter = new RateLimiter({
        maxAttempts: 10,
        windowMs: 120000,
        storageKey: 'test-custom',
      })
      expect(limiter).toBeInstanceOf(RateLimiter)
    })
  })

  describe('check()', () => {
    it('should return true when no attempts recorded', () => {
      const limiter = new RateLimiter({
        maxAttempts: 3,
        windowMs: 60000,
        storageKey: 'test-check',
      })
      expect(limiter.check('user1')).toBe(true)
    })

    it('should return true when under limit', () => {
      const limiter = new RateLimiter({
        maxAttempts: 3,
        windowMs: 60000,
        storageKey: 'test-check-under',
      })
      limiter.recordAttempt('user1')
      limiter.recordAttempt('user1')
      expect(limiter.check('user1')).toBe(true)
    })

    it('should return false when at limit', () => {
      const limiter = new RateLimiter({
        maxAttempts: 3,
        windowMs: 60000,
        storageKey: 'test-check-at',
      })
      limiter.recordAttempt('user1')
      limiter.recordAttempt('user1')
      limiter.recordAttempt('user1')
      expect(limiter.check('user1')).toBe(false)
    })

    it('should return false when over limit', () => {
      const limiter = new RateLimiter({
        maxAttempts: 2,
        windowMs: 60000,
        storageKey: 'test-check-over',
      })
      limiter.recordAttempt('user1')
      limiter.recordAttempt('user1')
      expect(limiter.check('user1')).toBe(false)
    })
  })

  describe('recordAttempt()', () => {
    it('should record single attempt', () => {
      const limiter = new RateLimiter({
        maxAttempts: 3,
        windowMs: 60000,
        storageKey: 'test-record',
      })
      limiter.recordAttempt('user1')
      expect(limiter.getRemainingAttempts('user1')).toBe(2)
    })

    it('should record multiple attempts', () => {
      const limiter = new RateLimiter({
        maxAttempts: 5,
        windowMs: 60000,
        storageKey: 'test-record-multiple',
      })
      limiter.recordAttempt('user1')
      limiter.recordAttempt('user1')
      limiter.recordAttempt('user1')
      expect(limiter.getRemainingAttempts('user1')).toBe(2)
    })

    it('should trigger rate limit when max attempts reached', () => {
      const limiter = new RateLimiter({
        maxAttempts: 2,
        windowMs: 60000,
        storageKey: 'test-record-exceed',
      })
      limiter.recordAttempt('user1')
      limiter.recordAttempt('user1')
      expect(limiter.check('user1')).toBe(false)
    })
  })

  describe('checkAndRecord()', () => {
    it('should check and record in one call', () => {
      const limiter = new RateLimiter({
        maxAttempts: 3,
        windowMs: 60000,
        storageKey: 'test-check-record',
      })
      expect(limiter.checkAndRecord('user1')).toBe(true)
      expect(limiter.getRemainingAttempts('user1')).toBe(2)
    })

    it('should return false when rate limited', () => {
      const limiter = new RateLimiter({
        maxAttempts: 2,
        windowMs: 60000,
        storageKey: 'test-check-record-block',
      })
      expect(limiter.checkAndRecord('user1')).toBe(true)
      expect(limiter.checkAndRecord('user1')).toBe(true)
      expect(limiter.checkAndRecord('user1')).toBe(false)
    })
  })

  describe('getRemainingAttempts()', () => {
    it('should return max attempts initially', () => {
      const limiter = new RateLimiter({
        maxAttempts: 5,
        windowMs: 60000,
        storageKey: 'test-remaining',
      })
      expect(limiter.getRemainingAttempts('user1')).toBe(5)
    })

    it('should decrease with each attempt', () => {
      const limiter = new RateLimiter({
        maxAttempts: 5,
        windowMs: 60000,
        storageKey: 'test-remaining-decrease',
      })
      limiter.recordAttempt('user1')
      expect(limiter.getRemainingAttempts('user1')).toBe(4)
      limiter.recordAttempt('user1')
      expect(limiter.getRemainingAttempts('user1')).toBe(3)
      limiter.recordAttempt('user1')
      expect(limiter.getRemainingAttempts('user1')).toBe(2)
    })

    it('should return 0 when rate limited', () => {
      const limiter = new RateLimiter({
        maxAttempts: 2,
        windowMs: 60000,
        storageKey: 'test-remaining-blocked',
      })
      limiter.recordAttempt('user1')
      limiter.recordAttempt('user1')
      expect(limiter.getRemainingAttempts('user1')).toBe(0)
    })
  })

  describe('getResetTime()', () => {
    it('should return 0 when no rate limit', () => {
      const limiter = new RateLimiter({
        maxAttempts: 3,
        windowMs: 60000,
        storageKey: 'test-reset-time',
      })
      expect(limiter.getResetTime('user1')).toBe(0)
    })

    it('should return time in milliseconds when rate limited', () => {
      const limiter = new RateLimiter({
        maxAttempts: 2,
        windowMs: 60000,
        storageKey: 'test-reset-time-blocked',
      })
      limiter.recordAttempt('user1')
      limiter.recordAttempt('user1')
      limiter.check('user1') // Trigger block
      
      const resetTime = limiter.getResetTime('user1')
      expect(resetTime).toBeGreaterThan(0)
      expect(resetTime).toBeLessThanOrEqual(60000)
    })

    it('should return correct reset time', () => {
      const limiter = new RateLimiter({
        maxAttempts: 1,
        windowMs: 60000,
        storageKey: 'test-reset-time-correct',
      })
      const now = Date.now()
      jest.setSystemTime(now)

      limiter.recordAttempt('user1')
      limiter.check('user1') // Trigger block

      const resetTime = limiter.getResetTime('user1')
      expect(resetTime).toBeGreaterThan(0)
    })
  })

  describe('clear()', () => {
    it('should clear attempts for specific key', () => {
      const limiter = new RateLimiter({
        maxAttempts: 3,
        windowMs: 60000,
        storageKey: 'test-clear',
      })
      limiter.recordAttempt('user1')
      limiter.recordAttempt('user1')
      limiter.recordAttempt('user1')

      limiter.clear('user1')

      expect(limiter.check('user1')).toBe(true)
      expect(limiter.getRemainingAttempts('user1')).toBe(3)
    })

    it('should unblock after clear', () => {
      const limiter = new RateLimiter({
        maxAttempts: 2,
        windowMs: 60000,
        storageKey: 'test-clear-unblock',
      })
      limiter.recordAttempt('user1')
      limiter.recordAttempt('user1')
      limiter.check('user1') // Trigger block

      expect(limiter.check('user1')).toBe(false)
      limiter.clear('user1')
      expect(limiter.check('user1')).toBe(true)
    })
  })

  describe('Window expiration', () => {
    it('should reset attempts after window expires', () => {
      const limiter = new RateLimiter({
        maxAttempts: 3,
        windowMs: 60000,
        storageKey: 'test-window-expire',
      })

      limiter.recordAttempt('user1')
      limiter.recordAttempt('user1')
      expect(limiter.getRemainingAttempts('user1')).toBe(1)

      // Fast forward time past window
      jest.advanceTimersByTime(61000)

      // Should be reset
      expect(limiter.getRemainingAttempts('user1')).toBe(3)
    })

    it('should unblock after block duration expires', () => {
      const limiter = new RateLimiter({
        maxAttempts: 2,
        windowMs: 60000,
        storageKey: 'test-block-expire',
      })

      limiter.recordAttempt('user1')
      limiter.recordAttempt('user1')
      limiter.check('user1') // Trigger block

      expect(limiter.check('user1')).toBe(false)

      // Fast forward past block duration
      jest.advanceTimersByTime(61000)

      // Should be unblocked
      expect(limiter.check('user1')).toBe(true)
    })
  })

  describe('LocalStorage persistence', () => {
    it('should persist attempts to localStorage', () => {
      const limiter1 = new RateLimiter({
        maxAttempts: 3,
        windowMs: 60000,
        storageKey: 'test-persist',
      })

      limiter1.recordAttempt('user1')
      limiter1.recordAttempt('user1')

      // Create new instance with same key
      const limiter2 = new RateLimiter({
        maxAttempts: 3,
        windowMs: 60000,
        storageKey: 'test-persist',
      })

      // Should have same state
      expect(limiter2.getRemainingAttempts('user1')).toBe(1)
    })

    it('should persist block state', () => {
      const limiter1 = new RateLimiter({
        maxAttempts: 2,
        windowMs: 60000,
        storageKey: 'test-persist-block',
      })

      limiter1.recordAttempt('user1')
      limiter1.recordAttempt('user1')
      limiter1.check('user1') // Trigger block

      // Create new instance
      const limiter2 = new RateLimiter({
        maxAttempts: 2,
        windowMs: 60000,
        storageKey: 'test-persist-block',
      })

      // Should still be blocked
      expect(limiter2.check('user1')).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle zero max attempts', () => {
      const limiter = new RateLimiter({
        maxAttempts: 0,
        windowMs: 60000,
        storageKey: 'test-zero',
      })
      expect(limiter.check('user1')).toBe(false)
    })

    it('should handle very large max attempts', () => {
      const limiter = new RateLimiter({
        maxAttempts: 1000000,
        windowMs: 60000,
        storageKey: 'test-large',
      })
      expect(limiter.check('user1')).toBe(true)
      limiter.recordAttempt('user1')
      expect(limiter.getRemainingAttempts('user1')).toBe(999999)
    })

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('test-corrupt:corrupt-key', 'invalid-json')

      const limiter = new RateLimiter({
        maxAttempts: 3,
        windowMs: 60000,
        storageKey: 'test-corrupt',
      })

      // Should not throw and should work normally
      expect(limiter.check('corrupt-key')).toBe(true)
      expect(limiter.getRemainingAttempts('corrupt-key')).toBe(3)
    })

    it('should isolate different users', () => {
      const limiter = new RateLimiter({
        maxAttempts: 2,
        windowMs: 60000,
        storageKey: 'test-isolate',
      })

      limiter.recordAttempt('user1')
      limiter.recordAttempt('user1')

      // user1 should be blocked
      expect(limiter.check('user1')).toBe(false)

      // user2 should still be allowed
      expect(limiter.check('user2')).toBe(true)
      expect(limiter.getRemainingAttempts('user2')).toBe(2)
    })
  })

  describe('Pre-configured instances', () => {
    it('should export loginRateLimiter', () => {
      expect(loginRateLimiter).toBeInstanceOf(RateLimiter)
    })

    it('should export passwordResetRateLimiter', () => {
      expect(passwordResetRateLimiter).toBeInstanceOf(RateLimiter)
    })

    it('should export apiRateLimiter', () => {
      expect(apiRateLimiter).toBeInstanceOf(RateLimiter)
    })

    it('should export formSubmitRateLimiter', () => {
      expect(formSubmitRateLimiter).toBeInstanceOf(RateLimiter)
    })

    it('should have correct configuration for loginRateLimiter', () => {
      expect(loginRateLimiter.getRemainingAttempts('test-user')).toBe(5)
    })

    it('should have correct configuration for formSubmitRateLimiter', () => {
      expect(formSubmitRateLimiter.getRemainingAttempts('test-user')).toBe(10)
    })
  })
})
