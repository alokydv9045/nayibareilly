'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Crown, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  DollarSign,
  FileText,
  Building2,
  Users,
  Calendar,
  Search,
  Eye,
  Download
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ApprovalItem {
  id: string
  type: 'budget' | 'project' | 'policy' | 'emergency' | 'staff' | 'contract'
  title: string
  description: string
  submittedBy: {
    name: string
    department: string
    role: string
  }
  submittedAt: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'URGENT'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW'
  estimatedCost?: number
  budgetImpact?: string
  timeframe?: string
  expectedOutcome?: string
  documents: Array<{
    name: string
    url: string
    type: string
  }>
  stakeholders: string[]
  risks?: string[]
  benefits?: string[]
  publicImpact?: string
  legalCompliance?: boolean
}

interface ApprovalStats {
  pending: number
  approved: number
  rejected: number
  underReview: number
  urgent: number
  avgProcessingTime: number
}

export default function MayorApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([])
  const [stats, setStats] = useState<ApprovalStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    underReview: 0,
    urgent: 0,
    avgProcessingTime: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const [approvalsRes, statsRes] = await Promise.all([
          fetch('/api/mayor/approvals', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          fetch('/api/mayor/approvals/stats', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        ])

        if (approvalsRes.ok) {
          const approvalsData = await approvalsRes.json()
          setApprovals(approvalsData.approvals)
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData.stats)
        }
      } catch (error) {
        console.error('Error fetching approvals:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch approvals data',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchApprovals()
  }, [toast])

  const handleApproval = async (itemId: string, action: 'approve' | 'reject' | 'review', comment?: string) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/mayor/approvals/${itemId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment })
      })
      
      if (response.ok) {
        // Update the approval in the list
        setApprovals(prev => prev.map(approval => 
          approval.id === itemId 
            ? { ...approval, status: action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'UNDER_REVIEW' }
            : approval
        ))
        
        // Update stats
        setStats(prev => ({
          ...prev,
          pending: action === 'approve' || action === 'reject' ? prev.pending - 1 : prev.pending,
          approved: action === 'approve' ? prev.approved + 1 : prev.approved,
          rejected: action === 'reject' ? prev.rejected + 1 : prev.rejected,
          underReview: action === 'review' ? prev.underReview + 1 : prev.underReview
        }))

        setSelectedItem(null)
        toast({
          title: 'Success',
          description: `Item ${action}d successfully`
        })
      }
    } catch (error) {
      console.error('Error processing approval:', error)
      toast({
        title: 'Error',
        description: 'Failed to process approval',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.submittedBy.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || approval.type === typeFilter
    const matchesPriority = priorityFilter === 'all' || approval.priority === priorityFilter
    const matchesStatus = statusFilter === 'all' || approval.status === statusFilter
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-600 text-white'
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget': return <DollarSign className="h-4 w-4" />
      case 'project': return <Building2 className="h-4 w-4" />
      case 'policy': return <FileText className="h-4 w-4" />
      case 'emergency': return <AlertTriangle className="h-4 w-4" />
      case 'staff': return <Users className="h-4 w-4" />
      case 'contract': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getDaysWaiting = (submittedAt: string) => {
    const submitted = new Date(submittedAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - submitted.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-800"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Crown className="h-8 w-8 text-slate-800" />
        <h1 className="text-3xl font-bold text-slate-900">Mayor Approvals</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {stats.pending} Pending
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-orange-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-xs text-slate-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-xs text-slate-600">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-xs text-slate-600">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-emerald-600">{stats.underReview}</div>
            <div className="text-xs text-slate-600">Under Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-red-600">{stats.urgent}</div>
            <div className="text-xs text-slate-600">Urgent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-slate-800 mx-auto mb-1" />
            <div className="text-xl font-bold text-slate-800">{stats.avgProcessingTime}d</div>
            <div className="text-xs text-slate-600">Avg Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search approvals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="policy">Policy</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setSearchTerm('')
                setTypeFilter('all')
                setPriorityFilter('all')
                setStatusFilter('PENDING')
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approvals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredApprovals.map((approval) => (
          <Card 
            key={approval.id} 
            className={`hover:shadow-lg transition-shadow cursor-pointer ${
              approval.priority === 'URGENT' ? 'border-red-500 border-2' : ''
            }`}
            onClick={() => setSelectedItem(approval)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
                  {getTypeIcon(approval.type)}
                  {approval.title}
                </CardTitle>
                <Badge className={getPriorityColor(approval.priority)}>
                  {approval.priority}
                </Badge>
              </div>
              <div className="text-sm text-slate-600">
                {approval.submittedBy.department} • {approval.submittedBy.name}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-600 line-clamp-3">{approval.description}</p>
              
              {approval.estimatedCost && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>₹{approval.estimatedCost.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>Submitted {getDaysWaiting(approval.submittedAt)} days ago</span>
              </div>

              {approval.timeframe && (
                <div className="text-sm text-slate-600">
                  <span className="font-medium">Timeframe:</span> {approval.timeframe}
                </div>
              )}

              <Badge variant="outline" className="w-fit">
                {approval.type.replace('_', ' ').toUpperCase()}
              </Badge>

              {approval.priority === 'URGENT' && (
                <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700 text-sm">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Requires immediate attention
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedItem.type)}
                  {selectedItem.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(selectedItem.priority)}>
                    {selectedItem.priority}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
                    ×
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="impact">Impact</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="decision">Decision</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-slate-600">{selectedItem.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Submitted By</h4>
                        <div className="text-sm">
                          <div>{selectedItem.submittedBy.name}</div>
                          <div className="text-slate-600">{selectedItem.submittedBy.role}</div>
                          <div className="text-slate-600">{selectedItem.submittedBy.department}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Timeline</h4>
                        <div className="text-sm">
                          <div>Submitted: {new Date(selectedItem.submittedAt).toLocaleDateString()}</div>
                          <div>Days waiting: {getDaysWaiting(selectedItem.submittedAt)}</div>
                          {selectedItem.timeframe && (
                            <div>Expected duration: {selectedItem.timeframe}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedItem.stakeholders.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Stakeholders</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.stakeholders.map((stakeholder, index) => (
                            <Badge key={index} variant="outline">{stakeholder}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="impact" className="mt-4">
                  <div className="space-y-4">
                    {selectedItem.estimatedCost && (
                      <div>
                        <h4 className="font-semibold mb-2">Financial Impact</h4>
                        <div className="bg-emerald-50 p-3 rounded">
                          <div className="text-lg font-bold text-emerald-600">
                            ₹{selectedItem.estimatedCost.toLocaleString()}
                          </div>
                          {selectedItem.budgetImpact && (
                            <div className="text-sm text-emerald-700 mt-1">{selectedItem.budgetImpact}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedItem.publicImpact && (
                      <div>
                        <h4 className="font-semibold mb-2">Public Impact</h4>
                        <p className="text-slate-600">{selectedItem.publicImpact}</p>
                      </div>
                    )}

                    {selectedItem.benefits && selectedItem.benefits.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Expected Benefits</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedItem.benefits.map((benefit, index) => (
                            <li key={index} className="text-green-700">{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedItem.risks && selectedItem.risks.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Risks & Concerns</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedItem.risks.map((risk, index) => (
                            <li key={index} className="text-red-700">{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="mt-4">
                  <div className="space-y-3">
                    {selectedItem.documents.length === 0 ? (
                      <div className="text-center py-8 text-slate-600">
                        No documents attached
                      </div>
                    ) : (
                      selectedItem.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-emerald-600" />
                            <div>
                              <div className="font-medium">{doc.name}</div>
                              <div className="text-sm text-slate-600">{doc.type}</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="decision" className="mt-4">
                  {selectedItem.status === 'PENDING' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
                        <Textarea
                          placeholder="Add any comments or conditions for this decision..."
                          className="min-h-[100px]"
                          id="decision-comment"
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            const comment = (document.getElementById('decision-comment') as HTMLTextAreaElement)?.value
                            handleApproval(selectedItem.id, 'approve', comment)
                          }}
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => {
                            const comment = (document.getElementById('decision-comment') as HTMLTextAreaElement)?.value
                            handleApproval(selectedItem.id, 'reject', comment)
                          }}
                          disabled={actionLoading}
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => {
                            const comment = (document.getElementById('decision-comment') as HTMLTextAreaElement)?.value
                            handleApproval(selectedItem.id, 'review', comment)
                          }}
                          disabled={actionLoading}
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Mark for Review
                        </Button>
                      </div>

                      {selectedItem.legalCompliance === false && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700">
                          <AlertTriangle className="h-4 w-4 inline mr-2" />
                          Legal compliance review required before approval
                        </div>
                      )}
                    </div>
                  )}

                  {selectedItem.status !== 'PENDING' && (
                    <div className="text-center py-8">
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        Status: {selectedItem.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}