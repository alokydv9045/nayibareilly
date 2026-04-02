import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api/client'
import { isAuthenticated as checkIsAuthenticated, authEvents } from '@/lib/auth/auth-utils'

export type Stats = {
  total: number
  open: number
  resolved: number
  in_progress: number
}

export const statsKeys = {
  all: ['stats'] as const,
  dashboard: () => [...statsKeys.all, 'dashboard'] as const,
}

// Helper hook to track authentication state
const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = checkIsAuthenticated()
      setIsAuthenticated(authenticated)
      return authenticated
    }

    checkAuth()

    const handleAuthChange = () => checkAuth()
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleAuthChange)
      window.addEventListener(authEvents.LOGIN, handleAuthChange)
      window.addEventListener(authEvents.LOGOUT, handleAuthChange)
      window.addEventListener('auth:reset', handleAuthChange) // Legacy compatibility
      return () => {
        window.removeEventListener('storage', handleAuthChange)
        window.removeEventListener(authEvents.LOGIN, handleAuthChange)
        window.removeEventListener(authEvents.LOGOUT, handleAuthChange)
        window.removeEventListener('auth:reset', handleAuthChange)
      }
    }
  }, [])

  return isAuthenticated
}

export function useStats() {
  const isAuthenticated = useAuthState()
  
  return useQuery({
    queryKey: statsKeys.dashboard(),
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats')
      return (data?.data || {}) as Stats
    },
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status === 401) return false
      }
      return failureCount < 2
    },
    refetchOnWindowFocus: false,
    staleTime: 60000,
  })
}