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
  Droplets, Waves, Zap as Pipe, Gauge, Activity, AlertTriangle, TrendingUp
} from 'lucide-react'
import { userStorage } from '@/lib/auth/auth-utils'
import { useDepartmentIssues, useDepartmentStaff, useAssignIssueToStaff, useDepartmentStats, type DepartmentIssue } from '@/hooks/api/useDepartments'

export default function WaterDepartmentPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [user, setUser] = useState<{ id: string; name: string; departmentId?: string } | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<DepartmentIssue | null>(null)
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')
  const [assignmentNote, setAssignmentNote] = useState<string>('')
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Get user info
  useEffect(() => {
    const userData = userStorage.get()
    if (userData) {
      setUser(userData as { id: string; name: string; departmentId?: string })
    }
  }, [])

  const departmentId = user?.departmentId || 'water-dept-id'

  // Fetch Water department-specific data
  const { data: waterIssues = [], isLoading: loadingWaterIssues, refetch: refetchWaterIssues } = useDepartmentIssues(departmentId, 'TRIAGED')
  const { data: inProgressWork = [], isLoading: loadingInProgress, refetch: refetchInProgress } = useDepartmentIssues(departmentId, 'ASSIGNED_TO_STAFF,IN_PROGRESS')
  const { data: waterStaff = [], isLoading: loadingStaff } = useDepartmentStaff(departmentId)
  const { data: stats } = useDepartmentStats(departmentId)
  
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
      
      toast.success(`Water issue assigned to technician successfully`)
      setShowAssignDialog(false)
      refetchWaterIssues()
      refetchInProgress()
    } catch {
      toast.error('Failed to assign water issue')
    }
  }

  // Filter issues by search term
  const filteredWaterIssues = waterIssues.filter(issue => 
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredInProgress = inProgressWork.filter(issue => 
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Water-specific priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-600 text-white'
      case 'HIGH': return 'bg-orange-500 text-white'
      case 'MEDIUM': return 'bg-emerald-500 text-white'
      case 'LOW': return 'bg-green-500 text-white'
      default: return 'bg-slate-500 text-white'
    }
  }

  // Water-specific issue type mapping
  const getIssueIcon = (category: string) => {
    if (category.toLowerCase().includes('water') || category.toLowerCase().includes('supply')) return <Droplets className="h-4 w-4" />
    if (category.toLowerCase().includes('leak') || category.toLowerCase().includes('pipe')) return <Pipe className="h-4 w-4" />
    if (category.toLowerCase().includes('sewage') || category.toLowerCase().includes('drainage')) return <Waves className="h-4 w-4" />
    if (category.toLowerCase().includes('pressure')) return <Gauge className="h-4 w-4" />
    return <Droplets className="h-4 w-4" />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-blue-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-emerald-600/20 rounded-xl border border-emerald-500/30">
              <Droplets className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Water Supply & Utilities</h1>
              <p className="text-emerald-200">Water Supply, Sewerage, Drainage & Utility Management</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 text-sm">Water Connections</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalIssues || 0}</p>
                    <p className="text-xs text-blue-400">Active</p>
                  </div>
                  <Droplets className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-200 text-sm">Under Repair</p>
                    <p className="text-2xl font-bold text-white">{stats?.inProgressIssues || 0}</p>
                    <p className="text-xs text-cyan-400">Active Repairs</p>
                  </div>
                  <RefreshCw className="h-8 w-8 text-cyan-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm">Fixed Today</p>
                    <p className="text-2xl font-bold text-white">{stats?.resolvedToday || 0}</p>
                    <p className="text-xs text-green-400">Repairs</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-200 text-sm">Water Staff</p>
                    <p className="text-2xl font-bold text-white">{waterStaff.length}</p>
                    <p className="text-xs text-yellow-400">Technicians</p>
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
              New Issues ({filteredWaterIssues.length})
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="data-[state=active]:bg-emerald-600/30">
              Active Repairs ({filteredInProgress.length})
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-emerald-600/30">
              Water Staff ({waterStaff.length})
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-emerald-600/30">
              Water Quality
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Issue Distribution */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-400" />
                    <span>Water Issue Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: 'Water Supply Issues', count: 18, color: 'bg-emerald-500' },
                      { type: 'Pipe Leakages', count: 12, color: 'bg-red-500' },
                      { type: 'Sewage Problems', count: 8, color: 'bg-yellow-500' },
                      { type: 'Water Quality', count: 5, color: 'bg-green-500' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-white text-sm">{item.type}</span>
                        </div>
                        <Badge className="bg-white/20 text-white">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Staff Workload */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span>Technician Workload</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {waterStaff.slice(0, 5).map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-emerald-600/30 rounded-full flex items-center justify-center">
                            <Droplets className="h-4 w-4 text-emerald-300" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{staff.name}</p>
                            <p className="text-emerald-300 text-xs">Water Technician</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`
                            ${staff.workloadStatus === 'available' ? 'bg-green-600' : 
                              staff.workloadStatus === 'light' ? 'bg-yellow-600' : 
                              staff.workloadStatus === 'moderate' ? 'bg-orange-600' : 'bg-red-600'}
                            text-white text-xs
                          `}>
                            {staff.activeIssues} repairs
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Water Quality Monitoring */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Gauge className="h-5 w-5 text-blue-400" />
                    <span>Water Quality Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { metric: 'pH Level', value: '7.2', status: 'Good', color: 'text-green-400' },
                      { metric: 'Chlorine (mg/L)', value: '0.8', status: 'Normal', color: 'text-blue-400' },
                      { metric: 'Turbidity (NTU)', value: '0.5', status: 'Excellent', color: 'text-green-400' },
                      { metric: 'TDS (mg/L)', value: '180', status: 'Good', color: 'text-green-400' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">{item.metric}</p>
                          <p className="text-emerald-300 text-xs">{item.status}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Alerts */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <span>Emergency Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { area: 'Sector 12', issue: 'Major pipe burst', priority: 'CRITICAL', time: '10 min ago' },
                      { area: 'Civil Lines', issue: 'Low water pressure', priority: 'HIGH', time: '1 hour ago' },
                      { area: 'Railway Colony', issue: 'Sewage overflow', priority: 'HIGH', time: '2 hours ago' }
                    ].map((alert, index) => (
                      <div key={index} className="p-3 bg-red-600/20 border border-red-500/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getPriorityColor(alert.priority)}>
                            {alert.priority}
                          </Badge>
                          <span className="text-red-300 text-xs">{alert.time}</span>
                        </div>
                        <p className="text-white text-sm font-medium">{alert.area}</p>
                        <p className="text-red-200 text-xs">{alert.issue}</p>
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
                placeholder="Search water issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md bg-white/10 border-white/20 text-white placeholder:text-emerald-300"
              />
              <Badge className="bg-emerald-600/30 text-emerald-200">
                {filteredWaterIssues.length} New Water Issues
              </Badge>
            </div>

            <div className="grid gap-4">
              {loadingWaterIssues ? (
                <div className="text-center text-white py-8">Loading water issues...</div>
              ) : filteredWaterIssues.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-8 text-center">
                    <Droplets className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <p className="text-white">No new water issues found</p>
                    <p className="text-emerald-300 text-sm">All issues are assigned or resolved</p>
                  </CardContent>
                </Card>
              ) : (
                filteredWaterIssues.map((issue) => (
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
                            Assign Technician
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Active Repairs Tab */}
          <TabsContent value="ongoing" className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <Input
                placeholder="Search active repairs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md bg-white/10 border-white/20 text-white placeholder:text-emerald-300"
              />
              <Badge className="bg-cyan-600/30 text-cyan-200">
                {filteredInProgress.length} Active Repairs
              </Badge>
            </div>

            <div className="grid gap-4">
              {loadingInProgress ? (
                <div className="text-center text-white py-8">Loading active repairs...</div>
              ) : filteredInProgress.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-8 text-center">
                    <RefreshCw className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                    <p className="text-white">No active repairs</p>
                    <p className="text-emerald-300 text-sm">All issues are either pending or completed</p>
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
                            <Badge className="bg-cyan-600 text-white">IN REPAIR</Badge>
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
                              <span>Technician: {issue.assignedTo?.name || 'Unknown'}</span>
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
                            Track Repair
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Water Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Water Department Staff</h2>
              <Badge className="bg-emerald-600/30 text-emerald-200">
                {waterStaff.length} Technicians
              </Badge>
            </div>

            <div className="grid gap-4">
              {loadingStaff ? (
                <div className="text-center text-white py-8">Loading water staff...</div>
              ) : waterStaff.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <p className="text-white">No water staff members found</p>
                  </CardContent>
                </Card>
              ) : (
                waterStaff.map((staff) => (
                  <Card key={staff.id} className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-emerald-600/30 rounded-full flex items-center justify-center">
                            <Droplets className="h-6 w-6 text-emerald-300" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{staff.name}</h3>
                            <p className="text-emerald-300 text-sm">{staff.email}</p>
                            <p className="text-blue-400 text-xs">
                              {staff.roles.includes('dept_admin') ? 'Water Supply Engineer' : 'Water Technician'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-white text-sm font-medium">{staff.activeIssues} Active Repairs</p>
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

          {/* Water Quality Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Water Quality Monitoring</h2>
              <Badge className="bg-green-600/30 text-green-200">All Systems Normal</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { station: 'Central Treatment Plant', ph: '7.1', chlorine: '0.9', status: 'Excellent', trend: 'up' },
                { station: 'East Zone Pumping', ph: '7.3', chlorine: '0.7', status: 'Good', trend: 'stable' },
                { station: 'West Zone Supply', ph: '7.0', chlorine: '0.8', status: 'Good', trend: 'up' },
                { station: 'North Sector Reservoir', ph: '7.2', chlorine: '0.6', status: 'Normal', trend: 'down' },
                { station: 'South Distribution', ph: '7.4', chlorine: '0.9', status: 'Excellent', trend: 'up' },
                { station: 'Industrial Zone Supply', ph: '6.9', chlorine: '1.0', status: 'Normal', trend: 'stable' }
              ].map((station, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Gauge className="h-8 w-8 text-blue-400" />
                      <Badge className={`
                        ${station.status === 'Excellent' ? 'bg-green-600' : 
                          station.status === 'Good' ? 'bg-emerald-600' : 'bg-yellow-600'}
                        text-white
                      `}>
                        {station.status}
                      </Badge>
                    </div>
                    <h3 className="text-white font-semibold mb-4">{station.station}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200 text-sm">pH Level:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{station.ph}</span>
                          <TrendingUp className={`h-4 w-4 ${station.trend === 'up' ? 'text-green-400' : station.trend === 'down' ? 'text-red-400' : 'text-slate-400'}`} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200 text-sm">Chlorine:</span>
                        <span className="text-white font-medium">{station.chlorine} mg/L</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mt-4">
                        <div className={`h-2 rounded-full ${
                          station.status === 'Excellent' ? 'bg-green-500' : 
                          station.status === 'Good' ? 'bg-emerald-500' : 'bg-yellow-500'
                        }`} style={{ width: `${station.status === 'Excellent' ? '90' : station.status === 'Good' ? '75' : '60'}%` }}></div>
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
          <DialogContent className="bg-blue-900 border border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>Assign Water Issue to Technician</DialogTitle>
              <DialogDescription className="text-emerald-300">
                Select a water technician to handle this repair
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Water Technician</label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Choose a technician..." />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-900 border-white/20">
                    {waterStaff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id} className="text-white">
                        {staff.name} - {staff.activeIssues} active repairs ({staff.workloadStatus})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Assignment Notes</label>
                <Textarea
                  placeholder="Add any specific instructions for the technician..."
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
                {assignMutation.isPending ? 'Assigning...' : 'Assign Repair'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}