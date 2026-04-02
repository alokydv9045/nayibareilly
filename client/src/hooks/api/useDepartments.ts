import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import api from '@/lib/api/endpoints'

export interface DepartmentIssue {
  id: string
  title: string
  description: string
  category: {
    id: string
    name: string
  }
  location: string
  latitude: number
  longitude: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: string
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  assignedToId?: string
  reporter: {
    id: string
    name: string
    email: string
  }
  departmentId: string
  createdAt: string
  moderatorNotes?: string
  assignedToDepartmentAt?: string
}

export interface StaffMember {
  id: string
  name: string
  email: string
  phone?: string
  roles: string[]
  activeIssues: number
  workloadStatus: 'available' | 'light' | 'moderate' | 'heavy'
  createdAt: string
}

export interface DepartmentStats {
  totalIssues: number
  unassignedIssues: number
  inProgressIssues: number
  resolvedToday: number
  staffCount: number
  avgResponseTime: string
}

// Query keys
const departmentKeys = {
  all: ['departments'] as const,
  issues: (deptId: string, status?: string) => ['departments', deptId, 'issues', status] as const,
  staff: (deptId: string) => ['departments', deptId, 'staff'] as const,
  stats: (deptId: string) => ['departments', deptId, 'stats'] as const,
}

/**
 * Fetch department issues
 */
export const useDepartmentIssues = (departmentId: string, status?: string) => {
  return useQuery({
    queryKey: departmentKeys.issues(departmentId, status),
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        if (status) params.append('status', status)
        
        const { data } = await api.get(`/departments/${departmentId}/issues?${params}`)
        return data?.data?.issues as DepartmentIssue[]
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; message?: string }
        const message = err?.response?.data?.message || 'Failed to load department issues'
        toast.error(message)
        throw error
      }
    },
    enabled: !!departmentId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  })
}

/**
 * Fetch department staff members
 */
export const useDepartmentStaff = (departmentId: string) => {
  return useQuery({
    queryKey: departmentKeys.staff(departmentId),
    queryFn: async () => {
      try {
        const { data } = await api.get(`/departments/${departmentId}/staff`)
        return data?.data?.staff as StaffMember[]
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; message?: string }
        const message = err?.response?.data?.message || 'Failed to load staff members'
        toast.error(message)
        throw error
      }
    },
    enabled: !!departmentId,
    staleTime: 60000, // 1 minute
  })
}

/**
 * Assign issue to staff member
 */
export const useAssignIssueToStaff = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      issueId, 
      staffUserId, 
      note 
    }: { 
      issueId: string
      staffUserId: string
      note?: string 
    }) => {
      const { data } = await api.post(`/departments/issues/${issueId}/assign-staff`, {
        staffUserId,
        note
      })
      return data?.data?.issue
    },
    onSuccess: () => {
      toast.success('Issue assigned to staff member successfully!')
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      const message = err?.response?.data?.message || err?.message || 'Failed to assign issue to staff'
      toast.error(message)
    }
  })
}

/**
 * Get department statistics
 */
export const useDepartmentStats = (departmentId: string) => {
  return useQuery({
    queryKey: departmentKeys.stats(departmentId),
    queryFn: async () => {
      try {
        // Calculate stats from issues
        const { data } = await api.get(`/departments/${departmentId}/issues`)
        const issues = data?.data?.issues as DepartmentIssue[]
        
        if (!issues) {
          return {
            totalIssues: 0,
            unassignedIssues: 0,
            inProgressIssues: 0,
            resolvedToday: 0,
            staffCount: 0,
            avgResponseTime: '0h'
          } as DepartmentStats
        }
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const stats: DepartmentStats = {
          totalIssues: issues.length,
          unassignedIssues: issues.filter(i => i.status === 'TRIAGED' && !i.assignedToId).length,
          inProgressIssues: issues.filter(i => ['ASSIGNED_TO_STAFF', 'IN_PROGRESS'].includes(i.status)).length,
          resolvedToday: issues.filter(i => 
            i.status === 'RESOLVED' && 
            new Date(i.createdAt) >= today
          ).length,
          staffCount: 0, // Will be updated from staff query
          avgResponseTime: 'N/A' // Will be calculated from real data when backend provides it
        }
        
        return stats
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; message?: string }
        const message = err?.response?.data?.message || 'Failed to load department statistics'
        toast.error(message)
        throw error
      }
    },
    enabled: !!departmentId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  })
}