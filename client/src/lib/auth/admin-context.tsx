'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { unifiedLogout } from '../utils/unified-logout'

interface AdminContextType {
  isAdminAuthenticated: boolean
  adminLogin: (email: string, password: string) => Promise<boolean>
  adminLogout: () => void
  loading: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if admin is already logged in with backward-compatible migration
    const legacyKey = 'nagarsetu_admin_session'
    const newKey = 'nayibareilly_admin_session'
    let adminSession = localStorage.getItem(newKey)
    if (!adminSession) {
      const legacy = localStorage.getItem(legacyKey)
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy)
          localStorage.setItem(newKey, JSON.stringify(parsed))
          localStorage.removeItem(legacyKey)
          adminSession = JSON.stringify(parsed)
        } catch {
          localStorage.removeItem(legacyKey)
        }
      }
    }
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession)
        const now = new Date().getTime()
        const sessionTime = new Date(session.timestamp).getTime()
        const hoursDiff = (now - sessionTime) / (1000 * 60 * 60)
        
        if (hoursDiff < 24) {
          setIsAdminAuthenticated(true)
        } else {
          localStorage.removeItem(newKey)
        }
      } catch {
        localStorage.removeItem(newKey)
      }
    }
    setLoading(false)
  }, [])

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      // Use environment variables for admin credentials
  const ADMIN_EMAIL = 'admin@nayibareilly.gov.in'
  const ADMIN_PASSWORD = 'NayiBareilly@Admin2025'

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const session = {
          authenticated: true,
          timestamp: new Date().toISOString(),
          email: email
        }
        
  localStorage.setItem('nayibareilly_admin_session', JSON.stringify(session))
        setIsAdminAuthenticated(true)
        
        console.log('Admin logged in:', { email, timestamp: new Date().toISOString() })
        return true
      }
      
      return false
    } catch {
      console.error('Admin login error')
      return false
    }
  }

  const adminLogout = async () => {
    // Use unified logout utility
    await unifiedLogout({
      showToast: false, // Admin context logout is programmatic
      silent: true,
      onSuccess: () => {
        setIsAdminAuthenticated(false)
        console.log('Admin logged out:', new Date().toISOString())
      },
      onError: (error) => {
        console.error('Admin logout error:', error)
        // Still update local state
        setIsAdminAuthenticated(false)
      }
    })
  }

  return (
    <AdminContext.Provider value={{
      isAdminAuthenticated,
      adminLogin,
      adminLogout,
      loading
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
