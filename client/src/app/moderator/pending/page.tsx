"use client"

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { 
  CheckCircle,
  Filter,
  Eye,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  RefreshCw,
  CheckCircle2,
  X
} from 'lucide-react'
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute'
import { useModeratorAPI } from '@/hooks/api/useModeratorAPI'

interface PendingIssue {
  id: string
  reportId: string
  title: string
  description: string
  address: string
  reporterName: string
  createdAt: string
  priority: string
  categoryName?: string
  images?: Array<{ id: string; url: string }>
}

interface Department {
  id: string
  name: string
  code: string
}

export default function ModeratorPendingPage() {
  const router = useRouter()
  const { 
    fetchPending, 
    fetchDepartments, 
    approveIssue, 
    rejectIssue
  } = useModeratorAPI()

  const [pendingIssues, setPendingIssues] = useState<PendingIssue[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [selectedDeptByIssue, setSelectedDeptByIssue] = useState<Record<string, string>>({})
  const [detailsIssueId, setDetailsIssueId] = useState<string | null>(null)
  const [rejectIssueId, setRejectIssueId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [issuesData, departmentsData] = await Promise.all([
        fetchPending(),
        fetchDepartments()
      ])
      setPendingIssues(issuesData || [])
      setDepartments(departmentsData || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [fetchPending, fetchDepartments])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredIssues = pendingIssues?.filter((issue: PendingIssue) => {
    if (filterPriority !== "all" && issue.priority !== filterPriority) return false
    return true
  }) || []

  const handleApprove = useCallback(async (issueId: string) => {
    const selectedDept = selectedDeptByIssue[issueId]
    if (!selectedDept) {
      toast.error('Please select a department first')
      return
    }

    setProcessing(issueId)
    try {
      await approveIssue(issueId, selectedDept, 'Approved by moderator')
      toast.success('Issue approved and assigned successfully')
      await loadData()
    } catch (error) {
      console.error('Error approving issue:', error)
      toast.error('Failed to approve issue')
    } finally {
      setProcessing(null)
    }
  }, [selectedDeptByIssue, approveIssue, loadData])

  const handleReject = useCallback(async () => {
    if (!rejectIssueId || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    setProcessing(rejectIssueId)
    try {
      await rejectIssue(rejectIssueId, rejectReason)
      toast.success('Issue rejected')
      setRejectIssueId(null)
      setRejectReason("")
      await loadData()
    } catch (error) {
      console.error('Error rejecting issue:', error)
      toast.error('Failed to reject issue')
    } finally {
      setProcessing(null)
    }
  }, [rejectIssueId, rejectReason, rejectIssue, loadData])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const selectedIssue = detailsIssueId ? pendingIssues?.find((issue: PendingIssue) => issue.id === detailsIssueId) : null

  return (
    <ProtectedRoute requiredRoles={['moderator']}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/moderator/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Pending Reviews</h1>
                <p className="text-slate-600 mt-1">
                  {filteredIssues.length} issues awaiting moderation
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => loadData()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Priority
                </label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Department
                </label>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments?.map((dept: Department) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-400" />
            <p className="text-slate-500">Loading pending issues...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">All Caught Up!</h3>
              <p className="text-slate-600">No pending issues to review at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredIssues.map((issue: PendingIssue) => (
              <Card key={issue.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-lg">{issue.title}</CardTitle>
                        <Badge className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                        <Badge variant="outline">{issue.categoryName || 'Uncategorized'}</Badge>
                      </div>
                      <CardDescription className="text-sm text-slate-600">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {issue.reporterName}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                          {issue.address && (
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {issue.address}
                            </span>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailsIssueId(issue.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 mb-4 line-clamp-2">{issue.description}</p>
                  
                  {/* Images */}
                  {issue.images && issue.images.length > 0 && (
                    <div className="flex space-x-2 mb-4">
                      {issue.images.slice(0, 3).map((image) => (
                        <div key={image.id} className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={image.url}
                            alt="Issue image"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {issue.images.length > 3 && (
                        <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-sm text-slate-500">
                          +{issue.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Select
                        value={selectedDeptByIssue[issue.id] || ""}
                        onValueChange={(value) => 
                          setSelectedDeptByIssue(prev => ({...prev, [issue.id]: value}))
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments?.map((dept: Department) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRejectIssueId(issue.id)}
                        disabled={processing === issue.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApprove(issue.id)}
                        disabled={!selectedDeptByIssue[issue.id] || processing === issue.id}
                        size="sm"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        {processing === issue.id ? 'Processing...' : 'Approve'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Issue Details Modal */}
        <Dialog open={!!detailsIssueId} onOpenChange={() => setDetailsIssueId(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Issue Details</DialogTitle>
              <DialogDescription>
                Review all information about this issue before making a decision
              </DialogDescription>
            </DialogHeader>
            {selectedIssue && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{selectedIssue.title}</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge className={getPriorityColor(selectedIssue.priority)}>
                      {selectedIssue.priority}
                    </Badge>
                    <Badge variant="outline">{selectedIssue.categoryName || 'Uncategorized'}</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-slate-700">{selectedIssue.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Reporter Information</h4>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p><strong>Name:</strong> {selectedIssue.reporterName}</p>
                  </div>
                </div>

                {selectedIssue.address && (
                  <div>
                    <h4 className="font-medium mb-2">Location</h4>
                    <p className="text-slate-700">{selectedIssue.address}</p>
                  </div>
                )}

                {selectedIssue.images && selectedIssue.images.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Attachments</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedIssue.images.map((image: { id: string; url: string }) => (
                        <div key={image.id} className="relative aspect-video rounded-lg overflow-hidden">
                          <Image
                            src={image.url}
                            alt="Issue attachment"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Submission Date</h4>
                  <p className="text-slate-700">
                    {new Date(selectedIssue.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Issue Modal */}
        <Dialog open={!!rejectIssueId} onOpenChange={() => setRejectIssueId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Issue</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this issue
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setRejectIssueId(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || processing === rejectIssueId}
                  variant="destructive"
                >
                  {processing === rejectIssueId ? 'Processing...' : 'Reject Issue'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
