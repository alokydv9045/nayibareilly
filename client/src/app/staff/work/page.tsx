'use client'

import { useState } from 'react'
import { useMyAssignedIssues, useStartWork, useResolveIssue } from '@/lib/api/staff-workflow'
import { StartWorkDialog, ResolveIssueDialog, IssueDetailsDialog } from '@/components/features/admin/StaffWorkflowDialogs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlayCircle, CheckCircle2, Eye, Clock, AlertCircle } from 'lucide-react'
import type { Issue } from '@/types/api'

export default function StaffWorkPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  
  // Dialog states
  const [startWorkDialog, setStartWorkDialog] = useState(false)
  const [resolveDialog, setResolveDialog] = useState(false)
  const [detailsDialog, setDetailsDialog] = useState(false)

  // Fetch assigned issues
  const { data: issuesData, isLoading } = useMyAssignedIssues({
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  // Mutations
  const startWorkMutation = useStartWork()
  const resolveIssueMutation = useResolveIssue()

  const issues = issuesData?.issues || []
  const stats = issuesData?.stats || {
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    avgResolutionTime: 0,
  }

  // Handle start work
  const handleStartWork = (issueId: string, issue: Issue) => {
    setSelectedIssueId(issueId)
    setSelectedIssue(issue)
    setStartWorkDialog(true)
  }

  const handleStartWorkConfirm = async (note?: string) => {
    if (!selectedIssueId) return

    try {
      await startWorkMutation.mutateAsync({
        issueId: selectedIssueId,
        note,
      })
      alert('Work started successfully')
      setStartWorkDialog(false)
      setSelectedIssueId(null)
      setSelectedIssue(null)
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      alert(err.response?.data?.message || 'Failed to start work')
    }
  }

  // Handle resolve issue
  const handleResolve = (issueId: string, issue: Issue) => {
    setSelectedIssueId(issueId)
    setSelectedIssue(issue)
    setResolveDialog(true)
  }

  const handleResolveConfirm = async (photos: File[], note?: string, materials?: Array<{ material: string; quantity: number }>) => {
    if (!selectedIssueId) return

    try {
      await resolveIssueMutation.mutateAsync({
        issueId: selectedIssueId,
        photos,
        note,
        materials,
      })
      alert('Issue resolved successfully with proof photos')
      setResolveDialog(false)
      setSelectedIssueId(null)
      setSelectedIssue(null)
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      alert(err.response?.data?.message || 'Failed to resolve issue')
    }
  }

  // Handle view details
  const handleViewDetails = (issue: Issue) => {
    setSelectedIssue(issue)
    setDetailsDialog(true)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ASSIGNED_TO_STAFF: 'secondary',
      IN_PROGRESS: 'default',
      RESOLVED: 'outline',
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      HIGH: 'destructive',
      MEDIUM: 'default',
      LOW: 'secondary',
    }
    return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Work Queue</h1>
          <p className="text-muted-foreground">Issues assigned to you</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assigned || 0}</div>
            <p className="text-xs text-muted-foreground">Waiting to start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <PlayCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress || 0}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved || 0}</div>
            <p className="text-xs text-muted-foreground">Completed work</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgResolutionTime ? `${stats.avgResolutionTime}h` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Average time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Work Queue</CardTitle>
              <CardDescription>Manage your assigned issues</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Issues</SelectItem>
                <SelectItem value="ASSIGNED_TO_STAFF">Assigned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : issues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No issues assigned to you
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.map((issue: Issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-mono text-sm">
                      {issue.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-medium">{issue.title}</TableCell>
                    <TableCell>
                      {issue.category || 'N/A'}
                    </TableCell>
                    <TableCell>{getPriorityBadge(issue.priority)}</TableCell>
                    <TableCell>{getStatusBadge(issue.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetails(issue)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {issue.status === 'assigned' && (
                          <Button
                            size="sm"
                            onClick={() => handleStartWork(issue.id, issue)}
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Start Work
                          </Button>
                        )}
                        
                        {issue.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleResolve(issue.id, issue)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <StartWorkDialog
        open={startWorkDialog}
        onClose={() => {
          setStartWorkDialog(false)
          setSelectedIssueId(null)
          setSelectedIssue(null)
        }}
        onConfirm={handleStartWorkConfirm}
        isLoading={startWorkMutation.isPending}
        issueTitle={selectedIssue?.title}
      />

      <ResolveIssueDialog
        open={resolveDialog}
        onClose={() => {
          setResolveDialog(false)
          setSelectedIssueId(null)
          setSelectedIssue(null)
        }}
        onConfirm={handleResolveConfirm}
        isLoading={resolveIssueMutation.isPending}
        issueTitle={selectedIssue?.title}
      />

      <IssueDetailsDialog
        open={detailsDialog}
        onClose={() => {
          setDetailsDialog(false)
          setSelectedIssue(null)
        }}
        issue={selectedIssue}
      />
    </div>
  )
}