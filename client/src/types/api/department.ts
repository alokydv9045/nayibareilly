/**
 * Type definitions for Department-related API responses
 */

export type DepartmentStatus = 'active' | 'inactive'

export type DepartmentCategory = 
  | 'infrastructure'
  | 'water'
  | 'electricity'
  | 'sanitation'
  | 'health'
  | 'education'
  | 'safety'
  | 'environment'
  | 'administration'
  | 'other'

export interface Department {
  id: string
  name: string
  description?: string
  category: DepartmentCategory
  status: DepartmentStatus
  isActive: boolean
  
  // Contact information
  email?: string
  phone?: string
  address?: string
  
  // Head of department
  head?: {
    id: string
    name: string
    email: string
  }
  
  // Staff
  staffCount: number
  activeStaffCount: number
  
  // Issues
  totalIssues: number
  pendingIssues: number
  resolvedIssues: number
  
  // Performance metrics
  averageResolutionTime?: number // in hours
  resolutionRate?: number // percentage
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface DepartmentListItem extends Pick<
  Department,
  | 'id'
  | 'name'
  | 'description'
  | 'category'
  | 'status'
  | 'isActive'
  | 'staffCount'
  | 'pendingIssues'
> {
  headName?: string
}

export interface DepartmentDetails extends Department {
  staff: Array<{
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
  }>
  recentIssues: Array<{
    id: string
    title: string
    status: string
    priority: string
    createdAt: string
  }>
}

export interface DepartmentStats {
  totalDepartments: number
  activeDepartments: number
  totalStaff: number
  totalIssues: number
  byCategory: Record<DepartmentCategory, number>
  performance: {
    bestPerforming: DepartmentListItem[]
    needsAttention: DepartmentListItem[]
  }
}

export interface CreateDepartmentData {
  name: string
  description?: string
  category: DepartmentCategory
  email?: string
  phone?: string
  address?: string
  headId?: string
}

export interface UpdateDepartmentData {
  name?: string
  description?: string
  category?: DepartmentCategory
  status?: DepartmentStatus
  email?: string
  phone?: string
  address?: string
  headId?: string
}

export interface DepartmentFilters {
  category?: DepartmentCategory[]
  status?: DepartmentStatus[]
  isActive?: boolean
  search?: string
}

export interface DepartmentPerformance {
  departmentId: string
  departmentName: string
  totalIssues: number
  resolvedIssues: number
  pendingIssues: number
  averageResolutionTime: number
  resolutionRate: number
  lastUpdated: string
}
