import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

export interface StaffIssue {
  id: string
  title: string
  status: 'PENDING' | 'TRIAGED' | 'ASSIGNED_TO_STAFF' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATED' | 'REJECTED'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  createdAt: string
  updatedAt: string
}

export const fetchAssignedIssues = async (): Promise<StaffIssue[]> => {
  const { data } = await api.get('/issues/assigned-to-me')
  return (data?.data?.items || []) as StaffIssue[]
}

export const startWork = async (id: string) => {
  const { data } = await api.put(`/issues/${id}/start`)
  return data?.data?.issue as StaffIssue
}

export const resolveWithPhotos = async (id: string, files: File[]) => {
  const form = new FormData()
  for (const f of files) form.append('after', f)
  const { data } = await api.put(`/issues/${id}/resolve`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data?.data?.issue as StaffIssue
}

export const useAssignedIssues = () => useQuery({ queryKey: ['staffAssignedIssues'], queryFn: fetchAssignedIssues, refetchInterval: 15000 })

export const useStartWork = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string }) => startWork(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staffAssignedIssues'] })
  })
}

export const useResolveWithPhotos = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) => resolveWithPhotos(id, files),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staffAssignedIssues'] })
  })
}
