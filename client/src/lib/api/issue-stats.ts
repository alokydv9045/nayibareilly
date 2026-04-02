import { useQuery } from '@tanstack/react-query'
import { api } from './client'

export interface IssueStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  newToday: number
  resolvedLast7Days: number
}

// Fetch aggregated issue statistics for admin dashboard
export const fetchIssueStats = async (): Promise<IssueStats> => {
  try {
    const { data } = await api.get('/admin/stats/issues')
    if (data?.data) {
      return data.data
    }
    // If endpoint exists but returns unexpected format, fall through to fallback
    throw new Error('Invalid response format')
  } catch {
    // Fallback: derive stats from recent issues query if dedicated endpoint doesn't exist or fails
    try {
      const { data: issuesData } = await api.get('/issues', { 
        params: { limit: 500, sort: 'newest' } 
      })
      
      const items = issuesData?.data?.items || []
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      interface IssueItem {
        status?: string
        createdAt: string
        updatedAt?: string
      }
      
      return {
        total: items.length,
        open: items.filter((i: IssueItem) => i.status?.toLowerCase() === 'open').length,
        inProgress: items.filter((i: IssueItem) => i.status?.toLowerCase() === 'in_progress').length,
        resolved: items.filter((i: IssueItem) => i.status?.toLowerCase() === 'resolved').length,
        newToday: items.filter((i: IssueItem) => new Date(i.createdAt) >= today).length,
        resolvedLast7Days: items.filter((i: IssueItem) => 
          i.status?.toLowerCase() === 'resolved' && 
          new Date(i.updatedAt || i.createdAt) >= sevenDaysAgo
        ).length,
      }
    } catch (fallbackError) {
      // If even fallback fails, return zeros
      console.warn('Failed to fetch issue stats, returning defaults:', fallbackError)
      return {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        newToday: 0,
        resolvedLast7Days: 0,
      }
    }
  }
}

export const useIssueStats = () => {
  return useQuery({
    queryKey: ['issueStats'],
    queryFn: fetchIssueStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}