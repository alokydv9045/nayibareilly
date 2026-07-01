/**
 * Workflow Configuration - Define issue workflow states and transitions
 * 
 * This file defines the complete workflow for civic issues including:
 * - Valid status transitions
 * - Role permissions for each transition
 * - Automatic actions on status changes
 * - Validation rules
 */

import { UserRole } from '@/lib/rbac/roles'

// ===========================
// Workflow States
// ===========================

export const WORKFLOW_STATES = {
  // Initial states
  DRAFT: 'draft' as const,
  OPEN: 'open' as const,
  
  // Review states
  PENDING: 'pending' as const,
  APPROVED: 'approved' as const,
  REJECTED: 'rejected' as const,
  
  // Work states
  IN_PROGRESS: 'in_progress' as const,
  ON_HOLD: 'on_hold' as const,
  
  // Resolution states
  RESOLVED: 'resolved' as const,
  VERIFIED: 'verified' as const,
  
  // Final states
  CLOSED: 'closed' as const,
  ARCHIVED: 'archived' as const,
} as const

export type WorkflowState = typeof WORKFLOW_STATES[keyof typeof WORKFLOW_STATES]

// ===========================
// Transition Definitions
// ===========================

export interface WorkflowTransition {
  from: WorkflowState[]
  to: WorkflowState
  allowedRoles: UserRole[]
  requiresComment?: boolean
  requiresAssignment?: boolean
  requiresVerification?: boolean
  autoActions?: AutoAction[]
  validations?: ValidationRule[]
}

export interface AutoAction {
  type: 'notify' | 'assign' | 'log' | 'update_priority' | 'send_email'
  target?: string
  params?: Record<string, unknown>
}

export interface ValidationRule {
  field: string
  condition: 'required' | 'min_length' | 'max_length' | 'custom'
  value?: string | number | boolean
  message: string
}

// ===========================
// Workflow Transition Rules
// ===========================

export const WORKFLOW_TRANSITIONS: Record<string, WorkflowTransition> = {
  // Submit issue (Citizen)
  submit: {
    from: [WORKFLOW_STATES.DRAFT],
    to: WORKFLOW_STATES.OPEN,
    allowedRoles: [UserRole.CITIZEN],
    validations: [
      { field: 'title', condition: 'required', message: 'Title is required' },
      { field: 'description', condition: 'min_length', value: 20, message: 'Description must be at least 20 characters' },
      { field: 'category', condition: 'required', message: 'Category is required' },
      { field: 'location', condition: 'required', message: 'Location is required' }
    ],
    autoActions: [
      { type: 'notify', target: 'moderators', params: { message: 'New issue submitted' } },
      { type: 'log', params: { event: 'issue_created' } }
    ]
  },

  // Approve issue (Moderator)
  approve: {
    from: [WORKFLOW_STATES.OPEN, WORKFLOW_STATES.PENDING],
    to: WORKFLOW_STATES.APPROVED,
    allowedRoles: [UserRole.MODERATOR, UserRole.DEPT_ADMIN, UserRole.MAYOR, UserRole.TECH_ADMIN],
    autoActions: [
      { type: 'notify', target: 'department', params: { message: 'Issue approved and ready for assignment' } },
      { type: 'notify', target: 'reporter', params: { message: 'Your issue has been approved' } },
      { type: 'log', params: { event: 'issue_approved' } }
    ]
  },

  // Reject issue (Moderator)
  reject: {
    from: [WORKFLOW_STATES.OPEN, WORKFLOW_STATES.PENDING],
    to: WORKFLOW_STATES.REJECTED,
    allowedRoles: [UserRole.MODERATOR, UserRole.DEPT_ADMIN, UserRole.MAYOR, UserRole.TECH_ADMIN],
    requiresComment: true,
    validations: [
      { field: 'rejectionReason', condition: 'required', message: 'Rejection reason is required' },
      { field: 'rejectionReason', condition: 'min_length', value: 10, message: 'Please provide a detailed reason' }
    ],
    autoActions: [
      { type: 'notify', target: 'reporter', params: { message: 'Your issue has been rejected' } },
      { type: 'log', params: { event: 'issue_rejected' } }
    ]
  },

  // Assign to staff (Department Admin)
  assign: {
    from: [WORKFLOW_STATES.APPROVED],
    to: WORKFLOW_STATES.APPROVED, // Status stays same, but issue gets assigned
    allowedRoles: [UserRole.DEPT_ADMIN, UserRole.MAYOR, UserRole.TECH_ADMIN],
    requiresAssignment: true,
    autoActions: [
      { type: 'notify', target: 'assigned_staff', params: { message: 'New issue assigned to you' } },
      { type: 'notify', target: 'reporter', params: { message: 'Your issue has been assigned' } },
      { type: 'log', params: { event: 'issue_assigned' } }
    ]
  },

  // Start work (Staff)
  start_work: {
    from: [WORKFLOW_STATES.APPROVED],
    to: WORKFLOW_STATES.IN_PROGRESS,
    allowedRoles: [UserRole.STAFF, UserRole.DEPT_ADMIN, UserRole.TECH_ADMIN],
    requiresAssignment: true,
    autoActions: [
      { type: 'notify', target: 'reporter', params: { message: 'Work has started on your issue' } },
      { type: 'notify', target: 'department', params: { message: 'Staff member started working on issue' } },
      { type: 'log', params: { event: 'work_started' } }
    ]
  },

  // Put on hold (Staff)
  hold: {
    from: [WORKFLOW_STATES.IN_PROGRESS],
    to: WORKFLOW_STATES.ON_HOLD,
    allowedRoles: [UserRole.STAFF, UserRole.DEPT_ADMIN, UserRole.TECH_ADMIN],
    requiresComment: true,
    validations: [
      { field: 'holdReason', condition: 'required', message: 'Reason for hold is required' }
    ],
    autoActions: [
      { type: 'notify', target: 'reporter', params: { message: 'Work on your issue has been paused' } },
      { type: 'notify', target: 'department', params: { message: 'Issue put on hold' } },
      { type: 'log', params: { event: 'issue_on_hold' } }
    ]
  },

  // Resume work (Staff)
  resume: {
    from: [WORKFLOW_STATES.ON_HOLD],
    to: WORKFLOW_STATES.IN_PROGRESS,
    allowedRoles: [UserRole.STAFF, UserRole.DEPT_ADMIN, UserRole.TECH_ADMIN],
    autoActions: [
      { type: 'notify', target: 'reporter', params: { message: 'Work has resumed on your issue' } },
      { type: 'log', params: { event: 'work_resumed' } }
    ]
  },

  // Mark resolved (Staff)
  resolve: {
    from: [WORKFLOW_STATES.IN_PROGRESS],
    to: WORKFLOW_STATES.RESOLVED,
    allowedRoles: [UserRole.STAFF, UserRole.DEPT_ADMIN, UserRole.TECH_ADMIN],
    requiresComment: true,
    validations: [
      { field: 'resolutionDetails', condition: 'required', message: 'Resolution details are required' },
      { field: 'resolutionDetails', condition: 'min_length', value: 20, message: 'Please provide detailed resolution information' }
    ],
    autoActions: [
      { type: 'notify', target: 'reporter', params: { message: 'Your issue has been resolved. Please verify.' } },
      { type: 'notify', target: 'department', params: { message: 'Issue marked as resolved' } },
      { type: 'log', params: { event: 'issue_resolved' } }
    ]
  },

  // Verify resolution (Citizen or Department Admin)
  verify: {
    from: [WORKFLOW_STATES.RESOLVED],
    to: WORKFLOW_STATES.VERIFIED,
    allowedRoles: [UserRole.CITIZEN, UserRole.DEPT_ADMIN, UserRole.MAYOR, UserRole.TECH_ADMIN],
    requiresVerification: true,
    autoActions: [
      { type: 'notify', target: 'staff', params: { message: 'Resolution verified by citizen' } },
      { type: 'notify', target: 'department', params: { message: 'Issue verification complete' } },
      { type: 'log', params: { event: 'resolution_verified' } }
    ]
  },

  // Reopen (if verification fails)
  reopen: {
    from: [WORKFLOW_STATES.RESOLVED, WORKFLOW_STATES.VERIFIED, WORKFLOW_STATES.CLOSED],
    to: WORKFLOW_STATES.IN_PROGRESS,
    allowedRoles: [UserRole.CITIZEN, UserRole.STAFF, UserRole.DEPT_ADMIN, UserRole.MAYOR, UserRole.TECH_ADMIN],
    requiresComment: true,
    validations: [
      { field: 'reopenReason', condition: 'required', message: 'Reason for reopening is required' }
    ],
    autoActions: [
      { type: 'notify', target: 'staff', params: { message: 'Issue reopened' } },
      { type: 'notify', target: 'department', params: { message: 'Issue requires additional work' } },
      { type: 'update_priority', params: { increase: true } },
      { type: 'log', params: { event: 'issue_reopened' } }
    ]
  },

  // Close issue (Department Admin or higher)
  close: {
    from: [WORKFLOW_STATES.VERIFIED, WORKFLOW_STATES.RESOLVED],
    to: WORKFLOW_STATES.CLOSED,
    allowedRoles: [UserRole.DEPT_ADMIN, UserRole.MAYOR, UserRole.TECH_ADMIN],
    autoActions: [
      { type: 'notify', target: 'reporter', params: { message: 'Your issue has been closed' } },
      { type: 'log', params: { event: 'issue_closed' } }
    ]
  },

  // Archive issue (Admin only)
  archive: {
    from: [WORKFLOW_STATES.CLOSED, WORKFLOW_STATES.REJECTED],
    to: WORKFLOW_STATES.ARCHIVED,
    allowedRoles: [UserRole.MAYOR, UserRole.TECH_ADMIN],
    autoActions: [
      { type: 'log', params: { event: 'issue_archived' } }
    ]
  }
}

// ===========================
// Workflow State Metadata
// ===========================

export interface WorkflowStateMetadata {
  label: string
  description: string
  color: string
  icon: string
  isFinal: boolean
  requiresAction: boolean
  nextStates: WorkflowState[]
}

export const WORKFLOW_STATE_METADATA: Record<WorkflowState, WorkflowStateMetadata> = {
  [WORKFLOW_STATES.DRAFT]: {
    label: 'Draft',
    description: 'Issue is being prepared',
    color: 'gray',
    icon: 'FileEdit',
    isFinal: false,
    requiresAction: true,
    nextStates: [WORKFLOW_STATES.OPEN]
  },
  [WORKFLOW_STATES.OPEN]: {
    label: 'Open',
    description: 'Issue submitted and awaiting review',
    color: 'amber',
    icon: 'AlertCircle',
    isFinal: false,
    requiresAction: true,
    nextStates: [WORKFLOW_STATES.APPROVED, WORKFLOW_STATES.REJECTED, WORKFLOW_STATES.PENDING]
  },
  [WORKFLOW_STATES.PENDING]: {
    label: 'Pending',
    description: 'Additional information requested',
    color: 'yellow',
    icon: 'Clock',
    isFinal: false,
    requiresAction: true,
    nextStates: [WORKFLOW_STATES.OPEN, WORKFLOW_STATES.APPROVED, WORKFLOW_STATES.REJECTED]
  },
  [WORKFLOW_STATES.APPROVED]: {
    label: 'Approved',
    description: 'Issue approved and ready for assignment',
    color: 'green',
    icon: 'CheckCircle',
    isFinal: false,
    requiresAction: true,
    nextStates: [WORKFLOW_STATES.IN_PROGRESS]
  },
  [WORKFLOW_STATES.REJECTED]: {
    label: 'Rejected',
    description: 'Issue did not meet criteria',
    color: 'red',
    icon: 'XCircle',
    isFinal: true,
    requiresAction: false,
    nextStates: [WORKFLOW_STATES.ARCHIVED]
  },
  [WORKFLOW_STATES.IN_PROGRESS]: {
    label: 'In Progress',
    description: 'Work is being performed',
    color: 'blue',
    icon: 'Play',
    isFinal: false,
    requiresAction: false,
    nextStates: [WORKFLOW_STATES.ON_HOLD, WORKFLOW_STATES.RESOLVED]
  },
  [WORKFLOW_STATES.ON_HOLD]: {
    label: 'On Hold',
    description: 'Work temporarily paused',
    color: 'orange',
    icon: 'Pause',
    isFinal: false,
    requiresAction: true,
    nextStates: [WORKFLOW_STATES.IN_PROGRESS]
  },
  [WORKFLOW_STATES.RESOLVED]: {
    label: 'Resolved',
    description: 'Issue fixed, awaiting verification',
    color: 'emerald',
    icon: 'CheckCircle2',
    isFinal: false,
    requiresAction: true,
    nextStates: [WORKFLOW_STATES.VERIFIED, WORKFLOW_STATES.IN_PROGRESS, WORKFLOW_STATES.CLOSED]
  },
  [WORKFLOW_STATES.VERIFIED]: {
    label: 'Verified',
    description: 'Resolution confirmed by citizen',
    color: 'teal',
    icon: 'ShieldCheck',
    isFinal: false,
    requiresAction: false,
    nextStates: [WORKFLOW_STATES.CLOSED, WORKFLOW_STATES.IN_PROGRESS]
  },
  [WORKFLOW_STATES.CLOSED]: {
    label: 'Closed',
    description: 'Issue completed and closed',
    color: 'gray',
    icon: 'Archive',
    isFinal: true,
    requiresAction: false,
    nextStates: [WORKFLOW_STATES.ARCHIVED, WORKFLOW_STATES.IN_PROGRESS]
  },
  [WORKFLOW_STATES.ARCHIVED]: {
    label: 'Archived',
    description: 'Issue archived for records',
    color: 'slate',
    icon: 'Archive',
    isFinal: true,
    requiresAction: false,
    nextStates: []
  }
}

// ===========================
// Helper Functions
// ===========================

/**
 * Get all valid next states from current state
 */
export function getNextStates(currentState: WorkflowState): WorkflowState[] {
  return WORKFLOW_STATE_METADATA[currentState]?.nextStates || []
}

/**
 * Get all valid transitions from current state
 */
export function getAvailableTransitions(currentState: WorkflowState): string[] {
  return Object.entries(WORKFLOW_TRANSITIONS)
    .filter(([_, transition]) => transition.from.includes(currentState))
    .map(([key]) => key)
}

/**
 * Check if a transition is valid
 */
export function isValidTransition(
  from: WorkflowState,
  to: WorkflowState,
  userRole: UserRole
): boolean {
  const transitions = Object.values(WORKFLOW_TRANSITIONS).filter(
    t => t.from.includes(from) && t.to === to
  )

  return transitions.some(t => t.allowedRoles.includes(userRole))
}

/**
 * Get transition by key
 */
export function getTransition(key: string): WorkflowTransition | undefined {
  return WORKFLOW_TRANSITIONS[key]
}

/**
 * Get state metadata
 */
export function getStateMetadata(state: WorkflowState): WorkflowStateMetadata {
  return WORKFLOW_STATE_METADATA[state]
}
