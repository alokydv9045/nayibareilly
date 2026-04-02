/**
 * Assignment React Hooks
 * Custom hooks for manual assignment functionality
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  StaffMember, 
  Assignment, 
  AssignmentHistory,
  AssignmentFilters,
  filterStaff,
  sortStaffByMatch,
  PriorityLevel
} from './assignment.config'
import { findStaffMatches, SkillMatch, MatchCriteria } from './matcher'
import { StaffWorkload } from './workload'

/**
 * Hook to get list of staff members with filtering
 */
export function useStaffList(filters?: AssignmentFilters) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/staff')
        if (!response.ok) throw new Error('Failed to fetch staff')

        const data = await response.json()
        setStaff(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStaff()
  }, [])

  const filteredStaff = useMemo(() => {
    if (!filters) return staff
    return filterStaff(staff, filters)
  }, [staff, filters])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/staff')
      if (!response.ok) throw new Error('Failed to fetch staff')
      const data = await response.json()
      setStaff(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    staff: filteredStaff,
    allStaff: staff,
    isLoading,
    error,
    refresh
  }
}

/**
 * Hook to get staff matches for an issue
 */
export function useStaffMatches(
  issueCategory: string,
  issuePriority?: PriorityLevel,
  enabled: boolean = true
) {
  const [matches, setMatches] = useState<SkillMatch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { staff, isLoading: staffLoading } = useStaffList()

  useEffect(() => {
    if (!enabled || staffLoading || staff.length === 0) return

    setIsLoading(true)
    
    // Calculate matches
    const criteria: MatchCriteria = {
      issueCategory,
      issuePriority
    }

    const staffMatches = findStaffMatches(staff, criteria, 10)
    setMatches(staffMatches)
    setIsLoading(false)
  }, [issueCategory, issuePriority, staff, staffLoading, enabled])

  const topMatch = matches.length > 0 ? matches[0] : null

  return {
    matches,
    topMatch,
    isLoading: isLoading || staffLoading
  }
}

/**
 * Hook to manually assign an issue to staff
 */
export function useAssign() {
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const assignIssue = useCallback(async (
    issueId: string,
    staffId: string,
    priority: PriorityLevel,
    notes?: string
  ): Promise<Assignment | null> => {
    setIsAssigning(true)
    setError(null)

    try {
      const response = await fetch(`/api/issues/${issueId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigneeId: staffId,
          priority,
          notes
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to assign issue')
      }

      const assignment = await response.json()
      return assignment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setIsAssigning(false)
    }
  }, [])

  return {
    assignIssue,
    isAssigning,
    error
  }
}

/**
 * Hook to reassign an issue to different staff
 */
export function useReassign() {
  const [isReassigning, setIsReassigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reassignIssue = useCallback(async (
    issueId: string,
    newStaffId: string,
    reason: string
  ): Promise<Assignment | null> => {
    setIsReassigning(true)
    setError(null)

    try {
      const response = await fetch(`/api/issues/${issueId}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newAssigneeId: newStaffId,
          reason
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to reassign issue')
      }

      const assignment = await response.json()
      return assignment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setIsReassigning(false)
    }
  }, [])

  return {
    reassignIssue,
    isReassigning,
    error
  }
}

/**
 * Hook to unassign an issue
 */
export function useUnassign() {
  const [isUnassigning, setIsUnassigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unassignIssue = useCallback(async (
    issueId: string,
    reason: string
  ): Promise<boolean> => {
    setIsUnassigning(true)
    setError(null)

    try {
      const response = await fetch(`/api/issues/${issueId}/unassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to unassign issue')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return false
    } finally {
      setIsUnassigning(false)
    }
  }, [])

  return {
    unassignIssue,
    isUnassigning,
    error
  }
}

/**
 * Hook to get assignment history for an issue
 */
export function useAssignmentHistory(issueId: string) {
  const [history, setHistory] = useState<AssignmentHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/issues/${issueId}/assignment-history`)
        if (!response.ok) throw new Error('Failed to fetch assignment history')

        const data = await response.json()
        setHistory(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    if (issueId) {
      fetchHistory()
    }
  }, [issueId])

  return {
    history,
    isLoading,
    error
  }
}

/**
 * Hook to get workload for a specific staff member
 */
export function useStaffWorkload(staffId: string) {
  const [workload, setWorkload] = useState<StaffWorkload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkload = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/staff/${staffId}/workload`)
        if (!response.ok) throw new Error('Failed to fetch workload')

        const data = await response.json()
        setWorkload(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    if (staffId) {
      fetchWorkload()
    }
  }, [staffId])

  return {
    workload,
    isLoading,
    error
  }
}

/**
 * Hook to get current assignment for an issue
 */
export function useCurrentAssignment(issueId: string) {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignment = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/issues/${issueId}/assignment`)
        if (!response.ok) {
          if (response.status === 404) {
            setAssignment(null)
            setIsLoading(false)
            return
          }
          throw new Error('Failed to fetch assignment')
        }

        const data = await response.json()
        setAssignment(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    if (issueId) {
      fetchAssignment()
    }
  }, [issueId])

  const refresh = useCallback(async () => {
    if (!issueId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/issues/${issueId}/assignment`)
      if (response.ok) {
        const data = await response.json()
        setAssignment(data)
      } else if (response.status === 404) {
        setAssignment(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [issueId])

  return {
    assignment,
    isLoading,
    error,
    refresh
  }
}

/**
 * Hook for sorting staff by best match
 */
export function useSortedStaff(
  staff: StaffMember[],
  issueCategory: string,
  issuePriority?: PriorityLevel
) {
  return useMemo(() => {
    return sortStaffByMatch(staff, issueCategory, issuePriority)
  }, [staff, issueCategory, issuePriority])
}
