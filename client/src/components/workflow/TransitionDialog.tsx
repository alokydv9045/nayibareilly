'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { WorkflowTransitionKey } from '@/types/workflow'
import { useTransitionValidation } from '@/lib/workflow/hooks'

interface TransitionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transitionKey: WorkflowTransitionKey
  transitionLabel: string
  onConfirm: (data: Record<string, unknown>) => Promise<void>
  requiresComment?: boolean
  requiresReason?: boolean
  currentIssueData?: Record<string, unknown>
}

export function TransitionDialog({
  open,
  onOpenChange,
  transitionKey,
  transitionLabel,
  onConfirm,
  requiresComment = false,
  requiresReason = false,
  currentIssueData = {}
}: TransitionDialogProps) {
  const [comment, setComment] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { validate, errors: validationErrors } = useTransitionValidation(String(transitionKey))

  const handleConfirm = async () => {
    setError(null)
    
    // Validate transition data
    const dataToValidate = { ...currentIssueData, comment, reason }
    const isValid = validate(dataToValidate)
    
    if (!isValid) {
      return
    }
    
    setIsSubmitting(true)

    try {
      const data: Record<string, unknown> = {}
      if (requiresComment && comment) data.comment = comment
      if (requiresReason && reason) data.reason = reason

      await onConfirm(data)
      
      // Reset form
      setComment('')
      setReason('')
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform transition')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = validationErrors.length === 0
  const canSubmit = isValid && !isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm {transitionLabel}</DialogTitle>
          <DialogDescription>
            Please provide the required information to proceed with this action.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {requiresComment && (
            <div className="space-y-2">
              <Label htmlFor="comment">
                Comment <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="comment"
                placeholder="Enter your comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          )}

          {requiresReason && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          {validationErrors && validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((err: string, idx: number) => (
                    <li key={idx} className="text-sm">{err}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canSubmit}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm {transitionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
