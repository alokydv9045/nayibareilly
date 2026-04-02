// Enhanced TypeScript types for the NayiBareilly platform
// This file provides comprehensive type definitions for better type safety and developer experience

// User Types
export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  roles: UserRole[]
  requestedRole?: string
  isActive: boolean
  isVerified: boolean
  departmentId?: string
  department?: Department
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  CITIZEN = 'citizen',
  STAFF = 'staff',
  MODERATOR = 'moderator',
  DEPT_ADMIN = 'dept_admin',
  MAYOR = 'mayor',
  SUPER_ADMIN = 'super_admin'
}

export interface AuthUser extends User {
  token?: string
  isAdmin: boolean
  isModerator: boolean
  isStaff: boolean
}

// Issue Types
export interface Issue {
  id: string
  reportId: string
  title: string
  description: string
  status: IssueStatus
  priority: IssuePriority
  latitude?: number
  longitude?: number
  address?: string
  landmark?: string
  ward?: string
  zone?: string
  reporterId?: string
  reporterName: string
  reporterEmail: string
  reporterPhone?: string
  isAnonymous: boolean
  categoryId?: string
  category?: IssueCategory
  departmentId?: string
  department?: Department
  assignedToId?: string
  assignedTo?: User
  slaDeadline?: string
  slaBreached: boolean
  resolutionTimeHours?: number
  isEscalated: boolean
  escalatedAt?: string
  escalationLevel: number
  escalationReason?: string
  resolutionSummary?: string
  resolutionDetails?: string
  resolvedAt?: string
  resolvedById?: string
  resolvedBy?: User
  resolutionCost?: number
  upvotes: number
  downvotes: number
  totalVotes: number
  viewCount: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
  images?: IssueMedia[]
  comments?: IssueComment[]
  timeline?: IssueTimeline[]
  votes?: Vote[]
  _count?: {
    comments: number
    timeline: number
    votes: number
  }
}

export enum IssueStatus {
  PENDING = 'PENDING',
  TRIAGED = 'TRIAGED',
  ASSIGNED_TO_STAFF = 'ASSIGNED_TO_STAFF',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  ESCALATED = 'ESCALATED',
  REJECTED = 'REJECTED'
}

export enum IssuePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface IssueCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  priority: IssuePriority
  slaHours: number
  isActive: boolean
  requiresLocation: boolean
  requiresImages: boolean
  allowsAnonymous: boolean
  defaultDepartmentId?: string
  defaultDepartment?: Department
  autoEscalateAfterHours?: number
  escalateToDepartmentId?: string
  notifyRoles: UserRole[]
  createdAt: string
  updatedAt: string
  _count?: {
    issues: number
  }
}

export interface IssueMedia {
  id: string
  issueId: string
  url: string
  filename: string
  originalName?: string
  mimeType?: string
  size?: number
  uploadedAt: string
}

export interface IssueComment {
  id: string
  issueId: string
  userId?: string
  user?: User
  content: string
  isInternal: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface IssueTimeline {
  id: string
  issueId: string
  status: IssueStatus
  note?: string
  performedById?: string
  performedBy?: User
  createdAt: string
}

export interface Vote {
  id: string
  userId: string
  user?: User
  issueId: string
  isUpvote: boolean
  createdAt: string
}

// Department Types
export interface Department {
  id: string
  name: string
  description: string
  code: string
  contactEmail?: string
  contactPhone?: string
  isActive: boolean
  slaHours: number
  priority: number
  budget: number
  headId?: string
  head?: User
  createdAt: string
  updatedAt: string
  _count?: {
    users: number
    issues: number
    categories: number
  }
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  title: string
  message?: string
  type?: string
  metadata?: Record<string, unknown>
  read: boolean
  createdAt: string
}

// Activity Log Types
export interface ActivityLog {
  id: string
  action: ActivityAction
  description: string
  metadata?: Record<string, unknown>
  userId?: string
  user?: User
  issueId?: string
  issue?: Issue
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export enum ActivityAction {
  CREATED = 'CREATED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  ASSIGNED = 'ASSIGNED',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
  COMMENTED = 'COMMENTED',
  ATTACHMENT_ADDED = 'ATTACHMENT_ADDED',
  LOCATION_UPDATED = 'LOCATION_UPDATED',
  PRIORITY_CHANGED = 'PRIORITY_CHANGED',
  DEPARTMENT_TRANSFERRED = 'DEPARTMENT_TRANSFERRED',
  SLA_BREACHED = 'SLA_BREACHED',
  VOTED = 'VOTED',
  DELETED = 'DELETED'
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: {
    type: string
    message: string
    statusCode: number
    metadata?: Record<string, unknown>
  }
}

export interface PaginatedResponse<T = unknown> {
  items: T[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface ListResponse<T = unknown> extends ApiResponse<PaginatedResponse<T>> {
  filters?: Record<string, unknown>
}

// Form Types
export interface IssueCreateForm {
  title: string
  description: string
  categoryId?: string
  categoryName?: string
  location?: {
    latitude?: number
    longitude?: number
    address?: string
    landmark?: string
    ward?: string
    zone?: string
  }
  images?: File[]
  isAnonymous?: boolean
}

export interface UserRegistrationForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  requestedRole?: string
  acceptTerms: boolean
}

export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

export interface PasswordResetForm {
  email: string
}

export interface PasswordUpdateForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ProfileUpdateForm {
  name: string
  email: string
  avatarUrl?: string
  departmentId?: string
}

// Filter Types
export interface IssueFilters {
  status?: IssueStatus | string
  priority?: IssuePriority | string
  category?: string
  department?: string
  assignedTo?: string
  user?: string
  search?: string
  startDate?: string
  endDate?: string
  sort?: 'newest' | 'oldest' | 'priority' | 'votes' | 'updated' | 'status'
  page?: number
  limit?: number
}

export interface UserFilters {
  role?: UserRole | string
  status?: 'active' | 'inactive' | 'verified' | 'unverified'
  department?: string
  search?: string
  sort?: 'newest' | 'oldest' | 'name' | 'email' | 'lastLogin'
  page?: number
  limit?: number
}

// Dashboard Types
export interface DashboardStats {
  overview: {
    totalUsers: number
    totalIssues: number
    resolvedIssues: number
    pendingIssues: number
    criticalIssues: number
    escalatedIssues: number
    resolutionRate: number
    avgResolutionTime: number
  }
  trends: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  departments: Array<{
    department: Department
    count: number
  }>
  categories: Array<{
    category: IssueCategory
    count: number
  }>
  alerts: {
    critical: number
    escalated: number
    slaBreached: number
  }
  lastUpdated: string
}

export interface AnalyticsData {
  period: string
  totalIssues: number
  filters: {
    departmentId?: string
    categoryId?: string
    startDate: string
    endDate: string
  }
  distributions: {
    status: Array<{
      status: IssueStatus
      count: number
      percentage: string
    }>
    priority: Array<{
      priority: IssuePriority
      count: number
      percentage: string
    }>
    categories: Array<{
      category: IssueCategory
      count: number
      percentage: number
    }>
    departments: Array<{
      department: Department
      count: number
      percentage: number
    }>
  }
  trends: {
    daily: Array<{
      date: string
      total: number
      resolved: number
    }>
  }
  metrics: {
    resolution: {
      averageHours: number
      minHours: number
      maxHours: number
      totalResolved: number
    }
    users: {
      newRegistrations: number
    }
    sla: {
      breachedCount: number
      breachRate: string
    }
  }
  generatedAt: string
}

// Component Props Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export interface TableColumn<T = unknown> {
  key: string
  title: string
  dataIndex?: string
  render?: (value: unknown, record: T, index: number) => React.ReactNode
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T = unknown> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: {
    current: number
    total: number
    pageSize: number
    onChange: (page: number) => void
  }
  className?: string
}

// Utility Types
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Location Types
export interface LocationData {
  latitude: number
  longitude: number
  address?: string
  landmark?: string
  ward?: string
  zone?: string
  accuracy?: number
}

export interface MapProps {
  center?: [number, number]
  zoom?: number
  markers?: Array<{
    id: string
    position: [number, number]
    title: string
    description?: string
    onClick?: () => void
  }>
  onLocationSelect?: (location: LocationData) => void
  height?: string
  className?: string
}

// Theme Types
export interface Theme {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    danger: string
    info: string
    light: string
    dark: string
    gray: Record<string, string>
  }
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  shadows: Record<string, string>
  typography: {
    fontFamily: string
    fontSize: Record<string, string>
    fontWeight: Record<string, number>
    lineHeight: Record<string, string>
  }
}

// Error Types
export interface AppError {
  type: string
  message: string
  statusCode: number
  metadata?: Record<string, unknown>
  timestamp: string
}

export interface ValidationError {
  field: string
  message: string
  value?: unknown
}

// File Upload Types
export interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  onUpload: (files: File[]) => void
  onError?: (error: string) => void
  className?: string
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
}

// Real-time Types
export interface SocketEvent {
  type: string
  payload: unknown
  timestamp: string
}

export interface NotificationEvent extends SocketEvent {
  type: 'notification:new'
  payload: {
    title: string
    message?: string
    issueId?: string
    reportId?: string
  }
}

export interface IssueEvent extends SocketEvent {
  type: 'issue:new' | 'issue:updated' | 'issue:status_changed'
  payload: {
    id: string
    title?: string
    status?: IssueStatus
    reportId?: string
    category?: string
    priority?: IssuePriority
    createdAt?: string
  }
}

