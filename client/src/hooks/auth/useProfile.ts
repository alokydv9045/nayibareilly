import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api/client'
import { isAuthenticated, authEvents } from '@/lib/auth/auth-utils'

export type Profile = {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  roles?: string[]
}

const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
}

// Helper hook to track authentication state
const useAuthState = () => {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsAuthenticatedState(authenticated)
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

  return isAuthenticatedState
}

export function useMe() {
  const isAuthenticatedState = useAuthState()
  
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: async () => {
      const { data } = await api.get('/auth/me')
      return (data?.data?.user || data?.data) as Profile
    },
    enabled: isAuthenticatedState,
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

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { name?: string; avatarUrl?: string }) => {
      const { data } = await api.put('/users/profile', payload)
      return data?.data?.user || data?.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.all })
    },
  })
}