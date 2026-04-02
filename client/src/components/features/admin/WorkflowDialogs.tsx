"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Building2, User, CheckCircle, XCircle, FileText } from 'lucide-react'

// Triage Dialog - PENDING → TRIAGED
interface TriageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (departmentId: string, note?: string) => void
  isLoading?: boolean
  issue?: {
    title: string
    reportId?: string
  }
}

export function TriageDialog({ open, onOpenChange, onConfirm, isLoading, issue }: TriageDialogProps) {
  const [departmentId, setDepartmentId] = useState('')
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (departmentId) {
      onConfirm(departmentId, note || undefined)
      setDepartmentId('')
      setNote('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            Triage Issue to Department
          </DialogTitle>
          <DialogDescription>
            Assign this issue to the appropriate department for handling.
            {issue && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <strong>Issue:</strong> {issue.title}
                {issue.reportId && <div className="text-xs text-gray-500">ID: {issue.reportId}</div>}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dept_water">Water Supply Department</SelectItem>
                  <SelectItem value="dept_roads">Roads & Infrastructure</SelectItem>
                  <SelectItem value="dept_sanitation">Sanitation Department</SelectItem>
                  <SelectItem value="dept_electricity">Electricity Department</SelectItem>
                  <SelectItem value="dept_health">Health & Hygiene</SelectItem>
                  <SelectItem value="dept_parks">Parks & Recreation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Triage Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add any notes about the department assignment..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!departmentId || isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Triage to Department
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Assign to Staff Dialog - TRIAGED → ASSIGNED_TO_STAFF
interface AssignStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (staffUserId: string, note?: string) => void
  isLoading?: boolean
  issue?: {
    title: string
    department?: string
  }
}

export function AssignStaffDialog({ open, onOpenChange, onConfirm, isLoading, issue }: AssignStaffDialogProps) {
  const [staffUserId, setStaffUserId] = useState('')
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (staffUserId) {
      onConfirm(staffUserId, note || undefined)
      setStaffUserId('')
      setNote('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-cyan-600" />
            Assign to Staff Member
          </DialogTitle>
          <DialogDescription>
            Select a staff member to handle this issue in the field.
            {issue && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <strong>Issue:</strong> {issue.title}
                {issue.department && <div className="text-xs text-gray-500">Dept: {issue.department}</div>}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staff">Staff Member *</Label>
              <Select value={staffUserId} onValueChange={setStaffUserId}>
                <SelectTrigger id="staff">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff_001">Rajesh Kumar (Water Dept)</SelectItem>
                  <SelectItem value="staff_002">Priya Sharma (Roads Dept)</SelectItem>
                  <SelectItem value="staff_003">Amit Singh (Sanitation)</SelectItem>
                  <SelectItem value="staff_004">Neha Gupta (Electricity)</SelectItem>
                  <SelectItem value="staff_005">Vijay Verma (Health Dept)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Note: In production, this would fetch actual staff members from the selected department.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assign-note">Assignment Note (Optional)</Label>
              <Textarea
                id="assign-note"
                placeholder="Add instructions or details for the staff member..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!staffUserId || isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign to Staff
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Close Issue Dialog - RESOLVED → CLOSED
interface CloseIssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (note?: string) => void
  isLoading?: boolean
  issue?: {
    title: string
    reportId?: string
    resolvedAt?: string
  }
}

export function CloseIssueDialog({ open, onOpenChange, onConfirm, isLoading, issue }: CloseIssueDialogProps) {
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(note || undefined)
    setNote('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Close Issue
          </DialogTitle>
          <DialogDescription>
            Mark this issue as officially closed after verification.
            {issue && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <strong>Issue:</strong> {issue.title}
                {issue.reportId && <div className="text-xs text-gray-500">ID: {issue.reportId}</div>}
                {issue.resolvedAt && (
                  <div className="text-xs text-green-600 mt-1">
                    Resolved on {new Date(issue.resolvedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="close-note">Closing Note (Optional)</Label>
              <Textarea
                id="close-note"
                placeholder="Add final verification notes or comments..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
              />
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
              <p className="text-green-800">
                ✓ This will mark the issue as officially closed and update statistics.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Close Issue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Reject Issue Dialog
interface RejectIssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
  isLoading?: boolean
  issue?: {
    title: string
    reportId?: string
  }
}

export function RejectIssueDialog({ open, onOpenChange, onConfirm, isLoading, issue }: RejectIssueDialogProps) {
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (reason.trim()) {
      onConfirm(reason)
      setReason('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Reject Issue
          </DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting this issue.
            {issue && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <strong>Issue:</strong> {issue.title}
                {issue.reportId && <div className="text-xs text-gray-500">ID: {issue.reportId}</div>}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Rejection Reason *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Explain why this issue is being rejected..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
              <p className="text-red-800">
                ⚠ The reporter will be notified of the rejection and reason.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!reason.trim() || isLoading} variant="destructive">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Issue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Issue Details Dialog
interface IssueDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issue: {
    id: string
    title: string
    description: string
    status: string
    priority: string
    category: string
    location: string
    reportedBy: { name: string; email: string }
    assignedTo?: { name: string; department?: string }
    createdAt: string
    updatedAt: string
    resolvedAt?: string
  } | null
}

export function IssueDetailsDialog({ open, onOpenChange, issue }: IssueDetailsDialogProps) {
  if (!issue) return null

  const statusColors = {
    PENDING: 'bg-blue-100 text-blue-800',
    TRIAGED: 'bg-indigo-100 text-indigo-800',
    ASSIGNED_TO_STAFF: 'bg-cyan-100 text-cyan-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    REJECTED: 'bg-red-100 text-red-800',
  }

  const priorityColors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Issue Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{issue.title}</h3>
            <div className="flex gap-2 mb-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[issue.status as keyof typeof statusColors]}`}>
                {issue.status.replace(/_/g, ' ')}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[issue.priority as keyof typeof priorityColors]}`}>
                {issue.priority}
              </span>
              <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                {issue.category}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
            </div>

            <div>
              <Label className="text-sm font-medium">Location</Label>
              <p className="text-sm text-gray-700 mt-1">{issue.location || 'Not specified'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Reported By</Label>
                <p className="text-sm text-gray-700 mt-1">{issue.reportedBy.name}</p>
                <p className="text-xs text-gray-500">{issue.reportedBy.email}</p>
              </div>
              {issue.assignedTo && (
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <p className="text-sm text-gray-700 mt-1">{issue.assignedTo.name}</p>
                  {issue.assignedTo.department && (
                    <p className="text-xs text-gray-500">{issue.assignedTo.department}</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm text-gray-700 mt-1">
                  {new Date(issue.createdAt).toLocaleString()}
                </p>
              </div>
              {issue.resolvedAt && (
                <div>
                  <Label className="text-sm font-medium">Resolved</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {new Date(issue.resolvedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
