import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { toast } from 'react-hot-toast'

export type Issue = {
  id: string
  reportId?: string
  title: string
  description?: string
  category: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  createdAt?: string
  updatedAt?: string
  resolvedAt?: string
  location?: { lat?: number; lng?: number; address?: string }
  images?: Array<{ id: string; url: string; filename: string }>
  reporter?: { id: string; name: string; email: string }
  timeline?: Array<{ id: string; createdAt: string; description: string }>
  categoryId?: string
  departmentId?: string
  upvotes?: number
  downvotes?: number
  totalVotes?: number
  viewCount?: number
}

export type IssuesParams = {
  status?: string
  category?: string
  priority?: string
  page?: number
  limit?: number
  mine?: boolean
}

export const issuesKeys = {
  all: ['issues'] as const,
  list: (params?: IssuesParams) => [...issuesKeys.all, 'list', params] as const,
  detail: (id: string) => [...issuesKeys.all, 'detail', id] as const,
}

export function useMyIssues(params?: IssuesParams) {
  return useQuery({
    queryKey: issuesKeys.list(params),
    queryFn: async () => {
      const { mine, ...rest } = params || {}
      const url = mine ? '/issues/my-issues' : '/issues'
      
      try {
        console.log(`🔍 Fetching issues from: ${url}`, { params: rest })
        const { data } = await api.get(url, { params: rest })
        
        // Debug log to see actual API response structure
        console.log('📦 API Response for', url, ':', data)
        
        // Handle different response structures:
        // Server API: { success: true, data: { items: [...] } }
        // Mock API: [...]
        let result
        
        if (mine) {
          // For my-issues endpoint, expect server response format
          result = data?.data?.items || data?.items || data || []
        } else {
          // For general issues endpoint
          result = data?.data?.issues || data?.data || data?.issues || data || []
        }
        
        // Ensure we always return an array
        if (!Array.isArray(result)) {
          console.warn('⚠️ API returned non-array data:', result)
          result = []
        }
        
        console.log(`✅ Processed ${result.length} issues from ${url}`)
        return result as Issue[]
      } catch (error) {
        console.error('❌ Failed to fetch issues:', error)
        toast.error('Failed to load issues. Please try again.')
        // Return empty array on error to prevent crashes
        return [] as Issue[]
      }
    },
  })
}

export function useIssue(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: id ? issuesKeys.detail(id) : ['issues', 'detail', 'missing'],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/issues/${id}`)
        return data?.data as Issue
      } catch (error: unknown) {
        console.error('❌ Failed to fetch issue:', error)
        toast.error('Failed to load issue details. Please try again.')
        throw error
      }
    },
  })
}

export function useCreateIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Issue> & { title: string; category?: string; categoryName?: string; attachments?: File[]; location?: { latitude: number; longitude: number; address?: string } }) => {
      const hasFiles = Array.isArray(payload.attachments) && payload.attachments.length > 0
      const hasLocation = !!payload.location
      
      if (hasFiles || hasLocation) {
        const fd = new FormData()
        fd.append('title', String(payload.title))
        if (payload.description) fd.append('description', String(payload.description))
        if (payload.category) fd.append('category', String(payload.category))
        if (payload.categoryName) fd.append('categoryName', String(payload.categoryName))
        if (payload.location) fd.append('location', JSON.stringify(payload.location))
        for (const f of payload.attachments || []) fd.append('images', f)
        
        const { data } = await api.post('/issues', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        return data?.data?.issue || data?.data || data?.issue || data
      } else {
        const { data } = await api.post('/issues', payload)
        return data?.data?.issue || data?.data || data?.issue || data
      }
    },
    onSuccess: (newIssue) => {
      // NOTE: Callers (e.g., report/page.tsx) are responsible for showing success toasts
      // so we deliberately do NOT fire toast.success here to avoid duplicates.
      
      // Invalidate issues queries to refresh lists
      qc.invalidateQueries({ queryKey: issuesKeys.all })
      
      // Optimistically update caches
      qc.setQueryData(issuesKeys.list({ mine: true }), (oldData: Issue[] | undefined) => {
        if (!oldData) return [newIssue]
        return [newIssue, ...oldData]
      })
      qc.setQueryData(issuesKeys.list(), (oldData: Issue[] | undefined) => {
        if (!oldData) return [newIssue]
        return [newIssue, ...oldData]
      })
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      const message = err?.response?.data?.message || err?.message || 'Failed to submit report'
      toast.error(message)
    }
  })
}
