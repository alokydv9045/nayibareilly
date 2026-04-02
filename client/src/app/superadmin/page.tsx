"use client"

import { useState, useEffect, useCallback } from 'react'
import { config } from '@/lib/constants/app.config'
import socketService from '@/lib/services/socket-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Toaster, toast } from 'react-hot-toast'
import { 
  Crown,
  Users,
  Building2,
  Settings,
  Shield,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Lock,
  Eye,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { tokenStorage } from '@/lib/auth/auth-utils'

interface RealtimeIssue { reportId: string; title: string; status: string; timeline: string }
interface ModeratorPerformance { id: string; name: string; reviewedCount: number; avgReviewTime: number; accuracy: number; qualityScore: number }

export default function SuperAdminDashboard() {

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
    totalIssues: 0,
    systemHealth: 100,
    activeUsers: 0,
    pendingApprovals: 0
  })

  const [realtimeIssues, setRealtimeIssues] = useState<RealtimeIssue[]>([])
  const [moderatorPerformance, setModeratorPerformance] = useState<ModeratorPerformance[]>([])

  const fetchDashboardStats = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? tokenStorage.get() : null
      const apiRoot = config.api.fullUrl.replace(/\/$/, '')
      const response = await fetch(`${apiRoot}/admin/super-admin/stats`, token ? {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      } : undefined)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
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
      const response = await fetch(`${apiRoot}/admin/super-admin/issues/realtime`, token ? {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      } : undefined)
      if (response.ok) {
        const data = await response.json()
        setRealtimeIssues(data)
      }
    } catch {
      // Silent fail for realtime updates
    }
  }, [])

  const fetchModeratorPerformance = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? tokenStorage.get() : null
      const apiRoot = config.api.fullUrl.replace(/\/$/, '')
      const response = await fetch(`${apiRoot}/admin/super-admin/moderators/performance`, token ? {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      } : undefined)
      if (response.ok) {
        const data = await response.json()
        setModeratorPerformance(data)
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
      toast('Dashboard updated with latest data!')
    }
    socketService.on('issue:new', handleIssue)
    socketService.on('issue:update', handleIssue)
    socketService.on('issue:status', handleIssue)

    return () => {
      clearInterval(interval)
      socketService.off('issue:new', handleIssue)
      socketService.off('issue:update', handleIssue)
      socketService.off('issue:status', handleIssue)
    }
  }, [fetchDashboardStats, fetchModeratorPerformance, fetchRealtimeIssues])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="container mx-auto p-6">
        <Toaster position="top-right" />
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl shadow-lg">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Super Admin Dashboard</h1>
                <p className="text-purple-200">Complete system control and oversight</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-500 text-white animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                System Online
              </Badge>
              <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
                  <p className="text-xs text-green-400 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    {stats.activeUsers} active now
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="h-8 w-8 text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Departments</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.totalDepartments}</p>
                  <p className="text-xs text-purple-300 mt-1">All active</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Building2 className="h-8 w-8 text-purple-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Total Issues</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.totalIssues}</p>
                  <p className="text-xs text-yellow-400 mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {stats.pendingApprovals} pending review
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-yellow-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">System Health</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.systemHealth}%</p>
                  <p className="text-xs text-green-400 mt-1">
                    <CheckCircle className="h-3 w-3 inline mr-1" />
                    All systems operational
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Activity className="h-8 w-8 text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/superadmin/users">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer hover:scale-105 transform">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Management
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Create, edit, and manage all user accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-white text-2xl font-bold">{stats.totalUsers}</span>
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    View All â†’
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/superadmin/departments">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer hover:scale-105 transform">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Department Management
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Manage departments and assign heads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-white text-2xl font-bold">{stats.totalDepartments}</span>
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Manage â†’
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/issues">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer hover:scale-105 transform">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Issue Override
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Complete visibility and control over all issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-white text-2xl font-bold">{stats.totalIssues}</span>
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    View Issues â†’
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/superadmin/analytics">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer hover:scale-105 transform">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Analytics & Reports
                </CardTitle>
                <CardDescription className="text-purple-200">
                  System-wide analytics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="text-white hover:bg-white/10 w-full">
                  View Analytics â†’
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/superadmin/security">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer hover:scale-105 transform">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Security & Logs
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Audit trails and security monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="text-white hover:bg-white/10 w-full">
                  View Logs â†’
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/superadmin/settings">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer hover:scale-105 transform">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  System Settings
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Configure platform-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="text-white hover:bg-white/10 w-full">
                  Configure â†’
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Real-time Issue Monitor */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Live System Dashboard
              <Badge className="ml-3 bg-red-500 animate-pulse">LIVE</Badge>
            </CardTitle>
            <CardDescription className="text-purple-200">
              Real-time issue processing across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {realtimeIssues.length === 0 ? (
                <div className="text-center py-8 text-purple-300">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No active issues being processed right now</p>
                </div>
              ) : (
                realtimeIssues.map((issue, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-purple-500">#{issue.reportId}</Badge>
                          <h3 className="text-white font-semibold">{issue.title}</h3>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center text-purple-200">
                            <Clock className="h-3 w-3 mr-2" />
                            {issue.timeline}
                          </div>
                        </div>
                      </div>
                      <Badge className={
                        issue.status === 'COMPLETED' ? 'bg-green-500' :
                        issue.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                        issue.status === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-500'
                      }>
                        {issue.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Moderator Performance Tracking */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Moderator Performance Tracking
            </CardTitle>
            <CardDescription className="text-purple-200">
              Monitor moderator efficiency and assignment accuracy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moderatorPerformance.length === 0 ? (
                <div className="text-center py-8 text-purple-300">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No moderator data available</p>
                </div>
              ) : (
                moderatorPerformance.map((moderator, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-semibold">{moderator.name}</h4>
                      <Badge className="bg-green-500">Quality: {moderator.qualityScore}/100</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-purple-300">Issues Reviewed</p>
                        <p className="text-white font-bold text-lg">{moderator.reviewedCount}</p>
                      </div>
                      <div>
                        <p className="text-purple-300">Avg Review Time</p>
                        <p className="text-white font-bold text-lg">{moderator.avgReviewTime}m</p>
                      </div>
                      <div>
                        <p className="text-purple-300">Assignment Accuracy</p>
                        <p className="text-white font-bold text-lg">{moderator.accuracy}%</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}