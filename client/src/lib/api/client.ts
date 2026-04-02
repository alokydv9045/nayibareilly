import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios'
import { tokenStorage, emitAuthEvent, authEvents } from '../auth/auth-utils'
import { config } from '../constants/app.config'
import { getCSRFToken, needsCSRFToken } from '../utils/csrf'
/**
 * API client with:
 *  - Automatic bearer injection from unified token storage
 *  - CSRF token injection for state-changing requests
 *  - Single-flight refresh handling with exponential backoff
 *  - Error message normalization
 *  - Public helper to force logout/reset auth state
 */

// Root API origin (fallback aligned with server default 4012 if port override occurred)
const baseURL = config.api.fullUrl

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: config.api.timeout,
})

// Admin-scoped client (uses same token mechanism; backend enforces role)
export const adminApi = api

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    // Add authentication token
    const token = tokenStorage.get()
    if (token) {
      const headers = config.headers as unknown as { set?: (name: string, value: string) => void } & Record<string, unknown>
      if (typeof headers?.set === 'function') {
        headers.set('Authorization', `Bearer ${token}`)
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - index signature for headers
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    // Add CSRF token for state-changing requests
    if (needsCSRFToken(config.method || 'GET')) {
      const csrfToken = await getCSRFToken()
      if (csrfToken) {
        const headers = config.headers as unknown as { set?: (name: string, value: string) => void } & Record<string, unknown>
        if (typeof headers?.set === 'function') {
          headers.set('x-csrf-token', csrfToken)
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - index signature for headers
          headers['x-csrf-token'] = csrfToken
        }
      }
    }
  }
  return config
})

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshInFlight: Promise<string | null> | null = null
let consecutiveRefreshFailures = 0
const MAX_REFRESH_FAILURES = 3
// Cooldown window (ms) to prevent multiple rapid refresh attempts that might reuse an old cookie
const REFRESH_COOLDOWN_MS = 1500
let lastSuccessfulRefresh = 0

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)) }

async function performRefresh(): Promise<string | null> {
  // Return existing refresh promise if already in flight
  if (refreshInFlight) return refreshInFlight
  
  // If we very recently refreshed, wait for ongoing refresh or return cached token
  const now = Date.now()
  if (now - lastSuccessfulRefresh < REFRESH_COOLDOWN_MS) {
    // If there's an ongoing refresh, wait for it even in cooldown
    if (refreshInFlight) return refreshInFlight
    
    // Verify cached token exists and is valid
    const cachedToken = tokenStorage.get()
    if (cachedToken) return cachedToken
    
    // If no cached token, proceed with refresh despite cooldown
  }
  
  refreshInFlight = (async () => {
    try {
      const attempt = consecutiveRefreshFailures
      if (attempt > 0) {
        // exponential backoff: 100, 300, 900...
        const delay = 100 * Math.pow(3, attempt - 1)
        await sleep(Math.min(delay, 2000))
      }
  // Use normalized fullUrl which includes /api when needed
  const res = await fetch(`${config.api.fullUrl}/auth/refresh`, { method: 'POST', credentials: 'include' })
      if (!res.ok) {
        consecutiveRefreshFailures++
        return null
      }
      const json = await res.json().catch(() => null) as { data?: { accessToken?: string } } | null
      const token = json?.data?.accessToken || null
      if (token) {
        tokenStorage.set(token)
        consecutiveRefreshFailures = 0
        lastSuccessfulRefresh = Date.now()
      } else {
        consecutiveRefreshFailures++
      }
      return token
    } catch {
      consecutiveRefreshFailures++
      return null
    } finally {
      // Clear refresh promise after a short delay to allow concurrent requests to complete
      setTimeout(() => {
        refreshInFlight = null
      }, 100)
    }
  })()
  return refreshInFlight
}

export function resetAuthState() {
  tokenStorage.remove()
  if (typeof window !== 'undefined') {
    emitAuthEvent(authEvents.LOGOUT)
  }
}

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (err: AxiosError) => {
    const original = err.config as RetryableConfig | undefined

    // Prefer meaningful API error messages when available
    const data: unknown = err.response?.data
    const hasMessage = (data && typeof data === 'object' && 'message' in (data as Record<string, unknown>))
    const baseMessage = hasMessage ? String((data as { message?: unknown }).message || '') : ''
    // If server provided validator errors array, surface the first message
    let detail = ''
    if (data && typeof data === 'object' && 'errors' in (data as Record<string, unknown>)) {
      const errs = (data as { errors?: Array<{ msg?: string }> }).errors
      if (Array.isArray(errs) && errs.length > 0) {
        detail = errs[0]?.msg ? String(errs[0].msg) : ''
      }
    }
    const message = [baseMessage, detail].filter(Boolean).join(': ')
    if (message) {
      err.message = message
    }

    // Attempt silent refresh on 401 (browser only)
    if (err.response?.status === 401 && typeof window !== 'undefined' && original && !original._retry) {
      if (consecutiveRefreshFailures >= MAX_REFRESH_FAILURES) {
        resetAuthState()
        return Promise.reject(err)
      }
      original._retry = true
      const newToken = await performRefresh()
      if (newToken) {
        const headers = original.headers as unknown as { set?: (name: string, value: string) => void } & Record<string, string>
        if (typeof headers?.set === 'function') headers.set('Authorization', `Bearer ${newToken}`)
        else headers['Authorization'] = `Bearer ${newToken}`
        return api(original as AxiosRequestConfig)
      }
      resetAuthState()
    }
    return Promise.reject(err)
  }
)

// Global listener example (optional integration in app root):
// window.addEventListener('auth:reset', () => router.push('/login'))
