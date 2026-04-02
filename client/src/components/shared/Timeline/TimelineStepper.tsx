/**
 * TimelineStepper - Visual step-by-step progress for issue workflow
 */

'use client'

import { cn } from '@/lib/utils/helpers'
import { Check, Circle, Clock } from 'lucide-react'
import StatusBadge, { IssueStatus } from '@/components/shared/StatusBadge'

export interface WorkflowStep {
  id: string
  label: string
  description?: string
  status: IssueStatus
  completedAt?: string | Date
  isActive?: boolean
}

interface TimelineStepperProps {
  steps: WorkflowStep[]
  currentStep: number
  className?: string
  orientation?: 'horizontal' | 'vertical'
  showDescription?: boolean
}

export default function TimelineStepper({
  steps,
  currentStep,
  className,
  orientation = 'horizontal',
  showDescription = true
}: TimelineStepperProps) {
  const isHorizontal = orientation === 'horizontal'

  return (
    <div 
      className={cn(
        'flex',
        isHorizontal ? 'flex-row items-center overflow-x-auto' : 'flex-col',
        className
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <div
            key={step.id}
            className={cn(
              'flex',
              isHorizontal ? 'flex-col items-center' : 'flex-row items-start',
              isHorizontal && !isLast && 'flex-1'
            )}
          >
            {/* Step Container */}
            <div className={cn(
              'flex',
              isHorizontal ? 'flex-col items-center w-full' : 'flex-row items-start gap-4 w-full'
            )}>
              {/* Step Indicator */}
              <div className="flex items-center gap-0">
                {/* Circle/Icon */}
                <div className={cn(
                  'flex items-center justify-center rounded-full border-2 transition-all',
                  isHorizontal ? 'w-10 h-10' : 'w-8 h-8 shrink-0',
                  isCompleted && 'bg-green-600 border-green-600',
                  isCurrent && 'bg-blue-600 border-blue-600',
                  !isCompleted && !isCurrent && 'bg-background border-muted'
                )}>
                  {isCompleted ? (
                    <Check className={cn(
                      'text-white',
                      isHorizontal ? 'w-5 h-5' : 'w-4 h-4'
                    )} />
                  ) : isCurrent ? (
                    <Clock className={cn(
                      'text-white',
                      isHorizontal ? 'w-5 h-5' : 'w-4 h-4'
                    )} />
                  ) : (
                    <Circle className={cn(
                      'text-muted-foreground',
                      isHorizontal ? 'w-4 h-4' : 'w-3 h-3'
                    )} />
                  )}
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className={cn(
                    'transition-all',
                    isHorizontal 
                      ? 'h-0.5 flex-1 min-w-[2rem]' 
                      : 'w-0.5 h-12 ml-[15px] -my-2',
                    isCompleted ? 'bg-green-600' : 'bg-muted'
                  )} />
                )}
              </div>

              {/* Step Content */}
              <div className={cn(
                'flex flex-col',
                isHorizontal ? 'items-center text-center mt-2' : 'flex-1 pb-6'
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    'font-semibold',
                    isHorizontal ? 'text-sm' : 'text-base',
                    isCompleted && 'text-green-700',
                    isCurrent && 'text-blue-700',
                    !isCompleted && !isCurrent && 'text-muted-foreground'
                  )}>
                    {step.label}
                  </span>
                  {step.isActive && (
                    <StatusBadge status={step.status} size="sm" showIcon={false} />
                  )}
                </div>

                {showDescription && step.description && (
                  <p className={cn(
                    'text-muted-foreground',
                    isHorizontal ? 'text-xs max-w-[120px]' : 'text-sm'
                  )}>
                    {step.description}
                  </p>
                )}

                {step.completedAt && (
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(step.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
