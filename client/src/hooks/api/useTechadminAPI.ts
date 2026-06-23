import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'

// Types
export interface TechadminUser {
  id: string
  email: string
  name: string
  roles: string[]
  departmentId?: string
  departmentName?: string
  isActive: boolean
  isVerified: boolean
  lastLogin?: string
  createdAt: string
}

export interface TechadminDepartment {
  id: string
  name: string
  description: string
  headId?: string
  headName?: string
  headEmail?: string
  contactPhone?: string
  contactEmail?: string
  isActive: boolean
  staffCount: number
  activeIssues: number
  resolvedIssues: number
  avgResolutionTime: number
  slaCompliance: number
  createdAt: string
}

export interface TechadminSettings {
  platformName: string
  platformDescription: string
  platformUrl: string
  supportEmail: string
  supportPhone: string
  slaHighPriority: number
  slaMediumPriority: number
  slaLowPriority: number
  slaUnit: 'hours' | 'days'
  emailNotificationsEnabled: boolean
  smsNotificationsEnabled: boolean
  pushNotificationsEnabled: boolean
  notifyOnIssueCreated: boolean
  notifyOnIssueAssigned: boolean
  notifyOnIssueStatusChange: boolean
  notifyOnIssueResolved: boolean
  smtpHost: string
  smtpPort: number
  smtpUsername: string
  smtpPassword: string
  emailFromAddress: string
  emailFromName: string
  smsProvider: string
  smsApiKey: string
  smsApiSecret: string
  smsSenderName: string
  sessionTimeout: number
  maxLoginAttempts: number
  passwordMinLength: number
  requireEmailVerification: boolean
  requirePhoneVerification: boolean
  enableTwoFactorAuth: boolean
  autoBackupEnabled: boolean
  backupFrequency: string
  retentionDays: number
}

export interface CreateUserInput {
  email: string
  name: string
  password: string
  roles: string[]
  departmentId?: string
  isActive: boolean
  isVerified: boolean
}

export interface UpdateUserInput {
  email?: string
  name?: string
  password?: string
  roles?: string[]
  departmentId?: string
  isActive?: boolean
  isVerified?: boolean
}

export interface CreateDepartmentInput {
  name: string
  description: string
  headId?: string
  contactPhone?: string
  contactEmail?: string
  isActive: boolean
}

export interface UpdateDepartmentInput {
  name?: string
  description?: string
  headId?: string
  contactPhone?: string
  contactEmail?: string
  isActive?: boolean
}

// API Functions
const fetchUsers = async (): Promise<TechadminUser[]> => {
  const { data } = await api.request<any>({
    method: 'GET',
    url: '/admin/users',
  })
  return data?.data?.users || data?.users || []
}

const fetchDepartments = async (): Promise<TechadminDepartment[]> => {
  const { data } = await api.request<any>({
    method: 'GET',
    url: '/departments',
  })
  return data?.data?.items || data?.items || []
}

const fetchSettings = async (): Promise<TechadminSettings> => {
  const { data } = await api.request<TechadminSettings>({
    method: 'GET',
    url: '/admin/techadmin/settings',
  })
  return (data as any)?.data || data
}

const createUser = async (data: CreateUserInput): Promise<TechadminUser> => {
  const res = await api.request<TechadminUser>({
    method: 'POST',
    url: '/admin/users',
    data,
  })
  return res.data
}

const updateUser = async ({ id, data }: { id: string; data: UpdateUserInput }): Promise<TechadminUser> => {
  const res = await api.request<TechadminUser>({
    method: 'PUT',
    url: `/admin/users/${id}`,
    data,
  })
  return res.data
}

const deleteUser = async (id: string): Promise<void> => {
  await api.request<void>({
    method: 'DELETE',
    url: `/admin/users/${id}`,
  })
  return
}

const createDepartment = async (data: CreateDepartmentInput): Promise<TechadminDepartment> => {
  const res = await api.request<TechadminDepartment>({
    method: 'POST',
    url: '/departments',
    data,
  })
  return res.data
}

const updateDepartment = async ({ id, data }: { id: string; data: UpdateDepartmentInput }): Promise<TechadminDepartment> => {
  const res = await api.request<TechadminDepartment>({
    method: 'PUT',
    url: `/departments/${id}`,
    data,
  })
  return res.data
}

const deleteDepartment = async (id: string): Promise<void> => {
  await api.request<void>({
    method: 'DELETE',
    url: `/departments/${id}`,
  })
  return
}

const updateSettings = async (data: Partial<TechadminSettings>): Promise<TechadminSettings> => {
  const res = await api.request<TechadminSettings>({
    method: 'PUT',
    url: '/admin/techadmin/settings',
    data,
  })
  return (res.data as any)?.data || res.data
}

// Hooks
export function useTechadminUsers() {
  return useQuery({
    queryKey: ['techadmin', 'users'],
    queryFn: fetchUsers,
    staleTime: 30000, // 30 seconds
  })
}

export function useTechadminDepartments() {
  return useQuery({
    queryKey: ['techadmin', 'departments'],
    queryFn: fetchDepartments,
    staleTime: 30000,
  })
}

export function useTechadminSettings() {
  return useQuery({
    queryKey: ['techadmin', 'settings'],
    queryFn: fetchSettings,
    staleTime: 60000, // 1 minute
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techadmin', 'users'] })
      toast.success('User created successfully')
    },
    onError: () => {
      toast.error('Failed to create user')
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techadmin', 'users'] })
      toast.success('User updated successfully')
    },
    onError: () => {
      toast.error('Failed to update user')
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techadmin', 'users'] })
      toast.success('User deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete user')
    },
  })
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techadmin', 'departments'] })
      toast.success('Department created successfully')
    },
    onError: () => {
      toast.error('Failed to create department')
    },
  })
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techadmin', 'departments'] })
      toast.success('Department updated successfully')
    },
    onError: () => {
      toast.error('Failed to update department')
    },
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techadmin', 'departments'] })
      toast.success('Department deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete department')
    },
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techadmin', 'settings'] })
      toast.success('Settings saved successfully')
    },
    onError: () => {
      toast.error('Failed to save settings')
    },
  })
}
