/**
 * StatusBadge - Unified status display component
 * Supports all issue/report statuses with consistent styling
 */

import { cn } from '@/lib/utils/helpers'
import { CheckCircle2, Clock, AlertCircle, XCircle, FileCheck, Archive } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type IssueStatus = 
  | 'open' 
  | 'in_progress' 
  | 'resolved' 
  | 'closed'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'verified'
  | 'archived'

interface StatusBadgeProps {
  status: IssueStatus
  showIcon?: boolean
  showTooltip?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const STATUS_CONFIG: Record<IssueStatus, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  className: string
  tooltip: string
}> = {
  open: {
    label: 'Open',
    icon: AlertCircle,
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    tooltip: 'Issue is open and awaiting review'
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    tooltip: 'Issue is pending approval'
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    className: 'bg-sky-100 text-sky-800 border-sky-200',
    tooltip: 'Issue is currently being worked on'
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 border-green-200',
    tooltip: 'Issue has been approved'
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle2,
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    tooltip: 'Issue has been resolved'
  },
  verified: {
    label: 'Verified',
    icon: FileCheck,
    className: 'bg-teal-100 text-teal-800 border-teal-200',
    tooltip: 'Issue resolution has been verified'
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-200',
    tooltip: 'Issue has been rejected'
  },
  closed: {
    label: 'Closed',
    icon: Archive,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    tooltip: 'Issue has been closed'
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    className: 'bg-slate-100 text-slate-800 border-slate-200',
    tooltip: 'Issue has been archived'
  }
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2'
}

const ICON_SIZES = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4'
}

export default function StatusBadge({
  status,
  showIcon = true,
  showTooltip = true,
  className,
  size = 'md'
}: StatusBadgeProps) {
  if (!status) return null

  const config = STATUS_CONFIG[status]
  if (!config) return null

  const Icon = config.icon
  
  const badgeContent = (
    <span 
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors',
        SIZE_CLASSES[size],
        config.className,
        className
      )}
    >
      {showIcon && <Icon className={ICON_SIZES[size]} />}
      <span className="capitalize">{config.label}</span>
    </span>
  )

  if (!showTooltip) {
    return badgeContent
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Export status config for use in other components
export { STATUS_CONFIG }
