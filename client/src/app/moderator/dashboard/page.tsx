"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Activity,
  TrendingUp,
  Eye,
  ArrowRight
} from 'lucide-react'
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute'
import { useModeratorAPI } from '@/hooks/api/useModeratorAPI'

export default function ModeratorDashboard() {
  const router = useRouter()
  const { fetchStats } = useModeratorAPI()
  
  const [isLoading, setIsLoading] = useState(true)
  
  const [dashboardStats, setDashboardStats] = useState({
    pendingReviews: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalReviewed: 0,
    avgResponseTime: 0
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
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchStats])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const handleRefresh = () => {
    loadStats()
  }

  const statCards = [
    {
      title: "Pending Reviews",
      value: dashboardStats.pendingReviews,
      icon: <Clock className="h-4 w-4" />,
      description: "Issues awaiting moderation",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/moderator/pending"
    },
    {
      title: "Approved Today",
      value: dashboardStats.approvedToday,
      icon: <CheckCircle className="h-4 w-4" />,
      description: "Issues approved in last 24h",
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/moderator/approved"
    },
    {
      title: "Rejected Today",
      value: dashboardStats.rejectedToday,
      icon: <AlertTriangle className="h-4 w-4" />,
      description: "Issues rejected in last 24h",
      color: "text-red-600",
      bgColor: "bg-red-50",
      href: "/moderator/rejected"
    },
    {
      title: "Total Reviewed",
      value: dashboardStats.totalReviewed,
      icon: <FileText className="h-4 w-4" />,
      description: "All-time moderated issues",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/moderator/history"
    }
  ]

  const quickActions = [
    {
      title: "Review Pending Issues",
      description: "Review and moderate pending issue reports",
      icon: <Shield className="h-5 w-5" />,
      href: "/moderator/pending",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "View Analytics",
      description: "Check moderation statistics and trends",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/moderator/analytics",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Issue Categories",
      description: "Manage issue categories and priorities",
      icon: <FileText className="h-5 w-5" />,
      href: "/moderator/categories",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Quality Control",
      description: "Review flagged or disputed issues",
      icon: <Activity className="h-5 w-5" />,
      href: "/moderator/quality",
      color: "bg-indigo-500 hover:bg-indigo-600"
    }
  ]

  return (
    <ProtectedRoute requiredRoles={['moderator']}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Moderator Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage and review community reports</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                <Shield className="h-3 w-3 mr-1" />
                Moderator Access
              </Badge>
              <Button 
                variant="outline" 
                onClick={() => handleRefresh()}
                disabled={isLoading}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Refresh Stats
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(stat.href)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">
                  {isLoading ? "..." : stat.value.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(action.href)}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg text-white ${action.color}`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {action.description}
                      </p>
                      <div className="flex items-center text-sm text-blue-600">
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
              <div className="text-center py-8 text-gray-500">
                Loading recent activity...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-500 text-center py-8">
                  Recent activity will appear here once you start moderating issues.
                </div>
                <div className="text-center">
                  <Button onClick={() => router.push('/moderator/pending')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Start Reviewing Issues
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}