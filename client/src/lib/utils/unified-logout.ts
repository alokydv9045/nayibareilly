/**
 * Unified Logout Utility
 * 
 * This module provides a centralized logout function that ensures complete
 * session cleanup across all dashboards and contexts.
 * 
 * Features:
 * - Clears all authentication tokens (ns_token, admin_token, token, etc.)
 * - Disconnects Socket.IO connections
 * - Clears session and user data
 * - Calls backend logout API to invalidate refresh tokens
 * - Broadcasts logout event to other tabs/windows
 * - Emits auth events for cleanup
 * - Clears auth-related cookies
 */

import { toast } from 'react-hot-toast'
import socketService from '@/lib/services/socket-service'
import { tokenStorage, userStorage, emitAuthEvent, authEvents } from '@/lib/auth/auth-utils'
import { config } from '@/lib/constants/app.config'

export interface UnifiedLogoutOptions {
  /**
   * Show toast notifications during logout
   * @default true
   */
  showToast?: boolean
  
  /**
   * Path to redirect to after logout
   * @default '/'
   */
  redirectTo?: string
  
  /**
   * Callback after successful logout
   */
  onSuccess?: () => void
  
  /**
   * Callback on logout error
   */
  onError?: (error: string) => void
  
  /**
   * Whether this is a silent logout (no user feedback)
   * @default false
   */
  silent?: boolean
  
  /**
   * Timeout for logout API call in milliseconds
   * @default 10000
   */
  timeout?: number
}

/**
 * Clears all authentication tokens from localStorage
 */
function clearAllTokens(): void {
  if (typeof window === 'undefined') return
  
  const tokenKeys = [
    'ns_token',           // Citizen token
    'admin_token',        // Admin token
    'token',              // Generic token
    'nayibareilly_admin_session', // Admin session
    'nagarsetu_admin_session',    // Legacy admin session
    'ns_refresh_token',   // Refresh token
    'admin_user',         // Admin user data
    'ns_user',            // Citizen user data
    'ns_session_timestamp', // Session timestamp
    'ns_last_activity',   // Last activity
    'ns_auto_login',      // Auto login flag
  ]
  
  tokenKeys.forEach(key => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(`Failed to remove ${key}:`, error)
    }
  })
  
  // Also use auth-utils token storage
  try {
    tokenStorage.remove()
    userStorage.remove()
  } catch (error) {
    console.warn('Failed to clear auth-utils storage:', error)
  }
}

/**
 * Clears all auth-related cookies
 */
function clearAuthCookies(): void {
  if (typeof window === 'undefined' || !document.cookie) return
  
  try {
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie
      const trimmedName = name.trim().toLowerCase()
      
      // Clear cookies that contain auth-related keywords
      if (
        trimmedName.includes('auth') || 
        trimmedName.includes('token') ||
        trimmedName.includes('session') ||
        trimmedName.includes('refresh') ||
        trimmedName.includes('admin')
      ) {
        // Clear for all possible paths
        const paths = ['/', '/techadmin', '/mayor', '/department', '/moderator', '/staff', '/app']
        paths.forEach(path => {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${window.location.hostname}`
        })
      }
    })
  } catch (error) {
    console.warn('Failed to clear cookies:', error)
  }
}

/**
 * Disconnects Socket.IO connection
 */
function disconnectSocket(): void {
  try {
    socketService.disconnect()
  } catch (error) {
    console.warn('Failed to disconnect socket:', error)
  }
}

/**
 * Calls backend logout API to invalidate refresh token
 */
async function callLogoutAPI(timeout: number = 10000): Promise<void> {
  const apiUrl = config.api.fullUrl || 'https://nayibareilly.onrender.com/api'
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    // Import CSRF function dynamically to avoid circular dependency
    const { getCSRFToken } = await import('./csrf')
    const csrfToken = await getCSRFToken()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Add CSRF token if available
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }
    
    const response = await fetch(`${apiUrl}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      signal: controller.signal,
      headers,
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.warn('Logout API returned non-OK status:', response.status)
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Logout API call timed out')
    } else {
      console.warn('Logout API call failed:', error)
    }
    // Don't throw - we still want to complete local cleanup
  }
}

/**
 * Broadcasts logout event to other tabs/windows
 */
function broadcastLogout(): void {
  if (typeof window === 'undefined') return
  
  try {
    // Use auth-utils event system
    emitAuthEvent(authEvents.LOGOUT, { timestamp: Date.now() })
    
    // Use BroadcastChannel API
    const channel = new BroadcastChannel('auth')
    channel.postMessage({ 
      type: 'LOGOUT', 
      timestamp: Date.now(),
      source: 'unified-logout'
    })
    channel.close()
  } catch (error) {
    console.warn('Failed to broadcast logout:', error)
  }
}

/**
 * Unified logout function
 * 
 * Performs complete logout cleanup including:
 * - Token removal
 * - Socket disconnection
 * - Backend API call
 * - Cookie clearing
 * - Event broadcasting
 * 
 * @param options - Logout configuration options
 * @returns Promise that resolves when logout is complete
 */
export async function unifiedLogout(options: UnifiedLogoutOptions = {}): Promise<void> {
  const {
    showToast = true,
    redirectTo: _redirectTo = '/',
    onSuccess,
    onError,
    silent = false,
    timeout = 10000,
  } = options
  
  let loadingToastId: string | undefined
  
  try {
    // Show loading toast
    if (showToast && !silent) {
      loadingToastId = toast.loading('Logging out...', {
        duration: timeout,
      })
    }
    
    // 1. Disconnect socket first to stop receiving updates
    disconnectSocket()
    
    // 2. Call backend logout API
    await callLogoutAPI(timeout)
    
    // 3. Clear all tokens and session data
    clearAllTokens()
    
    // 4. Clear auth cookies
    clearAuthCookies()
    
    // 5. Broadcast logout to other tabs
    broadcastLogout()
    
    // Dismiss loading toast
    if (loadingToastId) {
      toast.dismiss(loadingToastId)
    }
    
    // Show success toast
    if (showToast && !silent) {
      toast.success('Logged out successfully! ðŸ‘‹', {
        duration: 3000,
        icon: 'âœ…'
      })
    }
    
    // Call success callback
    onSuccess?.()
    
  } catch (error) {
    console.error('Unified logout error:', error)
    
    // Dismiss loading toast
    if (loadingToastId) {
      toast.dismiss(loadingToastId)
    }
    
    // Still perform local cleanup even on error
    disconnectSocket()
    clearAllTokens()
    clearAuthCookies()
    broadcastLogout()
    
    const errorMessage = error instanceof Error ? error.message : 'Logout failed'
    
    // Show error toast
    if (showToast && !silent) {
      toast.error(`Logout error: ${errorMessage}`, {
        duration: 5000,
        icon: 'âš ï¸'
      })
    }
    
    // Call error callback
    onError?.(errorMessage)
    
    // Don't throw - logout should always complete locally
  }
}

/**
 * Check if user is logged in (has any valid token)
 */
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  
  // Use tokenStorage which checks both new and legacy keys
  const token = tokenStorage.get()
  return !!token
}

/**
 * Get the currently active token (prioritized)
 */
export function getActiveToken(): string | null {
  if (typeof window === 'undefined') return null
  
  // Use tokenStorage which handles priority and migration
  return tokenStorage.get()
}

/**
 * Get the user role based on which token is active
 */
export function getUserRole(): 'citizen' | 'admin' | 'staff' | 'guest' {
  if (typeof window === 'undefined') return 'guest'
  
  // Check for admin user data first
  const user = userStorage.get()
  if (user) {
    // If we have user data with roles, use that to determine role
    return 'admin' // Admin users are stored in userStorage
  }
  
  // Check for citizen token
  if (tokenStorage.get()) return 'citizen'
  
  return 'guest'
}

export default unifiedLogout