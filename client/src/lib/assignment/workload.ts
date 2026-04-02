/**
 * Workload Analyzer
 * Tracks and calculates staff workload, capacity, and availability
 */

import { StaffMember, WorkloadStatus, getWorkloadStatus } from './assignment.config'

export interface WorkloadMetrics {
  totalAssignments: number
  activeAssignments: number
  completedThisWeek: number
  completedThisMonth: number
  averageCompletionTime: number // in hours
  capacityUtilization: number // percentage
  status: WorkloadStatus
}

export interface StaffWorkload {
  staffId: string
  staffName: string
  department: string
  currentWorkload: number
  maxCapacity: number
  metrics: WorkloadMetrics
  recentAssignments: Array<{
    issueId: string
    title: string
    assignedAt: Date
    status: string
  }>
}

/**
 * Calculate detailed workload metrics for a staff member
 */
export function calculateWorkloadMetrics(
  assignments: Array<{
    id: string
    status: string
    assignedAt: Date
    completedAt?: Date
  }>
): WorkloadMetrics {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const active = assignments.filter(a => a.status !== 'completed' && a.status !== 'closed')
  const completed = assignments.filter(a => a.status === 'completed' || a.status === 'closed')
  const completedThisWeek = completed.filter(a => a.completedAt && a.completedAt >= oneWeekAgo)
  const completedThisMonth = completed.filter(a => a.completedAt && a.completedAt >= oneMonthAgo)

  // Calculate average completion time
  const completionTimes = completed
    .filter(a => a.completedAt)
    .map(a => {
      const assignedTime = new Date(a.assignedAt).getTime()
      const completedTime = new Date(a.completedAt!).getTime()
      return (completedTime - assignedTime) / (1000 * 60 * 60) // Convert to hours
    })

  const averageCompletionTime = completionTimes.length > 0
    ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
    : 0

  return {
    totalAssignments: assignments.length,
    activeAssignments: active.length,
    completedThisWeek: completedThisWeek.length,
    completedThisMonth: completedThisMonth.length,
    averageCompletionTime: Math.round(averageCompletionTime),
    capacityUtilization: 0, // Will be calculated with maxCapacity
    status: 'available'
  }
}

/**
 * Get workload data for a staff member
 */
export function getStaffWorkload(
  staff: StaffMember,
  assignments: Array<{
    id: string
    issueId: string
    issueTitle: string
    status: string
    assignedAt: Date
    completedAt?: Date
  }>
): StaffWorkload {
  const metrics = calculateWorkloadMetrics(assignments)
  const capacityUtilization = (staff.currentWorkload / staff.maxCapacity) * 100
  const status = getWorkloadStatus(staff.currentWorkload, staff.maxCapacity)

  // Get recent assignments (last 5)
  const recentAssignments = assignments
    .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())
    .slice(0, 5)
    .map(a => ({
      issueId: a.issueId,
      title: a.issueTitle,
      assignedAt: new Date(a.assignedAt),
      status: a.status
    }))

  return {
    staffId: staff.id,
    staffName: staff.name,
    department: staff.department,
    currentWorkload: staff.currentWorkload,
    maxCapacity: staff.maxCapacity,
    metrics: {
      ...metrics,
      capacityUtilization,
      status
    },
    recentAssignments
  }
}

/**
 * Get workload summary for all staff
 */
export function getTeamWorkloadSummary(
  staffList: StaffMember[],
  allAssignments: Map<string, Array<{
    id: string
    issueId: string
    issueTitle: string
    status: string
    assignedAt: Date
    completedAt?: Date
  }>>
): {
  totalStaff: number
  availableStaff: number
  averageWorkload: number
  totalActiveAssignments: number
  workloadDistribution: Record<WorkloadStatus, number>
} {
  const workloadDistribution: Record<WorkloadStatus, number> = {
    available: 0,
    light: 0,
    moderate: 0,
    heavy: 0,
    full: 0
  }

  let totalWorkload = 0
  let totalActiveAssignments = 0
  let availableStaff = 0

  staffList.forEach(staff => {
    const status = getWorkloadStatus(staff.currentWorkload, staff.maxCapacity)
    workloadDistribution[status]++
    totalWorkload += staff.currentWorkload

    if (staff.isAvailable && staff.currentWorkload < staff.maxCapacity) {
      availableStaff++
    }

    const assignments = allAssignments.get(staff.id) || []
    const active = assignments.filter(a => a.status !== 'completed' && a.status !== 'closed')
    totalActiveAssignments += active.length
  })

  return {
    totalStaff: staffList.length,
    availableStaff,
    averageWorkload: staffList.length > 0 ? totalWorkload / staffList.length : 0,
    totalActiveAssignments,
    workloadDistribution
  }
}

/**
 * Find staff members with lightest workload in a department
 */
export function findLeastBusyStaff(
  staffList: StaffMember[],
  department?: string,
  limit: number = 5
): StaffMember[] {
  let filtered = staffList.filter(staff => 
    staff.isAvailable && staff.currentWorkload < staff.maxCapacity
  )

  if (department) {
    filtered = filtered.filter(staff => staff.department === department)
  }

  return filtered
    .sort((a, b) => {
      // Sort by workload percentage
      const percentA = (a.currentWorkload / a.maxCapacity) * 100
      const percentB = (b.currentWorkload / b.maxCapacity) * 100
      return percentA - percentB
    })
    .slice(0, limit)
}

/**
 * Check if team has capacity for new assignments
 */
export function hasTeamCapacity(
  staffList: StaffMember[],
  department?: string
): {
  hasCapacity: boolean
  availableCount: number
  totalCount: number
  capacityPercentage: number
} {
  let filtered = staffList

  if (department) {
    filtered = staffList.filter(staff => staff.department === department)
  }

  const availableStaff = filtered.filter(staff => 
    staff.isAvailable && staff.currentWorkload < staff.maxCapacity
  )

  const totalCapacity = filtered.reduce((sum, staff) => sum + staff.maxCapacity, 0)
  const usedCapacity = filtered.reduce((sum, staff) => sum + staff.currentWorkload, 0)
  const capacityPercentage = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 100

  return {
    hasCapacity: availableStaff.length > 0,
    availableCount: availableStaff.length,
    totalCount: filtered.length,
    capacityPercentage: Math.round(capacityPercentage)
  }
}

/**
 * Get workload forecast for next week
 */
export function forecastWorkload(
  currentWorkload: StaffWorkload,
  averageNewIssuesPerWeek: number
): {
  projectedWorkload: number
  projectedStatus: WorkloadStatus
  recommendation: string
} {
  // Simple forecast: current + average new - (completed this week)
  const projectedNew = averageNewIssuesPerWeek
  const projectedCompleted = currentWorkload.metrics.completedThisWeek
  const projectedWorkload = Math.max(
    0,
    currentWorkload.currentWorkload + projectedNew - projectedCompleted
  )

  const projectedStatus = getWorkloadStatus(projectedWorkload, currentWorkload.maxCapacity)

  let recommendation = ''
  if (projectedStatus === 'full' || projectedStatus === 'heavy') {
    recommendation = 'Consider redistributing assignments or adjusting capacity'
  } else if (projectedStatus === 'available' || projectedStatus === 'light') {
    recommendation = 'Good capacity for new assignments'
  } else {
    recommendation = 'Monitor workload closely'
  }

  return {
    projectedWorkload,
    projectedStatus,
    recommendation
  }
}
