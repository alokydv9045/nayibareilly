import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import socketService from '@/lib/services/socket-service'
import { logger } from '@/lib/utils/logger'

// Type definitions for API responses
interface SystemStatsResponse {
  success: boolean
  data: {
    totalUsers: number
    totalIssues: number
    resolvedIssues: number
    pendingIssues: number
    lastUpdated: string
  }
}

interface UserCountResponse {
  success: boolean
  data: {
    totalUsers: number
    activeUsers: number
    verifiedUsers: number
    newUsersToday: number
    weeklyRegistrations: number
    lastUpdated: string
  }
}

/**
 * Hook to integrate Socket.IO events with React Query cache invalidation
 * Automatically invalidates relevant queries when real-time events occur
 */
export function useRealtimeCacheInvalidation() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // User-related events
    socketService.onUserNew((data) => {
      logger.debug('🔄 Invalidating user caches due to new user:', data.newUser?.name)
      
      // Invalidate admin system stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'realtime', 'user-count'] })
      
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      
      // Invalidate dashboard queries that show user counts
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['organization', 'stats'] })
      
      // Update cache with new data if available
      if (data.totalUsers) {
        queryClient.setQueryData(['admin', 'system-stats'], (oldData: SystemStatsResponse | undefined) => {
          if (oldData?.data) {
            return {
              ...oldData,
              data: {
                ...oldData.data,
                totalUsers: data.totalUsers,
                lastUpdated: new Date().toISOString()
              }
            }
          }
          return oldData
        })
      }
    })

    socketService.onUserVerified((data) => {
      logger.debug('🔄 Invalidating user caches due to user verification:', data.verifiedUser?.name)
      
      // Invalidate user count and verification stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'realtime', 'user-count'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      
      // Update cache with new verification data
      if (data.verifiedUsers) {
        queryClient.setQueryData(['admin', 'realtime', 'user-count'], (oldData: UserCountResponse | undefined) => {
          if (oldData?.data) {
            return {
              ...oldData,
              data: {
                ...oldData.data,
                verifiedUsers: data.verifiedUsers,
                lastUpdated: new Date().toISOString()
              }
            }
          }
          return oldData
        })
      }
    })

    // System stats events
    socketService.onSystemStats((data) => {
      logger.debug('🔄 Updating system stats cache:', data)
      
      // Update system stats cache directly
      queryClient.setQueryData(['admin', 'system-stats'], {
        success: true,
        data: {
          totalUsers: data.totalUsers,
          totalIssues: data.totalIssues,
          resolvedIssues: data.resolvedIssues,
          pendingIssues: data.pendingIssues,
          lastUpdated: data.lastUpdated
        }
      })
      
      // Invalidate related dashboard queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    })

    // Issue-related events
    socketService.onIssueCreated((data) => {
      logger.debug('🔄 Invalidating issue caches due to new issue:', data.issue.title)
      
      // Invalidate all issue-related queries
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-stats'] })
      queryClient.invalidateQueries({ queryKey: ['citizen', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['organization', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['moderator', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['moderator', 'pending'] })
    })

    socketService.onIssueUpdated((data) => {
      logger.debug('🔄 Invalidating issue caches due to issue update:', data.issue.title)
      
      // Invalidate specific issue and lists
      queryClient.invalidateQueries({ queryKey: ['issue', data.issueId] })
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-stats'] })
      queryClient.invalidateQueries({ queryKey: ['organization', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['moderator', 'stats'] })
    })

    socketService.onIssueAssigned((data) => {
      logger.debug('🔄 Invalidating caches due to issue assignment:', data.issue.title)
      
      // Invalidate assignment-related queries
      queryClient.invalidateQueries({ queryKey: ['my-assigned-issues'] })
      queryClient.invalidateQueries({ queryKey: ['staffAssignedIssues'] })
      queryClient.invalidateQueries({ queryKey: ['organization', 'issues'] })
      queryClient.invalidateQueries({ queryKey: ['department', 'assigned-issues'] })
    })

    socketService.onIssueEscalated((data) => {
      logger.debug('🔄 Invalidating caches due to issue escalation:', data.issue.title)
      
      // Invalidate escalation-related queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-stats'] })
      queryClient.invalidateQueries({ queryKey: ['organization', 'stats'] })
    })

    // Department stats events
    socketService.onDepartmentStats((data) => {
      logger.debug('🔄 Updating department stats cache:', data.departmentId)
      
      // Invalidate department-specific queries
      queryClient.invalidateQueries({ queryKey: ['department', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['organization', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    })

    // System alerts
    socketService.onSystemAlert((data) => {
      logger.warn('⚠️ System alert received:', data.message)
      
      // Could invalidate system health queries if they exist
      queryClient.invalidateQueries({ queryKey: ['system', 'health'] })
    })

    // Cleanup function is not needed as socket service manages its own listeners
    // The socket service will handle cleanup when the component unmounts
    return () => {
      // Optional: Remove specific listeners if needed
      // But socket service already handles this
    }
  }, [queryClient])
}

/**
 * Hook specifically for AdminFooter to listen for system stats updates
 */
export function useAdminFooterRealtimeUpdates() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Listen for any event that should update the AdminFooter stats
    const handleStatsUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-stats'] })
    }

    socketService.onUserNew(handleStatsUpdate)
    socketService.onUserVerified(handleStatsUpdate)
    socketService.onSystemStats(handleStatsUpdate)
    socketService.onIssueCreated(handleStatsUpdate)
    socketService.onIssueUpdated(handleStatsUpdate)

    return () => {
      // Cleanup is handled by socket service
    }
  }, [queryClient])
}