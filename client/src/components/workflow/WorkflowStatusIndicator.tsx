'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  CheckCheck,
  XCircle,
  Archive
} from 'lucide-react'
import { WorkflowState } from '@/types/workflow'
import { WORKFLOW_STATE_METADATA } from '@/lib/workflow'

interface WorkflowStatusIndicatorProps {
  state: WorkflowState
  showIcon?: boolean
  showDescription?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const STATE_ICONS: Record<WorkflowState, React.ReactNode> = {
  draft: <FileText className="h-3 w-3" />,
  open: <AlertCircle className="h-3 w-3" />,
  pending: <Clock className="h-3 w-3" />,
  approved: <CheckCircle className="h-3 w-3" />,
  in_progress: <PlayCircle className="h-3 w-3" />,
  on_hold: <PauseCircle className="h-3 w-3" />,
  resolved: <CheckCircle className="h-3 w-3" />,
  verified: <CheckCheck className="h-3 w-3" />,
  closed: <CheckCircle className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
  archived: <Archive className="h-3 w-3" />,
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
}

export function WorkflowStatusIndicator({ 
  state, 
  showIcon = true, 
  showDescription = false,
  size = 'md',
  className = '' 
}: WorkflowStatusIndicatorProps) {
  const metadata = WORKFLOW_STATE_METADATA[state as keyof typeof WORKFLOW_STATE_METADATA]

  if (!metadata) {
    return null
  }

  const badgeVariant = 
    metadata.color === 'gray' ? 'secondary' :
    metadata.color === 'blue' ? 'default' :
    metadata.color === 'green' ? 'default' :
    metadata.color === 'red' ? 'destructive' :
    metadata.color === 'yellow' ? 'secondary' :
    'outline'

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Badge 
        variant={badgeVariant} 
        className={`flex items-center gap-1 w-fit ${SIZE_CLASSES[size]}`}
        style={{
          backgroundColor: 
            metadata.color === 'blue' ? '#3b82f6' :
            metadata.color === 'green' ? '#10b981' :
            metadata.color === 'yellow' ? '#f59e0b' :
            metadata.color === 'red' ? '#ef4444' :
            metadata.color === 'purple' ? '#8b5cf6' :
            undefined,
          color: ['blue', 'green', 'red', 'purple'].includes(metadata.color) ? 'white' : undefined
        }}
      >
        {showIcon && STATE_ICONS[state]}
        <span>{metadata.label}</span>
      </Badge>
      {showDescription && (
        <p className="text-xs text-muted-foreground max-w-xs">
          {metadata.description}
        </p>
      )}
    </div>
  )
}
