import { api } from './client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types align with existing public issues but include admin-only fields like reporter & assignee
export interface AdminIssue {
  _id: string
  id?: string
  title: string
  description?: string
  status: string
  priority?: string
  category?: { _id: string; name: string; color?: string }
  location?: string
  reportedBy?: { _id?: string; name?: string; email?: string }
  assignedTo?: { _id?: string; name?: string; department?: string }
  createdAt: string
  updatedAt?: string
  resolvedAt?: string
  images?: string[]
  votes?: number
}

export interface AdminIssuesFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  priority?: string
  category?: string
  sort?: string
}

export interface AdminIssuesResponse {
  items: AdminIssue[]
  total: number
  page: number
  pages: number
}

// Fetch issues (admin scope). Assumes same /issues endpoint honors role-based expansion.
export const fetchAdminIssues = async (filters: AdminIssuesFilters = {}): Promise<AdminIssuesResponse> => {
  const params: Record<string, string | number | undefined> = {
    page: filters.page || 1,
    limit: filters.limit || 20,
  }
  if (filters.search) params.q = filters.search
  if (filters.status) params.status = filters.status
  if (filters.priority) params.priority = filters.priority
  if (filters.category) params.category = filters.category
  if (filters.sort) params.sort = filters.sort

  const { data } = await api.get('/issues', { params })
  // Backend standard shape { data: { items, total, page, pages } }
  const payload = data?.data || {}
  return {
    items: payload.items || [],
    total: payload.total || 0,
    page: payload.page || params.page,
    pages: payload.pages || 1,
  }
}

// Update single issue status
export const updateIssueStatus = async (id: string, status: string, note?: string) => {
  // Prefer dedicated status route on server to ensure timeline logging and notifications
  const { data } = await api.put(`/issues/${id}/status`, { status, note })
  return data?.data?.issue
}

export const triageIssue = async (id: string, departmentId: string, note?: string) => {
  const { data } = await api.put(`/issues/${id}/triage`, { departmentId, note })
  return data?.data?.issue as AdminIssue
}

export const assignIssueToStaff = async (id: string, staffUserId: string, note?: string) => {
  const { data } = await api.put(`/issues/${id}/assign`, { staffUserId, note })
  return data?.data?.issue as AdminIssue
}

export const closeIssue = async (id: string, note?: string) => {
  const { data } = await api.put(`/issues/${id}/close`, { note })
  return data?.data?.issue as AdminIssue
}

// Bulk update statuses (assumed endpoint; fallback to sequential if not implemented server-side)
export const bulkUpdateIssueStatus = async (ids: string[], status: string) => {
  try {
    const { data } = await api.post(`/issues/bulk-status`, { ids, status })
    return (data?.data?.items as AdminIssue[]) || []
  } catch {
    // Fallback: update sequentially
    const results: AdminIssue[] = []
    for (const id of ids) {
      try {
        const { data } = await api.patch(`/issues/${id}`, { status })
        const issue: AdminIssue | undefined = data?.data?.issue
        if (issue) results.push(issue)
      } catch {
        // continue
      }
    }
    return results
  }
}

// React Query hooks
export const useAdminIssues = (filters: AdminIssuesFilters) => {
  return useQuery({
    queryKey: ['adminIssues', filters],
    queryFn: () => fetchAdminIssues(filters),
  })
}

export const useUpdateIssueStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) => updateIssueStatus(id, status, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminIssues'] })
    }
  })
}

export const useTriageIssue = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, departmentId, note }: { id: string; departmentId: string; note?: string }) => triageIssue(id, departmentId, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminIssues'] })
  })
}

export const useAssignIssueToStaff = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, staffUserId, note }: { id: string; staffUserId: string; note?: string }) => assignIssueToStaff(id, staffUserId, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminIssues'] })
  })
}

export const useCloseIssue = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => closeIssue(id, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminIssues'] })
  })
}

export const useBulkUpdateIssueStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) => bulkUpdateIssueStatus(ids, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminIssues'] })
    }
  })
}
