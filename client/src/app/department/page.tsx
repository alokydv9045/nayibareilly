'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import { 
  Users, CheckCircle, Clock, User, MapPin, Calendar, UserPlus,
  Droplets, Activity, AlertTriangle, Shield, Bell, Loader2
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

  // Get user info
  useEffect(() => {
    const userData = userStorage.get()
    if (userData) {
      setUser(userData as { id: string; name: string; departmentId?: string; roles?: string[] })
    }
  }, [])

  const departmentId = user?.departmentId || ''

  // Fetch department data
  const { data: triagedIssues = [], isLoading: loadingTriaged, refetch: refetchTriaged } = useDepartmentIssues(departmentId, 'TRIAGED')
  const { data: inProgressWork = [], isLoading: loadingInProgress, refetch: refetchInProgress } = useDepartmentIssues(departmentId, 'ASSIGNED_TO_STAFF,IN_PROGRESS')
  const { data: staffList = [], isLoading: loadingStaff } = useDepartmentStaff(departmentId)
  const { data: stats, refetch: refetchStats } = useDepartmentStats(departmentId)
  
  const assignMutation = useAssignIssueToStaff()

  // Handle issue assignment
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
      
      toast.success(`Issue assigned to staff successfully`)
      setShowAssignDialog(false)
      refetchTriaged()
      refetchInProgress()
      refetchStats()
    } catch {
      toast.error('Failed to assign issue')
    }
  }

  // Filter issues by search term
  const filteredTriagedIssues = triagedIssues.filter(issue => 
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredInProgress = inProgressWork.filter(issue => 
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/50 pb-8 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Municipal Department Dashboard</h1>
          <p className="text-xs text-blue-600/60 mt-0.5">Municipal Corporation — Welcome, {user.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-500/20 text-blue-600 border border-blue-200 gap-1.5">
            <Shield className="h-3 w-3" />
            Dept Admin
          </Badge>
          <Button size="sm" variant="ghost"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs">Total Issues</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalIssues || 0}</p>
                  <p className="text-xs text-blue-600">Assigned & Unassigned</p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs">Unassigned Issues</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.unassignedIssues || 0}</p>
                  <p className="text-xs text-orange-600">Awaiting Triage</p>
                </div>
                <div className="p-2 bg-orange-500/10 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs">Active Repairs</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.inProgressIssues || 0}</p>
                  <p className="text-xs text-cyan-600">Field work in progress</p>
                </div>
                <div className="p-2 bg-cyan-500/10 rounded-xl">
                  <Clock className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs">Total Staff</p>
                  <p className="text-3xl font-bold text-gray-900">{staffList.length}</p>
                  <p className="text-xs text-green-600">Active Technicians</p>
                </div>
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-gray-900">
              Overview
            </TabsTrigger>
            <TabsTrigger value="new-issues" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-gray-900">
              New Issues ({filteredTriagedIssues.length})
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-gray-900">
              Active Repairs ({filteredInProgress.length})
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-gray-900">
              Department Staff ({staffList.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span>Recent Issue Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Average Resolution Time:</span>
                      <span className="text-base font-bold text-gray-900">{stats?.avgResponseTime || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Resolved Today:</span>
                      <span className="text-base font-bold text-emerald-600">{stats?.resolvedToday || 0} issues</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Active Workload Rate:</span>
                      <span className="text-base font-bold text-blue-600">
                        {stats?.totalIssues ? Math.round(((stats.inProgressIssues + stats.unassignedIssues) / stats.totalIssues) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span>Technician Workload Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {staffList.slice(0, 4).map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                        <div>
                          <p className="text-gray-900 text-sm font-medium">{staff.name}</p>
                          <p className="text-xs text-blue-600">{staff.email}</p>
                        </div>
                        <Badge className={`
                          ${staff.workloadStatus === 'available' ? 'bg-green-500' : 
                            staff.workloadStatus === 'light' ? 'bg-blue-500' : 
                            staff.workloadStatus === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'}
                          text-white font-semibold text-xs
                        `}>
                          {staff.activeIssues} tasks ({staff.workloadStatus})
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* New Issues Tab */}
          <TabsContent value="new-issues" className="space-y-6">
            <div className="flex items-center space-x-4 mb-4">
              <Input
                placeholder="Search new issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md bg-white border-gray-200 text-gray-900"
              />
            </div>

            <div className="grid gap-4">
              {loadingTriaged ? (
                <div className="text-center text-gray-900 py-8">Loading issues...</div>
              ) : filteredTriagedIssues.length === 0 ? (
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-8 text-center text-gray-600">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p>No new triaged issues waiting for assignment</p>
                  </CardContent>
                </Card>
              ) : (
                filteredTriagedIssues.map((issue) => (
                  <Card key={issue.id} className="bg-white border-gray-200 hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {getIssueIcon(issue.category.name)}
                            <h3 className="text-gray-900 font-semibold">{issue.title}</h3>
                            <Badge className={getPriorityColor(issue.priority)}>
                              {issue.priority}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{issue.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-amber-600/80">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {issue.location || 'No Location'}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(issue.createdAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {issue.reporter.name}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-600/10 border-blue-500 text-blue-600 hover:bg-blue-600/20"
                          onClick={() => handleAssignClick(issue)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Assign Staff
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Active Repairs Tab */}
          <TabsContent value="ongoing" className="space-y-6">
            <div className="flex items-center space-x-4 mb-4">
              <Input
                placeholder="Search active repairs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md bg-white border-gray-200 text-gray-900"
              />
            </div>

            <div className="grid gap-4">
              {loadingInProgress ? (
                <div className="text-center text-gray-900 py-8">Loading repairs...</div>
              ) : filteredInProgress.length === 0 ? (
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-8 text-center text-gray-600">
                    <Clock className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
                    <p>No active repairs currently in progress</p>
                  </CardContent>
                </Card>
              ) : (
                filteredInProgress.map((issue) => (
                  <Card key={issue.id} className="bg-white border-gray-200 hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {getIssueIcon(issue.category.name)}
                            <h3 className="text-gray-900 font-semibold">{issue.title}</h3>
                            <Badge className="bg-cyan-500 text-white font-semibold">IN REPAIR</Badge>
                            <Badge className={getPriorityColor(issue.priority)}>
                              {issue.priority}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{issue.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-amber-600/80">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {issue.location || 'No Location'}</span>
                            <span className="flex items-center gap-1"><User className="h-3 w-3" /> Technician: {issue.assignedTo?.name || 'Unassigned'}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Started: {issue.assignedToDepartmentAt ? new Date(issue.assignedToDepartmentAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Department Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <div className="grid gap-4">
              {loadingStaff ? (
                <div className="text-center text-gray-900 py-8">Loading staff...</div>
              ) : staffList.length === 0 ? (
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-8 text-center text-gray-600">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>No staff members assigned to this department yet</p>
                  </CardContent>
                </Card>
              ) : (
                staffList.map((staff) => (
                  <Card key={staff.id} className="bg-white border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-white text-lg">
                              {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                            <p className="text-xs text-blue-600">{staff.email}</p>
                            <Badge className="bg-teal-500 text-white font-semibold text-xs mt-1">
                              Technician
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{staff.activeIssues} Active Tasks</p>
                          <Badge className={`
                            ${staff.workloadStatus === 'available' ? 'bg-green-500' : 
                              staff.workloadStatus === 'light' ? 'bg-blue-500' : 
                              staff.workloadStatus === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'}
                            text-white font-semibold text-xs mt-1
                          `}>
                            {staff.workloadStatus}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="bg-white border border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle>Assign Issue to Technician</DialogTitle>
            <DialogDescription className="text-gray-600">
              Select an available technician to handle this task
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-900">Select Technician</label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                  <SelectValue placeholder="Choose a technician..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {staffList.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id} className="text-gray-900 hover:bg-amber-100">
                      {staff.name} - {staff.activeIssues} active tasks ({staff.workloadStatus})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-900">Assignment Instructions</label>
              <Textarea
                placeholder="Provide instructions for the technician..."
                value={assignmentNote}
                onChange={(e) => setAssignmentNote(e.target.value)}
                className="bg-white border-gray-200 text-gray-900"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAssignDialog(false)}
              className="border-gray-200 text-gray-900 hover:bg-amber-100"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignSubmit}
              disabled={!selectedStaffId || assignMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

