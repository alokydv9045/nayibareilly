"use client"
import AnimatedHeading from '@/components/ui/AnimatedHeading'

import { useState, useEffect, useCallback } from 'react'
import { config } from '@/lib/constants/app.config'
import socketService from '@/lib/services/socket-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import {
  Crown, Users, Building2, Settings, Shield, BarChart3,
  AlertTriangle, CheckCircle, Clock, TrendingUp, Activity,
  Lock, Eye, RefreshCw, LogOut, ChevronRight, Database,
  Zap, Bell, Search, UserCog, FileBarChart, Layers,
  ArrowUpRight, Cpu, Globe, UserCheck, Terminal, Server
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { tokenStorage, userStorage } from '@/lib/auth/auth-utils'
import { api } from '@/lib/api/client'

interface RealtimeIssue { reportId: string; title: string; status: string; timeline: string }
interface ModeratorPerformance { id: string; name: string; reviewedCount: number; avgReviewTime: number; accuracy: number; qualityScore: number }

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'bg-emerald-500/20 text-emerald-600 border-emerald-200',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-600 border-blue-200',
  PENDING: 'bg-amber-500/20 text-amber-600 border-gray-200',
}

export default function TechAdminDashboard() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats, setStats] = useState({
    totalUsers: 0, totalDepartments: 0, totalIssues: 0,
    systemHealth: 100, activeUsers: 0, pendingApprovals: 0,
    databaseNodes: '1/1', apiRequests: '0', systemUptime: '100%'
  })
  const [realtimeIssues, setRealtimeIssues] = useState<RealtimeIssue[]>([])
  const [moderatorPerformance, setModeratorPerformance] = useState<ModeratorPerformance[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [systemLogs, setSystemLogs] = useState<{ id?: string; timestamp: string; level: 'INFO'|'WARN'|'ERROR'; message: string; source: string }[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/techadmin/stats')
      setStats(res.data?.data || res.data)
    } catch { /* silent */ }
  }, [])

  const fetchRealtimeIssues = useCallback(async () => {
    try {
      const res = await api.get('/admin/techadmin/realtime-issues')
      setRealtimeIssues(res.data?.data || res.data || [])
    } catch { /* silent */ }
  }, [])

  const fetchModeratorPerformance = useCallback(async () => {
    try {
      const res = await api.get('/admin/techadmin/moderator-performance')
      setModeratorPerformance(res.data?.data || res.data || [])
    } catch { /* silent */ }
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.get('/admin/activity-logs?limit=100')
      const rawLogs = res.data?.data?.items || res.data?.data?.logs || []
      const mappedLogs = rawLogs.map((log: any) => {
        let level: 'INFO' | 'WARN' | 'ERROR' = 'INFO'
        let source = 'system-service'
        const actionStr = String(log.action).toUpperCase()
        const descStr = String(log.description || '').toUpperCase()
        
        if (actionStr.includes('FAIL') || descStr.includes('FAIL') || descStr.includes('WARN')) {
          level = 'WARN'
        } else if (actionStr.includes('ERROR') || descStr.includes('ERROR') || (actionStr.includes('FAIL') && actionStr.includes('CRITICAL'))) {
          level = 'ERROR'
        }
        
        if (actionStr.includes('LOGIN') || actionStr.includes('LOGOUT') || actionStr.includes('REGISTER') || actionStr.includes('AUTH') || actionStr.includes('PASSWORD') || actionStr.includes('OTP')) {
          source = 'auth-service'
        } else if (log.issueId) {
          source = 'issue-service'
        } else if (actionStr.includes('ASSIGN') || actionStr.includes('DEPARTMENT') || descStr.includes('ASSIGN')) {
          source = 'department-service'
        } else if (actionStr.includes('AUDIT') || actionStr.includes('TECH_ADMIN') || actionStr.includes('ADMIN')) {
          source = 'techadmin'
        }

        return {
          id: log.id,
          timestamp: log.createdAt || new Date().toISOString(),
          level,
          source,
          message: log.description || ''
        }
      })
      setSystemLogs(mappedLogs)
    } catch { /* silent */ }
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await Promise.all([fetchStats(), fetchRealtimeIssues(), fetchModeratorPerformance(), fetchLogs()])
    setIsRefreshing(false)
    toast.success('Dashboard refreshed')
  }, [fetchStats, fetchRealtimeIssues, fetchModeratorPerformance, fetchLogs])

  const handleLogout = useCallback(() => {
    tokenStorage.remove()
    userStorage.remove()
    router.push('/login')
    toast.success('Logged out successfully')
  }, [router])

  useEffect(() => {
    fetchStats(); fetchRealtimeIssues(); fetchModeratorPerformance(); fetchLogs()
    const poll = setInterval(fetchRealtimeIssues, 60000)
    const clock = setInterval(() => setCurrentTime(new Date()), 1000)
    const onIssue = () => { fetchRealtimeIssues(); fetchStats() }
    socketService.on('issue:new', onIssue)
    socketService.on('issue:update', onIssue)
    socketService.on('issue:status', onIssue)
    socketService.on('issue:deleted', onIssue)
    socketService.on('system:user:updated', fetchStats)
    socketService.on('system:departments:updated', fetchStats)
    return () => {
      clearInterval(poll); clearInterval(clock)
      socketService.off('issue:new', onIssue)
      socketService.off('issue:update', onIssue)
      socketService.off('issue:status', onIssue)
      socketService.off('issue:deleted', onIssue)
      socketService.off('system:user:updated', fetchStats)
      socketService.off('system:departments:updated', fetchStats)
    }
  }, [fetchStats, fetchModeratorPerformance, fetchRealtimeIssues, fetchLogs])

  useEffect(() => {
    const onActivityLog = (log: any) => {
      const newLog = {
        id: log.id,
        timestamp: log.timestamp || new Date().toISOString(),
        level: (log.level || 'INFO') as 'INFO'|'WARN'|'ERROR',
        source: log.source || 'system-service',
        message: log.message || log.details || ''
      }
      setSystemLogs(prev => {
        if (prev.some(item => item.id === newLog.id)) {
          return prev
        }
        return [newLog, ...prev].slice(0, 100)
      })
    }

    socketService.on('activity:log', onActivityLog)
    return () => {
      socketService.off('activity:log', onActivityLog)
    }
  }, [])

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, sub: `${stats.activeUsers} active now`, icon: Users, iconBg: 'bg-blue-500/20', iconColor: 'text-blue-600', trend: 'text-emerald-600' },
    { label: 'Database Nodes', value: stats.databaseNodes || '1/1', sub: 'Healthy cluster', icon: Database, iconBg: 'bg-violet-500/20', iconColor: 'text-violet-600', trend: 'text-emerald-600' },
    { label: 'API Requests', value: stats.apiRequests || '0', sub: 'Last 24 hours', icon: Server, iconBg: 'bg-amber-500/20', iconColor: 'text-amber-600', trend: 'text-amber-600' },
    { label: 'System Uptime', value: stats.systemUptime || `100%`, sub: 'All systems operational', icon: Cpu, iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-600', trend: 'text-emerald-600' },
  ]

  const navCards = [
    { href: '/techadmin/users', icon: UserCog, label: 'User Management', desc: 'Manage accounts, roles & permissions', value: stats.totalUsers, color: 'from-blue-600/20 to-blue-800/20 border-blue-200 hover:border-blue-400/60' },
    { href: '/techadmin/departments', icon: Building2, label: 'Departments', desc: 'Manage departments and assign heads', value: stats.totalDepartments, color: 'from-violet-600/20 to-violet-800/20 border-violet-200 hover:border-violet-400/60' },
    { href: '/issues', icon: Layers, label: 'Issue Override', desc: 'Full visibility and control over all issues', value: stats.totalIssues, color: 'from-amber-600/20 to-amber-800/20 border-gray-200 hover:border-amber-400/60' },
    { href: '/techadmin/analytics', icon: BarChart3, label: 'Analytics & Reports', desc: 'System-wide analytics and insights', value: null, color: 'from-cyan-600/20 to-cyan-800/20 border-cyan-200 hover:border-cyan-400/60' },
    { href: '/techadmin/audit', icon: Lock, label: 'Security & Audit', desc: 'Audit trails and security monitoring', value: null, color: 'from-red-600/20 to-red-800/20 border-red-200 hover:border-red-400/60' },
    { href: '/techadmin/settings', icon: Settings, label: 'System Settings', desc: 'Configure platform-wide settings', value: null, color: 'from-slate-600/20 to-slate-800/20 border-slate-500/30 hover:border-slate-400/60' },
    { href: '/techadmin/webhooks', icon: Zap, label: 'Webhook Manager', desc: 'Configure external integrations (Slack, Discord)', value: null, color: 'from-emerald-600/20 to-green-800/20 border-emerald-200 hover:border-emerald-400/60' },
    { href: '/techadmin/db-health', icon: Database, label: 'DB Health & Archiving', desc: 'Database health check and data retention policy', value: null, color: 'from-orange-600/20 to-amber-800/20 border-gray-200 hover:border-amber-400/60' },
    { href: '/techadmin/api-keys', icon: Shield, label: 'Developer Portal Keys', desc: 'API keys for universities & civic developers', value: null, color: 'from-indigo-600/20 to-purple-800/20 border-indigo-200 hover:border-indigo-400/60' },
  ]

  return (
    <div className="min-h-screen bg-transparent pb-8">
        {/* Topbar */}
        <header className="sticky top-16 lg:top-0 z-40 bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <AnimatedHeading as="h1" className="text-xl md:text-2xl font-bold text-gray-900">Tech Admin & Systems Dashboard</AnimatedHeading>
            <p className="text-xs text-blue-600 mt-0.5">
              {isMounted ? `${currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} • ${currentTime.toLocaleTimeString('en-IN')}` : 'Loading time...'}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Badge className="bg-emerald-500/20 text-emerald-600 border border-emerald-200 gap-1.5 hidden sm:flex">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              System Online
            </Badge>
            <Button size="sm" variant="ghost"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200"
              onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" variant="ghost"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200">
              <Search className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {statCards.map((card, i) => {
              const Icon = card.icon
              return (
                <Card key={i} className="bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-200 transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">{card.label}</p>
                        <p className="text-4xl font-bold text-gray-900">{card.value}</p>
                        <p className={`text-xs mt-2 flex items-center gap-1 ${card.trend}`}>
                          <TrendingUp className="h-3 w-3" />
                          {card.sub}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${card.iconBg}`}>
                        <Icon className={`h-6 w-6 ${card.iconColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Navigation Cards */}
          <div>
            <h2 className="text-lg font-semibold text-gray-600 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Management Modules
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {navCards.map((card) => {
                const Icon = card.icon
                return (
                  <Link key={card.href} href={card.href}>
                    <Card className={`bg-gradient-to-br ${card.color}  border transition-all cursor-pointer hover:scale-[1.02] group`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-2.5 bg-amber-100/50 rounded-xl">
                            <Icon className="h-5 w-5 text-gray-900" />
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">{card.label}</h3>
                        <p className="text-sm text-gray-600 mb-4">{card.desc}</p>
                        {card.value !== null && (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900">{card.value}</span>
                            <ArrowUpRight className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Bottom Grid: Live Issues + Moderator Performance */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Live Issue Feed */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
                    <Zap className="h-4 w-4 text-amber-600" />
                    Live Issue Feed
                  </CardTitle>
                  <Badge className="bg-red-500/20 text-red-600 border border-red-200 gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                    LIVE
                  </Badge>
                </div>
                <CardDescription className="text-gray-600 text-sm">Real-time issue processing across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {!Array.isArray(realtimeIssues) || realtimeIssues.length === 0 ? (
                    <div className="text-center py-10 text-gray-600">
                      <Activity className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No active issues right now</p>
                    </div>
                  ) : (
                    realtimeIssues.map((issue, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-blue-600">#{issue.reportId}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">{issue.title}</p>
                          <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {issue.timeline}
                          </p>
                        </div>
                        <Badge className={`shrink-0 border text-xs ${STATUS_COLORS[issue.status] || 'bg-amber-100/50 text-gray-600 border-gray-200'}`}>
                          {issue.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Moderator Performance */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  Moderator Performance
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">Assignment accuracy and review efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {!Array.isArray(moderatorPerformance) || moderatorPerformance.length === 0 ? (
                    <div className="text-center py-10 text-gray-600">
                      <Shield className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No moderator data available</p>
                    </div>
                  ) : (
                    moderatorPerformance.map((mod, i) => (
                      <div key={i} className="p-4 bg-white rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600">{mod.name.charAt(0)}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{mod.name}</span>
                          </div>
                          <Badge className="bg-emerald-500/20 text-emerald-600 border border-emerald-200 text-xs">
                            {mod.qualityScore}/100
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="bg-white rounded-lg p-2 text-center">
                            <p className="text-gray-600 mb-0.5">Reviewed</p>
                            <p className="text-gray-900 font-bold text-base">{mod.reviewedCount}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center">
                            <p className="text-gray-600 mb-0.5">Avg Time</p>
                            <p className="text-gray-900 font-bold text-base">{mod.avgReviewTime}m</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center">
                            <p className="text-gray-600 mb-0.5">Accuracy</p>
                            <p className="text-gray-900 font-bold text-base">{mod.accuracy}%</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Width Terminal / System Logs */}
          <Card className="bg-white border border-gray-200 font-mono shadow-2xl">
            <CardHeader className="pb-4 border-b border-gray-200 flex flex-row items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <Terminal className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-gray-900 text-base">Live System Logs</CardTitle>
                <div className="flex gap-1.5 ml-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                Connected: tail -f /var/log/nayibareilly/sys.log
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-80 overflow-y-auto p-4 space-y-1.5 text-xs">
                {systemLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-4 hover:bg-white px-2 py-1 rounded transition-colors group">
                    <span className="text-gray-600 shrink-0 w-36">
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
                    </span>
                    <span className={`shrink-0 w-16 font-semibold ${log.level === 'INFO' ? 'text-blue-600' : log.level === 'WARN' ? 'text-amber-600' : 'text-red-600'}`}>
                      [{log.level}]
                    </span>
                    <span className="text-blue-600 shrink-0 w-32 truncate">
                      {log.source}
                    </span>
                    <span className="text-slate-700 flex-1 break-all">
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}

