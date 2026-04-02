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
  Users, CheckCircle, Clock, User, MapPin, Calendar, UserPlus, Eye,
  Trash2, Leaf, Recycle, Shield, AlertTriangle,
  Activity, BarChart3, TrendingUp, Droplets
} from 'lucide-react'
import { userStorage } from '@/lib/auth/auth-utils'
import { useDepartmentIssues, useDepartmentStaff, useAssignIssueToStaff, useDepartmentStats, type DepartmentIssue } from '@/hooks/api/useDepartments'

export default function EnvironmentalServicesPage() {
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

  const departmentId = user?.departmentId || 'health-env-dept-id'

  // Fetch Health & Environment department data
  const { data: allIssues = [], isLoading: loadingIssues, refetch: refetchIssues } = useDepartmentIssues(departmentId, 'TRIAGED')
  const { data: inProgressWork = [], isLoading: loadingInProgress, refetch: refetchInProgress } = useDepartmentIssues(departmentId, 'ASSIGNED_TO_STAFF,IN_PROGRESS')
  const { data: healthEnvStaff = [], isLoading: loadingStaff } = useDepartmentStaff(departmentId)
  const { data: stats } = useDepartmentStats(departmentId)
  
  const assignMutation = useAssignIssueToStaff()

  // Filter issues by category (Environmental only - no health/medical)
  const environmentIssues = allIssues.filter(issue => 
    issue.category.name.toLowerCase().includes('waste') ||
    issue.category.name.toLowerCase().includes('garbage') ||
    issue.category.name.toLowerCase().includes('pollution') ||
    issue.category.name.toLowerCase().includes('environment') ||
    issue.category.name.toLowerCase().includes('cleaning') ||
    issue.category.name.toLowerCase().includes('sanitation')
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
    if (issueFilter === 'environment') filtered = environmentIssues
    
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
      default: return 'bg-gray-500 text-white'
    }
  }

  // Issue type mapping for environmental services only
  const getIssueIcon = (category: string) => {
    if (category.toLowerCase().includes('waste') || category.toLowerCase().includes('garbage')) return <Trash2 className="h-4 w-4" />
    if (category.toLowerCase().includes('pollution') || category.toLowerCase().includes('environment')) return <Leaf className="h-4 w-4" />
    if (category.toLowerCase().includes('sanitation') || category.toLowerCase().includes('cleaning')) return <Droplets className="h-4 w-4" />
    return <Shield className="h-4 w-4" />
  }

  // Environmental staff only (no medical staff)
  const environmentStaff = healthEnvStaff.filter(staff => 
    staff.name.toLowerCase().includes('cleaner') ||
    staff.name.toLowerCase().includes('supervisor') ||
    staff.email.toLowerCase().includes('waste') ||
    staff.roles.some(role => role.toLowerCase().includes('environment'))
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-600/20 rounded-xl border border-green-500/30">
              <Leaf className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Environmental Services</h1>
              <p className="text-green-200">Environmental Protection, Waste Management & Sanitation</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm">Total Issues</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalIssues || 0}</p>
                    <p className="text-xs text-green-400">Environmental Issues</p>
                  </div>
                  <Leaf className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Active Cases</p>
                    <p className="text-2xl font-bold text-white">{stats?.inProgressIssues || 0}</p>
                    <p className="text-xs text-blue-400">In Treatment</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 text-sm">Resolved Today</p>
                    <p className="text-2xl font-bold text-white">{stats?.resolvedToday || 0}</p>
                    <p className="text-xs text-emerald-400">Completed</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-200 text-sm">Staff Members</p>
                    <p className="text-2xl font-bold text-white">{healthEnvStaff.length}</p>
                    <p className="text-xs text-yellow-400">Medical & Environmental</p>
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
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-green-600/30">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="new-issues" className="data-[state=active]:bg-green-600/30">
              New Issues ({filteredIssues.length})
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="data-[state=active]:bg-green-600/30">
              Active Cases ({filteredInProgress.length})
            </TabsTrigger>
            <TabsTrigger value="env-staff" className="data-[state=active]:bg-green-600/30">
              Environmental Staff ({environmentStaff.length})
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-green-600/30">
              Environmental Monitoring
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Issue Distribution */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-400" />
                    <span>Health & Environment Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: 'Waste Management', count: environmentIssues.length, color: 'bg-emerald-500', icon: Trash2 },
                      { type: 'Sanitation', count: 12, color: 'bg-blue-500', icon: Droplets },
                      { type: 'Environmental Protection', count: 8, color: 'bg-green-500', icon: Leaf },
                      { type: 'Pollution Control', count: 6, color: 'bg-orange-500', icon: Activity }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-5 w-5 text-green-300" />
                          <span className="text-white text-sm">{item.type}</span>
                        </div>
                        <Badge className="bg-white/20 text-white">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Environmental Metrics */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    <span>Environmental Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { metric: 'Air Quality Index', value: '42', status: 'Good', color: 'text-green-400' },
                      { metric: 'Waste Collection Rate', value: '94%', status: 'Excellent', color: 'text-green-400' },
                      { metric: 'Water Quality Score', value: '87%', status: 'Good', color: 'text-blue-400' },
                      { metric: 'Green Cover', value: '68%', status: 'Satisfactory', color: 'text-yellow-400' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">{item.metric}</p>
                          <p className="text-green-300 text-xs">{item.status}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Environmental Statistics */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Leaf className="h-5 w-5 text-green-400" />
                    <span>Environmental Protection Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { service: 'Primary Healthcare Centers', active: 8, total: 10, coverage: '80%' },
                      { service: 'Medical Emergency Response', active: 15, total: 15, coverage: '100%' },
                      { service: 'Disease Surveillance', active: 12, total: 15, coverage: '80%' },
                      { service: 'Immunization Programs', active: 6, total: 8, coverage: '75%' }
                    ].map((item, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white text-sm font-medium">{item.service}</span>
                          <Badge className="bg-red-600/30 text-red-200">{item.coverage}</Badge>
                        </div>
                        <div className="flex justify-between text-xs text-green-300">
                          <span>{item.active}/{item.total} Active</span>
                          <span>Coverage: {item.coverage}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Waste Management Overview */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Recycle className="h-5 w-5 text-emerald-400" />
                    <span>Waste Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { zone: 'Zone A - Residential', collected: '95%', scheduled: 'Daily', status: 'On Time' },
                      { zone: 'Zone B - Commercial', collected: '88%', scheduled: 'Twice Daily', status: 'Slight Delay' },
                      { zone: 'Zone C - Industrial', collected: '92%', scheduled: 'Daily', status: 'On Time' },
                      { zone: 'Zone D - Rural Areas', collected: '78%', scheduled: 'Alternate Days', status: 'Needs Attention' }
                    ].map((item, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white text-sm font-medium">{item.zone}</span>
                          <Badge className={`text-xs ${
                            item.status === 'On Time' ? 'bg-green-600' : 
                            item.status === 'Slight Delay' ? 'bg-yellow-600' : 'bg-red-600'
                          } text-white`}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-green-300">
                          <span>Collected: {item.collected}</span>
                          <span>{item.scheduled}</span>
                        </div>
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
                className="max-w-md bg-white/10 border-white/20 text-white placeholder:text-green-300"
              />
              <Select value={issueFilter} onValueChange={setIssueFilter}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="all" className="text-white">All Issues</SelectItem>
                  <SelectItem value="environment" className="text-white">Environment Issues ({environmentIssues.length})</SelectItem>
                </SelectContent>
              </Select>
              <Badge className="bg-green-600/30 text-green-200">
                {filteredIssues.length} Issues
              </Badge>
            </div>

            <div className="grid gap-4">
              {loadingIssues ? (
                <div className="text-center text-white py-8">Loading issues...</div>
              ) : filteredIssues.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-8 text-center">
                    <Leaf className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-white">No issues found</p>
                    <p className="text-green-300 text-sm">All environmental issues are under control</p>
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
                            <Badge className="text-xs bg-emerald-600 text-white">
                              ENVIRONMENT
                            </Badge>
                          </div>
                          
                          <p className="text-green-200 text-sm mb-3 line-clamp-2">{issue.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-green-300">
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
                            className="bg-green-600/20 border-green-500 text-green-300 hover:bg-green-600/30"
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

          {/* Active Cases Tab */}
          <TabsContent value="ongoing" className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <Input
                placeholder="Search active cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md bg-white/10 border-white/20 text-white placeholder:text-green-300"
              />
              <Badge className="bg-blue-600/30 text-blue-200">
                {filteredInProgress.length} Active Cases
              </Badge>
            </div>

            <div className="grid gap-4">
              {loadingInProgress ? (
                <div className="text-center text-white py-8">Loading active cases...</div>
              ) : filteredInProgress.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-8 text-center">
                    <Activity className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <p className="text-white">No active cases</p>
                    <p className="text-green-300 text-sm">All cases are either pending or resolved</p>
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
                            <Badge className="bg-blue-600 text-white">IN TREATMENT</Badge>
                            <Badge className={getPriorityColor(issue.priority)}>
                              {issue.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-green-200 text-sm mb-3 line-clamp-2">{issue.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-green-300">
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
                              <span>Progress: {Math.floor(Math.random() * 60 + 40)}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-emerald-600/20 border-emerald-500 text-emerald-300 hover:bg-emerald-600/30"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Monitor Case
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Environmental Staff Tab */}
          <TabsContent value="env-staff" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Environmental & Sanitation Staff</h2>
              <Badge className="bg-emerald-600/30 text-emerald-200">
                {environmentStaff.length} Environmental Personnel
              </Badge>
            </div>

            <div className="grid gap-4">
              {loadingStaff ? (
                <div className="text-center text-white py-8">Loading environmental staff...</div>
              ) : environmentStaff.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-8 text-center">
                    <Leaf className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                    <p className="text-white">No environmental staff members found</p>
                  </CardContent>
                </Card>
              ) : (
                environmentStaff.map((staff) => (
                  <Card key={staff.id} className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-emerald-600/30 rounded-full flex items-center justify-center">
                            <Leaf className="h-6 w-6 text-emerald-300" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{staff.name}</h3>
                            <p className="text-emerald-300 text-sm">{staff.email}</p>
                            <p className="text-emerald-400 text-xs">Environmental Officer</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-white text-sm font-medium">{staff.activeIssues} Active Tasks</p>
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

          {/* Health Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Health & Environment Monitoring</h2>
              <Badge className="bg-green-600/30 text-green-200">Real-time Data</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Health Centers Status */}
              {[
                { center: 'Primary Health Center - Zone A', status: 'Operational', patients: 45, capacity: '75%', staff: 8 },
                { center: 'Community Health Post - Zone B', status: 'Operational', patients: 32, capacity: '60%', staff: 5 },
                { center: 'Emergency Response Unit', status: 'On Standby', patients: 8, capacity: '20%', staff: 12 },
                { center: 'Environmental Testing Lab', status: 'Active Testing', samples: 15, processed: 12, staff: 6 },
                { center: 'Waste Treatment Facility', status: 'Operational', capacity: '85%', trucks: 8, staff: 15 },
                { center: 'Disease Surveillance Unit', status: 'Monitoring', alerts: 2, tracked: 25, staff: 4 }
              ].map((facility, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      {facility.center.includes('Environmental') ? (
                        <Activity className="h-8 w-8 text-green-400" />
                      ) : facility.center.includes('Waste') ? (
                        <Recycle className="h-8 w-8 text-emerald-400" />
                      ) : facility.center.includes('Emergency') ? (
                        <AlertTriangle className="h-8 w-8 text-orange-400" />
                      ) : (
                        <Shield className="h-8 w-8 text-green-400" />
                      )}
                      <Badge className={`
                        ${facility.status === 'Operational' || facility.status === 'Active Testing' ? 'bg-green-600' : 
                          facility.status === 'On Standby' || facility.status === 'Monitoring' ? 'bg-yellow-600' : 'bg-blue-600'}
                        text-white
                      `}>
                        {facility.status}
                      </Badge>
                    </div>
                    <h3 className="text-white font-semibold mb-2 text-sm">{facility.center}</h3>
                    <div className="space-y-2">
                      {facility.patients && (
                        <div className="flex justify-between items-center">
                          <span className="text-green-200 text-sm">Patients:</span>
                          <span className="text-white text-sm">{facility.patients}</span>
                        </div>
                      )}
                      {facility.capacity && (
                        <div className="flex justify-between items-center">
                          <span className="text-green-200 text-sm">Capacity:</span>
                          <span className="text-white text-sm">{facility.capacity}</span>
                        </div>
                      )}
                      {facility.samples && (
                        <div className="flex justify-between items-center">
                          <span className="text-green-200 text-sm">Samples:</span>
                          <span className="text-white text-sm">{facility.processed}/{facility.samples}</span>
                        </div>
                      )}
                      {facility.trucks && (
                        <div className="flex justify-between items-center">
                          <span className="text-green-200 text-sm">Trucks Active:</span>
                          <span className="text-white text-sm">{facility.trucks}</span>
                        </div>
                      )}
                      {facility.alerts && (
                        <div className="flex justify-between items-center">
                          <span className="text-green-200 text-sm">Active Alerts:</span>
                          <Badge className="bg-red-600 text-white text-xs">{facility.alerts}</Badge>
                        </div>
                      )}
                      {facility.tracked && (
                        <div className="flex justify-between items-center">
                          <span className="text-green-200 text-sm">Cases Tracked:</span>
                          <span className="text-white text-sm">{facility.tracked}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        <span className="text-green-200 text-sm">Staff:</span>
                        <span className="text-green-300 text-sm font-medium">{facility.staff}</span>
                      </div>
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
              <DialogDescription className="text-green-300">
                Select appropriate staff member based on issue type (Health or Environmental)
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
                    {healthEnvStaff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id} className="text-white">
                        {staff.name} - {staff.activeIssues} active cases ({staff.workloadStatus})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Assignment Notes</label>
                <Textarea
                  placeholder="Add any specific instructions or priority notes..."
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-green-300"
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
                className="bg-green-600 hover:bg-green-700"
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