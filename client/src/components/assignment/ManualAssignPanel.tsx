'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  UserPlus, 
  AlertCircle, 
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { StaffSelector } from './StaffSelector'
import { AssignmentDialog } from './AssignmentDialog'
import { AssignmentHistory } from './AssignmentHistory'
import { 
  useStaffList, 
  useAssign, 
  useCurrentAssignment,
  useAssignmentHistory 
} from '@/lib/assignment/hooks'
import { PriorityLevel } from '@/lib/assignment'
import { toast } from 'react-hot-toast'

interface ManualAssignPanelProps {
  issueId: string
  issueCategory: string
  issueName: string
  onAssignmentComplete?: () => void
  className?: string
}

export function ManualAssignPanel({
  issueId,
  issueCategory,
  issueName,
  onAssignmentComplete,
  className = ''
}: ManualAssignPanelProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { staff, isLoading: staffLoading, refresh: refreshStaff } = useStaffList()
  const { assignIssue } = useAssign()
  const { assignment, isLoading: assignmentLoading, refresh: refreshAssignment } = useCurrentAssignment(issueId)
  const { history, isLoading: historyLoading } = useAssignmentHistory(issueId)

  const selectedStaff = staff.find(s => s.id === selectedStaffId) || null

  const handleSelectStaff = (staffId: string) => {
    setSelectedStaffId(staffId)
    setDialogOpen(true)
  }

  const handleConfirmAssignment = async (priority: PriorityLevel, notes: string) => {
    if (!selectedStaffId) return

    const result = await assignIssue(issueId, selectedStaffId, priority, notes)

    if (result) {
      toast.success(`Issue assigned to ${selectedStaff?.name}`)
      
      // Refresh data
      await refreshAssignment()
      await refreshStaff()
      
      // Reset selection
      setSelectedStaffId(null)
      
      // Notify parent
      onAssignmentComplete?.()
    } else {
      toast.error('Failed to assign issue')
    }
  }

  const isAlreadyAssigned = !!assignment

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Assignment Status */}
      {assignmentLoading ? (
        <div className="h-24 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg" />
      ) : isAlreadyAssigned ? (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Already Assigned
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  This issue is currently assigned to <strong>{assignment.assigneeName}</strong>
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshAssignment}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Assign to Staff
            </CardTitle>
            <CardDescription>
              Select a staff member to assign this issue
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Staff Selection */}
      {!isAlreadyAssigned && (
        <Card>
          <CardHeader>
            <CardTitle>Available Staff Members</CardTitle>
            <CardDescription>
              Staff members are sorted by best match for this issue category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {staffLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg" />
                ))}
              </div>
            ) : staff.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No staff members available for assignment. Please try again later.
                </AlertDescription>
              </Alert>
            ) : (
              <StaffSelector
                issueCategory={issueCategory}
                selectedStaffId={selectedStaffId || undefined}
                onSelectStaff={handleSelectStaff}
                staff={staff}
                showMatchScores
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Assignment History */}
      {(history.length > 0 || historyLoading) && (
        <AssignmentHistory
          history={history}
          isLoading={historyLoading}
        />
      )}

      {/* Assignment Confirmation Dialog */}
      <AssignmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedStaff={selectedStaff}
        onConfirm={handleConfirmAssignment}
        issueName={issueName}
      />
    </div>
  )
}
