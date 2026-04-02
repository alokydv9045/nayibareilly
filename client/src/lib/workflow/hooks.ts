/**
 * Workflow Hooks - React hooks for workflow management
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import useSessionManager from '@/hooks/auth/useSession'
import { useUserRoles } from '@/lib/rbac/hooks/usePermissions'
import {
  WorkflowState,
  WORKFLOW_TRANSITIONS,
  getNextStates,
  getAvailableTransitions,
  getStateMetadata
} from './workflow.config'
import {
  validateTransition,
  getRequiredFields,
  type TransitionContext
} from './validator'

/**
 * Hook to get available workflow actions for current user and issue state
 */
export function useWorkflowActions(currentState: WorkflowState) {
  const { primaryRole } = useUserRoles()

  const availableActions = useMemo(() => {
    if (!primaryRole) return []

    const transitions = getAvailableTransitions(currentState)
    return transitions
      .filter(key => {
        const transition = WORKFLOW_TRANSITIONS[key]
        return transition.allowedRoles.includes(primaryRole)
      })
      .map(key => {
        const labels: Record<string, string> = {
          submit: 'Submit Issue',
          approve: 'Approve',
          reject: 'Reject',
          assign: 'Assign',
          start_work: 'Start Work',
          hold: 'Put On Hold',
          resume: 'Resume Work',
          resolve: 'Mark Resolved',
          verify: 'Verify Resolution',
          reopen: 'Reopen',
          close: 'Close Issue',
          archive: 'Archive'
        }
        
        return {
          key,
          label: labels[key] || key,
          enabled: true,
          requiresConfirmation: ['reject', 'hold', 'reopen', 'archive'].includes(key)
        }
      })
  }, [currentState, primaryRole])

  const canPerform = useCallback((transitionKey: string): boolean => {
    if (!primaryRole) return false
    const transition = WORKFLOW_TRANSITIONS[transitionKey]
    if (!transition) return false

    return transition.allowedRoles.includes(primaryRole)
  }, [primaryRole])

  const getActionLabel = useCallback((transitionKey: string): string => {
    const labels: Record<string, string> = {
      submit: 'Submit Issue',
      approve: 'Approve',
      reject: 'Reject',
      assign: 'Assign',
      start_work: 'Start Work',
      hold: 'Put On Hold',
      resume: 'Resume Work',
      resolve: 'Mark Resolved',
      verify: 'Verify Resolution',
      reopen: 'Reopen',
      close: 'Close Issue',
      archive: 'Archive'
    }
    return labels[transitionKey] || transitionKey
  }, [])

  return {
    availableActions,
    canPerform,
    getActionLabel
  }
}

/**
 * Hook for workflow transition with validation
 */
export function useWorkflowTransition(
  currentState: WorkflowState,
  onTransition: (context: TransitionContext) => Promise<void>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const { primaryRole } = useUserRoles()
  const session = useSessionManager()
  const user = session.user

  const performTransition = useCallback(async (
    to: WorkflowState,
    data: {
      comment?: string
      assignedTo?: string
      issueData: Record<string, unknown>
    }
  ): Promise<boolean> => {
    if (!primaryRole || !user) {
      setError('User not authenticated')
      return false
    }

    setLoading(true)
    setError(null)
    setValidationErrors([])

    try {
      // Create transition context
      const context: TransitionContext = {
        from: currentState,
        to,
        userRole: primaryRole,
        userId: user.id,
        comment: data.comment,
        assignedTo: data.assignedTo,
        issueData: data.issueData
      }

      // Validate transition
      const validation = validateTransition(context)
      if (!validation.valid) {
        setValidationErrors(validation.errors)
        setError('Validation failed')
        setLoading(false)
        return false
      }

      // Perform transition
      await onTransition(context)

      setLoading(false)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transition failed'
      setError(message)
      setLoading(false)
      return false
    }
  }, [currentState, primaryRole, user, onTransition])

  const clearErrors = useCallback(() => {
    setError(null)
    setValidationErrors([])
  }, [])

  return {
    performTransition,
    loading,
    error,
    validationErrors,
    clearErrors
  }
}

/**
 * Hook to get workflow progress information
 */
export function useWorkflowProgress(currentState: WorkflowState) {
  const stateMetadata = getStateMetadata(currentState)
  const nextStates = getNextStates(currentState)

  const progress = useMemo(() => {
    const stateOrder: WorkflowState[] = [
      'draft',
      'open',
      'pending',
      'approved',
      'in_progress',
      'resolved',
      'verified',
      'closed'
    ]

    const currentIndex = stateOrder.indexOf(currentState)
    const totalSteps = stateOrder.length

    return {
      percentage: currentIndex >= 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0,
      currentStep: currentIndex + 1,
      totalSteps,
      isComplete: stateMetadata.isFinal
    }
  }, [currentState, stateMetadata])

  return {
    ...stateMetadata,
    nextStates,
    progress
  }
}

/**
 * Hook to get recommended next action
 */
export function useNextAction(
  currentState: WorkflowState
) {
  const { primaryRole } = useUserRoles()

  const recommendation = useMemo(() => {
    if (!primaryRole) return null

    // Get available transitions for current role
    const availableTransitions = getAvailableTransitions(currentState)
      .filter(key => {
        const transition = WORKFLOW_TRANSITIONS[key]
        return transition.allowedRoles.includes(primaryRole)
      })

    if (availableTransitions.length === 0) {
      return null
    }

    // Priority logic for recommendations
    const priority = {
      // Moderator priorities
      approve: 10,
      reject: 9,
      
      // Staff priorities
      start_work: 8,
      resolve: 7,
      hold: 6,
      
      // Citizen priorities
      verify: 5,
      submit: 4,
      
      // Admin priorities
      assign: 3,
      close: 2,
      archive: 1
    } as Record<string, number>

    // Sort by priority
    const sortedActions = availableTransitions.sort((a, b) => {
      return (priority[b] || 0) - (priority[a] || 0)
    })

    const recommendedAction = sortedActions[0]
    const transition = WORKFLOW_TRANSITIONS[recommendedAction]

    return {
      action: recommendedAction,
      transition,
      requiredFields: getRequiredFields(recommendedAction),
      reason: getRecommendationReason(recommendedAction, currentState)
    }
  }, [currentState, primaryRole])

  return recommendation
}

/**
 * Get human-readable reason for recommendation
 */
function getRecommendationReason(
  action: string,
  _state: WorkflowState
): string {
  const reasons: Record<string, string> = {
    submit: 'Complete your issue report and submit for review',
    approve: 'Review and approve this issue to move it forward',
    reject: 'Review this issue and provide rejection feedback if needed',
    assign: 'Assign this approved issue to a staff member',
    start_work: 'Begin working on this assigned issue',
    hold: 'Pause work if you need additional resources or information',
    resolve: 'Mark this issue as resolved with detailed notes',
    verify: 'Verify that the issue has been properly resolved',
    reopen: 'Reopen if the resolution was not satisfactory',
    close: 'Close this verified issue to complete the workflow',
    archive: 'Archive this closed issue for record keeping'
  }

  return reasons[action] || `Perform ${action} action`
}

/**
 * Hook for validating transition data before submission
 */
export function useTransitionValidation(transitionKey: string) {
  const [errors, setErrors] = useState<string[]>([])

  const validate = useCallback((data: Record<string, unknown>): boolean => {
    const transition = WORKFLOW_TRANSITIONS[transitionKey]
    if (!transition) {
      setErrors(['Invalid transition'])
      return false
    }

    const validationErrors: string[] = []

    // Check required comment
    if (transition.requiresComment && !data.comment) {
      validationErrors.push('Comment is required')
    }

    // Check required assignment
    if (transition.requiresAssignment && !data.assignedTo) {
      validationErrors.push('Assignment is required')
    }

    // Check field validations
    if (transition.validations) {
      for (const rule of transition.validations) {
        const value = data[rule.field]

        if (rule.condition === 'required' && !value) {
          validationErrors.push(rule.message)
        }

        if (rule.condition === 'min_length' && 
            typeof value === 'string' && 
            typeof rule.value === 'number' &&
            value.length < rule.value) {
          validationErrors.push(rule.message)
        }
      }
    }

    setErrors(validationErrors)
    return validationErrors.length === 0
  }, [transitionKey])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  return {
    validate,
    errors,
    clearErrors
  }
}
