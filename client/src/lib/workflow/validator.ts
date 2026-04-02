/**
 * Workflow Validator - Validate workflow transitions and requirements
 */

import { UserRole } from '@/lib/rbac/roles'
import {
  WorkflowState,
  WORKFLOW_TRANSITIONS,
  isValidTransition,
  getTransition,
  ValidationRule
} from './workflow.config'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
}

export interface TransitionContext {
  from: WorkflowState
  to: WorkflowState
  userRole: UserRole
  userId: string
  issueData: Record<string, unknown>
  comment?: string
  assignedTo?: string
}

/**
 * Validate if a transition is allowed
 */
export function validateTransition(context: TransitionContext): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if transition exists
  const transition = Object.values(WORKFLOW_TRANSITIONS).find(
    t => t.from.includes(context.from) && t.to === context.to
  )

  if (!transition) {
    return {
      valid: false,
      errors: [`Invalid transition from ${context.from} to ${context.to}`]
    }
  }

  // Check role permission
  if (!transition.allowedRoles.includes(context.userRole)) {
    errors.push(`Role ${context.userRole} is not allowed to perform this transition`)
  }

  // Check if comment is required
  if (transition.requiresComment && !context.comment) {
    errors.push('A comment is required for this transition')
  }

  // Check if assignment is required
  if (transition.requiresAssignment && !context.assignedTo) {
    errors.push('Issue must be assigned before this transition')
  }

  // Validate fields
  if (transition.validations) {
    const fieldErrors = validateFields(transition.validations, context.issueData)
    errors.push(...fieldErrors)
  }

  // Additional business logic validations
  const businessErrors = validateBusinessRules(context)
  errors.push(...businessErrors)

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Validate fields against rules
 */
function validateFields(
  rules: ValidationRule[],
  data: Record<string, unknown>
): string[] {
  const errors: string[] = []

  for (const rule of rules) {
    const value = data[rule.field]

    switch (rule.condition) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push(rule.message)
        }
        break

      case 'min_length':
        if (typeof value === 'string' && typeof rule.value === 'number') {
          if (value.length < rule.value) {
            errors.push(rule.message)
          }
        }
        break

      case 'max_length':
        if (typeof value === 'string' && typeof rule.value === 'number') {
          if (value.length > rule.value) {
            errors.push(rule.message)
          }
        }
        break

      case 'custom':
        // Custom validation logic would go here
        break
    }
  }

  return errors
}

/**
 * Validate business rules specific to civic platform
 */
function validateBusinessRules(context: TransitionContext): string[] {
  const errors: string[] = []

  // Rule: Can't resolve an issue without images or detailed description
  if (context.to === 'resolved') {
    const hasImages = context.issueData.images && 
      Array.isArray(context.issueData.images) && 
      context.issueData.images.length > 0
    
    const description = context.issueData.resolutionDetails as string | undefined
    const hasDetailedDescription = description && description.length >= 50

    if (!hasImages && !hasDetailedDescription) {
      errors.push('Resolution must include either images or detailed description (min 50 characters)')
    }
  }

  // Rule: Citizens can only verify their own issues
  if (context.to === 'verified' && context.userRole === UserRole.CITIZEN) {
    const reporterId = context.issueData.reporterId as string | undefined
    if (reporterId && reporterId !== context.userId) {
      errors.push('You can only verify your own issues')
    }
  }

  // Rule: Can't reopen an issue more than 3 times
  if (context.to === 'in_progress' && context.from === 'resolved') {
    const reopenCount = (context.issueData.reopenCount as number | undefined) || 0
    if (reopenCount >= 3) {
      errors.push('This issue has been reopened too many times. Please create a new issue.')
    }
  }

  return errors
}

/**
 * Get required fields for a transition
 */
export function getRequiredFields(transitionKey: string): string[] {
  const transition = getTransition(transitionKey)
  if (!transition) return []

  const required: string[] = []

  if (transition.requiresComment) {
    required.push('comment')
  }

  if (transition.requiresAssignment) {
    required.push('assignedTo')
  }

  if (transition.validations) {
    const validationFields = transition.validations
      .filter(v => v.condition === 'required')
      .map(v => v.field)
    required.push(...validationFields)
  }

  return required
}

/**
 * Check if user can perform a transition
 */
export function canPerformTransition(
  from: WorkflowState,
  to: WorkflowState,
  userRole: UserRole
): boolean {
  return isValidTransition(from, to, userRole)
}

/**
 * Get validation errors for preview (before submission)
 */
export function previewValidation(
  transitionKey: string,
  data: Record<string, unknown>
): ValidationResult {
  const transition = getTransition(transitionKey)
  if (!transition) {
    return {
      valid: false,
      errors: ['Invalid transition']
    }
  }

  const errors: string[] = []

  // Check validations
  if (transition.validations) {
    errors.push(...validateFields(transition.validations, data))
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
