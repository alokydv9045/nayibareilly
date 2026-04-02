/**
 * Unified token management utility
 * Standardizes token storage and auth state management across the application
 */

export const AUTH_TOKEN_KEY = 'ns_token' as const
export const AUTH_USER_KEY = 'ns_user' as const

export type AuthUser = {
  id: string
  email: string
  name: string
  roles: string[]
  avatarUrl?: string
  isVerified?: boolean
  requestedRole?: string
  departmentId?: string
}

export type AuthTokens = {
  accessToken: string
  user: AuthUser
}

/**
 * Token storage utilities
 */
export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null
    try {
      // Check new standard key first
      let token = localStorage.getItem(AUTH_TOKEN_KEY)
      
      // Fallback to legacy keys for backward compatibility
      if (!token) {
        token = localStorage.getItem('admin_token') || localStorage.getItem('token')
        
        // If found in legacy key, migrate to new key
        if (token) {
          localStorage.setItem(AUTH_TOKEN_KEY, token)
          localStorage.removeItem('admin_token')
          localStorage.removeItem('token')
        }
      }
      
      return token
    } catch {
      return null
    }
  },

  set: (token: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token)
      // Clean up legacy keys when setting new token
      localStorage.removeItem('admin_token')
      localStorage.removeItem('token')
    } catch (error) {
      console.error('Failed to store auth token:', error)
    }
  },

  remove: (): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
      // Clean up legacy tokens
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      localStorage.removeItem('token')
      localStorage.removeItem('nagarsetu_admin_session')
    } catch (error) {
      console.error('Failed to remove auth tokens:', error)
    }
  }
}

/**
 * User data storage utilities
 */
export const userStorage = {
  get: (): AuthUser | null => {
    if (typeof window === 'undefined') return null
    try {
      // Check new standard key first
      let userData = localStorage.getItem(AUTH_USER_KEY)
      
      // Fallback to legacy key for backward compatibility
      if (!userData) {
        userData = localStorage.getItem('admin_user')
        
        // If found in legacy key, migrate to new key
        if (userData) {
          localStorage.setItem(AUTH_USER_KEY, userData)
          localStorage.removeItem('admin_user')
        }
      }
      
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  },

  set: (user: AuthUser): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
      // Clean up legacy key when setting new data
      localStorage.removeItem('admin_user')
    } catch (error) {
      console.error('Failed to store user data:', error)
    }
  },

  remove: (): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(AUTH_USER_KEY)
      localStorage.removeItem('admin_user')
    } catch (error) {
      console.error('Failed to remove user data:', error)
    }
  }
}

/**
 * Auth state management
 */
export const authEvents = {
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout', 
  TOKEN_REFRESH: 'auth:token-refresh',
  USER_UPDATE: 'auth:user-update'
} as const

export const emitAuthEvent = (event: string, data?: unknown) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(event, { detail: data }))
  
  // Also dispatch storage event for backwards compatibility
  if (event === authEvents.LOGOUT) {
    window.dispatchEvent(new StorageEvent('storage', {
      key: AUTH_TOKEN_KEY,
      oldValue: 'removed',
      newValue: null,
      url: window.location.href
    }))
  }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!tokenStorage.get()
}

/**
 * Get user role hierarchy level (for role comparison)
 */
export const getRoleLevel = (role: string): number => {
  const levels: Record<string, number> = {
    'citizen': 1,
    'staff': 2,
    'moderator': 3,
    'org_admin': 4,
    'super_admin': 5
  }
  return levels[role.toLowerCase()] || 0
}

/**
 * Check if user has required role or higher
 */
export const hasRole = (userRoles: string[], requiredRole: string): boolean => {
  if (!userRoles || userRoles.length === 0) return false
  
  const requiredLevel = getRoleLevel(requiredRole)
  return userRoles.some(role => getRoleLevel(role) >= requiredLevel)
}

/**
 * Get primary role (highest level role)
 */
export const getPrimaryRole = (roles: string[]): string => {
  if (!roles || roles.length === 0) return 'citizen'
  
  return roles.reduce((highest, current) => {
    return getRoleLevel(current) > getRoleLevel(highest) ? current : highest
  }, roles[0])
}