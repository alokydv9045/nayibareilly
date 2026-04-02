'use client'

import { createContext, useContext, ReactNode } from 'react'
import useSessionManager, { type SessionState } from '@/hooks/auth/useSession'
import { type AuthUser } from '@/lib/auth/auth-utils'

interface SessionContextType extends SessionState {
  refreshSession: () => Promise<boolean>
  updateActivity: () => void
  handleLoginSuccess: (user: AuthUser, token: string) => void
  handleLogoutSuccess: () => void
  isSessionValid: boolean
}

const SessionContext = createContext<SessionContextType | null>(null)

interface SessionProviderProps {
  children: ReactNode
  options?: {
    heartbeatInterval?: number
    activityTimeout?: number
    warningBeforeExpiry?: number
    autoRefresh?: boolean
    redirectOnExpiry?: string
  }
}

export function SessionProvider({ children, options }: SessionProviderProps) {
  const sessionManager = useSessionManager(options)

  return (
    <SessionContext.Provider value={sessionManager}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

export default SessionProvider