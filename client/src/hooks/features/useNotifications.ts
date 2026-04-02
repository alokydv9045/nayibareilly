import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api/client'
import { isAuthenticated as checkIsAuthenticated, authEvents } from '@/lib/auth/auth-utils'

export type Notification = {
  id: string
  title: string
  message?: string
  createdAt: string
  read: boolean
}

export const notificationsKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationsKeys.all, 'list'] as const,
  unreadCount: () => [...notificationsKeys.all, 'unread-count'] as const,
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

export function useNotifications() {
  const isAuthenticated = useAuthState()
  
  return useQuery({
    queryKey: notificationsKeys.list(),
    queryFn: async () => {
      const { data } = await api.get('/notifications')
      return (data?.data || []) as Notification[]
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
    staleTime: 30000,
  })
}

export function useUnreadCount() {
  const isAuthenticated = useAuthState()
  
  return useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count')
      return (data?.data?.count || 0) as number
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
    staleTime: 30000,
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/notifications/${id}/read`)
      return data?.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationsKeys.all })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/notifications/read-all')
      return data?.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationsKeys.all })
    },
  })
}
