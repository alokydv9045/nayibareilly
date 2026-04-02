/**
 * IssueCardModerator - Moderator-specific issue card variant
 * Shows approve/reject actions and moderation controls
 */

'use client'

import { useState } from 'react'
import IssueCard, { IssueCardProps } from './IssueCard'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Flag,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface IssueCardModeratorProps extends Omit<IssueCardProps, 'actions'> {
  onApprove?: (issueId: string) => void | Promise<void>
  onReject?: (issueId: string, reason?: string) => void | Promise<void>
  onRequestInfo?: (issueId: string) => void | Promise<void>
  onMarkSpam?: (issueId: string) => void | Promise<void>
  loading?: boolean
  showFullActions?: boolean
}

export default function IssueCardModerator({
  issue,
  onApprove,
  onReject,
  onRequestInfo,
  onMarkSpam,
  loading = false,
  showFullActions = true,
  ...props
}: IssueCardModeratorProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showSpamDialog, setShowSpamDialog] = useState(false)

  const handleApprove = async () => {
    if (onApprove) {
      await onApprove(issue.id)
    }
  }

  const handleReject = async () => {
    if (onReject) {
      await onReject(issue.id)
      setShowRejectDialog(false)
    }
  }

  const handleMarkSpam = async () => {
    if (onMarkSpam) {
      await onMarkSpam(issue.id)
      setShowSpamDialog(false)
    }
  }

  const handleRequestInfo = async () => {
    if (onRequestInfo) {
      await onRequestInfo(issue.id)
    }
  }

  const actions = (
    <div className="space-y-2">
      {/* Primary Actions */}
      <div className="flex items-center gap-2">
        {onApprove && (
          <Button
            onClick={handleApprove}
            disabled={loading}
            size="sm"
            variant="default"
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
        )}

        {onReject && (
          <Button
            onClick={() => setShowRejectDialog(true)}
            disabled={loading}
            size="sm"
            variant="destructive"
            className="flex-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
        )}

        <Link href={`/moderator/issues/${issue.id}`}>
          <Button size="sm" variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Review
          </Button>
        </Link>
      </div>

      {/* Secondary Actions */}
      {showFullActions && (
        <div className="flex items-center gap-2">
          {onRequestInfo && (
            <Button
              onClick={handleRequestInfo}
              disabled={loading}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Request Info
            </Button>
          )}

          {onMarkSpam && (
            <Button
              onClick={() => setShowSpamDialog(true)}
              disabled={loading}
              size="sm"
              variant="outline"
              className="flex-1 text-orange-600 hover:text-orange-700"
            >
              <Flag className="w-4 h-4 mr-2" />
              Mark Spam
            </Button>
          )}
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Issue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this issue? The reporter will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Issue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Spam Confirmation Dialog */}
      <AlertDialog open={showSpamDialog} onOpenChange={setShowSpamDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Spam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this as spam? This action will reject the issue and flag the reporter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkSpam}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Mark as Spam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )

  return (
    <IssueCard
      issue={issue}
      showActions
      actions={actions}
      expandable
      defaultExpanded
      variant="detailed"
      className="border-l-4 border-l-orange-500"
      {...props}
    />
  )
}
