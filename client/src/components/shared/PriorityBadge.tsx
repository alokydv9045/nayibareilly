/**
 * PriorityBadge - Unified priority display component
 */

import { cn } from '@/lib/utils/helpers'
import { AlertTriangle, AlertCircle, Info, Flame } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical'

interface PriorityBadgeProps {
  priority: IssuePriority
  showIcon?: boolean
  showTooltip?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const PRIORITY_CONFIG: Record<IssuePriority, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  className: string
  tooltip: string
}> = {
  low: {
    label: 'Low',
    icon: Info,
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    tooltip: 'Low priority - can be addressed later'
  },
  medium: {
    label: 'Medium',
    icon: AlertCircle,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    tooltip: 'Medium priority - should be addressed soon'
  },
  high: {
    label: 'High',
    icon: AlertTriangle,
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    tooltip: 'High priority - needs prompt attention'
  },
  critical: {
    label: 'Critical',
    icon: Flame,
    className: 'bg-red-100 text-red-800 border-red-200',
    tooltip: 'Critical priority - requires immediate action'
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

export default function PriorityBadge({
  priority,
  showIcon = true,
  showTooltip = true,
  className,
  size = 'md'
}: PriorityBadgeProps) {
  if (!priority) return null

  const normalizedPriority = priority.toLowerCase() as IssuePriority
  const config = PRIORITY_CONFIG[normalizedPriority]
  if (!config) return null

  const Icon = config.icon
  
  const badgeContent = (
    <span 
      className={cn(
        'inline-flex items-center font-semibold rounded-full border transition-colors',
        SIZE_CLASSES[size],
        config.className,
        className
      )}
    >
      {showIcon && <Icon className={ICON_SIZES[size]} />}
      <span className="uppercase tracking-wide">{config.label}</span>
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

export { PRIORITY_CONFIG }
