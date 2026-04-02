import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

// Get issues assigned to current staff member
export function useMyAssignedIssues(filters?: {
  status?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['my-assigned-issues', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())
      
      const { data } = await api.get(`/api/v1/issues/my-assigned?${params}`)
      return data
    },
  })
}

// Start work on an issue (ASSIGNED_TO_STAFF → IN_PROGRESS)
export function useStartWork() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      issueId, 
      note 
    }: { 
      issueId: string
      note?: string 
    }) => {
      const { data } = await api.put(`/api/v1/issues/${issueId}/start`, { note })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-assigned-issues'] })
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

// Resolve an issue with after photos (IN_PROGRESS → RESOLVED)
export function useResolveIssue() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      issueId, 
      photos,
      note 
    }: { 
      issueId: string
      photos: File[]
      note?: string 
    }) => {
      const formData = new FormData()
      
      // Append all photo files
      photos.forEach((photo) => {
        formData.append('media', photo)
      })
      
      // Append note if provided
      if (note) {
        formData.append('note', note)
      }
      
      const { data } = await api.put(`/api/v1/issues/${issueId}/resolve`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-assigned-issues'] })
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

// Get issue details for staff
export function useIssueDetails(issueId: string | null) {
  return useQuery({
    queryKey: ['issue-details', issueId],
    queryFn: async () => {
      if (!issueId) return null
      const { data } = await api.get(`/api/v1/issues/${issueId}`)
      return data
    },
    enabled: !!issueId,
  })
}

// Add work comment/update
export function useAddWorkComment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      issueId, 
      comment 
    }: { 
      issueId: string
      comment: string 
    }) => {
      const { data } = await api.post(`/api/v1/issues/${issueId}/comments`, { comment })
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['issue-details', variables.issueId] })
    },
  })
}

// Request escalation (if issue can't be resolved)
export function useRequestEscalation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      issueId, 
      reason 
    }: { 
      issueId: string
      reason: string 
    }) => {
      const { data } = await api.post(`/api/v1/issues/${issueId}/escalate`, { reason })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-assigned-issues'] })
    },
  })
}
