"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Calendar,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Target
} from 'lucide-react'
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute'
import { useModeratorAPI } from '@/hooks/api/useModeratorAPI'

interface AnalyticsData {
  totalReviewed: number
  approvalRate: number
  avgResponseTime: number
  dailyReviews: number
  weeklyTrend: number
  dailyStats: Array<{ date: string; reviews: number; approved: number; rejected?: number }>
  categoryBreakdown: Array<{ name: string; count: number; percentage: number }>
}

export default function ModeratorAnalyticsPage() {
  const router = useRouter()
  const { fetchPerformance } = useModeratorAPI()
  const [timeRange, setTimeRange] = useState("7d")
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<object | null>(null)

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await fetchPerformance()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchPerformance])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const mockAnalytics = {
    totalReviewed: 127,
    approvalRate: 78.5,
    avgResponseTime: 2.4,
    dailyReviews: 18,
    weeklyTrend: 12.5,
    categoryBreakdown: [
      { name: "Infrastructure", count: 45, percentage: 35.4 },
      { name: "Sanitation", count: 32, percentage: 25.2 },
      { name: "Safety", count: 28, percentage: 22.0 },
      { name: "Environment", count: 22, percentage: 17.4 }
    ],
    dailyStats: [
      { date: "Mon", reviews: 15, approved: 12, rejected: 3 },
      { date: "Tue", reviews: 22, approved: 18, rejected: 4 },
      { date: "Wed", reviews: 18, approved: 14, rejected: 4 },
      { date: "Thu", reviews: 25, approved: 19, rejected: 6 },
      { date: "Fri", reviews: 20, approved: 16, rejected: 4 },
      { date: "Sat", reviews: 12, approved: 9, rejected: 3 },
      { date: "Sun", reviews: 15, approved: 12, rejected: 3 }
    ]
  }

  // Use mock data since API integration is not complete
  const data = (analytics || mockAnalytics) as AnalyticsData

  const statCards = [
    {
      title: "Total Reviewed",
      value: data.totalReviewed || 0,
      icon: <Activity className="h-4 w-4" />,
      description: "Issues reviewed this period",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Approval Rate",
      value: `${data.approvalRate || 0}%`,
      icon: <CheckCircle className="h-4 w-4" />,
      description: "Issues approved vs total",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Avg Response Time",
      value: `${data.avgResponseTime || 0}h`,
      icon: <Clock className="h-4 w-4" />,
      description: "Average time to review",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Daily Average",
      value: data.dailyReviews || 0,
      icon: <Target className="h-4 w-4" />,
      description: "Reviews per day",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ]

  return (
    <ProtectedRoute requiredRoles={['moderator']}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/moderator/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
                <p className="text-gray-600 mt-1">Track your moderation performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index}>
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
                  {isLoading ? "..." : stat.value}
                </div>
                <p className="text-xs text-gray-500">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Performance Trends
              </CardTitle>
              <CardDescription>
                Weekly review activity overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Weekly Trend</span>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{data.weeklyTrend}%</span>
                  </div>
                </div>
                
                {/* Simple bar chart representation */}
                <div className="space-y-2">
                  {data.dailyStats?.map((day: { date: string; reviews: number; approved: number }, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 text-xs text-gray-500">{day.date}</div>
                      <div className="flex-1 flex items-center space-x-1">
                        <div 
                          className="bg-blue-200 h-4 rounded-sm"
                          style={{ width: `${(day.reviews / 25) * 100}%` }}
                        />
                        <span className="text-xs text-gray-600">{day.reviews}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Category Breakdown
              </CardTitle>
              <CardDescription>
                Issues reviewed by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.categoryBreakdown?.map((category: { name: string; count: number; percentage: number }, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-gray-500">{category.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.percentage}% of total reviews
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Daily Activity
            </CardTitle>
            <CardDescription>
              Review activity breakdown by day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-sm font-medium text-gray-600">Day</th>
                    <th className="text-left p-2 text-sm font-medium text-gray-600">Reviews</th>
                    <th className="text-left p-2 text-sm font-medium text-gray-600">Approved</th>
                    <th className="text-left p-2 text-sm font-medium text-gray-600">Rejected</th>
                    <th className="text-left p-2 text-sm font-medium text-gray-600">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailyStats?.map((day: { date: string; reviews: number; approved: number; rejected?: number }, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 text-sm">{day.date}</td>
                      <td className="p-2 text-sm">{day.reviews}</td>
                      <td className="p-2 text-sm">
                        <div className="flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                          {day.approved}
                        </div>
                      </td>
                      <td className="p-2 text-sm">
                        <div className="flex items-center">
                          <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                          {day.rejected || 0}
                        </div>
                      </td>
                      <td className="p-2 text-sm">
                        <Badge variant="outline">
                          {((day.approved / day.reviews) * 100).toFixed(0)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Performance Insights
            </CardTitle>
            <CardDescription>
              Key insights based on your moderation activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Great Job!</span>
                </div>
                <p className="text-sm text-green-700">
                  Your approval rate is above average, showing good judgment in issue quality assessment.
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">Quick Responses</span>
                </div>
                <p className="text-sm text-blue-700">
                  Your average response time is excellent, helping maintain efficient issue flow.
                </p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="font-medium text-orange-800">Growing Impact</span>
                </div>
                <p className="text-sm text-orange-700">
                  Your review volume has increased this week, contributing to faster issue resolution.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}