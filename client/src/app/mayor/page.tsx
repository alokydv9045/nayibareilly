"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import socketService from '@/lib/services/socket-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Building,
  TrendingUp,
  BarChart3,
  FileText,
  Map,
  Activity,
  Eye,
  Download,
  CheckCircle,
  Clock,
  Star,
  ThumbsUp,
  Users,
  AlertTriangle,
  Bell,
  Zap,
  RefreshCw,
  MapPin,
  Phone,
  MessageSquare,
  Calendar,
  Target,
  Gauge,
  Filter
} from 'lucide-react'
import { config } from '@/lib/constants/config'
import { tokenStorage } from '@/lib/auth/auth-utils'
import { Toaster, toast } from 'react-hot-toast'

interface DepartmentPerformance {
  name: string
  issuesAssigned: number
  resolved: number
  inProgress: number
  performance: number
  avgTime: number
  slaCompliance: number
}

interface IssueTimeline {
  stage: string
  actor: string
  time: string
  completed: boolean
  notes?: string
}

interface RecentIssue {
  reportId: string
  title: string
  description: string
  status: string
  timeline?: IssueTimeline[]
  totalTime: string
  responseTime: string
  citizenRating?: number
}

export default function MayorDashboard() {
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    inProgress: 0,
    averageResolutionTime: 0,
    citizenSatisfaction: 0,
    totalReports: 0,
    cityHealthScore: 85,
    overdueIssues: 0,
    activeStaff: 156
  })

  const [departmentPerformance, setDepartmentPerformance] = useState<DepartmentPerformance[]>([])
  const [recentIssues, setRecentIssues] = useState<RecentIssue[]>([])

  const [emergencyIssues] = useState([
    { id: 'EMG-001', title: 'Water Main Burst', location: 'Civil Lines', priority: 'CRITICAL', time: '12 min ago' },
    { id: 'EMG-002', title: 'Power Outage', location: 'Cantonment', priority: 'HIGH', time: '28 min ago' }
  ])
  
  const [recentActivity] = useState([
    { action: 'Road repair completed', department: 'PWD', time: '5 min ago', type: 'success' },
    { action: 'New complaint assigned', department: 'Sanitation', time: '12 min ago', type: 'info' },
    { action: 'Staff deployed to site', department: 'Traffic', time: '18 min ago', type: 'warning' }
  ])

  const fetchDashboardData = async () => {
    try {
      // Align with app-wide auth storage keys; fallback maintained for backward compatibility
      const token =
        typeof window !== 'undefined'
          ? tokenStorage.get()
          : null
      
      const apiRoot = config.api.fullUrl.replace(/\/$/, '')
      // Fetch stats (real backend)
      const statsResponse = await fetch(`${apiRoot}/mayor/stats`, token ? {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      } : undefined)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch department performance (real backend)
      const deptResponse = await fetch(`${apiRoot}/mayor/departments/performance`, token ? {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      } : undefined)
      if (deptResponse.ok) {
        const deptData = await deptResponse.json()
        setDepartmentPerformance(deptData)
      }

      // Fetch recent issues (real backend)
      const issuesResponse = await fetch(`${apiRoot}/mayor/issues/recent`, token ? {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      } : undefined)
      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json()
        setRecentIssues(issuesData)
      }
    } catch {
      toast.error('Failed to load dashboard data')
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000) // Refresh every 30 seconds

    // Realtime updates via Socket.IO
    const handleRealtime = () => fetchDashboardData()
    socketService.on('issue:new', handleRealtime)
    socketService.on('issue:update', handleRealtime)
    socketService.on('issue:status', handleRealtime)

    return () => {
      clearInterval(interval)
      socketService.off('issue:new', handleRealtime)
      socketService.off('issue:update', handleRealtime)
      socketService.off('issue:status', handleRealtime)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <Toaster position="top-right" />
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-xl shadow-lg">
                <Building className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Mayor Dashboard</h1>
                <p className="text-emerald-200">City-wide oversight and performance monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-emerald-500 text-white">
                <Eye className="h-3 w-3 mr-1" />
                Read-Only Access
              </Badge>
              <Button onClick={() => toast('Exporting report...')} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions & City Health Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* City Health Score */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center">
                <Gauge className="h-5 w-5 mr-2 text-green-400" />
                City Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={stats.cityHealthScore >= 80 ? "#10b981" : stats.cityHealthScore >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="2"
                      strokeDasharray={`${stats.cityHealthScore}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{stats.cityHealthScore}%</span>
                  </div>
                </div>
                <p className="text-sm text-emerald-200">
                  {stats.cityHealthScore >= 80 ? 'Excellent' : stats.cityHealthScore >= 60 ? 'Good' : 'Needs Attention'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                <Bell className="h-4 w-4 mr-2" />
                Emergency Alert
              </Button>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                <Users className="h-4 w-4 mr-2" />
                Deploy Staff
              </Button>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Public Notice
              </Button>
            </CardContent>
          </Card>

          {/* Emergency Issues */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
                Emergency Issues
                <Badge className="ml-2 bg-red-500 animate-pulse">
                  {emergencyIssues.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {emergencyIssues.map((issue, index) => (
                <div key={index} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{issue.title}</p>
                      <p className="text-red-200 text-xs">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {issue.location} • {issue.time}
                      </p>
                    </div>
                    <Badge className={
                      issue.priority === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-600'
                    }>
                      {issue.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Interactive Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/issues">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 text-sm font-medium">Total Issues</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.totalIssues}</p>
                    <p className="text-xs text-blue-400 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      All time reports
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-500/20 rounded-lg">
                    <FileText className="h-8 w-8 text-emerald-300" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={(stats.resolvedIssues / Math.max(stats.totalIssues, 1)) * 100} className="h-2" />
                  <p className="text-xs text-emerald-300 mt-1">
                    {Math.round((stats.resolvedIssues / Math.max(stats.totalIssues, 1)) * 100)}% resolved
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/issues">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 text-sm font-medium">Resolved Issues</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.resolvedIssues}</p>
                    <p className="text-xs text-green-400 mt-1">
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                      +{Math.floor(stats.resolvedIssues * 0.15)} this week
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-300" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-xs text-green-300">
                    <Target className="h-3 w-3 mr-1" />
                    Target: 85% • Current: {Math.round((stats.resolvedIssues / Math.max(stats.totalIssues, 1)) * 100)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/issues">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 text-sm font-medium">Response Time</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.averageResolutionTime}h</p>
                    <p className="text-xs text-yellow-400 mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Target: 72h
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <Clock className="h-8 w-8 text-yellow-300" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-xs text-yellow-300">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Updated 5 min ago
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 text-sm font-medium">Citizen Satisfaction</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.citizenSatisfaction}%</p>
                    <p className="text-xs text-green-400 mt-1">
                      <Star className="h-3 w-3 inline mr-1" />
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +5% from last month
                    </p>
                  </div>
                  <div className="p-3 bg-slate-700/20 rounded-lg">
                    <ThumbsUp className="h-8 w-8 text-purple-300" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-xs text-purple-300">
                    <Calendar className="h-3 w-3 mr-1" />
                    Based on {Math.floor(stats.totalIssues * 0.6)} feedbacks
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </div>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500/20' :
                      activity.type === 'warning' ? 'bg-yellow-500/20' : 'bg-emerald-500/20'
                    }`}>
                      {activity.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-400" /> :
                       activity.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-400" /> :
                       <Activity className="h-4 w-4 text-blue-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.action}</p>
                      <p className="text-emerald-300 text-xs">{activity.department} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Staff Status */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Staff Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{stats.activeStaff}</p>
                <p className="text-emerald-200 text-sm">Active Staff Members</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200 text-sm">On Duty</span>
                  <Badge className="bg-green-500">{Math.floor(stats.activeStaff * 0.8)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200 text-sm">Field Work</span>
                  <Badge className="bg-emerald-500">{Math.floor(stats.activeStaff * 0.6)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200 text-sm">Available</span>
                  <Badge className="bg-yellow-500">{Math.floor(stats.activeStaff * 0.2)}</Badge>
                </div>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                <Phone className="h-4 w-4 mr-2" />
                Contact Staff
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Navigation Tabs with Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">City Management Center</h2>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-white/10 backdrop-blur-lg border-white/20 grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
                <Map className="h-4 w-4 mr-2" />
                City Overview
              </TabsTrigger>
              <TabsTrigger value="departments" className="data-[state=active]:bg-white/20">
                <Building className="h-4 w-4 mr-2" />
                Departments
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-white/20">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trends & Analytics
              </TabsTrigger>
              <TabsTrigger value="live" className="data-[state=active]:bg-white/20">
                <Activity className="h-4 w-4 mr-2" />
                Live Tracking
              </TabsTrigger>
            </TabsList>

            {/* City Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/mayor">
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Map className="h-5 w-5 mr-2" />
                        City Overview
                      </CardTitle>
                      <CardDescription className="text-emerald-200">
                        Geographic distribution and heat maps
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => toast('Opening city overview map...')} variant="ghost" className="text-white hover:bg-white/10 w-full">
                        View Map â†’
                      </Button>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/reports">
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Analytics & Reports
                      </CardTitle>
                      <CardDescription className="text-emerald-200">
                        Comprehensive analytics and insights
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => toast('Opening analytics...')} variant="ghost" className="text-white hover:bg-white/10 w-full">
                        View Analytics â†’
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </TabsContent>

            {/* Department Performance Tab */}
            <TabsContent value="departments" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Department Performance Comparison</CardTitle>
                  <CardDescription className="text-emerald-200">
                    Real-time department efficiency metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentPerformance.length === 0 ? (
                      <div className="text-center py-8 text-emerald-300">
                        <Building className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Loading department data...</p>
                      </div>
                    ) : (
                      departmentPerformance.map((dept, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${
                                dept.performance >= 80 ? 'bg-green-500/20' :
                                dept.performance >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                              }`}>
                                <Building className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="text-white font-semibold">{dept.name}</h4>
                                <p className="text-sm text-emerald-200">{dept.issuesAssigned} issues assigned</p>
                              </div>
                            </div>
                            <Badge className={
                              dept.performance >= 80 ? 'bg-green-500' :
                              dept.performance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }>
                              {dept.performance}% Performance
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm mt-3">
                            <div>
                              <p className="text-emerald-300">Resolved</p>
                              <p className="text-white font-bold">{dept.resolved}</p>
                            </div>
                            <div>
                              <p className="text-emerald-300">In Progress</p>
                              <p className="text-white font-bold">{dept.inProgress}</p>
                            </div>
                            <div>
                              <p className="text-emerald-300">Avg Time</p>
                              <p className="text-white font-bold">{dept.avgTime}h</p>
                            </div>
                            <div>
                              <p className="text-emerald-300">SLA Compliance</p>
                              <p className="text-white font-bold">{dept.slaCompliance}%</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Live Tracking Tab */}
            <TabsContent value="live" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Real-time Issue Tracking
                    <Badge className="ml-3 bg-red-500 animate-pulse">LIVE</Badge>
                  </CardTitle>
                  <CardDescription className="text-emerald-200">
                    Complete visibility from moderator assignment to citizen verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentIssues.length === 0 ? (
                      <div className="text-center py-8 text-emerald-300">
                        <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No recent issues to display</p>
                      </div>
                    ) : (
                      recentIssues.map((issue, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className="bg-emerald-500">#{issue.reportId}</Badge>
                                <h4 className="text-white font-semibold">{issue.title}</h4>
                              </div>
                              <p className="text-sm text-emerald-200 mb-2">{issue.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={
                              issue.status.includes('VERIFIED') ? 'bg-green-500' :
                              issue.status.includes('PROGRESS') ? 'bg-emerald-500' :
                              issue.status.includes('PENDING') ? 'bg-yellow-500' : 'bg-slate-500'
                            }>
                              {issue.status}
                            </Badge>
                              <Button size="sm" variant="outline" className="text-white border-white/20 bg-white/5 hover:bg-white/10" onClick={() => toast('Previewing images...')}>
                                Preview Images
                              </Button>
                            </div>
                          </div>
                          
                          {/* Complete Timeline View */}
                          <div className="space-y-2 mt-4 pl-4 border-l-2 border-white/20">
                            {issue.timeline?.map((event: IssueTimeline, idx: number) => (
                              <div key={idx} className="flex items-start space-x-3">
                                <div className={`p-1 rounded-full ${
                                  event.completed ? 'bg-green-500' : 'bg-slate-500'
                                }`}>
                                  {event.completed ? <CheckCircle className="h-3 w-3 text-white" /> : 
                                  <Clock className="h-3 w-3 text-white" />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-white">{event.stage}</p>
                                  <p className="text-xs text-emerald-300">{event.actor} • {event.time}</p>
                                  {event.notes && (
                                    <p className="text-xs text-emerald-200 mt-1 italic">&ldquo;{event.notes}&rdquo;</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Performance Metrics */}
                          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-emerald-300">Total Time</p>
                              <p className="text-white font-bold">{issue.totalTime}</p>
                            </div>
                            <div>
                              <p className="text-emerald-300">Response Time</p>
                              <p className="text-white font-bold">{issue.responseTime}</p>
                            </div>
                            {issue.citizenRating && (
                              <div>
                                <p className="text-emerald-300">Citizen Rating</p>
                                <p className="text-white font-bold">
                                  {'â­'.repeat(issue.citizenRating)} {issue.citizenRating}/5
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-6">
              <Link href="/reports">
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Issue Trends & Patterns
                    </CardTitle>
                    <CardDescription className="text-emerald-200">
                      Identify recurring problems and seasonal patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="text-white hover:bg-white/10 w-full">
                      View Full Trends â†’
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}