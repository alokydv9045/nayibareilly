/**
 * IssueCardStaff - Staff-specific issue card variant
 * Shows assignment details, workflow actions, and progress updates
 */

'use client'

import IssueCard, { IssueCardProps } from './IssueCard'
import { Button } from '@/components/ui/button'
import { 
  Play,
  CheckCircle,
  Users,
  MessageSquare,
  FileText,
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface IssueCardStaffProps extends Omit<IssueCardProps, 'actions'> {
  onStartWork?: (issueId: string) => void | Promise<void>
  onMarkResolved?: (issueId: string) => void | Promise<void>
  onAddUpdate?: (issueId: string) => void | Promise<void>
  onReassign?: (issueId: string) => void | Promise<void>
  loading?: boolean
  isAssignedToUser?: boolean
  estimatedTime?: string
  completionPercentage?: number
}

export default function IssueCardStaff({
  issue,
  onStartWork,
  onMarkResolved,
  onAddUpdate,
  onReassign,
  loading = false,
  isAssignedToUser = false,
  estimatedTime,
  completionPercentage,
  ...props
}: IssueCardStaffProps) {
  const isInProgress = issue.status === 'in_progress'
  const isResolved = issue.status === 'resolved'

  const handleStartWork = async () => {
    if (onStartWork) {
      await onStartWork(issue.id)
    }
  }

  const handleMarkResolved = async () => {
    if (onMarkResolved) {
      await onMarkResolved(issue.id)
    }
  }

  const handleAddUpdate = async () => {
    if (onAddUpdate) {
      await onAddUpdate(issue.id)
    }
  }

  const handleReassign = async () => {
    if (onReassign) {
      await onReassign(issue.id)
    }
  }

  const actions = (
    <div className="space-y-3">
      {/* Assignment Status */}
      {isAssignedToUser && (
        <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Users className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-blue-800">
            Assigned to you
          </span>
        </div>
      )}

      {/* Progress Bar */}
      {typeof completionPercentage === 'number' && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Estimated Time */}
      {estimatedTime && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Est. time: {estimatedTime}</span>
        </div>
      )}

      {/* Primary Actions */}
      <div className="flex items-center gap-2">
        {!isInProgress && !isResolved && onStartWork && (
          <Button
            onClick={handleStartWork}
            disabled={loading}
            size="sm"
            variant="default"
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Work
          </Button>
        )}

        {isInProgress && onMarkResolved && (
          <Button
            onClick={handleMarkResolved}
            disabled={loading}
            size="sm"
            variant="default"
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Resolved
          </Button>
        )}

        <Link href={`/staff/issues/${issue.id}`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full">
            <FileText className="w-4 h-4 mr-2" />
            Details
          </Button>
        </Link>
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center gap-2">
        {onAddUpdate && (
          <Button
            onClick={handleAddUpdate}
            disabled={loading}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Add Update
          </Button>
        )}

        {onReassign && (
          <Button
            onClick={handleReassign}
            disabled={loading}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <Users className="w-4 h-4 mr-2" />
            Reassign
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <IssueCard
      issue={issue}
      showActions
      actions={actions}
      expandable
      variant="detailed"
      className={
        isAssignedToUser 
          ? 'border-l-4 border-l-emerald-500 bg-emerald-50/50' 
          : ''
      }
      {...props}
    />
  )
}
