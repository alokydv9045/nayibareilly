import { api } from './client'
import { useQuery } from '@tanstack/react-query'

export interface AdminUser {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
  isActive?: boolean
}

export interface AdminUsersFilters {
  search?: string
  role?: string
  page?: number
  limit?: number
}

export interface AdminUsersResponse {
  items: AdminUser[]
  total: number
  page: number
  pages: number
}

export const fetchAdminUsers = async (filters: AdminUsersFilters = {}): Promise<AdminUsersResponse> => {
  const params: Record<string, string | number | undefined> = {
    page: filters.page || 1,
    limit: filters.limit || 20,
  }
  if (filters.search) params.q = filters.search
  if (filters.role) params.role = filters.role

  const { data } = await api.get('/admin/users', { params })
  const payload = data?.data || {}
  return {
    items: payload.items || [],
    total: payload.total || 0,
    page: payload.page || params.page,
    pages: payload.pages || 1,
  }
}

export const useAdminUsers = (filters: AdminUsersFilters) => {
  return useQuery({
    queryKey: ['adminUsers', filters],
    queryFn: () => fetchAdminUsers(filters),
  })
}