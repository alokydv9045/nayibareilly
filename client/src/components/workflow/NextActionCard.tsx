'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Lightbulb } from 'lucide-react'
import { useNextAction } from '@/lib/workflow/hooks'
import { WorkflowState, WorkflowTransitionKey } from '@/types/workflow'

interface NextActionCardProps {
  currentState: WorkflowState
  onActionClick?: (transitionKey: WorkflowTransitionKey) => void
  className?: string
}

export function NextActionCard({ 
  currentState, 
  onActionClick,
  className = '' 
}: NextActionCardProps) {
  const nextActionData = useNextAction(currentState)

  if (!nextActionData) {
    return null
  }

  const { action, reason } = nextActionData

  return (
    <Card className={`border-l-4 border-l-emerald-500 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-emerald-500" />
          <CardTitle className="text-lg">Recommended Next Action</CardTitle>
        </div>
        <CardDescription>
          Based on the current status and your role
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-medium">
                {action}
              </Badge>
            </div>
            {reason && (
              <p className="text-sm text-muted-foreground">
                {reason}
              </p>
            )}
          </div>
          {onActionClick && (
            <Button 
              onClick={() => onActionClick(action as WorkflowTransitionKey)}
              size="sm"
              className="flex items-center gap-2"
            >
              Take Action
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
