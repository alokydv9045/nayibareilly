import { api } from './client'
import { tokenStorage, userStorage, emitAuthEvent, authEvents } from '../auth/auth-utils'
import { config } from '../constants/app.config'

const toMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'string') return err
  if (err && typeof err === 'object' && 'message' in (err as Record<string, unknown>)) {
    const m = (err as { message?: unknown }).message
    if (typeof m === 'string' && m.trim()) return m
  }
  return fallback
}

export type LoginPayload = { email: string; password: string }
export type RegisterPayload = { 
  email: string; 
  password: string; 
  name?: string; 
  phone?: string; 
  address?: string; 
  requestedRole?: string 
}

export const login = async (payload: LoginPayload) => {
  try {
    const { data } = await api.post('/auth/login', payload)
    const token = data?.data?.token
    const user = data?.data?.user
    
    if (typeof window !== 'undefined' && token && user) {
      tokenStorage.set(token)
      userStorage.set(user)
      emitAuthEvent(authEvents.LOGIN, { token, user })
    }
    return data?.data
  } catch (err: unknown) {
    throw new Error(toMessage(err, 'Login failed'))
  }
}

export const register = async (payload: RegisterPayload) => {
  try {
    const { data } = await api.post('/auth/register', payload)
    const token = data?.data?.token
    const user = data?.data?.user
    
    if (typeof window !== 'undefined' && token && user) {
      tokenStorage.set(token)
      userStorage.set(user)
      emitAuthEvent(authEvents.LOGIN, { token, user })
    }
    return data?.data
  } catch (err: unknown) {
    // Interceptor already maps server message (e.g., 409 Email already in use) into err.message
    throw new Error(toMessage(err, 'Signup failed'))
  }
}

export const me = async () => {
  const { data } = await api.get('/auth/me')
  return data?.data?.user
}

export const logout = async () => {
  try {
    // Get token before removing it
    const token = typeof window !== 'undefined' ? tokenStorage.get() : null
    
    // Call logout endpoint with proper authorization
    if (token) {
      await fetch(`${config.api.fullUrl}/auth/logout`, { 
        method: 'POST', 
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    }
  } catch (error) {
    // Ignore logout API errors - we'll still clear local storage
    console.warn('Logout API call failed, but continuing with local cleanup:', error)
  }
  
  // Always clear local storage regardless of API response
  if (typeof window !== 'undefined') {
    tokenStorage.remove()
    emitAuthEvent(authEvents.LOGOUT)
  }
}

export const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
  const { data } = await api.post('/auth/change-password', payload)
  return data?.data
}
