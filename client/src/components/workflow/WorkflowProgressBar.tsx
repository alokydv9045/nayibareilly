'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock } from 'lucide-react'
import { useWorkflowProgress } from '@/lib/workflow/hooks'
import { WorkflowState } from '@/types/workflow'

interface WorkflowProgressBarProps {
  currentState: WorkflowState
  showPercentage?: boolean
  showSteps?: boolean
  className?: string
}

export function WorkflowProgressBar({ 
  currentState, 
  showPercentage = true, 
  showSteps = false,
  className = '' 
}: WorkflowProgressBarProps) {
  const workflowProgress = useWorkflowProgress(currentState)
  const { progress: progressData, isFinal } = workflowProgress

  const isComplete = progressData.percentage === 100

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          {isComplete && (
            <Badge variant="default" className="flex items-center gap-1 bg-green-500">
              <CheckCircle className="h-3 w-3" />
              Complete
            </Badge>
          )}
          {!isComplete && !isFinal && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              In Progress
            </Badge>
          )}
        </div>
        {showPercentage && (
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {progressData.percentage}%
          </span>
        )}
      </div>

      <Progress value={progressData.percentage} className="h-2" />

      {showSteps && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Step {progressData.currentStep} of {progressData.totalSteps}</span>
          <span className="font-medium" style={{ color: workflowProgress.color }}>
            {workflowProgress.label}
          </span>
        </div>
      )}
    </div>
  )
}
