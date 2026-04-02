/**
 * Assignment System Configuration
 * Handles manual assignment rules, workload tracking, and staff selection
 */

import { UserRole } from '@/types/api/user'

// Staff specializations and skills
export const STAFF_SPECIALIZATIONS = {
  ROADS: 'roads',
  WATER: 'water',
  ELECTRICITY: 'electricity',
  SANITATION: 'sanitation',
  PARKS: 'parks',
  BUILDINGS: 'buildings',
  GENERAL: 'general'
} as const

export type StaffSpecialization = typeof STAFF_SPECIALIZATIONS[keyof typeof STAFF_SPECIALIZATIONS]

// Issue categories mapped to required specializations
export const CATEGORY_SPECIALIZATION_MAP: Record<string, StaffSpecialization[]> = {
  'road-maintenance': [STAFF_SPECIALIZATIONS.ROADS, STAFF_SPECIALIZATIONS.GENERAL],
  'pothole': [STAFF_SPECIALIZATIONS.ROADS, STAFF_SPECIALIZATIONS.GENERAL],
  'water-supply': [STAFF_SPECIALIZATIONS.WATER, STAFF_SPECIALIZATIONS.GENERAL],
  'water-leak': [STAFF_SPECIALIZATIONS.WATER, STAFF_SPECIALIZATIONS.GENERAL],
  'electricity': [STAFF_SPECIALIZATIONS.ELECTRICITY, STAFF_SPECIALIZATIONS.GENERAL],
  'street-light': [STAFF_SPECIALIZATIONS.ELECTRICITY, STAFF_SPECIALIZATIONS.GENERAL],
  'garbage': [STAFF_SPECIALIZATIONS.SANITATION, STAFF_SPECIALIZATIONS.GENERAL],
  'sanitation': [STAFF_SPECIALIZATIONS.SANITATION, STAFF_SPECIALIZATIONS.GENERAL],
  'parks': [STAFF_SPECIALIZATIONS.PARKS, STAFF_SPECIALIZATIONS.GENERAL],
  'building': [STAFF_SPECIALIZATIONS.BUILDINGS, STAFF_SPECIALIZATIONS.GENERAL],
  'other': [STAFF_SPECIALIZATIONS.GENERAL]
}

// Department mappings
export const DEPARTMENTS = {
  PUBLIC_WORKS: 'public_works',
  WATER_WORKS: 'water_works',
  ELECTRICITY_BOARD: 'electricity_board',
  SANITATION: 'sanitation',
  PARKS_RECREATION: 'parks_recreation',
  BUILDING_DEPT: 'building_dept',
  GENERAL_ADMIN: 'general_admin'
} as const

export type Department = typeof DEPARTMENTS[keyof typeof DEPARTMENTS]

// Category to department mapping
export const CATEGORY_DEPARTMENT_MAP: Record<string, Department> = {
  'road-maintenance': DEPARTMENTS.PUBLIC_WORKS,
  'pothole': DEPARTMENTS.PUBLIC_WORKS,
  'water-supply': DEPARTMENTS.WATER_WORKS,
  'water-leak': DEPARTMENTS.WATER_WORKS,
  'electricity': DEPARTMENTS.ELECTRICITY_BOARD,
  'street-light': DEPARTMENTS.ELECTRICITY_BOARD,
  'garbage': DEPARTMENTS.SANITATION,
  'sanitation': DEPARTMENTS.SANITATION,
  'parks': DEPARTMENTS.PARKS_RECREATION,
  'building': DEPARTMENTS.BUILDING_DEPT,
  'other': DEPARTMENTS.GENERAL_ADMIN
}

// Department display names
export const DEPARTMENT_LABELS: Record<Department, string> = {
  [DEPARTMENTS.PUBLIC_WORKS]: 'Public Works Department',
  [DEPARTMENTS.WATER_WORKS]: 'Water Works Department',
  [DEPARTMENTS.ELECTRICITY_BOARD]: 'Electricity Board',
  [DEPARTMENTS.SANITATION]: 'Sanitation Department',
  [DEPARTMENTS.PARKS_RECREATION]: 'Parks & Recreation',
  [DEPARTMENTS.BUILDING_DEPT]: 'Building Department',
  [DEPARTMENTS.GENERAL_ADMIN]: 'General Administration'
}

// Workload thresholds for staff
export const WORKLOAD_THRESHOLDS = {
  LOW: 0,
  MEDIUM: 5,
  HIGH: 10,
  CRITICAL: 15,
  MAX: 20
} as const

// Workload status
export type WorkloadStatus = 'available' | 'light' | 'moderate' | 'heavy' | 'full'

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const

export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS]

// Priority weights for assignment suggestions
export const PRIORITY_WEIGHTS = {
  [PRIORITY_LEVELS.LOW]: 1,
  [PRIORITY_LEVELS.MEDIUM]: 2,
  [PRIORITY_LEVELS.HIGH]: 3,
  [PRIORITY_LEVELS.URGENT]: 5
}

// Staff member interface
export interface StaffMember {
  id: string
  name: string
  email: string
  role: UserRole
  department: Department
  specializations: StaffSpecialization[]
  currentWorkload: number
  maxCapacity: number
  isAvailable: boolean
  skills: string[]
  experienceYears: number
}

// Assignment interface
export interface Assignment {
  id: string
  issueId: string
  assigneeId: string
  assigneeName: string
  assignedBy: string
  assignedAt: Date
  department: Department
  status: 'active' | 'completed' | 'reassigned'
  priority: PriorityLevel
  notes?: string
}

// Assignment history entry
export interface AssignmentHistory {
  id: string
  issueId: string
  fromAssigneeId?: string
  fromAssigneeName?: string
  toAssigneeId: string
  toAssigneeName: string
  changedBy: string
  changedByName: string
  changedAt: Date
  reason?: string
  type: 'initial' | 'reassignment' | 'unassignment'
}

// Assignment filters
export interface AssignmentFilters {
  department?: Department
  specialization?: StaffSpecialization
  workloadStatus?: WorkloadStatus
  availableOnly?: boolean
  searchQuery?: string
}

// Helper functions

/**
 * Get workload status based on current assignments
 */
export function getWorkloadStatus(currentWorkload: number, maxCapacity: number): WorkloadStatus {
  const percentage = (currentWorkload / maxCapacity) * 100

  if (percentage === 0) return 'available'
  if (percentage < 40) return 'light'
  if (percentage < 70) return 'moderate'
  if (percentage < 100) return 'heavy'
  return 'full'
}

/**
 * Get workload color for UI
 */
export function getWorkloadColor(status: WorkloadStatus): string {
  const colors: Record<WorkloadStatus, string> = {
    available: 'green',
    light: 'blue',
    moderate: 'yellow',
    heavy: 'orange',
    full: 'red'
  }
  return colors[status]
}

/**
 * Get department for issue category
 */
export function getDepartmentForCategory(category: string): Department {
  return CATEGORY_DEPARTMENT_MAP[category] || DEPARTMENTS.GENERAL_ADMIN
}

/**
 * Get required specializations for issue category
 */
export function getRequiredSpecializations(category: string): StaffSpecialization[] {
  return CATEGORY_SPECIALIZATION_MAP[category] || [STAFF_SPECIALIZATIONS.GENERAL]
}

/**
 * Check if staff member has required specialization
 */
export function hasRequiredSpecialization(
  staffSpecializations: StaffSpecialization[],
  requiredSpecializations: StaffSpecialization[]
): boolean {
  return requiredSpecializations.some(req => staffSpecializations.includes(req))
}

/**
 * Calculate skill match score (0-100)
 */
export function calculateSkillMatchScore(
  staffSpecializations: StaffSpecialization[],
  requiredSpecializations: StaffSpecialization[],
  staffSkills: string[],
  issueCategory: string
): number {
  let score = 0

  // Specialization match (40 points)
  const hasExactMatch = staffSpecializations.some(s => requiredSpecializations.includes(s))
  if (hasExactMatch) {
    score += 40
  } else if (staffSpecializations.includes(STAFF_SPECIALIZATIONS.GENERAL)) {
    score += 20
  }

  // Skills match (30 points)
  const categoryKeywords = issueCategory.split('-')
  const matchingSkills = staffSkills.filter(skill =>
    categoryKeywords.some(keyword => skill.toLowerCase().includes(keyword.toLowerCase()))
  )
  score += Math.min(30, matchingSkills.length * 10)

  // Workload availability (30 points)
  // This will be calculated separately based on current workload

  return score
}

/**
 * Calculate workload score (0-30 points for skill match)
 */
export function calculateWorkloadScore(currentWorkload: number, maxCapacity: number): number {
  const percentage = (currentWorkload / maxCapacity) * 100
  
  if (percentage === 0) return 30
  if (percentage < 40) return 25
  if (percentage < 70) return 15
  if (percentage < 100) return 5
  return 0 // Full capacity
}

/**
 * Sort staff by best match for assignment
 */
export function sortStaffByMatch(
  staff: StaffMember[],
  issueCategory: string,
  _issuePriority?: PriorityLevel
): StaffMember[] {
  const requiredSpecs = getRequiredSpecializations(issueCategory)

  return [...staff].sort((a, b) => {
    // Calculate scores
    const scoreA = 
      calculateSkillMatchScore(a.specializations, requiredSpecs, a.skills, issueCategory) +
      calculateWorkloadScore(a.currentWorkload, a.maxCapacity)
    
    const scoreB = 
      calculateSkillMatchScore(b.specializations, requiredSpecs, b.skills, issueCategory) +
      calculateWorkloadScore(b.currentWorkload, b.maxCapacity)

    // Higher score = better match
    if (scoreB !== scoreA) return scoreB - scoreA

    // Tie breaker: less workload
    return a.currentWorkload - b.currentWorkload
  })
}

/**
 * Filter staff based on criteria
 */
export function filterStaff(
  staff: StaffMember[],
  filters: AssignmentFilters
): StaffMember[] {
  return staff.filter(member => {
    // Department filter
    if (filters.department && member.department !== filters.department) {
      return false
    }

    // Specialization filter
    if (filters.specialization && !member.specializations.includes(filters.specialization)) {
      return false
    }

    // Workload status filter
    if (filters.workloadStatus) {
      const status = getWorkloadStatus(member.currentWorkload, member.maxCapacity)
      if (status !== filters.workloadStatus) {
        return false
      }
    }

    // Available only filter
    if (filters.availableOnly && !member.isAvailable) {
      return false
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const searchableText = `${member.name} ${member.email} ${member.skills.join(' ')}`.toLowerCase()
      if (!searchableText.includes(query)) {
        return false
      }
    }

    return true
  })
}

/**
 * Check if staff can be assigned more work
 */
export function canAssignToStaff(staff: StaffMember): boolean {
  return staff.isAvailable && staff.currentWorkload < staff.maxCapacity
}

/**
 * Get assignment priority label
 */
export function getPriorityLabel(priority: PriorityLevel): string {
  const labels: Record<PriorityLevel, string> = {
    [PRIORITY_LEVELS.LOW]: 'Low Priority',
    [PRIORITY_LEVELS.MEDIUM]: 'Medium Priority',
    [PRIORITY_LEVELS.HIGH]: 'High Priority',
    [PRIORITY_LEVELS.URGENT]: 'Urgent'
  }
  return labels[priority]
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: PriorityLevel): string {
  const colors: Record<PriorityLevel, string> = {
    [PRIORITY_LEVELS.LOW]: 'gray',
    [PRIORITY_LEVELS.MEDIUM]: 'blue',
    [PRIORITY_LEVELS.HIGH]: 'orange',
    [PRIORITY_LEVELS.URGENT]: 'red'
  }
  return colors[priority]
}
