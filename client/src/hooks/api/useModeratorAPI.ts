import { useCallback } from 'react'
import { adminApi } from '@/lib/api/client'

// Types
export interface ModeratorStats {
  pendingReviews: number
  reviewedToday: number
  flaggedContent: number
  escalatedIssues: number
  totalReports: number
  approvalRate: number
}

export interface PendingIssue {
  id: string
  reportId: string
  title: string
  description: string
  address: string
  reporterName: string
  createdAt: string
  priority: string
  categoryName?: string
  images?: Array<{ id: string; url: string }>
}

export interface Department {
  id: string
  name: string
  code: string
  description?: string
  _count?: {
    issues: number
  }
}

export interface PerformanceMetrics {
  avgResponseTime: string
  issuesReviewed: number
  accuracyRate: number
  activeTime: string
  activityData: Array<{
    date: string
    count: number
  }>
}

export interface ModeratorHistoryResponse {
  history: Array<{
    id: string
    title: string
    description: string
    status: string
    reviewedAt: string
    reviewedBy: string
    decision: string
    reason?: string
    reporterName: string
    address: string
    categoryName?: string
  }>
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function useModeratorAPI() {
  const fetchStats = useCallback(async (): Promise<ModeratorStats> => {
    try {
      const response = await adminApi.get('/v1/moderator/stats')
      return response.data.data || response.data
    } catch (error: any) {
      console.error('[useModeratorAPI] fetchStats FAILED:', error.response?.status, error.message)
      throw new Error(`Failed to fetch stats: ${error.message}`)
    }
  }, [])

  const fetchPending = useCallback(async (): Promise<PendingIssue[]> => {
    try {
      const response = await adminApi.get('/v1/moderator/pending')
      const data = response.data.data || response.data
      return data?.items || data || []
    } catch (error: any) {
      console.error('[useModeratorAPI] fetchPending FAILED:', error.response?.status, error.message)
      throw new Error(`Failed to fetch pending issues: ${error.message}`)
    }
  }, [])

  const fetchDepartments = useCallback(async (): Promise<Department[]> => {
    try {
      const response = await adminApi.get('/v1/moderator/departments')
      return response.data.data || response.data || []
    } catch (error: any) {
      console.error('[useModeratorAPI] fetchDepartments FAILED:', error.response?.status, error.message)
      throw new Error(`Failed to fetch departments: ${error.message}`)
    }
  }, [])

  const fetchPerformance = useCallback(async (): Promise<PerformanceMetrics> => {
    try {
      const response = await adminApi.get('/v1/moderator/performance')
      return response.data.data || response.data
    } catch (error: any) {
      console.error('[useModeratorAPI] fetchPerformance FAILED:', error.response?.status, error.message)
      throw new Error(`Failed to fetch performance metrics: ${error.message}`)
    }
  }, [])

  const fetchHistory = useCallback(async (page = 1, limit = 20): Promise<ModeratorHistoryResponse> => {
    try {
      const response = await adminApi.get(`/v1/moderator/history`, { params: { page, limit } })
      return response.data.data || response.data
    } catch (error: any) {
      console.error('[useModeratorAPI] fetchHistory FAILED:', error.response?.status, error.message)
      throw new Error(`Failed to fetch moderator history: ${error.message}`)
    }
  }, [])

  const checkDuplicates = useCallback(async (issueId: string) => {
    try {
      const response = await adminApi.get(`/v1/moderator/issues/${issueId}/check-duplicates`)
      return response.data.data || response.data
    } catch (error: any) {
      console.error('[useModeratorAPI] checkDuplicates FAILED:', error.response?.status, error.message)
      throw new Error(`Failed to check duplicates: ${error.message}`)
    }
  }, [])

  const approveIssue = useCallback(async (
    issueId: string,
    departmentId: string,
    priority: string,
    notes?: string
  ) => {
    try {
      const response = await adminApi.post(`/v1/moderator/issues/${issueId}/approve`, {
        departmentId, priority, notes
      })
      return response.data
    } catch (error: any) {
      console.error('[useModeratorAPI] approveIssue FAILED:', error.response?.status, error.message)
      throw new Error(error.response?.data?.message || 'Failed to approve issue')
    }
  }, [])

  const rejectIssue = useCallback(async (
    issueId: string,
    reason: string
  ) => {
    try {
      const response = await adminApi.post(`/v1/moderator/issues/${issueId}/reject`, { reason })
      return response.data
    } catch (error: any) {
      console.error('[useModeratorAPI] rejectIssue FAILED:', error.response?.status, error.message)
      throw new Error(error.response?.data?.message || 'Failed to reject issue')
    }
  }, [])

  const requestMoreInfo = useCallback(async (
    issueId: string,
    message: string,
    fields?: string[]
  ) => {
    try {
      const response = await adminApi.post(`/v1/moderator/issues/${issueId}/request-info`, {
        message, fields
      })
      return response.data
    } catch (error: any) {
      console.error('[useModeratorAPI] requestMoreInfo FAILED:', error.response?.status, error.message)
      throw new Error(error.response?.data?.message || 'Failed to request more information')
    }
  }, [])

  const markAsSpam = useCallback(async (
    issueId: string,
    reason?: string
  ) => {
    try {
      const response = await adminApi.post(`/v1/moderator/issues/${issueId}/mark-spam`, { reason })
      return response.data
    } catch (error: any) {
      console.error('[useModeratorAPI] markAsSpam FAILED:', error.response?.status, error.message)
      throw new Error(error.response?.data?.message || 'Failed to mark as spam')
    }
  }, [])

  return {
    fetchStats,
    fetchPending,
    fetchDepartments,
    fetchPerformance,
    fetchHistory,
    checkDuplicates,
    approveIssue,
    rejectIssue,
    requestMoreInfo,
    markAsSpam
  }
}