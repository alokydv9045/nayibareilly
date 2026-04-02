/**
 * IssueCardAdmin - Admin-specific issue card variant
 * Shows full management controls, analytics, and advanced actions
 */

'use client'

import IssueCard, { IssueCardProps } from './IssueCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  Trash2,
  Archive,
  Edit3,
  TrendingUp,
  FileText,
  Settings,
  Eye,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface IssueCardAdminProps extends Omit<IssueCardProps, 'actions'> {
  onAssign?: (issueId: string) => void | Promise<void>
  onEdit?: (issueId: string) => void | Promise<void>
  onArchive?: (issueId: string) => void | Promise<void>
  onDelete?: (issueId: string) => void | Promise<void>
  onViewAnalytics?: (issueId: string) => void | Promise<void>
  loading?: boolean
  showAnalytics?: boolean
  analytics?: {
    responseTime?: string
    resolutionTime?: string
    citizenSatisfaction?: number
  }
}

export default function IssueCardAdmin({
  issue,
  onAssign,
  onEdit,
  onArchive,
  onDelete,
  onViewAnalytics,
  loading = false,
  showAnalytics = true,
  analytics,
  ...props
}: IssueCardAdminProps) {
  const handleAssign = async () => {
    if (onAssign) {
      await onAssign(issue.id)
    }
  }

  const handleEdit = async () => {
    if (onEdit) {
      await onEdit(issue.id)
    }
  }

  const handleArchive = async () => {
    if (onArchive) {
      await onArchive(issue.id)
    }
  }

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(issue.id)
    }
  }

  const handleViewAnalytics = async () => {
    if (onViewAnalytics) {
      await onViewAnalytics(issue.id)
    }
  }

  const actions = (
    <div className="space-y-3">
      {/* Analytics Summary */}
      {showAnalytics && analytics && (
        <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg">
          {analytics.responseTime && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Response</div>
              <div className="text-sm font-semibold">{analytics.responseTime}</div>
            </div>
          )}
          {analytics.resolutionTime && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Resolution</div>
              <div className="text-sm font-semibold">{analytics.resolutionTime}</div>
            </div>
          )}
          {typeof analytics.citizenSatisfaction === 'number' && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Satisfaction</div>
              <div className="text-sm font-semibold">{analytics.citizenSatisfaction}%</div>
            </div>
          )}
        </div>
      )}

      {/* Primary Actions */}
      <div className="flex items-center gap-2">
        <Link href={`/admin/issues/${issue.id}`} className="flex-1">
          <Button size="sm" variant="default" className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            View Full Details
          </Button>
        </Link>

        {onAssign && (
          <Button
            onClick={handleAssign}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <Users className="w-4 h-4 mr-2" />
            Assign
          </Button>
        )}

        {/* More Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Issue Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {onEdit && (
              <DropdownMenuItem onClick={handleEdit}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Issue
              </DropdownMenuItem>
            )}

            {onViewAnalytics && (
              <DropdownMenuItem onClick={handleViewAnalytics}>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </DropdownMenuItem>
            )}

            <Link href={`/admin/reports/${issue.id}`}>
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator />

            {onArchive && (
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="w-4 h-4 mr-2" />
                Archive Issue
              </DropdownMenuItem>
            )}

            {onDelete && (
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Issue
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Department & Assignment Info */}
      <div className="flex items-center gap-2 text-sm">
        {issue.departmentName && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {issue.departmentName}
          </Badge>
        )}
        {issue.assignedToName && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {issue.assignedToName}
          </Badge>
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
      defaultExpanded
      variant="detailed"
      className="border-l-4 border-l-purple-500"
      {...props}
    />
  )
}
