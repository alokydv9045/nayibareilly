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
<<<<<<< HEAD
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
=======
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9
      </div>
    )
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-emerald-600/20 rounded-xl border border-emerald-500/30">
              <Building className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Department Administration</h1>
              <p className="text-emerald-200">Municipal Department Management & Oversight</p>
            </div>
          </div>
          
          {/* Welcome Message */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Welcome, {user.name}</h2>
            <p className="text-emerald-200">
              Manage municipal services across core departments. Select a department below to access specialized tools and staff management.
            </p>
          </div>
=======
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
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
<<<<<<< HEAD
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600/30">
              Department Overview
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-emerald-600/30">
              All Staff Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-emerald-600/30">
              Analytics & Reports
=======
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
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9
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
<<<<<<< HEAD
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-green-200 text-xs">Environmental Cases</p>
                        <p className="text-white text-lg font-bold">16</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-green-200 text-xs">Staff Members</p>
                        <p className="text-white text-lg font-bold">18</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-200">Environmental Staff</span>
                        <span className="text-white">18 Officers</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-green-600/30 hover:bg-green-600/50 border border-green-500/30 text-green-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigateToDepartment('health-environment')
                      }}
                    >
                      Access Department
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Water Supply & Utilities */}
              <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-lg border-emerald-500/30 hover:border-blue-400/50 transition-all group cursor-pointer"
                    onClick={() => navigateToDepartment('water')}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-emerald-600/30 rounded-xl">
                        <Droplets className="h-6 w-6 text-emerald-300" />
                      </div>
                      <div>
                        <CardTitle className="text-white group-hover:text-emerald-200 transition-colors">
                          Water Supply & Utilities
                        </CardTitle>
                        <p className="text-emerald-200 text-sm">Water, Sewerage & Utilities</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-emerald-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-emerald-200 text-xs">Active Connections</p>
                        <p className="text-white text-lg font-bold">1,245</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-emerald-200 text-xs">Staff Members</p>
                        <p className="text-white text-lg font-bold">15</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-200">Water Quality</span>
                        <Badge className="bg-green-600 text-white text-xs">Excellent</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-200">System Status</span>
                        <Badge className="bg-emerald-600 text-white text-xs">Operational</Badge>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/30 text-emerald-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigateToDepartment('water')
                      }}
                    >
                      Access Department
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-200 text-sm">Total Active Issues</p>
                      <p className="text-2xl font-bold text-white">68</p>
                      <p className="text-xs text-blue-400">Across All Departments</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm">Resolved Today</p>
                      <p className="text-2xl font-bold text-white">12</p>
                      <p className="text-xs text-green-400">94% Resolution Rate</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-200 text-sm">In Progress</p>
                      <p className="text-2xl font-bold text-white">28</p>
                      <p className="text-xs text-orange-400">Active Work</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">Total Staff</p>
                      <p className="text-2xl font-bold text-white">55</p>
                      <p className="text-xs text-purple-400">All Departments</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Staff Management Tab */}
          <TabsContent value="staff" className="space-y-6">
            <div className="grid gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Staff Overview by Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { dept: 'Infrastructure & Public Works', total: 15, available: 12, busy: 3, color: 'orange' },
                      { dept: 'Environmental Services', total: 18, available: 14, busy: 4, color: 'green' },
                      { dept: 'Water Supply & Utilities', total: 15, available: 12, busy: 3, color: 'blue' }
                    ].map((dept, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full bg-${dept.color}-500`}></div>
                          <div>
                            <h3 className="text-white font-medium">{dept.dept}</h3>
                            <p className="text-slate-300 text-sm">{dept.total} Total Staff</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-green-400 text-sm">{dept.available} Available</p>
                            <p className="text-yellow-400 text-sm">{dept.busy} Busy</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            onClick={() => {
                              const deptPath = dept.dept.includes('Infrastructure') ? 'infrastructure' :
                                              dept.dept.includes('Health') ? 'health-environment' : 'water'
                              navigateToDepartment(deptPath)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Staff
                          </Button>
=======
                  <div className="space-y-3">
                    {staffList.slice(0, 4).map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                        <div>
                          <p className="text-gray-900 text-sm font-medium">{staff.name}</p>
                          <p className="text-xs text-blue-600">{staff.email}</p>
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9
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

<<<<<<< HEAD
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { metric: 'Average Resolution Time', value: '4.2 hours', trend: '+12%', good: true },
                      { metric: 'Citizen Satisfaction', value: '87%', trend: '+5%', good: true },
                      { metric: 'Staff Utilization', value: '78%', trend: '-3%', good: false },
                      { metric: 'Issue Prevention', value: '65%', trend: '+8%', good: true }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">{item.metric}</p>
                          <p className="text-emerald-300 text-xs">Performance indicator</p>
=======
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
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9
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
<<<<<<< HEAD
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>{dept.issues} Active Issues</span>
                          <span>Avg: {dept.avgTime}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${
                              dept.efficiency >= 90 ? 'bg-green-500' : 
                              dept.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${dept.efficiency}%` }}
                          ></div>
                        </div>
=======
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9
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

