import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api } from '@/lib/api/client'
// import socketService from '@/lib/services/socket-service' // TODO: Enable for real-time Socket.IO integration

// Public statistics type
export type PublicStats = {
  totalIssues: number
  resolvedIssues: number
  inProgressIssues: number
  openIssues: number
  pendingIssues: number
  activeUsers: number
  avgResponseDays: number
  issuesToday: number
  resolutionRate: number
}

// Public report type
export type PublicReport = {
  id: string
  reportId: string
  title: string
  description?: string
  categoryName?: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  votesCount: number
  commentsCount: number
  viewsCount: number
  images?: Array<{ url: string; filename: string }>
  location?: {
    latitude?: number
    longitude?: number
    address?: string
  }
  createdAt: string
  updatedAt?: string
  resolvedAt?: string
  user?: {
    id: string
    fullName: string
    avatar?: string
  }
  department?: {
    id: string
    name: string
  }
}

export type PublicReportsParams = {
  page?: number
  limit?: number
  category?: string
  status?: string
  sort?: 'newest' | 'oldest' | 'votes'
  search?: string
}

export type PublicReportsResponse = {
  issues: PublicReport[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export type PublicCategory = {
  name: string
  count: number
}

export type RecentActivity = {
  id: string
  reportId: string
  title: string
  category?: string
  type: 'created' | 'resolved'
  timestamp: string
}

// Query keys for cache management
export const publicKeys = {
  all: ['public'] as const,
  stats: () => [...publicKeys.all, 'stats'] as const,
  reports: (params?: PublicReportsParams) => [...publicKeys.all, 'reports', params] as const,
  categories: () => [...publicKeys.all, 'categories'] as const,
  activity: (limit?: number) => [...publicKeys.all, 'activity', limit] as const,
}

/**
 * Hook to fetch public statistics for homepage counters
 * Automatically refreshes every 30 seconds
 * Integrates with Socket.IO for real-time updates
 */
export function usePublicStats() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: publicKeys.stats(),
    queryFn: async () => {
      try {
        console.log('🔍 Fetching public stats from /api/public/stats')
        const { data } = await api.get('/public/stats')
        
        console.log('📦 Public stats response:', data)
        
        // Handle different response structures
        const stats = data?.data || data
        
        if (!stats || typeof stats !== 'object') {
          console.warn('⚠️ Invalid stats response:', stats)
          return null
        }
        
        console.log('✅ Public stats loaded:', stats)
        return stats as PublicStats
      } catch (error) {
        console.error('❌ Failed to fetch public stats:', error)
        throw error
      }
    },
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchInterval: 30 * 1000, // Poll every 30 seconds as fallback
    retry: 2,
  })

  // Real-time Socket.IO integration
  // Note: Relying on polling for now (every 30s)
  // TODO: Add public event listeners to socketService for real-time updates
  useEffect(() => {
    // Placeholder for future real-time Socket.IO integration
  }, [queryClient])

  return query
}

/**
 * Hook to fetch public reports feed with pagination and filtering
 * Automatically refreshes and integrates with Socket.IO
 */
export function usePublicReports(params?: PublicReportsParams) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: publicKeys.reports(params),
    queryFn: async () => {
      try {
        console.log('🔍 Fetching public reports with params:', params)
        const { data } = await api.get('/public/reports', { params })
        
        console.log('📦 Public reports response:', data)
        
        // Handle different response structures
        const response = data?.data || data
        
        if (!response || !Array.isArray(response.issues)) {
          console.warn('⚠️ Invalid reports response:', response)
          return {
            issues: [],
            pagination: {
              page: 1,
              limit: 12,
              totalCount: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPrevPage: false
            }
          }
        }
        
        console.log(`✅ Loaded ${response.issues.length} public reports`)
        return response as PublicReportsResponse
      } catch (error) {
        console.error('❌ Failed to fetch public reports:', error)
        throw error
      }
    },
    staleTime: 20 * 1000, // Consider data stale after 20 seconds
    refetchInterval: 60 * 1000, // Poll every 60 seconds as fallback
    retry: 2,
  })

  // Real-time Socket.IO integration for new issues
  // Note: Relying on polling for now (every 60s)
  // TODO: Add public event listeners to socketService for real-time updates
  useEffect(() => {
    // Placeholder for future real-time Socket.IO integration
  }, [queryClient])

  return query
}

/**
 * Hook to fetch public categories with issue counts
 */
export function usePublicCategories() {
  return useQuery({
    queryKey: publicKeys.categories(),
    queryFn: async () => {
      try {
        console.log('🔍 Fetching public categories')
        const { data } = await api.get('/public/categories')
        
        const categories = data?.data || data || []
        
        if (!Array.isArray(categories)) {
          console.warn('⚠️ Invalid categories response:', categories)
          return []
        }
        
        console.log(`✅ Loaded ${categories.length} categories`)
        return categories as PublicCategory[]
      } catch (error) {
        console.error('❌ Failed to fetch public categories:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    retry: 2,
  })
}

/**
 * Hook to fetch recent activity feed
 */
export function useRecentActivity(limit: number = 10) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: publicKeys.activity(limit),
    queryFn: async () => {
      try {
        console.log('ðŸ” Fetching recent activity with limit:', limit)
        const { data } = await api.get('/public/activity', { params: { limit } })
        
        const activities = data?.data || data || []
        
        if (!Array.isArray(activities)) {
          console.warn('âš ï¸ Invalid activity response:', activities)
          return []
        }
        
        console.log(`âœ… Loaded ${activities.length} recent activities`)
        return activities as RecentActivity[]
      } catch (error) {
        console.error('âŒ Failed to fetch recent activity:', error)
        throw error
      }
    },
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    retry: 2,
  })

  // Real-time Socket.IO integration
  // Note: Relying on polling for now (every 30s)
  // TODO: Add public event listeners to socketService for real-time updates
  useEffect(() => {
    // Placeholder for future real-time Socket.IO integration
  }, [queryClient])

  return query
}