'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ThumbsUp, 
  PlayCircle,
  PauseCircle,
  CheckCheck,
  Archive,
  RotateCcw,
  Send
} from 'lucide-react'
import { useWorkflowActions } from '@/lib/workflow/hooks'
import { WorkflowState, WorkflowTransitionKey } from '@/types/workflow'

interface WorkflowActionsProps {
  currentState: WorkflowState
  onTransition: (transitionKey: WorkflowTransitionKey, data?: Record<string, unknown>) => Promise<void>
  disabled?: boolean
  className?: string
}

const TRANSITION_ICONS: Record<WorkflowTransitionKey, React.ReactNode> = {
  submit: <Send className="h-4 w-4" />,
  approve: <ThumbsUp className="h-4 w-4" />,
  reject: <XCircle className="h-4 w-4" />,
  assign: <PlayCircle className="h-4 w-4" />,
  start_work: <PlayCircle className="h-4 w-4" />,
  hold: <PauseCircle className="h-4 w-4" />,
  resume: <PlayCircle className="h-4 w-4" />,
  resolve: <CheckCircle className="h-4 w-4" />,
  verify: <CheckCheck className="h-4 w-4" />,
  close: <CheckCircle className="h-4 w-4" />,
  reopen: <RotateCcw className="h-4 w-4" />,
  archive: <Archive className="h-4 w-4" />,
}

const TRANSITION_VARIANTS: Record<WorkflowTransitionKey, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  submit: 'default',
  approve: 'default',
  reject: 'destructive',
  assign: 'secondary',
  start_work: 'default',
  hold: 'secondary',
  resume: 'default',
  resolve: 'default',
  verify: 'default',
  close: 'default',
  reopen: 'secondary',
  archive: 'outline',
}

export function WorkflowActions({ 
  currentState, 
  onTransition, 
  disabled = false,
  className = '' 
}: WorkflowActionsProps) {
  const { availableActions } = useWorkflowActions(currentState)

  if (availableActions.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          No actions available
        </Badge>
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {availableActions.map((action) => (
        <Button
          key={action.key}
          variant={TRANSITION_VARIANTS[action.key]}
          size="sm"
          disabled={disabled || !action.enabled}
          onClick={() => onTransition(action.key)}
          className="flex items-center gap-2"
        >
          {TRANSITION_ICONS[action.key]}
          {action.label}
        </Button>
      ))}
    </div>
  )
}
