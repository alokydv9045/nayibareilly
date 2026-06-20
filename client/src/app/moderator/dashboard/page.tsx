"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Shield, AlertTriangle, CheckCircle, Clock, FileText, BarChart3,
  Activity, Eye, ArrowRight, ChevronRight, RefreshCw, LogOut,
  Inbox, History, TrendingUp, Bell, Flame, XCircle, ListFilter,
  Star
} from 'lucide-react'
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute'
import { useModeratorAPI } from '@/hooks/api/useModeratorAPI'
import { tokenStorage, userStorage } from '@/lib/auth/auth-utils'
import { toast } from 'react-hot-toast'

interface StatCard {
  title: string
  value: number
  icon: React.ElementType
  description: string
  color: string
  bgGradient: string
  href: string
}

export default function ModeratorDashboard() {
  const router = useRouter()
  const { fetchStats } = useModeratorAPI()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [dashboardStats, setDashboardStats] = useState({
    pendingReviews: 0, approvedToday: 0,
    rejectedToday: 0, totalReviewed: 0, avgResponseTime: 0
  })

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await fetchStats()
      if (data) {
        setDashboardStats({
          pendingReviews: data.pendingReviews || 0,
          approvedToday: data.reviewedToday || 0,
          rejectedToday: data.flaggedContent || 0,
          totalReviewed: data.totalReports || 0,
          avgResponseTime: data.approvalRate || 0
        })
      }
    } catch (e) {
      console.error('Failed to load stats:', e)
    } finally {
      setIsLoading(false)
    }
  }, [fetchStats])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadStats()
    setIsRefreshing(false)
    toast.success('Stats refreshed')
  }

  const handleLogout = () => {
    tokenStorage.remove()
    userStorage.remove()
    router.push('/login')
    toast.success('Logged out')
  }

  useEffect(() => { loadStats() }, [loadStats])

  const statCards: StatCard[] = [
    {
      title: 'Pending Reviews', value: dashboardStats.pendingReviews,
      icon: Inbox, description: 'Awaiting your moderation',
      color: 'text-amber-600', bgGradient: 'from-amber-500/20 to-orange-500/10 border-amber-200',
      href: '/moderator/pending'
    },
    {
      title: 'Approved Today', value: dashboardStats.approvedToday,
      icon: CheckCircle, description: 'Issues approved in last 24h',
      color: 'text-emerald-600', bgGradient: 'from-emerald-500/20 to-green-500/10 border-emerald-200',
      href: '/moderator/history'
    },
    {
      title: 'Rejected Today', value: dashboardStats.rejectedToday,
      icon: XCircle, description: 'Issues rejected in last 24h',
      color: 'text-red-600', bgGradient: 'from-red-500/20 to-rose-500/10 border-red-200',
      href: '/moderator/history'
    },
    {
      title: 'All-Time Reviewed', value: dashboardStats.totalReviewed,
      icon: FileText, description: 'Total moderated issues',
      color: 'text-blue-600', bgGradient: 'from-blue-500/20 to-indigo-500/10 border-blue-200',
      href: '/moderator/history'
    }
  ]

  const quickActions = [
    {
      title: 'Review Pending Issues',
      description: 'Review and moderate pending issue reports',
      icon: Shield,
      href: '/moderator/pending',
      gradient: 'from-amber-600 to-orange-600',
      count: dashboardStats.pendingReviews
    },
    {
      title: 'View Analytics',
      description: 'Check moderation statistics and trends',
      icon: BarChart3,
      href: '/moderator/analytics',
      gradient: 'from-blue-600 to-indigo-600',
      count: null
    },
    {
      title: 'Moderation History',
      description: 'Browse all past moderation decisions',
      icon: History,
      href: '/moderator/history',
      gradient: 'from-violet-600 to-purple-600',
      count: null
    },
    {
      title: 'Quality Control',
      description: 'Review flagged or disputed issues',
      icon: Flame,
      href: '/moderator/pending',
      gradient: 'from-rose-600 to-red-600',
      count: dashboardStats.rejectedToday
    }
  ]

  return (
    <ProtectedRoute requiredRoles={['moderator']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-amber-950 pb-8">
          {/* Topbar */}
          <header className="sticky top-0 z-40 bg-white border-b border-amber-200/60 px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-amber-950">Moderator Dashboard</h1>
              <p className="text-xs text-amber-800/80 mt-0.5">Review and manage community reports</p>
            </div>
            <div className="flex items-center gap-3">
              {dashboardStats.pendingReviews > 0 && (
                <Badge className="bg-amber-500/20 text-amber-600 border border-amber-200 gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                  {dashboardStats.pendingReviews} Pending
                </Badge>
              )}
              <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={isRefreshing}
                className="text-amber-800/80 hover:text-amber-950 hover:bg-amber-100/50 border border-amber-200/60">
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm" variant="ghost"
                className="text-amber-800/80 hover:text-amber-950 hover:bg-amber-100/50 border border-amber-200/60">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="p-8 space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {statCards.map((card) => {
                const Icon = card.icon
                return (
                  <button key={card.href} onClick={() => router.push(card.href)} className="text-left">
                    <Card className={`bg-gradient-to-br ${card.bgGradient} border  hover:scale-[1.02] transition-all group`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-2.5 bg-amber-100/50 rounded-xl">
                            <Icon className={`h-5 w-5 ${card.color}`} />
                          </div>
                          <ChevronRight className="h-4 w-4 text-amber-800/80 group-hover:text-amber-950 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-sm text-amber-800/80 mb-1">{card.title}</p>
                        <p className="text-4xl font-bold text-amber-950 mb-2">
                          {isLoading ? <span className="text-amber-800/80">—</span> : card.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-amber-800/80">{card.description}</p>
                      </CardContent>
                    </Card>
                  </button>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-base font-semibold text-amber-800/80 mb-4 flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-orange-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button key={action.href} onClick={() => router.push(action.href)}
                      className="text-left group">
                      <Card className="bg-white border border-amber-200/60 hover:border-amber-200/60 hover:bg-amber-50/50 transition-all">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 bg-gradient-to-br ${action.gradient} rounded-xl shadow-lg shrink-0`}>
                              <Icon className="h-5 w-5 text-amber-950" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-amber-950 text-sm">{action.title}</h3>
                                {action.count !== null && action.count > 0 && (
                                  <Badge className="bg-amber-500/20 text-amber-600 border border-amber-200 text-xs">{action.count}</Badge>
                                )}
                              </div>
                              <p className="text-xs text-amber-800/80 mb-3">{action.description}</p>
                              <div className="flex items-center text-xs text-blue-600 group-hover:text-blue-600 transition-colors">
                                <span>Get started</span>
                                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Performance Snapshot */}
            <Card className="bg-white border border-amber-200/60 ">
              <CardHeader>
                <CardTitle className="text-amber-950 flex items-center gap-2 text-base">
                  <Star className="h-4 w-4 text-yellow-600" />
                  Today's Performance
                </CardTitle>
                <CardDescription className="text-amber-800/80">Your moderation activity in the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-amber-800/80 text-sm">Loading activity...</div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 text-center border border-amber-200/60">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-amber-950">{dashboardStats.approvedToday}</p>
                      <p className="text-xs text-amber-800/80 mt-1">Approved</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center border border-amber-200/60">
                      <XCircle className="h-5 w-5 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-amber-950">{dashboardStats.rejectedToday}</p>
                      <p className="text-xs text-amber-800/80 mt-1">Rejected</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center border border-amber-200/60">
                      <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-amber-950">{dashboardStats.avgResponseTime}%</p>
                      <p className="text-xs text-amber-800/80 mt-1">Approval Rate</p>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex gap-3">
                  <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-amber-950 text-sm"
                    onClick={() => router.push('/moderator/pending')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Start Reviewing
                  </Button>
                  <Button variant="outline" className="border-amber-200/60 text-amber-800/80 hover:text-amber-950 hover:bg-amber-100/50 text-sm"
                    onClick={() => router.push('/moderator/analytics')}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
      </div>
    </ProtectedRoute>
  )
}