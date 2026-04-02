/**
 * Workflow Type Exports
 * Re-exports workflow types for convenience
 */

export type {
  WorkflowState,
  WorkflowTransition,
  AutoAction,
  ValidationRule,
  WorkflowStateMetadata
} from '@/lib/workflow'

export type { ValidationResult, TransitionContext } from '@/lib/workflow/validator'

// Export WorkflowTransitionKey type
import { WORKFLOW_TRANSITIONS } from '@/lib/workflow'
export type WorkflowTransitionKey = keyof typeof WORKFLOW_TRANSITIONS
