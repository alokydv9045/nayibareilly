/**
 * useIssueActions - Handle all issue actions with loading states
 */

import { useState, useCallback } from 'react'
import { useModeratorAPI } from './useModeratorAPI'
import toast from 'react-hot-toast'

export function useIssueActions() {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const api = useModeratorAPI()

  const handleApprove = useCallback(async (
    issueId: string,
    departmentId: string,
    priority: string,
    notes?: string,
    onSuccess?: () => void
  ) => {
    setActionLoading(issueId)
    try {
      await api.approveIssue(issueId, departmentId, priority, notes)
      toast.success('Issue approved and assigned to department!')
      onSuccess?.()
    } catch (error) {
      console.error('Error approving issue:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to approve issue')
    } finally {
      setActionLoading(null)
    }
  }, [api])

  const handleReject = useCallback(async (
    issueId: string,
    reason: string,
    onSuccess?: () => void
  ) => {
    setActionLoading(issueId)
    try {
      await api.rejectIssue(issueId, reason)
      toast.success('Issue rejected successfully')
      onSuccess?.()
    } catch (error) {
      console.error('Error rejecting issue:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to reject issue')
    } finally {
      setActionLoading(null)
    }
  }, [api])

  const handleRequestInfo = useCallback(async (
    issueId: string,
    message: string,
    fields?: string[],
    onSuccess?: () => void
  ) => {
    setActionLoading(issueId)
    try {
      await api.requestMoreInfo(issueId, message, fields)
      toast.success('Information request sent to reporter')
      onSuccess?.()
    } catch (error) {
      console.error('Error requesting info:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to request information')
    } finally {
      setActionLoading(null)
    }
  }, [api])

  const handleMarkSpam = useCallback(async (
    issueId: string,
    reason?: string,
    onSuccess?: () => void
  ) => {
    setActionLoading(issueId)
    try {
      await api.markAsSpam(issueId, reason)
      toast.success('Issue marked as spam')
      onSuccess?.()
    } catch (error) {
      console.error('Error marking spam:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to mark as spam')
    } finally {
      setActionLoading(null)
    }
  }, [api])

  const checkDuplicates = useCallback(async (issueId: string) => {
    try {
      return await api.checkDuplicates(issueId)
    } catch (error) {
      console.error('Error checking duplicates:', error)
      toast.error('Failed to check for duplicates')
      return null
    }
  }, [api])

  return {
    handleApprove,
    handleReject,
    handleRequestInfo,
    handleMarkSpam,
    checkDuplicates,
    actionLoading
  }
}
