/**
 * Workflow System - Exports
 */

// Configuration
export {
  WORKFLOW_STATES,
  WORKFLOW_TRANSITIONS,
  WORKFLOW_STATE_METADATA,
  getNextStates,
  getAvailableTransitions,
  isValidTransition,
  getTransition,
  getStateMetadata
} from './workflow.config'

export type {
  WorkflowState,
  WorkflowTransition,
  AutoAction,
  ValidationRule,
  WorkflowStateMetadata
} from './workflow.config'

// Validation
export {
  validateTransition,
  canPerformTransition,
  getRequiredFields,
  previewValidation
} from './validator'

export type {
  ValidationResult,
  TransitionContext
} from './validator'

// Hooks
export {
  useWorkflowActions,
  useWorkflowTransition,
  useWorkflowProgress,
  useNextAction,
  useTransitionValidation
} from './hooks'
