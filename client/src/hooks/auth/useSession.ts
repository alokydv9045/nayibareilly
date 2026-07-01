'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { me } from '@/lib/api/auth'
import { logger } from '@/lib/utils/logger'
import { 
  tokenStorage, 
  userStorage, 
  emitAuthEvent, 
  authEvents, 
  isAuthenticated,
  type AuthUser 
} from '@/lib/auth/auth-utils'
import socketService from '@/lib/services/socket-service'

export interface SessionState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  sessionExpiry: number | null
  lastActivity: number
}

export interface SessionOptions {
  heartbeatInterval?: number // How often to check session (ms)
  activityTimeout?: number // Session timeout due to inactivity (ms)
  warningBeforeExpiry?: number // Warning time before session expires (ms)
  autoRefresh?: boolean // Auto refresh session
  redirectOnExpiry?: string // Where to redirect on session expiry
}

const DEFAULT_OPTIONS: Required<SessionOptions> = {
  heartbeatInterval: 300000, // 5 minutes (reduced from 1 minute to prevent API spam)
  activityTimeout: 30 * 60 * 1000, // 30 minutes
  warningBeforeExpiry: 5 * 60 * 1000, // 5 minutes
  autoRefresh: true,
  redirectOnExpiry: '/login'
}

export default function useSessionManager(options: SessionOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const router = useRouter()
  
  // Quick check: if no token, start with isLoading: false
  const hasToken = typeof window !== 'undefined' && isAuthenticated()
  
  // Initialize activity timestamp immediately
  if (typeof window !== 'undefined' && !localStorage.getItem('ns_last_activity')) {
    localStorage.setItem('ns_last_activity', Date.now().toString())
  }
  
  const [sessionState, setSessionState] = useState<SessionState>({
    user: null,
    isLoading: hasToken, // Only show loading if we have a token
    isAuthenticated: false,
    sessionExpiry: null,
    lastActivity: Date.now()
  })

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const activityRef = useRef<NodeJS.Timeout | null>(null)
  const warningShownRef = useRef(false)
  const isActiveRef = useRef(true)
  
  // Request deduplication: prevent multiple simultaneous /me calls
  const validationInProgressRef = useRef(false)
  const lastValidationTimeRef = useRef(0)
  const VALIDATION_CACHE_MS = 5000 // Cache validation for 5 seconds

  // Handle session expiry
  const handleSessionExpiry = useCallback((reason: string) => {
    logger.debug('Session expired:', reason)
    
    setSessionState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      sessionExpiry: null
    }))

    if (typeof window !== 'undefined') {
      tokenStorage.remove()
      userStorage.remove()
      emitAuthEvent(authEvents.LOGOUT, { reason, auto: true })
      // Ensure any active socket connection is torn down immediately
      try { socketService.disconnect() } catch {}
      
      // Only show toast if user was actually authenticated
      const wasAuthenticated = sessionState.isAuthenticated
      if (wasAuthenticated) {
        toast.error(`Session expired: ${reason}`, {
          duration: 5000,
          icon: 'â°'
        })
      }
    }

    // Only redirect if user was authenticated
    if (sessionState.isAuthenticated) {
      router.push(opts.redirectOnExpiry)
    }
  }, [router, opts.redirectOnExpiry, sessionState.isAuthenticated])

  // Update last activity
  const updateActivity = useCallback(() => {
    const now = Date.now()
    // Slide the session expiry window on every user activity
    setSessionState(prev => ({ 
      ...prev, 
      lastActivity: now,
      sessionExpiry: now + opts.activityTimeout
    }))
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('ns_last_activity', now.toString())
      // Keep a timestamp that mirrors last activity for warning UI
      localStorage.setItem('ns_session_timestamp', now.toString())
    }

    // Reset activity timeout
    if (activityRef.current) {
      clearTimeout(activityRef.current)
    }
    
    activityRef.current = setTimeout(() => {
      if (isActiveRef.current) {
        handleSessionExpiry('Activity timeout')
      }
    }, opts.activityTimeout)

    warningShownRef.current = false
  }, [opts.activityTimeout, handleSessionExpiry])

  // Validate current session with deduplication
  const validateSession = useCallback(async () => {
    try {
      if (!isAuthenticated()) {
        setSessionState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false
        }))
        return false
      }

      // DEDUPLICATION: Check if validation already in progress
      if (validationInProgressRef.current) {
        console.log('â­ï¸ Session validation already in progress, skipping...')
        return true // Return current state
      }

      // CACHING: Check if we validated recently (within last 5 seconds)
      const now = Date.now()
      const timeSinceLastValidation = now - lastValidationTimeRef.current
      if (timeSinceLastValidation < VALIDATION_CACHE_MS && sessionState.user) {
        console.log('âœ… Using cached session (validated', Math.round(timeSinceLastValidation / 1000), 'seconds ago)')
        return true
      }

      // Mark validation as in progress
      validationInProgressRef.current = true
      console.log('ðŸ” Validating session with /api/auth/me...')

      // Add timeout for faster response (increased to 30 seconds for slower connections/development)
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Session validation timeout')), 30000)
      )

      const user = await Promise.race([me(), timeoutPromise])
      
      // Mark validation complete
      validationInProgressRef.current = false
      lastValidationTimeRef.current = Date.now()
      
      if (user) {
        console.log('âœ… Session valid:', user.email)
        setSessionState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          isLoading: false
        }))
        
        userStorage.set(user)
        emitAuthEvent(authEvents.USER_UPDATE, user)
        return true
      } else {
        handleSessionExpiry('Invalid session')
        return false
      }

    } catch (error) {
      // Mark validation complete on error
      validationInProgressRef.current = false
      
      console.error('Session validation failed:', error)
      
      // On timeout or network error, allow page to render
      if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('Network'))) {
        console.log('Session validation timeout/network error, allowing page render...')
        setSessionState(prev => ({
          ...prev,
          isLoading: false // Allow page to render
        }))
        return true // Keep current session state
      }
      
      handleSessionExpiry('Session validation failed')
      return false
    }
  }, [handleSessionExpiry, sessionState.user])

  // Session heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
    }

    heartbeatRef.current = setInterval(async () => {
      if (!isActiveRef.current) return

      const isValid = await validateSession()
      
      if (isValid && sessionState.sessionExpiry) {
        const timeUntilExpiry = sessionState.sessionExpiry - Date.now()
        
        // Show warning before expiry
        if (timeUntilExpiry <= opts.warningBeforeExpiry && !warningShownRef.current) {
          warningShownRef.current = true
          
          const minutes = Math.ceil(timeUntilExpiry / 60000)
          toast(`Session expires in ${minutes} minute${minutes !== 1 ? 's' : ''}`, {
            duration: 10000,
            icon: 'âš ï¸'
          })
        }
        
        // Handle expiry
        if (timeUntilExpiry <= 0) {
          handleSessionExpiry('Session timeout')
        }
      }
    }, opts.heartbeatInterval)
  }, [validateSession, sessionState.sessionExpiry, opts.heartbeatInterval, opts.warningBeforeExpiry, handleSessionExpiry])

  // Track if initialization has already happened
  const initializationDoneRef = useRef(false)

  // Initialize session
  const initializeSession = useCallback(async () => {
    if (typeof window === 'undefined') return
    if (initializationDoneRef.current) return // Prevent re-initialization
    
    initializationDoneRef.current = true

    setSessionState(prev => ({ ...prev, isLoading: true }))

    // Check for existing session
    const lastActivity = localStorage.getItem('ns_last_activity')
    const hasToken = isAuthenticated()
    
    // Only check activity timeout if user has a token and previous activity exists
    if (hasToken && lastActivity) {
      const timeSinceActivity = Date.now() - parseInt(lastActivity, 10)
      
      if (timeSinceActivity > opts.activityTimeout) {
        handleSessionExpiry('Session timeout due to inactivity')
        return
      }
    }

    // Validate current session
    const isValid = await validateSession()
    
    if (isValid) {
      // Establish sliding expiry either from last activity or now
      const base = lastActivity ? parseInt(lastActivity, 10) : Date.now()
      setSessionState(prev => ({ ...prev, sessionExpiry: base + opts.activityTimeout }))
      // Also reset activity timer
      updateActivity()
      startHeartbeat()
    }
  }, [validateSession, updateActivity, startHeartbeat, opts.activityTimeout, handleSessionExpiry])

  // Manual session refresh
  const refreshSession = useCallback(async () => {
    return await validateSession()
  }, [validateSession])

  // Activity listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      if (sessionState.isAuthenticated) {
        updateActivity()
      }
    }

    // Add activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // Listen for auth events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ns_token' && !e.newValue) {
        // Token removed in another tab
        setSessionState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false
        }))
      }
    }

    // Listen for custom auth events
    const handleAuthEvent = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.type === 'LOGOUT') {
        setSessionState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false
        }))
      }
    }

    // BroadcastChannel for cross-tab communication
    const channel = new BroadcastChannel('auth')
    channel.onmessage = (e) => {
      if (e.data.type === 'LOGOUT') {
        setSessionState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false
        }))
      }
    }

  window.addEventListener('storage', handleStorageChange)
  window.addEventListener(authEvents.LOGOUT, handleAuthEvent)

    // Page visibility API
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden
      
      if (!document.hidden && sessionState.isAuthenticated) {
        // Page became visible, refresh session
        void refreshSession()
        updateActivity()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleActivity) // treat refocus as activity

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(authEvents.LOGOUT, handleAuthEvent)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleActivity)
      channel.close()
    }
  }, [sessionState.isAuthenticated, updateActivity, refreshSession])

  // Initialize on mount - run only once
  useEffect(() => {
    void initializeSession()

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }
      if (activityRef.current) {
        clearTimeout(activityRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Login success handler
  const handleLoginSuccess = useCallback((user: AuthUser, token: string) => {
    const now = Date.now()
    
    setSessionState({
      user,
      isAuthenticated: true,
      isLoading: false,
      sessionExpiry: now + opts.activityTimeout,
      lastActivity: now
    })

    if (typeof window !== 'undefined') {
      localStorage.setItem('ns_session_timestamp', now.toString())
      localStorage.setItem('ns_last_activity', now.toString())
    }

    updateActivity()
    startHeartbeat()
    
    emitAuthEvent(authEvents.LOGIN, { user, token })
  }, [opts.activityTimeout, updateActivity, startHeartbeat])

  // Logout handler
  const handleLogoutSuccess = useCallback(() => {
    setSessionState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      sessionExpiry: null,
      lastActivity: Date.now()
    })

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
    }
    if (activityRef.current) {
      clearTimeout(activityRef.current)
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('ns_session_timestamp')
      localStorage.removeItem('ns_last_activity')
    }

    isActiveRef.current = false
    try { socketService.disconnect() } catch {}
  }, [])

  return {
    ...sessionState,
    refreshSession,
    updateActivity,
    handleLoginSuccess,
    handleLogoutSuccess,
    isSessionValid: sessionState.isAuthenticated && !!sessionState.user
  }
}