/**
 * useModeratorStats - Manage moderator statistics with real-time updates
 */

import { useState, useEffect, useCallback } from 'react'
import { useModeratorAPI } from './useModeratorAPI'
import socketService from '@/lib/services/socket-service'

interface Stats {
  pendingReviews: number
  reviewedToday: number
  flaggedContent: number
  escalatedIssues: number
  totalReports: number
  approvalRate: number
}

export function useModeratorStats() {
  const [stats, setStats] = useState<Stats>({
    pendingReviews: 0,
    reviewedToday: 0,
    flaggedContent: 0,
    escalatedIssues: 0,
    totalReports: 0,
    approvalRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { fetchStats } = useModeratorAPI()

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchStats()
      setStats(data)
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [fetchStats])

  useEffect(() => {
    refetch()

    // Refresh every 30 seconds
    const interval = setInterval(refetch, 30000)

    // Listen for real-time updates
    const handleStatsUpdate = () => {
      refetch()
    }

    socketService.on('issue:new', handleStatsUpdate)
    socketService.on('issue:update', handleStatsUpdate)
    socketService.on('moderator:stats', handleStatsUpdate)

    return () => {
      clearInterval(interval)
      socketService.off('issue:new', handleStatsUpdate)
      socketService.off('issue:update', handleStatsUpdate)
      socketService.off('moderator:stats', handleStatsUpdate)
    }
  }, [refetch])

  return {
    stats,
    loading,
    error,
    refetch
  }
}