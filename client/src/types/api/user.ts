/**
 * Type definitions for User-related API responses
 */

export type UserRole = 
  | 'citizen'
  | 'staff'
  | 'moderator'
  | 'department_admin'
  | 'org_admin'
  | 'tech_admin'
  | 'mayor'

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  
  // Role and permissions
  roles: UserRole[]
  permissions?: string[]
  
  // Status
  status: UserStatus
  isActive: boolean
  isVerified: boolean
  
  // Department (for staff/admins)
  department?: {
    id: string
    name: string
  }
  departmentId?: string
  
  // Profile
  avatar?: string
  bio?: string
  address?: string
  
  // Account security
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
  
  // Activity
  lastLogin?: string
  loginCount: number
  
  // Lock status
  lockUntil?: string
  loginAttempts: number
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  issuesReported: number
  issuesResolved?: number
  issuesAssigned?: number
  reputation?: number
}

export interface UserListItem extends Pick<
  User,
  | 'id'
  | 'email'
  | 'name'
  | 'roles'
  | 'status'
  | 'isActive'
  | 'department'
  | 'lastLogin'
  | 'createdAt'
> {
  issueCount?: number
}

export interface CreateUserData {
  email: string
  password: string
  name: string
  phone?: string
  role?: UserRole
  departmentId?: string
}

export interface UpdateUserData {
  name?: string
  phone?: string
  bio?: string
  address?: string
  avatar?: string
}

export interface UpdateUserRoleData {
  roles: UserRole[]
  departmentId?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  verifiedUsers: number
  byRole: Record<UserRole, number>
  byStatus: Record<UserStatus, number>
  newUsersThisMonth: number
}

export interface UserFilters {
  role?: UserRole[]
  status?: UserStatus[]
  departmentId?: string
  isVerified?: boolean
  isActive?: boolean
  search?: string
}

export interface LoginData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  name: string
  phone?: string
  agreeToTerms: boolean
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    accessToken: string
    refreshToken?: string
  }
  message?: string
}

export interface SessionData {
  user: User
  token: string
  expiresAt: number
}
