import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api } from '@/lib/api/client'
import socketService from '@/lib/services/socket-service'
import { logger } from '@/lib/utils/logger'

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
  category?: {
    id: string
    name: string
    icon?: string
    color?: string
  }
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
  timeline?: Array<{
    status: string
    createdAt: string
    note?: string
    performedById?: string
  }>
  comments?: Array<{
    id: string
    content: string
    createdAt: string
    user?: {
      id: string
      name: string
      roles: string[]
      avatarUrl?: string
    }
  }>
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
  report: (id: string) => [...publicKeys.all, 'report', id] as const,
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
        logger.debug('🔍 Fetching public stats from /api/public/stats')
        const { data } = await api.get('/public/stats')
        
        logger.debug('📦 Public stats response:', data)
        
        // Handle different response structures
        const stats = data?.data || data
        
        if (!stats || typeof stats !== 'object') {
          logger.warn('⚠️ Invalid stats response:', stats)
          return null
        }
        
        logger.debug('✅ Public stats loaded:', stats)
        return stats as PublicStats
      } catch (error) {
        logger.error('❌ Failed to fetch public stats:', error)
        throw error
      }
    },
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchInterval: 30 * 1000, // Poll every 30 seconds as fallback
    retry: 2,
  })

  // Real-time Socket.IO integration
  useEffect(() => {
    const handleStatsUpdate = () => {
      queryClient.invalidateQueries({ queryKey: publicKeys.stats() })
    }
    socketService.onSystemStats(handleStatsUpdate)
    socketService.onIssueCreated(handleStatsUpdate)
    socketService.onIssueUpdated(handleStatsUpdate)
    
    return () => {
      // Cleanup handled by socket service optionally
    }
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
        logger.debug('🔍 Fetching public reports with params:', params)
        const { data } = await api.get('/public/reports', { params })
        
        logger.debug('📦 Public reports response:', data)
        
        // Handle different response structures
        const response = data?.data || data
        
        if (!response || !Array.isArray(response.issues)) {
          logger.warn('⚠️ Invalid reports response:', response)
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
        
        logger.debug(`✅ Loaded ${response.issues.length} public reports`)
        return response as PublicReportsResponse
      } catch (error) {
        logger.error('❌ Failed to fetch public reports:', error)
        throw error
      }
    },
    staleTime: 20 * 1000, // Consider data stale after 20 seconds
    refetchInterval: 60 * 1000, // Poll every 60 seconds as fallback
    retry: 2,
  })

  // Real-time Socket.IO integration for new issues
  useEffect(() => {
    const handleIssuesUpdate = () => {
      queryClient.invalidateQueries({ queryKey: publicKeys.reports() })
      queryClient.invalidateQueries({ queryKey: publicKeys.activity() })
    }
    socketService.onIssueCreated(handleIssuesUpdate)
    socketService.onIssueUpdated(handleIssuesUpdate)
  }, [queryClient])

  return query
}

/**
 * Hook to fetch a single public report by ID
 * Automatically refreshes and integrates with Socket.IO
 */
export function usePublicReport(id: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: publicKeys.report(id),
    queryFn: async () => {
      if (!id) return null;
      try {
        logger.debug(`🔍 Fetching public report details for: ${id}`)
        const { data } = await api.get(`/public/reports/${id}`)
        
        const report = data?.data || data
        
        if (!report || !report.id) {
          logger.warn('⚠️ Invalid report response:', report)
          return null
        }
        
        return report as PublicReport // Let page handle specific structure
      } catch (error) {
        logger.error(`❌ Failed to fetch public report ${id}:`, error)
        throw error
      }
    },
    enabled: !!id,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: 2,
  })

  // Real-time Socket.IO integration
  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleReportUpdate = (updatedReport: any) => {
      if (updatedReport?.id === id || updatedReport?.reportId === id || updatedReport?.issueId === id) {
        queryClient.invalidateQueries({ queryKey: publicKeys.report(id) })
      }
    }
    
    // Invalidate if the specific issue is updated
    socketService.onIssueUpdated(handleReportUpdate)
  }, [queryClient, id])

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
        logger.debug('🔍 Fetching public categories')
        const { data } = await api.get('/public/categories')
        
        const categories = data?.data || data || []
        
        if (!Array.isArray(categories)) {
          logger.warn('⚠️ Invalid categories response:', categories)
          return []
        }
        
        logger.debug(`✅ Loaded ${categories.length} categories`)
        return categories as PublicCategory[]
      } catch (error) {
        logger.error('❌ Failed to fetch public categories:', error)
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
        logger.debug('🔍 Fetching recent activity with limit:', limit)
        const { data } = await api.get('/public/activity', { params: { limit } })
        
        const activities = data?.data || data || []
        
        if (!Array.isArray(activities)) {
          logger.warn('⚠️ Invalid activity response:', activities)
          return []
        }
        
        logger.debug(`✅ Loaded ${activities.length} recent activities`)
        return activities as RecentActivity[]
      } catch (error) {
        logger.error('❌ Failed to fetch recent activity:', error)
        throw error
      }
    },
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    retry: 2,
  })

  // Real-time Socket.IO integration
  useEffect(() => {
    const handleActivityUpdate = () => {
      queryClient.invalidateQueries({ queryKey: publicKeys.activity() })
    }
    socketService.onIssueCreated(handleActivityUpdate)
    socketService.onIssueUpdated(handleActivityUpdate)
  }, [queryClient])

  return query
}