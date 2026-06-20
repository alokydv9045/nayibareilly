"use client"

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
  Target, Gauge, Filter, LogOut, ChevronRight
} from 'lucide-react'
import { config } from '@/lib/constants/config'
import { tokenStorage, userStorage } from '@/lib/auth/auth-utils'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface DeptPerf { name: string; issuesAssigned: number; resolved: number; inProgress: number; performance: number; avgTime: number; slaCompliance: number }
interface Timeline { stage: string; actor: string; time: string; completed: boolean; notes?: string }
interface RecentIssue { reportId: string; title: string; description: string; status: string; timeline?: Timeline[]; totalTime: string; responseTime: string; citizenRating?: number }

export default function MayorDashboard() {
  const router = useRouter()
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

  const handleLogout = () => {
    tokenStorage.remove(); userStorage.remove()
    router.push('/login')
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 text-amber-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-16 bg-white border-r border-amber-200/60 flex flex-col items-center py-6 gap-4 z-50">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
          <Building className="h-6 w-6 text-amber-950" />
        </div>
        <nav className="flex flex-col gap-3 mt-4">
          {[
            { icon: MapIcon, tab: 'overview', tip: 'City Overview' },
            { icon: Building, tab: 'departments', tip: 'Departments' },
            { icon: Activity, tab: 'live', tip: 'Live Tracking' },
            { icon: TrendingUp, tab: 'trends', tip: 'Trends' },
          ].map(({ icon: Icon, tab, tip }) => (
            <button key={tab} onClick={() => setActiveTab(tab)} title={tip}
              className={`p-2.5 rounded-xl transition-all ${activeTab === tab ? 'bg-indigo-600/30 text-indigo-600' : 'text-amber-800/80 hover:text-amber-950 hover:bg-amber-100/50'}`}>
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </nav>
        <div className="mt-auto">
          <button onClick={handleLogout} title="Logout"
            className="p-2.5 rounded-xl text-amber-800/80 hover:text-red-600 hover:bg-red-500/10 transition-all">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-16 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white border-b border-amber-200/60 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-950">Mayor Dashboard</h1>
            <p className="text-xs text-indigo-600/60 mt-0.5">City-wide oversight and performance monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-indigo-500/20 text-indigo-600 border border-indigo-200 gap-1.5">
              <Eye className="h-3 w-3" />
              Read-Only Access
            </Badge>
            <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={isRefreshing}
              className="text-amber-800/80 hover:text-amber-950 hover:bg-amber-100/50 border border-amber-200/60">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-amber-950 border border-indigo-500"
              onClick={() => toast.success('Exporting Report...')}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Top Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-white border border-amber-200/60 ">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-950 flex items-center text-base">
                  <Gauge className="h-4 w-4 mr-2 text-emerald-600" />
                  City Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={healthColor} strokeWidth="3" strokeDasharray={`${stats.cityHealthScore}, 100`} />
                    </svg>
                    <span className="text-3xl font-bold text-amber-950">{stats.cityHealthScore}%</span>
                  </div>
                  <p className="text-sm text-indigo-200 mt-4 font-medium">
                    {stats.cityHealthScore >= 80 ? 'Excellent Condition' : stats.cityHealthScore >= 60 ? 'Good Standing' : 'Needs Attention'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-amber-200/60 ">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-950 flex items-center text-base">
                  <Zap className="h-4 w-4 mr-2 text-amber-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <Button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-600 border border-red-200 justify-start">
                  <Bell className="h-4 w-4 mr-3" />Emergency Alert
                </Button>
                <Button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 border border-blue-200 justify-start">
                  <Users className="h-4 w-4 mr-3" />Deploy Staff
                </Button>
                <Button className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 border border-emerald-200 justify-start">
                  <MessageSquare className="h-4 w-4 mr-3" />Public Notice
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border border-amber-200/60 ">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-950 flex items-center text-base">
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                  Emergency Issues
                  <Badge className="ml-2 bg-red-500 text-amber-950 animate-pulse text-xs py-0 px-1.5">{emergencyIssues.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {emergencyIssues.map((issue, i) => (
                  <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-amber-950 mb-1">{issue.title}</p>
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{issue.location} • {issue.time}
                      </p>
                    </div>
                    <Badge className={`border text-xs ${issue.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-600 border-red-200' : 'bg-orange-500/20 text-orange-600 border-orange-200'}`}>
                      {issue.priority}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { label: 'Total Issues', value: stats.totalIssues, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-500/20', progVal: 100, progCol: 'bg-blue-500', sub: 'All time reports' },
              { label: 'Resolved Issues', value: stats.resolvedIssues, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-500/20', progVal: Math.round((stats.resolvedIssues / Math.max(stats.totalIssues, 1)) * 100) || 0, progCol: 'bg-emerald-500', sub: `Target: 85% • Current: ${Math.round((stats.resolvedIssues / Math.max(stats.totalIssues, 1)) * 100) || 0}%` },
              { label: 'Response Time', value: `${stats.averageResolutionTime}h`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/20', progVal: 70, progCol: 'bg-amber-500', sub: 'Target: 72h' },
              { label: 'Citizen Satisfaction', value: `${stats.citizenSatisfaction}%`, icon: ThumbsUp, color: 'text-purple-600', bg: 'bg-purple-500/20', progVal: stats.citizenSatisfaction, progCol: 'bg-purple-500', sub: 'Based on citizen feedback' },
            ].map((card, i) => {
              const Icon = card.icon
              return (
                <Card key={i} className="bg-white border border-amber-200/60  hover:bg-amber-50/50 hover:border-amber-200/60 transition-all cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-amber-800/80 mb-1">{card.label}</p>
                        <p className="text-3xl font-bold text-amber-950">{card.value}</p>
                      </div>
                      <div className={`p-2.5 rounded-xl ${card.bg}`}>
                        <Icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                    </div>
                    <Progress value={card.progVal} className="h-1.5 bg-amber-100/50" indicatorClassName={card.progCol} />
                    <p className={`text-xs mt-3 flex items-center gap-1 ${card.color}`}>
                      <Target className="h-3 w-3" />{card.sub}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Activity & Staff */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white border border-amber-200/60 ">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-amber-950 flex items-center text-base">
                  <Activity className="h-4 w-4 mr-2 text-indigo-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {recentActivity.map((act, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-amber-200/60">
                    <div className={`p-2 rounded-full ${act.type === 'success' ? 'bg-emerald-500/20' : act.type === 'warning' ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}>
                      {act.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : act.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-amber-600" /> : <Activity className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-950">{act.action}</p>
                      <p className="text-xs text-amber-800/80">{act.department} • {act.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border border-amber-200/60 ">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-950 flex items-center text-base">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  Staff Force Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-amber-950">{stats.activeStaff}</p>
                  <p className="text-xs text-amber-800/80 mt-1">Total Active Staff</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-800/80">On Duty</span>
                    <Badge className="bg-emerald-500/20 text-emerald-600 border border-emerald-200">{Math.floor(stats.activeStaff * 0.8)}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-800/80">Field Work</span>
                    <Badge className="bg-blue-500/20 text-blue-600 border border-blue-200">{Math.floor(stats.activeStaff * 0.6)}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-800/80">Available</span>
                    <Badge className="bg-amber-500/20 text-amber-600 border border-amber-200">{Math.floor(stats.activeStaff * 0.2)}</Badge>
                  </div>
                </div>
                <Button className="w-full bg-amber-100/50 hover:bg-amber-200/50 text-amber-950 border border-amber-200/60">
                  <Phone className="h-4 w-4 mr-2" />Contact Head
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tabs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-amber-950 flex items-center gap-2">
                <Filter className="h-5 w-5 text-indigo-600" />
                City Management Center
              </h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white border border-amber-200/60 p-1 mb-6">
                {[
                  { id: 'overview', icon: MapIcon, label: 'Overview' },
                  { id: 'departments', icon: Building, label: 'Departments' },
                  { id: 'live', icon: Activity, label: 'Live Tracking' },
                  { id: 'trends', icon: TrendingUp, label: 'Trends' },
                ].map(t => (
                  <TabsTrigger key={t.id} value={t.id} className="data-[state=active]:bg-indigo-600/40 data-[state=active]:text-amber-950 text-amber-800/80 gap-2 px-4">
                    <t.icon className="h-4 w-4" />{t.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white border border-amber-200/60  hover:bg-amber-50/50 transition-all cursor-pointer group">
                    <CardHeader>
                      <CardTitle className="text-amber-950 flex items-center text-base"><MapIcon className="h-5 w-5 mr-2 text-teal-400" />City Heatmap</CardTitle>
                      <CardDescription className="text-amber-800/80">Geographic distribution of issues</CardDescription>
                    </CardHeader>
                    <CardContent><Button variant="ghost" className="w-full text-amber-800/80 group-hover:text-amber-950 bg-white border border-amber-200/60">View Map <ChevronRight className="h-4 w-4 ml-1" /></Button></CardContent>
                  </Card>
                  <Card className="bg-white border border-amber-200/60  hover:bg-amber-50/50 transition-all cursor-pointer group">
                    <CardHeader>
                      <CardTitle className="text-amber-950 flex items-center text-base"><BarChart3 className="h-5 w-5 mr-2 text-purple-600" />Deep Analytics</CardTitle>
                      <CardDescription className="text-amber-800/80">Comprehensive data and reports</CardDescription>
                    </CardHeader>
                    <CardContent><Button variant="ghost" className="w-full text-amber-800/80 group-hover:text-amber-950 bg-white border border-amber-200/60">View Analytics <ChevronRight className="h-4 w-4 ml-1" /></Button></CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="departments">
                <Card className="bg-white border border-amber-200/60 ">
                  <CardHeader><CardTitle className="text-amber-950">Department Efficiency Metrics</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {departmentPerformance.length === 0 ? <p className="text-amber-800/80 text-center py-6 text-sm">No data</p> : 
                      departmentPerformance.map((dept, i) => (
                        <div key={i} className="bg-white rounded-xl p-5 border border-amber-200/60 flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${dept.performance >= 80 ? 'bg-emerald-500/20' : dept.performance >= 60 ? 'bg-amber-500/20' : 'bg-red-500/20'}`}>
                                <Building className="h-5 w-5 text-amber-950" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-amber-950">{dept.name}</h4>
                                <p className="text-xs text-amber-800/80">{dept.issuesAssigned} assignments</p>
                              </div>
                            </div>
                            <Badge className={`border ${dept.performance >= 80 ? 'bg-emerald-500/20 text-emerald-600 border-emerald-200' : dept.performance >= 60 ? 'bg-amber-500/20 text-amber-600 border-amber-200' : 'bg-red-500/20 text-red-600 border-red-200'}`}>{dept.performance}% Perf</Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm border-t border-amber-200/60 pt-4">
                            <div><p className="text-amber-800/80 text-xs mb-1">Resolved</p><p className="font-bold text-amber-950">{dept.resolved}</p></div>
                            <div><p className="text-amber-800/80 text-xs mb-1">In Progress</p><p className="font-bold text-amber-950">{dept.inProgress}</p></div>
                            <div><p className="text-amber-800/80 text-xs mb-1">Avg Time</p><p className="font-bold text-amber-950">{dept.avgTime}h</p></div>
                            <div><p className="text-amber-800/80 text-xs mb-1">SLA</p><p className="font-bold text-amber-950">{dept.slaCompliance}%</p></div>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="live">
                <Card className="bg-white border border-amber-200/60 ">
                  <CardHeader><CardTitle className="text-amber-950 flex items-center">Real-time Tracking <Badge className="ml-3 bg-red-500/20 text-red-600 border border-red-200 animate-pulse text-xs">LIVE</Badge></CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {recentIssues.length === 0 ? <p className="text-amber-800/80 text-center py-6 text-sm">No recent live issues</p> :
                      recentIssues.map((iss, i) => (
                        <div key={i} className="bg-white rounded-xl p-5 border border-amber-200/60">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-blue-500/20 text-blue-600 border border-blue-200 text-xs">#{iss.reportId}</Badge>
                                <h4 className="font-semibold text-amber-950 text-sm">{iss.title}</h4>
                              </div>
                              <p className="text-xs text-amber-800/80">{iss.description}</p>
                            </div>
                            <Badge className={`border text-xs ${iss.status.includes('VERIFIED') ? 'bg-emerald-500/20 text-emerald-600 border-emerald-200' : iss.status.includes('PROGRESS') ? 'bg-blue-500/20 text-blue-600 border-blue-200' : 'bg-amber-500/20 text-amber-600 border-amber-200'}`}>{iss.status}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-xs border-t border-amber-200/60 pt-4">
                            <div><p className="text-amber-800/80 mb-1">Total Time</p><p className="font-semibold text-amber-950">{iss.totalTime}</p></div>
                            <div><p className="text-amber-800/80 mb-1">Response Time</p><p className="font-semibold text-amber-950">{iss.responseTime}</p></div>
                            {iss.citizenRating && <div><p className="text-amber-800/80 mb-1">Rating</p><p className="font-semibold text-yellow-600">{'★'.repeat(iss.citizenRating)}</p></div>}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="trends">
                <Card className="bg-white border border-amber-200/60 "><CardContent className="p-8 text-center text-amber-800/80 text-sm">Trends coming soon</CardContent></Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}