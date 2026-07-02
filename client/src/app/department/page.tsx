'use client'
import AnimatedHeading from '@/components/ui/AnimatedHeading'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast, Toaster } from 'react-hot-toast'
import { 
  Users, CheckCircle, Clock, MapPin, 
  Droplets, Activity, AlertTriangle, Loader2
} from 'lucide-react'
import { userStorage } from '@/lib/auth/auth-utils'
import { useDepartmentIssues, useDepartmentStaff, useAssignIssueToStaff, useDepartmentStats, type DepartmentIssue } from '@/hooks/api/useDepartments'

export default function UnifiedDepartmentPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [user, setUser] = useState<{ id: string; name: string; departmentId?: string; roles?: string[] } | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<DepartmentIssue | null>(null)
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')
  const [assignmentNote, setAssignmentNote] = useState<string>('')
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const userData = userStorage.get()
    if (userData) {
      setUser(userData as { id: string; name: string; departmentId?: string; roles?: string[] })
    }
  }, [])

  const departmentId = user?.departmentId || ''

  const { data: triagedIssues = [], isLoading: loadingTriaged, refetch: refetchTriaged } = useDepartmentIssues(departmentId, 'TRIAGED')
  const { data: inProgressWork = [], isLoading: loadingInProgress, refetch: refetchInProgress } = useDepartmentIssues(departmentId, 'ASSIGNED_TO_STAFF,IN_PROGRESS')
  const { data: staffList = [], isLoading: loadingStaff } = useDepartmentStaff(departmentId)
  const { data: stats, refetch: refetchStats } = useDepartmentStats(departmentId)
  
  const assignMutation = useAssignIssueToStaff()

  const handleAssignClick = (issue: DepartmentIssue) => {
    setSelectedIssue(issue)
    setSelectedStaffId('')
    setAssignmentNote('')
    setShowAssignDialog(true)
  }

  const handleAssignSubmit = async () => {
    if (!selectedIssue || !selectedStaffId) return

    try {
      await assignMutation.mutateAsync({
        issueId: selectedIssue.id,
        staffUserId: selectedStaffId,
        note: assignmentNote
      })
      
      toast.success('Issue assigned to staff successfully')
      setShowAssignDialog(false)
      refetchTriaged()
      refetchInProgress()
      refetchStats()
    } catch {
      toast.error('Failed to assign issue')
    }
  }

  const filteredTriagedIssues = triagedIssues.filter(issue => 
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-600 text-white font-semibold'
      case 'HIGH': return 'bg-orange-500 text-white font-semibold'
      case 'MEDIUM': return 'bg-blue-500 text-white font-semibold'
      case 'LOW': return 'bg-green-500 text-white font-semibold'
      default: return 'bg-gray-500 text-white font-semibold'
    }
  }

  const getIssueIcon = (category: string) => {
    const cat = category.toLowerCase()
    if (cat.includes('water') || cat.includes('sewer') || cat.includes('drain')) return <Droplets className="h-4 w-4" />
    if (cat.includes('road') || cat.includes('light') || cat.includes('street')) return <Activity className="h-4 w-4" />
    return <AlertTriangle className="h-4 w-4" />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-white"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl border border-blue-200">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <AnimatedHeading as="h1" className="text-3xl font-bold text-gray-900">Department Dashboard</AnimatedHeading>
              <p className="text-gray-600">Municipal Department Management</p>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome, {user.name}</h2>
            <p className="text-gray-600">
              Manage your department's issues, staff assignments, and analytics.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Overview Dashboard
            </TabsTrigger>
            <TabsTrigger value="issues" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Issue Management
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Staff Directory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Active Issues</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalIssues || 0}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Resolved Today</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.resolvedToday || 0}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">In Progress</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.inProgressIssues || 0}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Staff</p>
                      <p className="text-2xl font-bold text-gray-900">{staffList.length || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle>Issues Awaiting Assignment</CardTitle>
                <CardDescription>Assign verified issues to your field technicians</CardDescription>
                <div className="mt-4">
                  <Input 
                    placeholder="Search by title or location..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loadingTriaged ? (
                  <div className="py-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                ) : filteredTriagedIssues.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">No issues found.</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredTriagedIssues.map(issue => (
                      <div key={issue.id} className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                            <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{issue.description}</p>
                          <div className="text-xs text-gray-500 flex items-center mb-4">
                            <MapPin className="h-3 w-3 mr-1" /> {issue.location}
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleAssignClick(issue)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Assign Technician
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle>Department Staff</CardTitle>
                <CardDescription>Overview of technicians and their current workload</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStaff ? (
                  <div className="py-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                ) : staffList.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">No staff found.</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {staffList.map(staff => (
                      <div key={staff.id} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                        <p className="text-sm text-gray-500">{staff.email}</p>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-sm text-gray-600">Workload</span>
                          <Badge variant="outline" className={staff.activeIssues > 5 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}>
                            {staff.activeIssues} tasks
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle>Assign Issue</DialogTitle>
            <DialogDescription>
              Assign <strong>{selectedIssue?.title}</strong> to a technician.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Technician</label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff..." />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name} ({staff.activeIssues} tasks)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Notes (Optional)</label>
              <Textarea 
                value={assignmentNote} 
                onChange={(e) => setAssignmentNote(e.target.value)}
                placeholder="Any special instructions..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAssignSubmit} 
              disabled={!selectedStaffId || assignMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
