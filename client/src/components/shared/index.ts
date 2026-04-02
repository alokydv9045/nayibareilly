/**
 * Shared Components - Standardized component library for the civic engagement platform
 * 
 * This library provides reusable, role-aware components that ensure consistency
 * across the entire application while supporting different user roles.
 * 
 * @module shared
 */

// Badges
export { default as StatusBadge, STATUS_CONFIG } from './StatusBadge'
export { default as PriorityBadge, PRIORITY_CONFIG } from './PriorityBadge'
export type { IssueStatus } from './StatusBadge'
export type { IssuePriority } from './PriorityBadge'

// Issue Cards
export {
  IssueCard,
  IssueCardCitizen,
  IssueCardModerator,
  IssueCardStaff,
  IssueCardAdmin
} from './IssueCard'
export type { BaseIssue, IssueCardProps } from './IssueCard'

// Timeline
export {
  IssueTimeline,
  TimelineStepper,
  StatusTransition
} from './Timeline'
export type { 
  TimelineEvent, 
  TimelineEventType,
  WorkflowStep 
} from './Timeline'

// Data Display
export {
  StatsCard,
  DataTable
} from './DataDisplay'
export type {
  StatsCardProps,
  DataTableColumn,
  DataTableProps
} from './DataDisplay'
