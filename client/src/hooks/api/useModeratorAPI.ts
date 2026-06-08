/**
 * useModeratorAPI - Custom hook for moderator API calls
 * Provides clean abstraction for all moderator endpoints
 */

import { useCallback } from 'react'
import { config } from '@/lib/constants/config'
import { tokenStorage } from '@/lib/auth/auth-utils'

interface ModeratorStats {
  pendingReviews: number
  reviewedToday: number
  flaggedContent: number
  escalatedIssues: number
  totalReports: number
  approvalRate: number
}

interface PendingIssue {
  id: string
  title: string
  description: string
  address: string
  latitude?: number
  longitude?: number
  reporterName: string
  reporterEmail?: string
  createdAt: string
  priority: string
  categoryName?: string
  images?: Array<{ id: string; url: string }>
  reportId: string
}

interface Department {
  id: string
  name: string
  code: string
  description?: string
  _count?: { issues: number }
}

interface PerformanceMetrics {
  reviews: {
    today: number
    week: number
    month: number
    total: number
  }
  performance: {
    avgReviewTime: number
    approvalRate: number
    qualityScore: number
  }
  breakdown: {
    approved: number
    rejected: number
    spam: number
    needsInfo: number
  }
  topCategories: Array<{ categoryId: string; _count: { _all: number } }>
}

interface ModeratorHistoryResponse {
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
  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = tokenStorage.get()
    
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }, [])

  const apiRoot = config.api.fullUrl.replace(/\/$/, '')

  // Fetch moderator statistics
  const fetchStats = useCallback(async (): Promise<ModeratorStats> => {
    const response = await fetch(`${apiRoot}/api/v1/moderator/stats`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch stats')
    }

    const data = await response.json()
    return data.data || data
  }, [apiRoot, getAuthHeaders])

  // Fetch pending issues
  const fetchPending = useCallback(async (): Promise<PendingIssue[]> => {
    console.log('[useModeratorAPI] Fetching pending issues from:', `${apiRoot}/api/v1/moderator/pending`)
    console.log('[useModeratorAPI] Auth headers:', getAuthHeaders())
    
    const response = await fetch(`${apiRoot}/api/v1/moderator/pending`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    })

    console.log('[useModeratorAPI] Response status:', response.status)
    console.log('[useModeratorAPI] Response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[useModeratorAPI] Error response:', errorText)
      throw new Error('Failed to fetch pending issues')
    }

    const data = await response.json()
    console.log('[useModeratorAPI] Response data:', data)
    const issues = data.data || data
    console.log('[useModeratorAPI] Parsed issues array:', issues)
    return issues
  }, [apiRoot, getAuthHeaders])

  // Fetch departments
  const fetchDepartments = useCallback(async (): Promise<Department[]> => {
    const response = await fetch(`${apiRoot}/api/v1/moderator/departments`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch departments')
    }

    const data = await response.json()
    return data.data || data || []
  }, [apiRoot, getAuthHeaders])

  // Fetch performance metrics
  const fetchPerformance = useCallback(async (): Promise<PerformanceMetrics> => {
    const response = await fetch(`${apiRoot}/api/v1/moderator/performance`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch performance metrics')
    }

    const data = await response.json()
    return data.data || data
  }, [apiRoot, getAuthHeaders])

  // Fetch moderator history
  const fetchHistory = useCallback(async (page = 1, limit = 20): Promise<ModeratorHistoryResponse> => {
    const response = await fetch(`${apiRoot}/api/v1/moderator/history?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch moderator history')
    }

    const data = await response.json()
    return data.data || data
  }, [apiRoot, getAuthHeaders])

  // Check for duplicates
  const checkDuplicates = useCallback(async (issueId: string) => {
    const response = await fetch(
      `${apiRoot}/api/v1/moderator/issues/${issueId}/check-duplicates`,
      {
        headers: getAuthHeaders(),
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      throw new Error('Failed to check duplicates')
    }

    const data = await response.json()
    return data.data || data
  }, [apiRoot, getAuthHeaders])

  // Approve issue
  const approveIssue = useCallback(async (
    issueId: string,
    departmentId: string,
    priority: string,
    notes?: string
  ) => {
    const response = await fetch(
      `${apiRoot}/api/v1/moderator/issues/${issueId}/approve`,
      {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ departmentId, priority, notes })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to approve issue')
    }

    return await response.json()
  }, [apiRoot, getAuthHeaders])

  // Reject issue
  const rejectIssue = useCallback(async (
    issueId: string,
    reason: string
  ) => {
    const response = await fetch(
      `${apiRoot}/api/v1/moderator/issues/${issueId}/reject`,
      {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to reject issue')
    }

    return await response.json()
  }, [apiRoot, getAuthHeaders])

  // Request more info
  const requestMoreInfo = useCallback(async (
    issueId: string,
    message: string,
    fields?: string[]
  ) => {
    const response = await fetch(
      `${apiRoot}/api/v1/moderator/issues/${issueId}/request-info`,
      {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, fields })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to request more information')
    }

    return await response.json()
  }, [apiRoot, getAuthHeaders])

  // Mark as spam
  const markAsSpam = useCallback(async (
    issueId: string,
    reason?: string
  ) => {
    const response = await fetch(
      `${apiRoot}/api/v1/moderator/issues/${issueId}/mark-spam`,
      {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to mark as spam')
    }

    return await response.json()
  }, [apiRoot, getAuthHeaders])

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