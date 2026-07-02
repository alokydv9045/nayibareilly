"use client"
import AnimatedHeading from '@/components/ui/AnimatedHeading'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  Users,
  Target
} from 'lucide-react'
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute'
import { useModeratorAPI } from '@/hooks/api/useModeratorAPI'

interface AnalyticsData {
  reviews: {
    today: number
    week: number
    month: number
    total: number
  }
  performance: {
    avgReviewTime: number
    approvalRate: number
    qualityScore: number
  }
  breakdown: {
    approved: number
    rejected: number
    spam: number
    needsInfo: number
  }
  topCategories: Array<{ categoryId: string; _count: { _all: number } }>
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

  const data = analytics as AnalyticsData

  const statCards = [
    {
      title: "Total Reviewed",
      value: data?.reviews?.total || 0,
      icon: <Activity className="h-4 w-4" />,
      description: "Issues reviewed overall",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Approval Rate",
      value: `${data?.performance?.approvalRate || 0}%`,
      icon: <CheckCircle className="h-4 w-4" />,
      description: "Issues approved vs total",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Avg Response Time",
      value: `${Math.round(data?.performance?.avgReviewTime || 0)}h`,
      icon: <Clock className="h-4 w-4" />,
      description: "Average time to review",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Reviews Today",
      value: data?.reviews?.today || 0,
      icon: <Target className="h-4 w-4" />,
      description: "Reviews done today",
      color: "text-slate-800",
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
                <AnimatedHeading as="h1" className="text-3xl font-bold text-slate-900">Analytics & Insights</AnimatedHeading>
                <p className="text-slate-600 mt-1">Track your moderation performance</p>
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
                <CardTitle className="text-sm font-medium text-slate-600">
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
                <p className="text-xs text-slate-500">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

          {/* Category Breakdown Placeholder (Needs backend update to show category names) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Moderation Breakdown
              </CardTitle>
              <CardDescription>
                Overview of moderation decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Approved', count: data?.breakdown?.approved || 0, color: 'bg-green-600' },
                  { name: 'Rejected', count: data?.breakdown?.rejected || 0, color: 'bg-red-600' },
                  { name: 'Spam', count: data?.breakdown?.spam || 0, color: 'bg-yellow-600' },
                  { name: 'Needs Info', count: data?.breakdown?.needsInfo || 0, color: 'bg-emerald-600' },
                ].map((item, index) => {
                  const total = (data?.breakdown?.approved || 0) + (data?.breakdown?.rejected || 0) + (data?.breakdown?.spam || 0) + (data?.breakdown?.needsInfo || 0);
                  const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm text-slate-500">{item.count}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`${item.color} h-2 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-500">
                        {percentage}% of total reviews
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          {/* Removed Hardcoded Daily Stats Section */}

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
              
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-emerald-600 mr-2" />
                  <span className="font-medium text-blue-800">Quick Responses</span>
                </div>
                <p className="text-sm text-emerald-700">
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
