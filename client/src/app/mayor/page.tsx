"use client"
import AnimatedHeading from '@/components/ui/AnimatedHeading'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import socketService from '@/lib/services/socket-service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Building, TrendingUp, BarChart3, FileText, Map as MapIcon, Activity, Eye,
  Download, CheckCircle, Clock, Star, ThumbsUp, Users, AlertTriangle,
  Bell, Zap, RefreshCw, MapPin, Phone, MessageSquare, Calendar,
  Target, Gauge, Filter, ChevronRight
} from 'lucide-react'
import { config } from '@/lib/constants/config'
import { tokenStorage } from '@/lib/auth/auth-utils'
import { toast, Toaster } from 'react-hot-toast'
import { 
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from 'recharts'
import { useRouter } from 'next/navigation'

interface DeptPerf { name: string; issuesAssigned: number; resolved: number; inProgress: number; performance: number; avgTime: number; slaCompliance: number }
interface Timeline { stage: string; actor: string; time: string; completed: boolean; notes?: string }
interface RecentIssue { reportId: string; title: string; description: string; status: string; timeline?: Timeline[]; totalTime: string; responseTime: string; citizenRating?: number }

export default function MayorDashboard() {

  const [activeTab, setActiveTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState({ totalIssues: 0, resolvedIssues: 0, inProgress: 0, averageResolutionTime: 0, citizenSatisfaction: 0, totalReports: 0, cityHealthScore: 85, overdueIssues: 0, activeStaff: 156 })
  const [departmentPerformance, setDepartmentPerformance] = useState<DeptPerf[]>([])
  const [recentIssues, setRecentIssues] = useState<RecentIssue[]>([])

  const emergencyIssues = [
    { id: 'EMG-001', title: 'Water Main Burst', location: 'Civil Lines', priority: 'CRITICAL', time: '12 min ago' },
    { id: 'EMG-002', title: 'Power Outage', location: 'Cantonment', priority: 'HIGH', time: '28 min ago' }
  ]
  
  const recentActivity = [
    { action: 'Road repair completed', department: 'PWD', time: '5 min ago', type: 'success' },
    { action: 'New complaint assigned', department: 'Sanitation', time: '12 min ago', type: 'info' },
    { action: 'Staff deployed to site', department: 'Traffic', time: '18 min ago', type: 'warning' }
  ]

  const fetchDashboardData = async () => {
    try {
      const token = typeof window !== 'undefined' ? tokenStorage.get() : null
      const apiRoot = ((config as { api: { fullUrl?: string } }).api.fullUrl || 'https://nayibareilly.onrender.com/api').replace(/\/$/, '')
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined

      const [sRes, dRes, iRes] = await Promise.all([
        fetch(`${apiRoot}/mayor/stats`, { headers, cache: 'no-store' }).catch(() => null),
        fetch(`${apiRoot}/mayor/departments/performance`, { headers, cache: 'no-store' }).catch(() => null),
        fetch(`${apiRoot}/mayor/issues/recent`, { headers, cache: 'no-store' }).catch(() => null)
      ])

      if (sRes?.ok) setStats(await sRes.json())
      if (dRes?.ok) setDepartmentPerformance(await dRes.json())
      if (iRes?.ok) setRecentIssues(await iRes.json())
    } catch { /* silent */ }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchDashboardData()
    setIsRefreshing(false)
    toast.success('Dashboard refreshed')
  }

  useEffect(() => {
    void fetchDashboardData()
    const int = setInterval(fetchDashboardData, 30000)
    const onRealtime = () => void fetchDashboardData()
    ;['issue:new','issue:update','issue:status'].forEach(e => socketService.on(e, onRealtime))
    return () => {
      clearInterval(int)
      ;['issue:new','issue:update','issue:status'].forEach(e => socketService.off(e, onRealtime))
    }
  }, [])

  const healthColor = stats.cityHealthScore >= 80 ? '#10b981' : stats.cityHealthScore >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="min-h-screen bg-transparent">
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
                <AnimatedHeading as="h1" className="text-4xl font-bold text-white">Mayor Dashboard</AnimatedHeading>
                <p className="text-emerald-200">City-wide oversight and performance monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-indigo-500/20 text-indigo-600 border border-indigo-200 gap-1.5">
                <Eye className="h-3 w-3 mr-1" />
                Read-Only Access
              </Badge>
              <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={isRefreshing}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 bg-white">
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-500"
                onClick={() => toast.success('Exporting Report...')}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8 bg-white rounded-xl shadow-sm">
          {/* Top Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-white border border-gray-200 ">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-900 flex items-center text-base">
                  <Gauge className="h-4 w-4 mr-2 text-emerald-600" />
                  City Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={healthColor} strokeWidth="3" strokeDasharray={`${stats.cityHealthScore}, 100`} />
                    </svg>
                    <span className="text-3xl font-bold text-gray-900">{stats.cityHealthScore}%</span>
                  </div>
                </div>
                <p className="text-sm text-emerald-600 text-center mt-2">
                  {stats.cityHealthScore >= 80 ? 'Excellent' : stats.cityHealthScore >= 60 ? 'Good' : 'Needs Attention'}
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
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
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Public Notice
                </Button>
              </CardContent>
            </Card>

            {/* Emergency Issues */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Emergency Issues
                  <Badge className="ml-2 bg-red-500 animate-pulse">
                    {emergencyIssues.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {emergencyIssues.map((issue, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium text-sm">{issue.title}</p>
                        <p className="text-red-600 text-xs">
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
            <Link href="/issues" className="block w-full">
              <Card className="bg-gray-50 border-gray-200 hover:bg-gray-100 transition-all cursor-pointer transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-700 text-sm font-medium">Total Issues</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalIssues}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        All time reports
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <FileText className="h-8 w-8 text-emerald-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={(stats.resolvedIssues / Math.max(stats.totalIssues, 1)) * 100} className="h-2" />
                    <p className="text-xs text-emerald-700 mt-1">
                      {Math.round((stats.resolvedIssues / Math.max(stats.totalIssues, 1)) * 100)}% resolved
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/issues" className="block w-full">
              <Card className="bg-gray-50 border-gray-200 hover:bg-gray-100 transition-all cursor-pointer transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-700 text-sm font-medium">Resolved Issues</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.resolvedIssues}</p>
                      <p className="text-xs text-green-600 mt-1">
                        <CheckCircle className="h-3 w-3 inline mr-1" />
                        +{Math.floor(stats.resolvedIssues * 0.15)} this week
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-xs text-green-700">
                      <Target className="h-3 w-3 mr-1" />
                      Target: 85% • Current: {Math.round((stats.resolvedIssues / Math.max(stats.totalIssues, 1)) * 100)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/issues" className="block w-full">
              <Card className="bg-gray-50 border-gray-200 hover:bg-gray-100 transition-all cursor-pointer transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-700 text-sm font-medium">Response Time</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.averageResolutionTime}h</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Target: 72h
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-xs text-yellow-700">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Updated 5 min ago
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports" className="block w-full">
              <Card className="bg-gray-50 border-gray-200 hover:bg-gray-100 transition-all cursor-pointer transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-700 text-sm font-medium">Citizen Satisfaction</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.citizenSatisfaction}%</p>
                      <p className="text-xs text-green-600 mt-1">
                        <Star className="h-3 w-3 inline mr-1" />
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        +5% from last month
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <ThumbsUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-xs text-purple-700">
                      <Calendar className="h-3 w-3 mr-1" />
                      Based on {Math.floor(stats.totalIssues * 0.6)} feedbacks
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Activity & Staff */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white border border-gray-200 ">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-gray-900 flex items-center text-base">
                  <Activity className="h-4 w-4 mr-2 text-indigo-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {recentActivity.map((act, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className={`p-2 rounded-full ${act.type === 'success' ? 'bg-emerald-100' : act.type === 'warning' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                      {act.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : act.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-amber-600" /> : <Activity className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{act.action}</p>
                      <p className="text-xs text-gray-600">{act.department} • {act.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 ">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-900 flex items-center text-base">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  Staff Force Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-gray-900">{stats.activeStaff}</p>
                  <p className="text-xs text-gray-600 mt-1">Total Active Staff</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">On Duty</span>
                    <Badge className="bg-emerald-100 text-emerald-600 border border-emerald-200">{Math.floor(stats.activeStaff * 0.8)}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Field Work</span>
                    <Badge className="bg-blue-100 text-blue-600 border border-blue-200">{Math.floor(stats.activeStaff * 0.6)}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Available</span>
                    <Badge className="bg-amber-100 text-amber-600 border border-gray-200">{Math.floor(stats.activeStaff * 0.2)}</Badge>
                  </div>
                </div>
                <Button className="w-full bg-amber-100 hover:bg-amber-200 text-gray-900 border border-gray-200">
                  <Phone className="h-4 w-4 mr-2" />Contact Head
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tabs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Filter className="h-5 w-5 text-indigo-600" />
                City Management Center
              </h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white border border-gray-200 p-1 mb-6">
                {[
                  { id: 'overview', icon: MapIcon, label: 'Overview' },
                  { id: 'departments', icon: Building, label: 'Departments' },
                  { id: 'live', icon: Activity, label: 'Live Tracking' },
                  { id: 'trends', icon: TrendingUp, label: 'Trends' },
                ].map(t => (
                  <TabsTrigger key={t.id} value={t.id} className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-900 text-gray-600 gap-2 px-4">
                    <t.icon className="h-4 w-4" />{t.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer group">
                    <CardHeader>
                      <CardTitle className="text-gray-900 flex items-center text-base"><MapIcon className="h-5 w-5 mr-2 text-teal-500" />City Heatmap</CardTitle>
                      <CardDescription className="text-gray-600">Geographic distribution of issues</CardDescription>
                    </CardHeader>
                    <CardContent><Button variant="ghost" className="w-full text-gray-600 group-hover:text-gray-900 bg-white border border-gray-200">View Map <ChevronRight className="h-4 w-4 ml-1" /></Button></CardContent>
                  </Card>
                  <Card className="bg-white border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer group">
                    <CardHeader>
                      <CardTitle className="text-gray-900 flex items-center text-base"><BarChart3 className="h-5 w-5 mr-2 text-blue-600" />Deep Analytics</CardTitle>
                      <CardDescription className="text-gray-600">Comprehensive data and reports</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/mayor/analytics" className="block w-full">
                        <Button variant="ghost" className="w-full text-gray-600 group-hover:text-gray-900 bg-white border border-gray-200">
                          View Analytics <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="departments">
                <Card className="bg-white border border-gray-200 mb-6">
                  <CardHeader>
                    <CardTitle className="text-gray-900 text-base">Department Performance Comparison</CardTitle>
                    <CardDescription className="text-gray-600">Comparing overall efficiency and SLA compliance across municipal teams</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-80 w-full">
                      {departmentPerformance.length === 0 ? (
                        <p className="text-gray-600 text-center py-10 text-sm">No data available for chart</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={departmentPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="name" stroke="#4b5563" fontSize={11} tickLine={false} />
                            <YAxis stroke="#4b5563" fontSize={12} unit="%" />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                            <Legend />
                            <Bar dataKey="performance" name="Overall Performance" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="slaCompliance" name="SLA Compliance" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="live">
                <Card className="bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-red-500" />
                      Real-time Issue Tracking
                      <Badge className="ml-3 bg-red-100 text-red-600 animate-pulse">LIVE</Badge>
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Complete visibility from moderator assignment to citizen verification
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentIssues.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Activity className="h-12 w-12 mx-auto mb-3 opacity-50 text-gray-400" />
                          <p>No recent issues to display</p>
                        </div>
                      ) : (
                        recentIssues.map((issue, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge className="bg-emerald-100 text-emerald-700">#{issue.reportId}</Badge>
                                  <h4 className="text-gray-900 font-semibold">{issue.title}</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={
                                issue.status.includes('VERIFIED') ? 'bg-green-100 text-green-700' :
                                issue.status.includes('PROGRESS') ? 'bg-emerald-100 text-emerald-700' :
                                issue.status.includes('PENDING') ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                              }>
                                {issue.status}
                              </Badge>
                              </div>
                            </div>
                            
                            {/* Complete Timeline View */}
                            <div className="space-y-2 mt-4 pl-4 border-l-2 border-gray-200">
                              {issue.timeline?.map((event: Timeline, idx: number) => (
                                <div key={idx} className="flex items-start space-x-3">
                                  <div className={`p-1 rounded-full ${
                                    event.completed ? 'bg-green-100' : 'bg-slate-100'
                                  }`}>
                                    {event.completed ? <CheckCircle className="h-3 w-3 text-green-600" /> : 
                                    <Clock className="h-3 w-3 text-slate-600" />}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-900">{event.stage}</p>
                                    <p className="text-xs text-gray-500">{event.actor} • {event.time}</p>
                                    {event.notes && (
                                      <p className="text-xs text-gray-600 mt-1 italic">&ldquo;{event.notes}&rdquo;</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends">
                <Card className="bg-white border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-indigo-500" />
                      Issue Trends & Patterns
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Identify recurring problems and seasonal patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-900 bg-white border border-gray-200">
                      View Full Trends <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
