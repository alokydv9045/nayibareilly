"use client"
import AnimatedHeading from '@/components/ui/AnimatedHeading'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Shield, CheckCircle, FileText, BarChart3,
  Eye, ArrowRight, ChevronRight, RefreshCw,
  Inbox, History, TrendingUp, Bell, Flame, XCircle, ListFilter,
  Star, Activity, Settings, Plus, Trash2
} from 'lucide-react'
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute'
import { useModeratorAPI } from '@/hooks/api/useModeratorAPI'
import { api } from '@/lib/api/client'
import { tokenStorage, userStorage } from '@/lib/auth/auth-utils'
import { toast } from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface StatCard {
  title: string
  value: number
  icon: React.ElementType
  description: string
  color: string
  bgGradient?: string
  bgColor?: string
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

  // Announcements state
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [isManagingAnnouncements, setIsManagingAnnouncements] = useState(false)
  const [isSavingAnnouncements, setIsSavingAnnouncements] = useState(false)

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/public/announcements')
      const data = res.data?.data || res.data
      if (Array.isArray(data)) setAnnouncements(data)
    } catch (e) {
      toast.error('Failed to load announcements')
    }
  }

  const saveAnnouncements = async (updatedList: string[]) => {
    try {
      setIsSavingAnnouncements(true)
      await api.put('/moderator/announcements', { announcements: updatedList })
      setAnnouncements(updatedList)
      toast.success('Announcements updated successfully')
    } catch (e) {
      toast.error('Failed to update announcements')
    } finally {
      setIsSavingAnnouncements(false)
    }
  }

  const addAnnouncement = () => {
    if (!newAnnouncement.trim()) return
    const updated = [...announcements, newAnnouncement.trim()]
    saveAnnouncements(updated)
    setNewAnnouncement('')
  }

  const removeAnnouncement = (index: number) => {
    const updated = announcements.filter((_, i) => i !== index)
    saveAnnouncements(updated)
  }

  useEffect(() => { loadStats() }, [loadStats])

  const statCards: StatCard[] = [
    {
      title: 'Pending Reviews', value: dashboardStats.pendingReviews,
      icon: Inbox, description: 'Awaiting your moderation',
      color: 'text-amber-600', bgGradient: 'from-amber-500/20 to-orange-500/10 border-gray-200',
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
      title: "Total Reviewed",
      value: dashboardStats.totalReviewed,
      icon: FileText,
      description: "All-time moderated issues",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      href: "/moderator/history"
    }
  ]

  const quickActions = [
    {
      title: 'Review Pending Issues',
      description: 'Review and moderate pending issue reports',
      icon: <Shield className="h-5 w-5" />,
      href: '/moderator/pending',
      color: 'bg-amber-600',
      count: dashboardStats.pendingReviews
    },
    {
      title: "View Analytics",
      description: "Check moderation statistics and trends",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/moderator/analytics",
      color: "bg-emerald-500 hover:bg-emerald-600"
    },
    {
      title: "Issue Categories",
      description: "Manage issue categories and priorities",
      icon: <FileText className="h-5 w-5" />,
      href: "/moderator/categories",
      color: "bg-slate-700 hover:bg-slate-800"
    },
    {
      title: 'Quality Control',
      description: 'Review flagged or disputed issues',
      icon: <Flame className="h-5 w-5" />,
      href: '/moderator/pending',
      color: 'bg-rose-600',
      count: dashboardStats.rejectedToday
    }
  ]

  return (
    <ProtectedRoute requiredRoles={['moderator']}>
      <div className="min-h-screen bg-transparent pb-8">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <AnimatedHeading as="h1" className="text-3xl font-bold text-slate-900">Moderator Dashboard</AnimatedHeading>
            <p className="text-slate-600 mt-1">Manage and review community reports</p>
          </div>
          <div className="flex items-center gap-3">
            {dashboardStats.pendingReviews > 0 && (
              <Badge className="bg-amber-500/20 text-amber-600 border border-gray-200 gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                {dashboardStats.pendingReviews} Pending
              </Badge>
            )}
            <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={isRefreshing}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" variant="ghost"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200">
              <Bell className="h-4 w-4" />
            </Button>
            
            <Dialog open={isManagingAnnouncements} onOpenChange={(open) => {
              setIsManagingAnnouncements(open)
              if (open) fetchAnnouncements()
            }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Announcements
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Global Announcements</DialogTitle>
                  <DialogDescription>
                    Manage the public announcement ticker displayed on the homepage.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 my-4">
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Add new announcement..." 
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addAnnouncement()}
                    />
                    <Button onClick={addAnnouncement} disabled={isSavingAnnouncements || !newAnnouncement.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-2 min-h-[150px] max-h-[300px] overflow-y-auto space-y-2">
                    {announcements.length === 0 ? (
                      <p className="text-center text-slate-500 text-sm py-8">No active announcements</p>
                    ) : (
                      announcements.map((ann, i) => (
                        <div key={i} className="bg-white border border-slate-200 p-3 rounded flex justify-between items-center text-sm shadow-sm group">
                          <span className="font-medium text-slate-700">{ann}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            onClick={() => removeAnnouncement(i)}
                            disabled={isSavingAnnouncements}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
          </div>
        </header>

        <div className="px-8 pt-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-slate-200 bg-white"
                      onClick={() => router.push(stat.href)}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-1">
                      {isLoading ? "..." : stat.value.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Card key={index} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-slate-200 bg-white"
                      onClick={() => router.push(action.href)}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg text-white ${action.color}`}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {action.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">
                          {action.description}
                        </p>
                        <div className="flex items-center text-sm text-emerald-600">
                          <span>Get started</span>
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest moderation actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">
                  Loading recent activity...
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-slate-500 text-center py-8">
                    Recent activity will appear here once you start moderating issues.
                  </div>
                  <div className="text-center flex justify-center gap-2">
                    <Button onClick={() => router.push('/moderator/pending')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Start Reviewing
                    </Button>
                    <Button variant="outline" className="border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-sm"
                      onClick={() => router.push('/moderator/analytics')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
