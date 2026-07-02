"use client"

import { useState, useEffect, useCallback } from 'react'
import { config } from '@/lib/constants/app.config'
import socketService from '@/lib/services/socket-service'
import { Toaster, toast } from 'react-hot-toast'
import Link from 'next/link'
import { tokenStorage } from '@/lib/auth/auth-utils'
import { 
  AlertTriangle, 
  Building2,
  Settings,
  LogOut,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  MapPin,
  Info,
  Users,
  Shield,
  Eye,
  BarChart3,
  Lock,
  Activity,
  Clock,
  Server,
  UserCheck,
  LayoutDashboard
} from 'lucide-react'

interface RealtimeIssue { reportId: string; title: string; status: string; timeline: string }
interface ModeratorPerformance { id: string; name: string; reviewedCount: number; avgReviewTime: number; accuracy: number; qualityScore: number }

export default function SuperAdminDashboard() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
    totalIssues: 0,
    systemHealth: 100,
    activeUsers: 0,
    pendingApprovals: 0,
    alerts: [] as { type: string, message: string }[]
  })

  const [realtimeIssues, setRealtimeIssues] = useState<RealtimeIssue[]>([])
  const [moderatorPerformance, setModeratorPerformance] = useState<ModeratorPerformance[]>([])

  // Scroll listener for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchDashboardStats = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? tokenStorage.get() : null
      const apiRoot = config.api.fullUrl.replace(/\/$/, '')
      const response = await fetch(`${apiRoot}/admin/superadmin/stats`, token ? {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      } : undefined)
      if (response.ok) {
        const json = await response.json()
        setStats(json.data || json)
      } else {
        toast('Failed to load dashboard stats')
      }
    } catch {
      toast('Error loading dashboard data')
    }
  }, [])

  const fetchRealtimeIssues = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? tokenStorage.get() : null
      const apiRoot = config.api.fullUrl.replace(/\/$/, '')
      const response = await fetch(`${apiRoot}/admin/superadmin/realtime-issues`, token ? {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      } : undefined)
      if (response.ok) {
        const json = await response.json()
        const issues = json.data || json
        setRealtimeIssues(Array.isArray(issues) ? issues : [])
      }
    } catch {
      // Silent fail for realtime updates
    }
  }, [])

  const fetchModeratorPerformance = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? tokenStorage.get() : null
      const apiRoot = config.api.fullUrl.replace(/\/$/, '')
      const response = await fetch(`${apiRoot}/admin/superadmin/moderator-performance`, token ? {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      } : undefined)
      if (response.ok) {
        const json = await response.json()
        const perf = json.data || json
        setModeratorPerformance(Array.isArray(perf) ? perf : [])
      }
    } catch {
      // Silent fail for performance metrics
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchDashboardStats()
    fetchRealtimeIssues()
    fetchModeratorPerformance()
    
    // Polling fallback every 20s
    const interval = setInterval(() => {
      fetchRealtimeIssues()
    }, 20000)

    // Optional: refresh on socket events
    const handleIssue = () => {
      fetchRealtimeIssues()
      toast('Dashboard updated with latest data!', { icon: '🔄' })
    }
    socketService.on('issue:new', handleIssue)
    socketService.on('issue:update', handleIssue)
    socketService.on('issue:status', handleIssue)
    socketService.on('issue:deleted', handleIssue)
    socketService.on('system:departments:updated', fetchDashboardStats)
    socketService.on('system:user:updated', fetchDashboardStats)

    return () => {
      clearInterval(interval)
      socketService.off('issue:new', handleIssue)
      socketService.off('issue:update', handleIssue)
      socketService.off('issue:status', handleIssue)
      socketService.off('issue:deleted', handleIssue)
      socketService.off('system:departments:updated', fetchDashboardStats)
      socketService.off('system:user:updated', fetchDashboardStats)
    }
  }, [fetchDashboardStats, fetchModeratorPerformance, fetchRealtimeIssues])

  return (
    <div className="min-h-screen bg-transparent text-slate-900 font-sans">
      <Toaster position="top-right" />
      
      {/* TopAppBar */}
      <header className={`sticky top-0 z-50 flex justify-between items-center w-full px-10 transition-all duration-300 border-b ${isScrolled ? 'h-16 shadow-md bg-white/80 backdrop-blur-md border-slate-200/50' : 'h-[72px] bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-6">
          <span className="text-xl font-bold tracking-tight text-slate-900">Nayi Bareilly</span>
          <nav className="hidden lg:flex gap-6 items-center">
            <Link className="text-slate-900 font-bold border-b-2 border-slate-900 text-sm py-2" href="/superadmin">Dashboard</Link>
            <Link className="text-slate-500 font-medium hover:text-slate-900 transition-colors text-sm py-2" href="/issues">Grievances</Link>
            <Link className="text-slate-500 font-medium hover:text-slate-900 transition-colors text-sm py-2" href="/services">Services</Link>
            <Link className="text-slate-500 font-medium hover:text-slate-900 transition-colors text-sm py-2" href="/public-works">Public Works</Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200">
            <span className="text-xs font-medium text-slate-900 cursor-pointer">English</span>
            <div className="w-px h-3 bg-slate-300"></div>
            <span className="text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-900">Hindi</span>
          </div>
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">System Administrator</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Tech Operations</p>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                className="w-full h-full object-cover" 
                alt="Admin Profile" 
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop" 
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-72px)]">
        {/* SideNav */}
        <aside className="hidden lg:flex flex-col py-4 gap-4 h-[calc(100vh-72px)] w-64 bg-slate-50 border-r border-slate-200 sticky top-[72px]">
          <div className="px-6 mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tech Admin Console</h3>
          </div>
          <nav className="flex flex-col gap-1">
            <Link className="text-slate-900 rounded-lg mx-2 flex items-center gap-3 px-4 py-3 bg-emerald-50/50" href="/superadmin">
              <LayoutDashboard className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-medium">System Overview</span>
            </Link>
            <Link className="text-slate-600 hover:bg-slate-100 rounded-lg mx-2 flex items-center gap-3 px-4 py-3 transition-all" href="/superadmin/users">
              <UserCheck className="h-5 w-5" />
              <span className="text-sm font-medium">User Management</span>
            </Link>
            <Link className="text-slate-600 hover:bg-slate-100 rounded-lg mx-2 flex items-center gap-3 px-4 py-3 transition-all" href="/superadmin/departments">
              <Building2 className="h-5 w-5" />
              <span className="text-sm font-medium">Department Setup</span>
            </Link>
            <Link className="text-slate-600 hover:bg-slate-100 rounded-lg mx-2 flex items-center gap-3 px-4 py-3 transition-all" href="/superadmin/security">
              <Lock className="h-5 w-5" />
              <span className="text-sm font-medium">Security & Audits</span>
            </Link>
            <Link className="text-slate-600 hover:bg-slate-100 rounded-lg mx-2 flex items-center gap-3 px-4 py-3 transition-all" href="/superadmin/analytics">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm font-medium">System Analytics</span>
            </Link>
            
            <div className="mt-6 mx-4 p-4 rounded-xl bg-slate-900 text-white">
              <p className="text-xs font-medium text-white mb-3">System Integrity</p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${stats.systemHealth >= 90 ? 'bg-emerald-400' : stats.systemHealth >= 70 ? 'bg-yellow-400' : 'bg-rose-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${stats.systemHealth >= 90 ? 'bg-emerald-500' : stats.systemHealth >= 70 ? 'bg-yellow-500' : 'bg-rose-500'}`}></span>
                </span>
                <span className={`text-xs font-bold ${stats.systemHealth >= 90 ? 'text-emerald-400' : stats.systemHealth >= 70 ? 'text-yellow-400' : 'text-rose-400'}`}>
                  {stats.systemHealth >= 90 ? 'All Systems Operational' : stats.systemHealth >= 70 ? 'Degraded Performance' : 'Critical Issues Detected'}
                </span>
              </div>
            </div>
          </nav>
          
          <div className="mt-auto border-t border-slate-200 pt-4 flex flex-col gap-1">
            <Link className="text-slate-600 hover:bg-slate-100 rounded-lg mx-2 flex items-center gap-3 px-4 py-3 transition-all" href="/superadmin/settings">
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
            <button className="text-slate-600 hover:bg-slate-100 rounded-lg mx-2 flex items-center gap-3 px-4 py-3 transition-all w-full text-left">
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 max-w-[1440px] mx-auto px-10 py-8 space-y-8 h-[calc(100vh-72px)] overflow-y-auto">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Super Admin Dashboard</h2>
              <p className="text-slate-500 font-medium mt-1">Platform overview and management console</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-bold text-slate-700">System Online</span>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Users</h4>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Departments</h4>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.totalDepartments}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Grievances</h4>
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.totalIssues}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">System Health</h4>
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <Server className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.systemHealth}%</p>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/superadmin/users">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 mb-4 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <h5 className="text-base font-bold text-slate-900">User Management</h5>
                  <p className="text-xs text-slate-500 font-medium mt-1">Manage admin roles and permissions</p>
                </div>
              </Link>
              
              <Link href="/superadmin/departments">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 mb-4 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h5 className="text-base font-bold text-slate-900">Department Setup</h5>
                  <p className="text-xs text-slate-500 font-medium mt-1">Configure categories and routing</p>
                </div>
              </Link>

              <Link href="/superadmin/issues">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-rose-200 hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 mb-4 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600 transition-all">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h5 className="text-base font-bold text-slate-900">Issue Override</h5>
                  <p className="text-xs text-slate-500 font-medium mt-1">Complete visibility and control over all issues</p>
                </div>
              </Link>

              <Link href="/superadmin/analytics">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 mb-4 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h5 className="text-base font-bold text-slate-900">Analytics & Reports</h5>
                  <p className="text-xs text-slate-500 font-medium mt-1">System-wide analytics and insights</p>
                </div>
              </Link>

              <Link href="/superadmin/security">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 mb-4 group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-800 transition-all">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h5 className="text-base font-bold text-slate-900">Security & Logs</h5>
                  <p className="text-xs text-slate-500 font-medium mt-1">Audit trails and security monitoring</p>
                </div>
              </Link>

              <Link href="/superadmin/settings">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 mb-4 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all">
                    <Settings className="h-6 w-6" />
                  </div>
                  <h5 className="text-base font-bold text-slate-900">System Settings</h5>
                  <p className="text-xs text-slate-500 font-medium mt-1">Configure platform-wide settings</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Real-time Issue Monitor */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    Live System Dashboard
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white rounded animate-pulse">Live</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Real-time issue processing across the platform</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {realtimeIssues.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-20 text-slate-900" />
                  <p className="font-medium text-sm">No active issues being processed right now</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {realtimeIssues.map((issue, index) => {
                    const isCritical = issue.status === 'PENDING' || issue.title.toLowerCase().includes('critical') || issue.title.toLowerCase().includes('burst');
                    
                    return (
                      <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                                #{issue.reportId}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900">{issue.title}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                              <Clock className="h-3.5 w-3.5" />
                              {issue.timeline}
                            </div>
                          </div>
                          
                          {issue.status === 'COMPLETED' ? (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">Completed</span>
                          ) : issue.status === 'IN_PROGRESS' ? (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">In Progress</span>
                          ) : issue.status === 'PENDING' ? (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">Pending</span>
                          ) : (
                            <span className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-full">{issue.status}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Moderator Performance Tracking */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Moderator Performance Tracking</h3>
                  <p className="text-xs text-slate-500 font-medium">Monitor moderator efficiency and assignment accuracy</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {moderatorPerformance.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-20 text-slate-900" />
                  <p className="font-medium text-sm">No moderator data available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {moderatorPerformance.map((moderator, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-slate-900">{moderator.name}</h4>
                        <span className="px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded">
                          Quality: {moderator.qualityScore}/100
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Reviewed</p>
                          <p className="text-lg font-bold text-slate-900">{moderator.reviewedCount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Avg Time</p>
                          <p className="text-lg font-bold text-slate-900">{moderator.avgReviewTime}m</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Accuracy</p>
                          <p className="text-lg font-bold text-slate-900">{moderator.accuracy}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </main>
      </div>

      {/* Footer */}
      <footer className="w-full pt-10 pb-8 px-10 bg-slate-900 flex flex-col gap-8 border-t border-slate-800">
        {/* Emergency Ticker */}
        <div className="bg-slate-900/40 border-y border-slate-700/50 py-3 overflow-hidden whitespace-nowrap px-6 -mx-10">
          <div className="inline-block animate-[marquee_30s_linear_infinite]">
            {stats.alerts && stats.alerts.map((alert, idx) => (
              <span key={idx} className={`font-bold mx-8 flex items-center gap-2 inline-flex text-sm ${alert.type === 'CRITICAL' ? 'text-rose-400' : 'text-blue-400'}`}>
                {alert.type === 'CRITICAL' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                {alert.message}
              </span>
            ))}
            {/* Duplicate for seamless looping effect */}
            {stats.alerts && stats.alerts.map((alert, idx) => (
              <span key={`loop-${idx}`} className={`font-bold mx-8 flex items-center gap-2 inline-flex text-sm ${alert.type === 'CRITICAL' ? 'text-rose-400' : 'text-blue-400'}`}>
                {alert.type === 'CRITICAL' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                {alert.message}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-4">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4">Nayi Bareilly</h2>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              A modern governance portal by the Bareilly Municipal Corporation. Dedicated to transparent, efficient, and smart citizen services for a better tomorrow.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">Administrative Login <ArrowRight className="h-3 w-3" /></Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">Citizen Charter <ArrowRight className="h-3 w-3" /></Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">Sitemap <ArrowRight className="h-3 w-3" /></Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">Right to Information <ArrowRight className="h-3 w-3" /></Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">Help Desk <ArrowRight className="h-3 w-3" /></Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">Privacy Policy <ArrowRight className="h-3 w-3" /></Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">Terms of Service <ArrowRight className="h-3 w-3" /></Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 mt-4 border-t border-slate-800 gap-4">
          <p className="text-xs text-slate-500 font-medium">
            © 2024 Nayi Bareilly Municipal Corporation. Govt. of Uttar Pradesh.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-slate-500 hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="text-slate-500 hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="text-slate-500 hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  )
}