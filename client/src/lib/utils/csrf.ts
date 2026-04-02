/**
 * CSRF token management for frontend
 * Handles fetching and including CSRF tokens in API requests
 */

import { config } from '../constants/app.config'

const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Get CSRF token from cookie
 */
export const getCSRFTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value)
    }
  }
  return null
}

/**
 * Fetch CSRF token from server
 */
export const fetchCSRFToken = async (): Promise<string | null> => {
  try {
    // Use normalized fullUrl which already contains the /api suffix when appropriate
    const response = await fetch(`${config.api.fullUrl}/v1/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include', // CRITICAL: Must include credentials to get/set cookie
    })
    
    if (!response.ok) {
      console.warn('Failed to fetch CSRF token:', response.status)
      return null
    }
    
    const data = await response.json()
    const token = data?.csrfToken || data?.data?.csrfToken || null
    
    // The token should also be set in a cookie by the server
    // Wait a tiny bit for cookie to be set
    if (token && typeof document !== 'undefined') {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return token
  } catch (error) {
    console.error('Error fetching CSRF token:', error)
    return null
  }
}

/**
 * Get CSRF token (from cookie or fetch from server)
 */
export const getCSRFToken = async (): Promise<string | null> => {
  // First try to get from cookie
  let token = getCSRFTokenFromCookie()
  
  if (!token) {
    // If not in cookie, fetch from server
    token = await fetchCSRFToken()
  }
  
  return token
}

/**
 * Add CSRF token to request headers
 */
export const addCSRFTokenToHeaders = async (headers: Record<string, string> = {}): Promise<Record<string, string>> => {
  const token = await getCSRFToken()
  
  if (token) {
    headers[CSRF_HEADER_NAME] = token
  }
  
  return headers
}

/**
 * Check if request needs CSRF token
 */
export const needsCSRFToken = (method: string): boolean => {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())
}

/**
 * CSRF-aware fetch wrapper
 */
export const csrfFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const { method = 'GET', headers = {}, ...otherOptions } = options
  
  let finalHeaders = { ...headers } as Record<string, string>
  
  if (needsCSRFToken(method)) {
    finalHeaders = await addCSRFTokenToHeaders(finalHeaders)
  }
  
  return fetch(url, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    ...otherOptions
  })
}