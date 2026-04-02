'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useSession } from '@/lib/providers/SessionProvider'
import { 
  tokenStorage, 
  userStorage, 
  authEvents
} from '@/lib/auth/auth-utils'
import { selectPrimaryRole, getDefaultRouteForRole } from '@/lib/constants/roles'

interface LoginStatePersistenceProps {
  children: React.ReactNode
  enableAutoLogin?: boolean
  rememberLoginPreference?: boolean
  showRestorationToast?: boolean
}

export default function LoginStatePersistence({ 
  children, 
  enableAutoLogin = true,
  rememberLoginPreference = true,
  showRestorationToast = true
}: LoginStatePersistenceProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated: sessionAuth, handleLoginSuccess, isLoading } = useSession()
  const [isInitialized, setIsInitialized] = useState(true) // Start as initialized to prevent blocking
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false)

  // Auto-login preference management
  const setAutoLoginPreference = useCallback((enabled: boolean) => {
    if (typeof window !== 'undefined' && rememberLoginPreference) {
      localStorage.setItem('ns_auto_login', enabled.toString())
    }
  }, [rememberLoginPreference])

  const getAutoLoginPreference = useCallback((): boolean => {
    if (typeof window === 'undefined' || !rememberLoginPreference) return enableAutoLogin
    const stored = localStorage.getItem('ns_auto_login')
    return stored ? stored === 'true' : enableAutoLogin
  }, [rememberLoginPreference, enableAutoLogin])

  // Session restoration
  const attemptSessionRestore = useCallback(async () => {
    try {
      const token = tokenStorage.get()
      const storedUser = userStorage.get()
      
      if (!token || !storedUser) {
        setIsInitialized(true)
        return false
      }

      // Check if session data is valid
      if (!storedUser.id || !storedUser.email) {
        console.log('Invalid stored user data, clearing...')
        tokenStorage.remove()
        userStorage.remove()
        setIsInitialized(true)
        return false
      }

      // Restore user session
      handleLoginSuccess(storedUser, token)
      
      // Handle role-based redirection only from login page (non-blocking)
      // Don't redirect from homepage - let users stay there if they want
      if (pathname === '/login') {
        const roles = Array.isArray(storedUser.roles) ? storedUser.roles : []
        const primaryRole = selectPrimaryRole(roles)
        
        if (primaryRole) {
          const defaultRoute = getDefaultRouteForRole(primaryRole)
          if (defaultRoute && defaultRoute !== '/login') {
            // Use setTimeout to prevent blocking the UI
            setTimeout(() => router.push(defaultRoute), 0)
          }
        }
      }

      // Show toast after a slight delay to avoid blocking
      if (showRestorationToast) {
        setTimeout(() => {
          toast.success('Session restored! Welcome back.', {
            duration: 2000,
            icon: '🔄'
          })
        }, 100)
      }

      setIsInitialized(true)
      return true

    } catch (error) {
      console.error('Session restore failed:', error)
      
      // Clear potentially corrupted data
      tokenStorage.remove()
      userStorage.remove()
      
      setIsInitialized(true)
      return false
    }
  }, [handleLoginSuccess, pathname, router, showRestorationToast])

  // Initialize session restoration on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (hasAttemptedRestore) return

      setHasAttemptedRestore(true)

      // Set a shorter timeout for faster page rendering
      const timeoutId = setTimeout(() => {
        console.log('Session initialization timeout, rendering page...')
        setIsInitialized(true)
      }, 800) // Reduced to 800ms for faster initial load

      try {
        // Only attempt auto-restore if enabled
        if (getAutoLoginPreference()) {
          await attemptSessionRestore()
        } else {
          setIsInitialized(true)
        }
      } finally {
        clearTimeout(timeoutId)
      }
    }

    if (typeof window !== 'undefined' && !isLoading) {
      void initializeAuth()
    }
  }, [isLoading, hasAttemptedRestore, getAutoLoginPreference, attemptSessionRestore])

  // Listen for auth events from other components
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleLoginEvent = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.user && customEvent.detail?.token) {
        // Update auto-login preference on successful login
        setAutoLoginPreference(true)
      }
    }

    const handleLogoutEvent = () => {
      // Clear restoration state on logout
      setHasAttemptedRestore(false)
      setIsInitialized(false)
    }

    window.addEventListener(authEvents.LOGIN, handleLoginEvent)
    window.addEventListener(authEvents.LOGOUT, handleLogoutEvent)

    return () => {
      window.removeEventListener(authEvents.LOGIN, handleLoginEvent)
      window.removeEventListener(authEvents.LOGOUT, handleLogoutEvent)
    }
  }, [setAutoLoginPreference])

  // Cross-tab session synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ns_token') {
        if (e.newValue && !sessionAuth) {
          // Token added in another tab, attempt restore
          void attemptSessionRestore()
        } else if (!e.newValue && sessionAuth) {
          // Token removed in another tab, trigger logout
          window.dispatchEvent(new CustomEvent(authEvents.LOGOUT, {
            detail: { crossTab: true }
          }))
        }
      }
    }

    const handleBroadcastMessage = (e: MessageEvent) => {
      if (e.data.type === 'LOGIN' && e.data.user && !sessionAuth) {
        // Another tab logged in, restore session
        void attemptSessionRestore()
      } else if (e.data.type === 'LOGOUT' && sessionAuth) {
        // Another tab logged out, clear current session
        window.dispatchEvent(new CustomEvent(authEvents.LOGOUT, {
          detail: { crossTab: true }
        }))
      }
    }

    const channel = new BroadcastChannel('auth')
    
    window.addEventListener('storage', handleStorageChange)
    channel.addEventListener('message', handleBroadcastMessage)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      channel.removeEventListener('message', handleBroadcastMessage)
      channel.close()
    }
  }, [sessionAuth, attemptSessionRestore])

  // Handle page visibility changes for session validation
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleVisibilityChange = () => {
      if (!document.hidden && sessionAuth && user) {
        // Page became visible and user is authenticated, validate session
        const token = tokenStorage.get()
        const storedUser = userStorage.get()
        
        if (!token || !storedUser) {
          // Session data missing, trigger logout
          window.dispatchEvent(new CustomEvent(authEvents.LOGOUT, {
            detail: { reason: 'Session data missing' }
          }))
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [sessionAuth, user])

  // Session backup and recovery
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionAuth || !user) return

    // Create session backup
    const sessionBackup = {
      user,
      timestamp: Date.now(),
      pathname: pathname
    }

    localStorage.setItem('ns_session_backup', JSON.stringify(sessionBackup))

    // Cleanup old backups (older than 1 hour)
    const cleanup = () => {
      try {
        const backup = localStorage.getItem('ns_session_backup')
        if (backup) {
          const data = JSON.parse(backup)
          if (Date.now() - data.timestamp > 60 * 60 * 1000) {
            localStorage.removeItem('ns_session_backup')
          }
        }
      } catch {
        localStorage.removeItem('ns_session_backup')
      }
    }

    cleanup()
  }, [sessionAuth, user, pathname])

  // Show subtle loading indicator while initializing (but don't block the page)
  if (!isInitialized && isLoading) {
    return (
      <>
        {children}
        <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-3 flex items-center gap-2 border border-gray-200">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Checking session...</p>
        </div>
      </>
    )
  }

  return <>{children}</>
}

// Hook for manual session restoration
export const useSessionRestore = () => {
  const { handleLoginSuccess } = useSession()
  const [isRestoring, setIsRestoring] = useState(false)

  const restoreSession = async (): Promise<boolean> => {
    setIsRestoring(true)
    
    try {
      const token = tokenStorage.get()
      const storedUser = userStorage.get()
      
      if (!token || !storedUser) {
        return false
      }

      handleLoginSuccess(storedUser, token)
      
      toast.success('Session restored successfully!', {
        duration: 3000,
        icon: '✅'
      })
      
      return true

    } catch (error) {
      console.error('Manual session restore failed:', error)
      
      tokenStorage.remove()
      userStorage.remove()
      
      toast.error('Failed to restore session. Please log in again.', {
        duration: 3000,
        icon: '❌'
      })
      
      return false

    } finally {
      setIsRestoring(false)
    }
  }

  const clearSession = () => {
    tokenStorage.remove()
    userStorage.remove()
    localStorage.removeItem('ns_session_backup')
    localStorage.removeItem('ns_auto_login')
    
    toast.success('Session cleared successfully!', {
      duration: 2000,
      icon: '🧹'
    })
  }

  return {
    restoreSession,
    clearSession,
    isRestoring
  }
}
