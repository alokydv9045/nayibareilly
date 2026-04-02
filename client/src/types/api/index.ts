/**
 * Central export for all API types
 */

// Issue types
export type {
  Issue,
  IssueListItem,
  IssueStatus,
  IssuePriority,
  IssueCategory,
  IssueImage,
  IssueLocation,
  IssueTimelineEntry,
  IssueAssignment,
  IssueFilters,
  IssueStats,
  CreateIssueData,
  UpdateIssueData,
  AssignIssueData,
  ResolveIssueData,
  ModerateIssueData,
} from './issue'

// User types
export type {
  User,
  UserProfile,
  UserListItem,
  UserRole,
  UserStatus,
  CreateUserData,
  UpdateUserData,
  UpdateUserRoleData,
  ChangePasswordData,
  UserStats,
  UserFilters,
  LoginData,
  RegisterData,
  AuthResponse,
  SessionData,
} from './user'

// Department types
export type {
  Department,
  DepartmentListItem,
  DepartmentDetails,
  DepartmentStatus,
  DepartmentCategory,
  DepartmentStats,
  DepartmentPerformance,
  CreateDepartmentData,
  UpdateDepartmentData,
  DepartmentFilters,
} from './department'

// Common API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface ApiError {
  message: string
  code?: string
  field?: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    items: T[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }
  message?: string
}

export interface ApiListResponse<T> {
  success: boolean
  data: T[]
  total?: number
  page?: number
  limit?: number
  message?: string
}
