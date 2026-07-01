'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Eye, CheckCircle, XCircle, Clock, AlertTriangle, GitBranch, UserPlus } from 'lucide-react'
import { DataTable, createSelectColumn, createActionsColumn } from '@/components/features/admin/DataTable'
import { useAdminIssues, useUpdateIssueStatus, useBulkUpdateIssueStatus, useTriageIssue, useAssignIssueToStaff, useCloseIssue, type AdminIssue } from '@/lib/api/admin-issues'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import OfficialLayout from '@/components/layout/OfficialLayout'
import { 
  TriageDialog, 
  AssignStaffDialog, 
  CloseIssueDialog, 
  RejectIssueDialog,
  IssueDetailsDialog 
} from '@/components/features/admin/WorkflowDialogs'

// Map backend issue shape to internal table row shape
interface IssueRow {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  location: string
  reportedBy: { name: string; email: string }
  assignedTo?: { name: string; department?: string }
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

const statusConfig = {
  PENDING: { label: 'Submitted', variant: 'default', className: 'bg-emerald-100 text-blue-800' },
  TRIAGED: { label: 'Triaged', variant: 'default', className: 'bg-indigo-100 text-indigo-800' },
  ASSIGNED_TO_STAFF: { label: 'Assigned', variant: 'default', className: 'bg-cyan-100 text-cyan-800' },
  IN_PROGRESS: { label: 'In Progress', variant: 'default', className: 'bg-yellow-100 text-yellow-800' },
  RESOLVED: { label: 'Resolved', variant: 'default', className: 'bg-green-100 text-green-800' },
  CLOSED: { label: 'Closed', variant: 'secondary', className: 'bg-slate-100 text-slate-800' },
  REJECTED: { label: 'Rejected', variant: 'destructive', className: 'bg-red-100 text-red-800' },
} as const

const priorityConfig = {
  LOW: { label: 'Low', variant: 'default', className: 'bg-green-100 text-green-800' },
  MEDIUM: { label: 'Medium', variant: 'default', className: 'bg-yellow-100 text-yellow-800' },
  HIGH: { label: 'High', variant: 'default', className: 'bg-orange-100 text-orange-800' },
  CRITICAL: { label: 'Critical', variant: 'destructive', className: 'bg-red-100 text-red-800' },
}

const categoryConfig = {
  WATER: { label: 'Water Supply', variant: 'default', className: 'bg-emerald-100 text-blue-800' },
  ROADS: { label: 'Roads & Transport', variant: 'default', className: 'bg-slate-100 text-slate-800' },
  ELECTRICITY: { label: 'Electricity', variant: 'default', className: 'bg-yellow-100 text-yellow-800' },
  SANITATION: { label: 'Sanitation', variant: 'default', className: 'bg-green-100 text-green-800' },
  OTHER: { label: 'Other', variant: 'secondary', className: 'bg-purple-100 text-purple-800' },
}

export default function IssuesPage() {
  const router = useRouter()
  const [page] = useState(1) // future: pagination integration
  // Future: UI controls will update these filters
  const [statusFilter] = useState<string | undefined>()
  const [priorityFilter] = useState<string | undefined>()
  const [categoryFilter] = useState<string | undefined>()
  const [search] = useState<string>('')

  // Dialog states
  const [triageDialog, setTriageDialog] = useState<{ open: boolean; issue: IssueRow | null }>({ open: false, issue: null })
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; issue: IssueRow | null }>({ open: false, issue: null })
  const [closeDialog, setCloseDialog] = useState<{ open: boolean; issue: IssueRow | null }>({ open: false, issue: null })
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; issue: IssueRow | null }>({ open: false, issue: null })
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; issue: IssueRow | null }>({ open: false, issue: null })

  const { data, isLoading, error, refetch, isRefetching } = useAdminIssues({
    page,
    search: search || undefined,
    status: statusFilter,
    priority: priorityFilter,
    category: categoryFilter,
  })

  // Show error toast if API fails
  if (error) {
    toast.error('Failed to load issues. Please try again.')
  }

  const updateStatus = useUpdateIssueStatus()
  const triageMut = useTriageIssue()
  const assignMut = useAssignIssueToStaff()
  const closeMut = useCloseIssue()
  const _bulkUpdate = useBulkUpdateIssueStatus() // planned for bulk action bar
  const qc = useQueryClient()

  // Transform to table rows
  const issues: IssueRow[] = useMemo(() => {
    return (data?.items || []).map((i: AdminIssue) => ({
      id: i.id || i._id || (i as any).id,
      title: i.title,
      description: i.description || '',
      category: i.category?.name?.toUpperCase() || 'OTHER',
      priority: (i.priority || 'MEDIUM').toUpperCase(),
      status: i.status?.toUpperCase(),
      location: i.location || 'â€”',
      reportedBy: { name: i.reportedBy?.name || 'Anonymous', email: i.reportedBy?.email || 'â€”' },
      assignedTo: i.assignedTo ? { name: i.assignedTo.name || 'Unassigned', department: i.assignedTo.department } : undefined,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt || i.createdAt,
      resolvedAt: i.resolvedAt,
    }))
  }, [data])

  const columns: ColumnDef<IssueRow>[] = [
    createSelectColumn<IssueRow>(),
    {
      accessorKey: 'title',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Issue
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const issue = row.original
        return (
          <div className="max-w-sm">
            <div className="font-medium truncate">{issue.title}</div>
            <div className="text-sm text-muted-foreground truncate">{issue.description}</div>
            <div className="text-xs text-muted-foreground mt-1">{issue.location}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'category',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const category = row.getValue('category') as keyof typeof categoryConfig
        const config = categoryConfig[category] || categoryConfig.OTHER
        
        return (
          <Badge className={config.className}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Priority
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const priority = row.getValue('priority') as keyof typeof priorityConfig
        const config = priorityConfig[priority] || priorityConfig.MEDIUM
        
        return (
          <Badge className={config.className}>
            {priority === 'CRITICAL' && <AlertTriangle className="mr-1 h-3 w-3" />}
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const status = row.getValue('status') as keyof typeof statusConfig
        const config = statusConfig[status] || statusConfig.PENDING
        
        return (
          <Badge className={config.className}>
            {status === 'RESOLVED' && <CheckCircle className="mr-1 h-3 w-3" />}
            {status === 'IN_PROGRESS' && <Clock className="mr-1 h-3 w-3" />}
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'reportedBy',
      header: 'Reported By',
      cell: ({ row }) => {
        const reportedBy = row.getValue('reportedBy') as IssueRow['reportedBy']
        return (
          <div>
            <div className="font-medium text-sm">{reportedBy.name}</div>
            <div className="text-xs text-muted-foreground">{reportedBy.email}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt') as string
        const date = new Date(createdAt)
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-muted-foreground">{date.toLocaleTimeString()}</div>
          </div>
        )
      },
    },
    createActionsColumn<IssueRow>([
      {
        label: 'View Details',
        onClick: (issue) => handleViewIssue(issue),
        icon: Eye,
      },
      {
        label: 'Triage to Department',
        onClick: (issue) => handleTriage(issue),
        icon: GitBranch,
      },
      {
        label: 'Assign to Staff',
        onClick: (issue) => handleAssign(issue),
        icon: UserPlus,
      },
      {
        label: 'Mark In Progress',
        onClick: (issue) => handleUpdateStatus(issue, 'IN_PROGRESS'),
        icon: Clock,
      },
      {
        label: 'Mark Resolved',
        onClick: (issue) => handleUpdateStatus(issue, 'RESOLVED'),
        icon: CheckCircle,
      },
      {
        label: 'Close Issue',
        onClick: (issue) => handleClose(issue),
        icon: CheckCircle,
      },
      {
        label: 'Reject Issue',
        onClick: (issue) => handleReject(issue),
        icon: XCircle,
        variant: 'destructive',
      },
    ]),
  ]

  const handleViewIssue = (issue: IssueRow) => {
    setDetailsDialog({ open: true, issue })
  }

  const handleUpdateStatus = (issue: IssueRow, newStatus: IssueRow['status'], note?: string) => {
    const prev = qc.getQueryData<{ items: AdminIssue[]; total: number; page: number; pages: number }>(['adminIssues'])
    // optimistic update
    qc.setQueryData(['adminIssues'], (data: { items: AdminIssue[]; total: number; page: number; pages: number } | undefined) => {
      if (!data) return data
      return {
        ...data,
        items: data.items.map((i: AdminIssue) => i._id === issue.id ? { ...i, status: newStatus, updatedAt: new Date().toISOString(), resolvedAt: newStatus === 'RESOLVED' ? new Date().toISOString() : i.resolvedAt } : i)
      }
    })
    updateStatus.mutate({ id: issue.id, status: newStatus, note }, {
      onSuccess: () => toast.success('Status updated'),
      onError: () => {
        toast.error('Failed to update status')
        qc.setQueryData(['adminIssues'], prev)
      }
    })
  }

  const handleTriage = (issue: IssueRow) => {
    setTriageDialog({ open: true, issue })
  }

  const handleTriageConfirm = (departmentId: string, note?: string) => {
    const issue = triageDialog.issue
    if (!issue) return
    
    const prev = qc.getQueryData<{ items: AdminIssue[]; total: number; page: number; pages: number }>(['adminIssues'])
    // optimistic
    qc.setQueryData(['adminIssues'], (data: { items: AdminIssue[]; total: number; page: number; pages: number } | undefined) => {
      if (!data) return data
      return { ...data, items: data.items.map((i) => i._id === issue.id ? { ...i, status: 'TRIAGED' } as AdminIssue : i) }
    })
    triageMut.mutate({ id: issue.id, departmentId, note }, {
      onSuccess: () => {
        toast.success('Issue triaged successfully')
        setTriageDialog({ open: false, issue: null })
      },
      onError: () => { 
        toast.error('Failed to triage issue')
        qc.setQueryData(['adminIssues'], prev)
      }
    })
  }

  const handleAssign = (issue: IssueRow) => {
    setAssignDialog({ open: true, issue })
  }

  const handleAssignConfirm = (staffUserId: string, note?: string) => {
    const issue = assignDialog.issue
    if (!issue) return
    
    const prev = qc.getQueryData<{ items: AdminIssue[]; total: number; page: number; pages: number }>(['adminIssues'])
    qc.setQueryData(['adminIssues'], (data: { items: AdminIssue[]; total: number; page: number; pages: number } | undefined) => {
      if (!data) return data
      return { ...data, items: data.items.map((i) => i._id === issue.id ? { ...i, status: 'ASSIGNED_TO_STAFF' } as AdminIssue : i) }
    })
    assignMut.mutate({ id: issue.id, staffUserId, note }, {
      onSuccess: () => {
        toast.success('Issue assigned to staff successfully')
        setAssignDialog({ open: false, issue: null })
      },
      onError: () => { 
        toast.error('Failed to assign issue')
        qc.setQueryData(['adminIssues'], prev)
      }
    })
  }

  const handleClose = (issue: IssueRow) => {
    setCloseDialog({ open: true, issue })
  }

  const handleCloseConfirm = (note?: string) => {
    const issue = closeDialog.issue
    if (!issue) return
    
    const prev = qc.getQueryData<{ items: AdminIssue[]; total: number; page: number; pages: number }>(['adminIssues'])
    qc.setQueryData(['adminIssues'], (data: { items: AdminIssue[]; total: number; page: number; pages: number } | undefined) => {
      if (!data) return data
      return { ...data, items: data.items.map((i) => i._id === issue.id ? { ...i, status: 'CLOSED' } as AdminIssue : i) }
    })
    closeMut.mutate({ id: issue.id, note }, {
      onSuccess: () => {
        toast.success('Issue closed successfully')
        setCloseDialog({ open: false, issue: null })
      },
      onError: () => { 
        toast.error('Failed to close issue')
        qc.setQueryData(['adminIssues'], prev)
      }
    })
  }

  const handleReject = (issue: IssueRow) => {
    setRejectDialog({ open: true, issue })
  }

  const handleRejectConfirm = (reason: string) => {
    const issue = rejectDialog.issue
    if (!issue) return
    
    handleUpdateStatus(issue, 'REJECTED', reason)
    setRejectDialog({ open: false, issue: null })
  }

  const handleAddIssue = () => {
    router.push('/report')
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleExport = () => {
    if (!issues || issues.length === 0) {
      toast('No data to export', { icon: '⚠️' })
      return
    }
    
    try {
      const headers = ['ID', 'Title', 'Category', 'Status', 'Priority', 'Department', 'Created At']
      const csvRows = [headers.join(',')]
      
      issues.forEach(issue => {
        const row = [
          issue.id,
          `"${issue.title.replace(/"/g, '""')}"`,
          issue.category,
          issue.status,
          issue.priority,
          issue.assignedTo?.department || 'Unassigned',
          new Date(issue.createdAt).toLocaleString()
        ]
        csvRows.push(row.join(','))
      })
      
      const csvData = csvRows.join('\n')
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `nayibareilly_issues_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast('Exported successfully', { icon: '✅' })
    } catch (error) {
      console.error('Export error:', error)
      toast('Failed to export data', { icon: '❌' })
    }
  }

  return (
    <OfficialLayout>
      <main className="py-4 sm:py-6 lg:py-8">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
<<<<<<< HEAD
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Issue Management</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-700">
              Track and manage citizen-reported issues across all departments
            </p>
            {data && (
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
=======
          {/* Page Header (Removed per request) */}
          <div className="mb-2 sm:mb-4 flex justify-end">
            {data && (
              <p className="text-xs sm:text-sm text-gray-500">
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9
                Total Issues: <span className="font-semibold">{data.total || 0}</span>
              </p>
            )}
          </div>

          <DataTable
            columns={columns}
            data={issues}
            searchKey="title"
            searchPlaceholder="Search issues by title..."
            onAdd={handleAddIssue}
            onRefresh={handleRefresh}
            onExport={handleExport}
            loading={isLoading || isRefetching}
          />
        </div>
      </main>

      {/* Workflow Dialogs */}
      <TriageDialog
        open={triageDialog.open}
        onOpenChange={(open) => setTriageDialog({ open, issue: null })}
        onConfirm={handleTriageConfirm}
        isLoading={triageMut.isPending}
        issue={triageDialog.issue ? {
          title: triageDialog.issue.title,
          reportId: triageDialog.issue.id
        } : undefined}
      />

      <AssignStaffDialog
        open={assignDialog.open}
        onOpenChange={(open) => setAssignDialog({ open, issue: null })}
        onConfirm={handleAssignConfirm}
        isLoading={assignMut.isPending}
        issue={assignDialog.issue ? {
          title: assignDialog.issue.title,
          department: assignDialog.issue.category
        } : undefined}
      />

      <CloseIssueDialog
        open={closeDialog.open}
        onOpenChange={(open) => setCloseDialog({ open, issue: null })}
        onConfirm={handleCloseConfirm}
        isLoading={closeMut.isPending}
        issue={closeDialog.issue ? {
          title: closeDialog.issue.title,
          reportId: closeDialog.issue.id,
          resolvedAt: closeDialog.issue.resolvedAt
        } : undefined}
      />

      <RejectIssueDialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog({ open, issue: null })}
        onConfirm={handleRejectConfirm}
        isLoading={updateStatus.isPending}
        issue={rejectDialog.issue ? {
          title: rejectDialog.issue.title,
          reportId: rejectDialog.issue.id
        } : undefined}
      />

      <IssueDetailsDialog
        open={detailsDialog.open}
        onOpenChange={(open) => setDetailsDialog({ open, issue: null })}
        issue={detailsDialog.issue}
      />
    </OfficialLayout>
  )
}
