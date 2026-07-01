'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import { 
  Users, CheckCircle, Clock, User, MapPin, Calendar, UserPlus, Eye, RefreshCw,
  Construction, HardHat, Wrench, Truck,
  Activity, BarChart3, Zap
} from 'lucide-react'
import { userStorage } from '@/lib/auth/auth-utils'
import { useDepartmentIssues, useDepartmentStaff, useAssignIssueToStaff, useDepartmentStats, type DepartmentIssue } from '@/hooks/api/useDepartments'

export default function InfrastructureDepartmentPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [user, setUser] = useState<{ id: string; name: string; departmentId?: string } | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<DepartmentIssue | null>(null)
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')
  const [assignmentNote, setAssignmentNote] = useState<string>('')
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [issueFilter, setIssueFilter] = useState('all')

  // Get user info
  useEffect(() => {
    const userData = userStorage.get()
    if (userData) {
      setUser(userData as { id: string; name: string; departmentId?: string })
    }
  }, [])

  const departmentId = user?.departmentId || 'infrastructure-dept-id'

  // Fetch Infrastructure department data
  const { data: allIssues = [], isLoading: loadingIssues, refetch: refetchIssues } = useDepartmentIssues(departmentId, 'TRIAGED')
  const { data: inProgressWork = [], isLoading: loadingInProgress, refetch: refetchInProgress } = useDepartmentIssues(departmentId, 'ASSIGNED_TO_STAFF,IN_PROGRESS')
  const { data: infrastructureStaff = [], isLoading: loadingStaff } = useDepartmentStaff(departmentId)
  const { data: stats } = useDepartmentStats(departmentId)
  
  const assignMutation = useAssignIssueToStaff()

  // Filter issues by category (PWD only - no traffic)
  const pwdIssues = allIssues.filter(issue => 
    issue.category.name.toLowerCase().includes('road') ||
    issue.category.name.toLowerCase().includes('construction') ||
    issue.category.name.toLowerCase().includes('infrastructure') ||
    issue.category.name.toLowerCase().includes('pothole') ||
    issue.category.name.toLowerCase().includes('bridge')
  )

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
      
      toast.success(`Issue assigned successfully`)
      setShowAssignDialog(false)
      refetchIssues()
      refetchInProgress()
    } catch {
      toast.error('Failed to assign issue')
    }
  }

  // Filter logic
  const getFilteredIssues = () => {
    let filtered = allIssues
    if (issueFilter === 'pwd') filtered = pwdIssues
    
    return filtered.filter(issue => 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const filteredIssues = getFilteredIssues()
  const filteredInProgress = inProgressWork.filter(issue => 
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-600 text-white'
      case 'HIGH': return 'bg-orange-500 text-white'
      case 'MEDIUM': return 'bg-yellow-500 text-black'
      case 'LOW': return 'bg-green-500 text-white'
      default: return 'bg-slate-500 text-white'
    }
  }

  // Issue type mapping for infrastructure only
  const getIssueIcon = (category: string) => {
    if (category.toLowerCase().includes('road') || category.toLowerCase().includes('pothole')) return <Construction className="h-4 w-4" />
    if (category.toLowerCase().includes('bridge') || category.toLowerCase().includes('infrastructure')) return <Wrench className="h-4 w-4" />
    return <HardHat className="h-4 w-4" />
  }

  // Infrastructure staff only (no traffic officers)
  const pwdStaff = infrastructureStaff.filter(staff => 
    staff.name.toLowerCase().includes('engineer') ||
    staff.email.toLowerCase().includes('pwd') ||
    staff.roles.some(role => role.toLowerCase().includes('pwd'))
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-emerald-600/20 rounded-xl border border-emerald-500/30">
              <Construction className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Infrastructure & Public Works</h1>
              <p className="text-emerald-200">Roads, Construction & Public Infrastructure Development</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 text-sm">Total Issues</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalIssues || 0}</p>
                    <p className="text-xs text-blue-400">PWD + Traffic</p>
                  </div>
                  <Construction className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-sm">In Progress</p>
                    <p className="text-2xl font-bold text-white">{stats?.inProgressIssues || 0}</p>
                    <p className="text-xs text-orange-400">Active Work</p>
                  </div>
                  <RefreshCw className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm">Completed Today</p>
                    <p className="text-2xl font-bold text-white">{stats?.resolvedToday || 0}</p>
                    <p className="text-xs text-green-400">Resolved</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-200 text-sm">Staff Members</p>
                    <p className="text-2xl font-bold text-white">{infrastructureStaff.length}</p>
                    <p className="text-xs text-yellow-400">Engineers & Officers</p>
                  </div>
                  <Users className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-emerald-600/30">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="new-issues" className="data-[state=active]:bg-emerald-600/30">
              New Issues ({filteredIssues.length})
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="data-[state=active]:bg-emerald-600/30">
              Active Work ({filteredInProgress.length})
            </TabsTrigger>
            <TabsTrigger value="pwd-staff" className="data-[state=active]:bg-emerald-600/30">
              PWD Staff ({pwdStaff.length})
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-emerald-600/30">
              Infrastructure Control
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Issue Distribution */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    <span>Issue Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: 'Road Infrastructure', count: pwdIssues.length, color: 'bg-orange-500', icon: Construction },
                      { type: 'Bridge & Drainage', count: 8, color: 'bg-emerald-500', icon: Wrench },
                      { type: 'Street Lighting', count: 5, color: 'bg-yellow-500', icon: Zap },
                      { type: 'Construction Projects', count: 12, color: 'bg-green-500', icon: HardHat }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-5 w-5 text-emerald-300" />
                          <span className="text-white text-sm">{item.type}</span>
                        </div>
                        <Badge className="bg-white/20 text-white">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Staff Workload Summary */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span>Staff Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-orange-600/20 border border-orange-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <HardHat className="h-5 w-5 text-orange-400" />
                          <span className="text-white font-medium">PWD Engineers</span>
                        </div>
                        <Badge className="bg-orange-600 text-white">{pwdStaff.length}</Badge>
                      </div>
                      <p className="text-orange-200 text-xs">Roads, Construction & Infrastructure</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-400" />
                    <span>Recent Activities</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { action: 'Road repair completed', location: 'Main Market Road', time: '2 hours ago', type: 'pwd' },
                      { action: 'Traffic signal fixed', location: 'Railway Crossing', time: '4 hours ago', type: 'traffic' },
                      { action: 'Pothole filling started', location: 'Civil Lines', time: '6 hours ago', type: 'pwd' },
                      { action: 'Parking issue resolved', location: 'Bus Stand', time: '8 hours ago', type: 'traffic' }
                    ].map((activity, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm font-medium">{activity.action}</span>
                          <Badge className={`text-xs ${activity.type === 'pwd' ? 'bg-orange-600' : 'bg-red-600'} text-white`}>
                            {activity.type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-emerald-300 text-xs">
                          <span>{activity.location}</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Equipment Status */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Truck className="h-5 w-5 text-blue-400" />
                    <span>Equipment Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { equipment: 'Road Rollers', available: 4, total: 5, status: 'Good' },
                      { equipment: 'Traffic Cameras', available: 18, total: 20, status: 'Excellent' },
                      { equipment: 'Excavators', available: 6, total: 8, status: 'Fair' },
                      { equipment: 'Signal Controllers', available: 25, total: 28, status: 'Good' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">{item.equipment}</p>
                          <p className="text-emerald-300 text-xs">{item.available}/{item.total} Available</p>
                        </div>
                        <Badge className={`text-xs ${
                          item.status === 'Excellent' ? 'bg-green-600' : 
                          item.status === 'Good' ? 'bg-emerald-600' : 'bg-yellow-600'
                        } text-white`}>
                          {item.status}
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
            <div className="flex items-center space-x-4 mb-6">
              <Input
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md bg-white/10 border-white/20 text-white placeholder:text-emerald-300"
              />
              <Select value={issueFilter} onValueChange={setIssueFilter}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="all" className="text-white">All Issues</SelectItem>
                  <SelectItem value="pwd" className="text-white">Infrastructure Issues ({pwdIssues.length})</SelectItem>
                </SelectContent>
              </Select>
              <Badge className="bg-emerald-600/30 text-emerald-200">
                {filteredIssues.length} Issues
              </Badge>
            </div>

            <div className="grid gap-4">
              {loadingIssues ? (
                <div className="text-center text-white py-8">Loading issues...</div>
              ) : filteredIssues.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-8 text-center">
                    <Construction className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <p className="text-white">No issues found</p>
                    <p className="text-emerald-300 text-sm">All issues are assigned or completed</p>
                  </CardContent>
                </Card>
              ) : (
                filteredIssues.map((issue) => (
                  <Card key={issue.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {getIssueIcon(issue.category.name)}
                            <h3 className="text-white font-semibold">{issue.title}</h3>
                            <Badge className={getPriorityColor(issue.priority)}>
                              {issue.priority}
                            </Badge>
                            <Badge className={`text-xs bg-orange-600 text-white`}>
                              INFRASTRUCTURE
                            </Badge>
                          </div>
                          
                          <p className="text-emerald-200 text-sm mb-3 line-clamp-2">{issue.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-emerald-300">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{issue.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{issue.reporter.name}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-emerald-600/20 border-emerald-500 text-emerald-300 hover:bg-emerald-600/30"
                            onClick={() => handleAssignClick(issue)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign Staff
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Active Work Tab */}
          <TabsContent value="ongoing" className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <Input
                placeholder="Search active work..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md bg-white/10 border-white/20 text-white placeholder:text-emerald-300"
              />
              <Badge className="bg-orange-600/30 text-orange-200">
                {filteredInProgress.length} Active Work
              </Badge>
            </div>

            <div className="grid gap-4">
              {loadingInProgress ? (
                <div className="text-center text-white py-8">Loading active work...</div>
              ) : filteredInProgress.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-8 text-center">
                    <RefreshCw className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                    <p className="text-white">No active work</p>
                    <p className="text-emerald-300 text-sm">All work is either pending or completed</p>
                  </CardContent>
                </Card>
              ) : (
                filteredInProgress.map((issue) => (
                  <Card key={issue.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {getIssueIcon(issue.category.name)}
                            <h3 className="text-white font-semibold">{issue.title}</h3>
                            <Badge className="bg-orange-600 text-white">IN PROGRESS</Badge>
                            <Badge className={getPriorityColor(issue.priority)}>
                              {issue.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-emerald-200 text-sm mb-3 line-clamp-2">{issue.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-emerald-300">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{issue.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>Assigned: {issue.assignedTo?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Started: {issue.assignedToDepartmentAt ? new Date(issue.assignedToDepartmentAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>Progress: {Math.floor(Math.random() * 60 + 30)}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-600/20 border-green-500 text-green-300 hover:bg-green-600/30"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Track Progress
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* PWD Staff Tab */}
          <TabsContent value="pwd-staff" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">PWD Engineering Staff</h2>
              <Badge className="bg-orange-600/30 text-orange-200">
                {pwdStaff.length} Engineers
              </Badge>
            </div>

            <div className="grid gap-4">
              {loadingStaff ? (
                <div className="text-center text-white py-8">Loading PWD staff...</div>
              ) : pwdStaff.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-8 text-center">
                    <HardHat className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                    <p className="text-white">No PWD staff members found</p>
                  </CardContent>
                </Card>
              ) : (
                pwdStaff.map((staff) => (
                  <Card key={staff.id} className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-orange-600/30 rounded-full flex items-center justify-center">
                            <HardHat className="h-6 w-6 text-orange-300" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{staff.name}</h3>
                            <p className="text-orange-300 text-sm">{staff.email}</p>
                            <p className="text-orange-400 text-xs">PWD Engineer</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-white text-sm font-medium">{staff.activeIssues} Active Projects</p>
                            <Badge className={`
                              ${staff.workloadStatus === 'available' ? 'bg-green-600' : 
                                staff.workloadStatus === 'light' ? 'bg-yellow-600' : 
                                staff.workloadStatus === 'moderate' ? 'bg-orange-600' : 'bg-red-600'}
                              text-white text-xs
                            `}>
                              {staff.workloadStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Infrastructure Control Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Infrastructure Control Center</h2>
              <Badge className="bg-green-600/30 text-green-200">Systems Online</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Infrastructure Control Points */}
              {[
                { location: 'Main Market Road', type: 'PWD Project', status: 'Under Construction', progress: '65%', team: 'Team A' },
                { location: 'Railway Station Road', type: 'Road Repair', status: 'In Progress', progress: '85%', team: 'Team B' },
                { location: 'Civil Lines Bridge', type: 'PWD Repair', status: 'In Progress', progress: '40%', team: 'Team B' },
                { location: 'Industrial Area Gate', type: 'PWD Expansion', status: 'Planning', progress: '10%', team: 'Team C' },
                { location: 'Hospital Area Road', type: 'Street Lighting', status: 'Maintenance', lights: 24, working: 20 },
                { location: 'School Zone', type: 'Road Safety', status: 'Completed', progress: '100%', team: 'Team A' }
              ].map((point, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Construction className="h-8 w-8 text-orange-400" />
                      <Badge className={`
                        ${point.status === 'Completed' ? 'bg-green-600' : 
                          point.status === 'Maintenance' ? 'bg-yellow-600' : 
                          point.status.includes('Progress') || point.status.includes('Construction') ? 'bg-orange-600' : 'bg-emerald-600'}
                        text-white
                      `}>
                        {point.status}
                      </Badge>
                    </div>
                    <h3 className="text-white font-semibold mb-2 text-sm">{point.location}</h3>
                    <p className="text-emerald-200 text-xs mb-4">{point.type}</p>
                    <div className="space-y-2">
                      {point.progress && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-emerald-200 text-sm">Progress:</span>
                            <span className="text-white text-sm">{point.progress}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-orange-500" 
                              style={{ width: point.progress }}
                            ></div>
                          </div>
                        </div>
                      )}
                      {point.team && (
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-200 text-sm">Team:</span>
                          <span className="text-orange-300 text-sm">{point.team}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Assignment Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="bg-slate-900 border border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>Assign Issue to Staff Member</DialogTitle>
              <DialogDescription className="text-emerald-300">
                Select appropriate staff member based on issue type
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Staff Member</label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Choose staff member..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    {infrastructureStaff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id} className="text-white">
                        {staff.name} - {staff.activeIssues} active issues ({staff.workloadStatus})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Assignment Notes</label>
                <Textarea
                  placeholder="Add any specific instructions..."
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-emerald-300"
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowAssignDialog(false)}
                className="border-white/20 text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAssignSubmit}
                disabled={!selectedStaffId || assignMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {assignMutation.isPending ? 'Assigning...' : 'Assign Issue'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}