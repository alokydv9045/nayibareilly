/**
 * IssueActions - Modals for approve, reject, request info, mark spam
 */

'use client'

import { useState, useEffect } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useModeratorAPI } from '@/hooks/api/useModeratorAPI'
import { Loader2 } from 'lucide-react'

interface Department {
  id: string
  name: string
  code: string
}

interface IssueActionsProps {
  issueId: string | null
  action: 'approve' | 'reject' | 'request-info' | 'mark-spam' | null
  onClose: () => void
  onSubmit: (issueId: string, ...args: string[]) => void
  loading?: boolean
}

export function IssueActions({
  issueId,
  action,
  onClose,
  onSubmit,
  loading
}: IssueActionsProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [notes, setNotes] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')

  const { fetchDepartments } = useModeratorAPI()

  useEffect(() => {
    if (action === 'approve') {
      fetchDepartments().then(setDepartments).catch(console.error)
    }
  }, [action, fetchDepartments])

  const handleClose = () => {
    setSelectedDepartment('')
    setPriority('MEDIUM')
    setNotes('')
    setReason('')
    setMessage('')
    onClose()
  }

  const handleSubmit = () => {
    if (!issueId) return

    switch (action) {
      case 'approve':
        if (!selectedDepartment) return
        onSubmit(issueId, selectedDepartment, priority, notes)
        break
      case 'reject':
        if (!reason.trim()) return
        onSubmit(issueId, reason)
        break
      case 'request-info':
        if (!message.trim()) return
        onSubmit(issueId, message)
        break
      case 'mark-spam':
        onSubmit(issueId, reason)
        break
    }

    handleClose()
  }

  const isOpen = !!issueId && !!action

  return (
    <>
      {/* Approve Modal */}
      <Dialog open={isOpen && action === 'approve'} onOpenChange={handleClose}>
        <DialogContent className="bg-gray-900 border-orange-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Approve & Assign Issue</DialogTitle>
            <DialogDescription className="text-orange-200">
              Select a department and set priority for this issue
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="department" className="text-white">Department *</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger id="department" className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority" className="text-white">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority" className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes" className="text-white">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for the department..."
                className="bg-white/5 border-white/20 text-white"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedDepartment || loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve & Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isOpen && action === 'reject'} onOpenChange={handleClose}>
        <DialogContent className="bg-gray-900 border-orange-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Reject Issue</DialogTitle>
            <DialogDescription className="text-orange-200">
              Please provide a reason for rejecting this issue
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label htmlFor="reason" className="text-white">Rejection Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this issue is being rejected..."
              className="bg-white/5 border-white/20 text-white"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason.trim() || loading}
              variant="destructive"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info Modal */}
      <Dialog open={isOpen && action === 'request-info'} onOpenChange={handleClose}>
        <DialogContent className="bg-gray-900 border-orange-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Request More Information</DialogTitle>
            <DialogDescription className="text-orange-200">
              Ask the reporter for additional details
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label htmlFor="message" className="text-white">Message to Reporter *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What additional information do you need?"
              className="bg-white/5 border-white/20 text-white"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Spam Modal */}
      <Dialog open={isOpen && action === 'mark-spam'} onOpenChange={handleClose}>
        <DialogContent className="bg-gray-900 border-orange-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Mark as Spam</DialogTitle>
            <DialogDescription className="text-orange-200">
              This will flag the issue and may affect the reporter&apos;s account
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label htmlFor="spam-reason" className="text-white">Reason (Optional)</Label>
            <Textarea
              id="spam-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this spam? (optional)"
              className="bg-white/5 border-white/20 text-white"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark as Spam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}