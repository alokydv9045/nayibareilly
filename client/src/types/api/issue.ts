/**
 * Type definitions for Issue-related API responses
 */

export type IssueStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'archived'

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent'

export type IssueCategory = 
  | 'infrastructure'
  | 'water'
  | 'electricity'
  | 'sanitation'
  | 'health'
  | 'education'
  | 'safety'
  | 'environment'
  | 'other'

export interface IssueImage {
  id: string
  url: string
  publicId?: string
  caption?: string
  uploadedAt: string
}

export interface IssueLocation {
  latitude: number
  longitude: number
  address?: string
  ward?: string
  zone?: string
}

export interface IssueTimelineEntry {
  id: string
  action: string
  description: string
  performedBy: {
    id: string
    name: string
    role: string
  }
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface IssueAssignment {
  assignedTo: {
    id: string
    name: string
    email: string
    role: string
    department?: string
  }
  assignedBy: {
    id: string
    name: string
  }
  assignedAt: string
  notes?: string
}

export interface Issue {
  id: string
  title: string
  description: string
  category: IssueCategory
  status: IssueStatus
  priority: IssuePriority
  
  // Location
  location: IssueLocation
  
  // Media
  images: IssueImage[]
  
  // Reporter
  reportedBy: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  reportedAt: string
  
  // Assignment
  assignment?: IssueAssignment
  
  // Department
  department?: {
    id: string
    name: string
  }
  
  // Timeline and history
  timeline: IssueTimelineEntry[]
  
  // Moderation
  moderatedBy?: {
    id: string
    name: string
  }
  moderatedAt?: string
  moderationNotes?: string
  
  // Resolution
  resolvedBy?: {
    id: string
    name: string
  }
  resolvedAt?: string
  resolutionNotes?: string
  resolutionImages?: IssueImage[]
  
  // Metadata
  upvotes?: number
  views?: number
  isPublic: boolean
  isUrgent: boolean
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface IssueListItem extends Pick<
  Issue,
  | 'id'
  | 'title'
  | 'description'
  | 'category'
  | 'status'
  | 'priority'
  | 'location'
  | 'reportedBy'
  | 'reportedAt'
  | 'department'
  | 'isUrgent'
  | 'createdAt'
> {
  imageCount: number
  firstImage?: string
}

export interface IssueFilters {
  status?: IssueStatus[]
  category?: IssueCategory[]
  priority?: IssuePriority[]
  departmentId?: string
  assignedToMe?: boolean
  reportedByMe?: boolean
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface IssueStats {
  total: number
  pending: number
  approved: number
  assigned: number
  inProgress: number
  resolved: number
  rejected: number
  byCategory: Record<IssueCategory, number>
  byPriority: Record<IssuePriority, number>
}

export interface CreateIssueData {
  title: string
  description: string
  category: IssueCategory
  location: IssueLocation
  images?: File[]
  priority?: IssuePriority
  isUrgent?: boolean
}

export interface UpdateIssueData {
  title?: string
  description?: string
  category?: IssueCategory
  priority?: IssuePriority
  status?: IssueStatus
  notes?: string
}

export interface AssignIssueData {
  assignTo: string
  notes?: string
}

export interface ResolveIssueData {
  resolutionNotes: string
  resolutionImages?: File[]
}

export interface ModerateIssueData {
  action: 'approve' | 'reject'
  notes?: string
  assignTo?: string
  department?: string
}
