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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, UserPlus } from 'lucide-react'
import { PRIORITY_LEVELS, PriorityLevel, getPriorityLabel } from '@/lib/assignment'
import { StaffCard } from './StaffCard'
import { StaffMember } from '@/lib/assignment'

interface AssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedStaff: StaffMember | null
  onConfirm: (priority: PriorityLevel, notes: string) => Promise<void>
  issueName?: string
}

export function AssignmentDialog({
  open,
  onOpenChange,
  selectedStaff,
  onConfirm,
  issueName = 'this issue'
}: AssignmentDialogProps) {
  const [priority, setPriority] = useState<PriorityLevel>(PRIORITY_LEVELS.MEDIUM)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!selectedStaff) return

    setError(null)
    setIsSubmitting(true)

    try {
      await onConfirm(priority, notes)
      
      // Reset form
      setPriority(PRIORITY_LEVELS.MEDIUM)
      setNotes('')
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign issue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = selectedStaff && !isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Confirm Assignment
          </DialogTitle>
          <DialogDescription>
            Assign {issueName} to selected staff member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selected Staff Preview */}
          {selectedStaff && (
            <div className="space-y-2">
              <Label>Assigning to:</Label>
              <StaffCard
                staff={selectedStaff}
                showDetails={false}
                className="pointer-events-none"
              />
            </div>
          )}

          {!selectedStaff && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select a staff member to assign
              </AlertDescription>
            </Alert>
          )}

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label htmlFor="priority">
              Priority <span className="text-red-500">*</span>
            </Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as PriorityLevel)}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PRIORITY_LEVELS).map(level => (
                  <SelectItem key={level} value={level}>
                    {getPriorityLabel(level)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Set the priority level for this assignment
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Assignment Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any special instructions or context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              These notes will be visible to the assigned staff member
            </p>
          </div>

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
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
