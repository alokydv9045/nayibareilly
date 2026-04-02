'use client'

import { useState, useEffect } from 'react'
import { UserRole } from '@/lib/rbac/roles'

export interface User {
  id: string
  name: string
  email: string
  roles: UserRole[]
  departmentId?: string
  departmentName?: string
}

export interface Session {
  user: User | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook to manage user session
 * Returns current user, loading state, and error state
 */
export function useSession(): Session {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSession() {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('token')
        
        if (!token) {
          setUser(null)
          setIsLoading(false)
          return
        }

        const response = await fetch('/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch session')
        }

        const data = await response.json()
        setUser(data.user)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch session')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [])

  return { user, isLoading, error }
}
