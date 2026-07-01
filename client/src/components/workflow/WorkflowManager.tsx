'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  WorkflowActions,
  WorkflowStatusIndicator,
  TransitionDialog,
  WorkflowProgressBar,
  NextActionCard
} from '@/components/workflow'
import { WorkflowState, WorkflowTransitionKey } from '@/types/workflow'
import { useWorkflowTransition } from '@/lib/workflow/hooks'
import { getTransition } from '@/lib/workflow'
import { toast } from 'sonner'

interface WorkflowManagerProps {
  issueId: string
  currentState: WorkflowState
  issueData: Record<string, unknown>
  onStateChange?: (newState: WorkflowState) => void
}

/**
 * WorkflowManager - Complete workflow management component
 * 
 * This component integrates all workflow features:
 * - Status indicator with color coding
 * - Progress bar showing completion percentage
 * - Available action buttons based on user role
 * - Recommended next action card
 * - Transition dialog for actions requiring input
 * 
 * Usage:
 * ```tsx
 * <WorkflowManager
 *   issueId="issue-123"
 *   currentState="open"
 *   issueData={{ title: "...", description: "..." }}
 *   onStateChange={(newState) => console.log(newState)}
 * />
 * ```
 */
export function WorkflowManager({
  issueId,
  currentState,
  issueData,
  onStateChange
}: WorkflowManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTransition, setSelectedTransition] = useState<WorkflowTransitionKey | null>(null)
  const [selectedLabel, setSelectedLabel] = useState('')

  const { performTransition, loading, error: transitionError } = useWorkflowTransition(
    currentState,
    async (context) => {
      // Call your API to update the issue state
      const response = await fetch(`/api/issues/${issueId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: context.from,
          to: context.to,
          comment: context.comment,
          assignedTo: context.assignedTo,
          issueData: context.issueData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update issue status')
      }

      const result = await response.json()
      
      // Notify parent component
      onStateChange?.(context.to)
      
      // Show success message
      toast.success(`Issue ${selectedLabel.toLowerCase()} successfully`)
      
      return result
    }
  )

  const handleActionClick = async (transitionKey: WorkflowTransitionKey) => {
    const transition = String(transitionKey)

    // Check if this transition requires user input
    const requiresInput = ['reject', 'hold', 'reopen'].includes(transition)

    if (requiresInput) {
      setSelectedTransition(transition)
      setSelectedLabel(getTransitionLabel(transition))
      setDialogOpen(true)
    } else {
      // Perform transition directly - need to find target state
      const workflowTransition = getTransition(transition)
      if (workflowTransition) {
        try {
          await performTransition(workflowTransition.to, { issueData })
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Failed to perform action')
        }
      }
    }
  }

  const handleDialogConfirm = async (data: Record<string, unknown>) => {
    if (!selectedTransition) return

    const workflowTransition = getTransition(String(selectedTransition))
    if (workflowTransition) {
      try {
        await performTransition(workflowTransition.to, { 
          issueData: { ...issueData, ...data },
          comment: data.comment as string | undefined,
          assignedTo: data.assignedTo as string | undefined
        })
        setDialogOpen(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to perform action')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Status</CardTitle>
          <CardDescription>
            Current status and progress of this issue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Current Status:
            </span>
            <WorkflowStatusIndicator state={currentState} showIcon />
          </div>

          <Separator />

          <WorkflowProgressBar 
            currentState={currentState} 
            showPercentage 
            showSteps 
          />
        </CardContent>
      </Card>

      {/* Recommended Action */}
      <NextActionCard
        currentState={currentState}
        onActionClick={handleActionClick}
      />

      {/* Available Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Available Actions</CardTitle>
          <CardDescription>
            Actions you can perform on this issue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkflowActions
            currentState={currentState}
            onTransition={handleActionClick}
            disabled={loading}
          />
          {transitionError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {transitionError}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transition Dialog */}
      {selectedTransition && (
        <TransitionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          transitionKey={selectedTransition}
          transitionLabel={selectedLabel}
          onConfirm={handleDialogConfirm}
          requiresComment={['reject', 'hold', 'reopen'].includes(String(selectedTransition))}
          requiresReason={String(selectedTransition) === 'reject'}
          currentIssueData={issueData}
        />
      )}
    </div>
  )
}

function getTransitionLabel(key: WorkflowTransitionKey): string {
  const labels: Record<WorkflowTransitionKey, string> = {
    submit: 'Submit',
    approve: 'Approve',
    reject: 'Reject',
    assign: 'Assign',
    start_work: 'Start Work',
    hold: 'Put on Hold',
    resume: 'Resume',
    resolve: 'Resolve',
    verify: 'Verify',
    close: 'Close',
    reopen: 'Reopen',
    archive: 'Archive'
  }
  return labels[key]
}
