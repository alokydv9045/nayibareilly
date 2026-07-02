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
    } catch (error: unknown) {
      const err = error as { response?: { status?: number, data?: { message?: string } }, message?: string };
      console.error('[useModeratorAPI] fetchStats FAILED:', err.response?.status, err.message)
      throw new Error(`Failed to fetch stats: ${err.message}`)
    }
  }, [])

  const fetchPending = useCallback(async (): Promise<PendingIssue[]> => {
    try {
      const response = await adminApi.get('/v1/moderator/pending')
      const data = response.data.data || response.data
      return data?.items || data || []
    } catch (error: unknown) {
      const err = error as { response?: { status?: number, data?: { message?: string } }, message?: string };
      console.error('[useModeratorAPI] fetchPending FAILED:', err.response?.status, err.message)
      throw new Error(`Failed to fetch pending issues: ${err.message}`)
    }
  }, [])

  const fetchDepartments = useCallback(async (): Promise<Department[]> => {
    try {
      const response = await adminApi.get('/v1/moderator/departments')
      return response.data.data || response.data || []
    } catch (error: unknown) {
      const err = error as { response?: { status?: number, data?: { message?: string } }, message?: string };
      console.error('[useModeratorAPI] fetchDepartments FAILED:', err.response?.status, err.message)
      throw new Error(`Failed to fetch departments: ${err.message}`)
    }
  }, [])

  const fetchPerformance = useCallback(async (): Promise<PerformanceMetrics> => {
    try {
      const response = await adminApi.get('/v1/moderator/performance')
      return response.data.data || response.data
    } catch (error: unknown) {
      const err = error as { response?: { status?: number, data?: { message?: string } }, message?: string };
      console.error('[useModeratorAPI] fetchPerformance FAILED:', err.response?.status, err.message)
      throw new Error(`Failed to fetch performance metrics: ${err.message}`)
    }
  }, [])

  const fetchHistory = useCallback(async (page = 1, limit = 20): Promise<ModeratorHistoryResponse> => {
    try {
      const response = await adminApi.get(`/v1/moderator/history`, { params: { page, limit } })
      return response.data.data || response.data
    } catch (error: unknown) {
      const err = error as { response?: { status?: number, data?: { message?: string } }, message?: string };
      console.error('[useModeratorAPI] fetchHistory FAILED:', err.response?.status, err.message)
      throw new Error(`Failed to fetch moderator history: ${err.message}`)
    }
  }, [])

  const checkDuplicates = useCallback(async (issueId: string) => {
    try {
      const response = await adminApi.get(`/v1/moderator/issues/${issueId}/check-duplicates`)
      return response.data.data || response.data
    } catch (error: unknown) {
      const err = error as { response?: { status?: number, data?: { message?: string } }, message?: string };
      console.error('[useModeratorAPI] checkDuplicates FAILED:', err.response?.status, err.message)
      throw new Error(`Failed to check duplicates: ${err.message}`)
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
    } catch (error: unknown) {
      const err = error as { response?: { status?: number, data?: { message?: string } }, message?: string };
      console.error('[useModeratorAPI] approveIssue FAILED:', err.response?.status, err.message)
      throw new Error(err.response?.data?.message || 'Failed to approve issue')
    }
  }, [])

  const rejectIssue = useCallback(async (
    issueId: string,
    reason: string
  ) => {
    try {
      const response = await adminApi.post(`/v1/moderator/issues/${issueId}/reject`, { reason })
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { status?: number, data?: { message?: string } }, message?: string };
      console.error('[useModeratorAPI] rejectIssue FAILED:', err.response?.status, err.message)
      throw new Error(err.response?.data?.message || 'Failed to reject issue')
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
    } catch (error: unknown) {
      const err = error as { response?: { status?: number, data?: { message?: string } }, message?: string };
      console.error('[useModeratorAPI] requestMoreInfo FAILED:', err.response?.status, err.message)
      throw new Error(err.response?.data?.message || 'Failed to request more information')
    }
  }, [])

  const markAsSpam = useCallback(async (
    issueId: string,
    reason?: string
  ) => {
    try {
      const response = await adminApi.post(`/v1/moderator/issues/${issueId}/mark-spam`, { reason })
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { status?: number, data?: { message?: string } }, message?: string };
      console.error('[useModeratorAPI] markAsSpam FAILED:', err.response?.status, err.message)
      throw new Error(err.response?.data?.message || 'Failed to mark as spam')
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