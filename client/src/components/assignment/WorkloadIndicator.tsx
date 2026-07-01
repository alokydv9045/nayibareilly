'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Clock
} from 'lucide-react'
import { WorkloadStatus, getWorkloadColor, getWorkloadStatus } from '@/lib/assignment'

interface WorkloadIndicatorProps {
  currentWorkload: number
  maxCapacity: number
  showProgress?: boolean
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const STATUS_ICONS: Record<WorkloadStatus, React.ReactNode> = {
  available: <CheckCircle className="h-3 w-3" />,
  light: <Clock className="h-3 w-3" />,
  moderate: <Clock className="h-3 w-3" />,
  heavy: <AlertTriangle className="h-3 w-3" />,
  full: <AlertCircle className="h-3 w-3" />
}

const STATUS_LABELS: Record<WorkloadStatus, string> = {
  available: 'Available',
  light: 'Light Load',
  moderate: 'Moderate Load',
  heavy: 'Heavy Load',
  full: 'At Capacity'
}

export function WorkloadIndicator({
  currentWorkload,
  maxCapacity,
  showProgress = true,
  showLabel = true,
  size = 'md',
  className = ''
}: WorkloadIndicatorProps) {
  const status = getWorkloadStatus(currentWorkload, maxCapacity)
  const color = getWorkloadColor(status)
  const percentage = (currentWorkload / maxCapacity) * 100

  const badgeVariant = 
    color === 'green' ? 'default' :
    color === 'red' ? 'destructive' :
    'secondary'

  const badgeStyle = {
    backgroundColor:
      color === 'blue' ? '#3b82f6' :
      color === 'yellow' ? '#f59e0b' :
      color === 'orange' ? '#f97316' :
      undefined,
    color: ['blue', 'yellow', 'orange'].includes(color) ? 'white' : undefined
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        {showLabel && (
          <Badge 
            variant={badgeVariant}
            className={`flex items-center gap-1 ${sizeClasses[size]}`}
            style={badgeStyle}
          >
            {STATUS_ICONS[status]}
            <span>{STATUS_LABELS[status]}</span>
          </Badge>
        )}
        <span className={`font-medium text-slate-700 dark:text-slate-300 ${sizeClasses[size]}`}>
          {currentWorkload}/{maxCapacity}
        </span>
      </div>
      
      {showProgress && (
        <div className="space-y-1">
          <Progress 
            value={Math.min(percentage, 100)} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(percentage)}% capacity
          </p>
        </div>
      )}
    </div>
  )
}
