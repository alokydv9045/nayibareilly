'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Building2,
  Star,
  MapPin
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface AnalyticsData {
  summary: {
    totalIssues: number
    resolvedIssues: number
    avgResolutionTime: number
    satisfactionRating: number
    activeStaff: number
    pendingIssues: number
  }
  trends: {
    issuesOverTime: Array<{
      date: string
      issues: number
      resolved: number
    }>
    categoryBreakdown: Array<{
      category: string
      count: number
      percentage: number
    }>
    priorityDistribution: Array<{
      priority: string
      count: number
      avgResolutionTime: number
    }>
    staffPerformance: Array<{
      staffId: string
      name: string
      assignedIssues: number
      completedIssues: number
      avgResolutionTime: number
      rating: number
    }>
    wardAnalysis: Array<{
      ward: string
      issues: number
      resolved: number
      avgResolutionTime: number
    }>
    materialConsumption?: Array<{
      material: string
      count: number
    }>
  }
  insights: {
    topPerformers: Array<{
      name: string
      metric: string
      value: number
    }>
    problemAreas: Array<{
      area: string
      issue: string
      count: number
    }>
    recommendations: string[]
  }
}

export default function DepartmentAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/department/analytics?range=${dateRange}&dept=${selectedDepartment}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.ok) {
          const analyticsData = await response.json()
          setData(analyticsData)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch analytics data',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [dateRange, selectedDepartment, toast])

  const downloadReport = async () => {
    try {
      const response = await fetch(`/api/department/analytics/export?range=${dateRange}&dept=${selectedDepartment}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `department-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast({
          title: 'Success',
          description: 'Analytics report downloaded successfully'
        })
      }
    } catch (error) {
      console.error('Error downloading report:', error)
      toast({
        title: 'Error',
        description: 'Failed to download report',
        variant: 'destructive'
      })
    }
  }

  const getResolutionRate = () => {
    if (!data) return 0
    return data.summary.totalIssues > 0 
      ? Math.round((data.summary.resolvedIssues / data.summary.totalIssues) * 100)
      : 0
  }

  const formatTime = (hours: number) => {
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">Unable to load analytics data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Department Analytics</h1>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Municipal Corporation</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={downloadReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{data.summary.totalIssues}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{data.summary.resolvedIssues}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{getResolutionRate()}%</div>
            <div className="text-sm text-gray-600">Resolution Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{formatTime(data.summary.avgResolutionTime)}</div>
            <div className="text-sm text-gray-600">Avg. Resolution</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{data.summary.satisfactionRating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Satisfaction</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-indigo-600">{data.summary.activeStaff}</div>
            <div className="text-sm text-gray-600">Active Staff</div>
          </CardContent>
        </Card>
      </div>

      {/* Material Inventory & Supply Tracking */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            Material Inventory & Supply Consumption Tracker
          </CardTitle>
          <CardDescription>
            Aggregated materials consumed during issue resolutions inside this department
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!data.trends.materialConsumption || data.trends.materialConsumption.length === 0 ? (
            <p className="text-center py-6 text-sm text-gray-500">No materials recorded for task resolutions in this period.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.trends.materialConsumption.map((item, index) => (
                <div key={index} className="border border-indigo-100/60 rounded-xl p-4 bg-indigo-50/10 flex justify-between items-center shadow-sm">
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Material</p>
                    <p className="text-sm font-semibold text-slate-900">{item.material}</p>
                  </div>
                  <Badge className="bg-indigo-600 text-white font-bold text-sm px-3 py-1">
                    {item.count.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Issue Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.trends.categoryBreakdown.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">{category.category.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{category.count}</span>
                    <Badge variant="outline">{category.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.trends.priorityDistribution.map((priority) => (
                <div key={priority.priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      priority.priority === 'HIGH' ? 'bg-red-500' :
                      priority.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <span className="font-medium">{priority.priority}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{priority.count} issues</span>
                    <Badge variant="outline">{formatTime(priority.avgResolutionTime)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Staff Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Staff Member</th>
                  <th className="text-center py-2">Assigned</th>
                  <th className="text-center py-2">Completed</th>
                  <th className="text-center py-2">Completion Rate</th>
                  <th className="text-center py-2">Avg. Time</th>
                  <th className="text-center py-2">Rating</th>
                </tr>
              </thead>
              <tbody>
                {data.trends.staffPerformance.map((staff) => {
                  const completionRate = staff.assignedIssues > 0 
                    ? Math.round((staff.completedIssues / staff.assignedIssues) * 100)
                    : 0
                  
                  return (
                    <tr key={staff.staffId} className="border-b">
                      <td className="py-3">
                        <div className="font-medium">{staff.name}</div>
                      </td>
                      <td className="text-center py-3">{staff.assignedIssues}</td>
                      <td className="text-center py-3">{staff.completedIssues}</td>
                      <td className="text-center py-3">
                        <Badge variant={completionRate >= 80 ? 'default' : completionRate >= 60 ? 'secondary' : 'destructive'}>
                          {completionRate}%
                        </Badge>
                      </td>
                      <td className="text-center py-3">{formatTime(staff.avgResolutionTime)}</td>
                      <td className="text-center py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Star className={`h-4 w-4 ${staff.rating >= 4 ? 'fill-yellow-400 text-yellow-600' : 'text-gray-300'}`} />
                          <span>{staff.rating.toFixed(1)}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Ward Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Ward Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.trends.wardAnalysis.map((ward) => {
                const resolutionRate = ward.issues > 0 
                  ? Math.round((ward.resolved / ward.issues) * 100)
                  : 0
                
                return (
                  <div key={ward.ward} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Ward {ward.ward}</span>
                      </div>
                      <Badge variant={resolutionRate >= 80 ? 'default' : resolutionRate >= 60 ? 'secondary' : 'destructive'}>
                        {resolutionRate}% resolved
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm text-gray-600">
                      <div>Issues: {ward.issues}</div>
                      <div>Resolved: {ward.resolved}</div>
                      <div>Avg. Time: {formatTime(ward.avgResolutionTime)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Insights and Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Top Performers */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  Top Performers
                </h4>
                <div className="space-y-2">
                  {data.insights.topPerformers.map((performer, index) => (
                    <div key={index} className="bg-green-50 p-2 rounded text-sm">
                      <span className="font-medium">{performer.name}</span> - {performer.metric}: {performer.value}
                    </div>
                  ))}
                </div>
              </div>

              {/* Problem Areas */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Problem Areas
                </h4>
                <div className="space-y-2">
                  {data.insights.problemAreas.map((area, index) => (
                    <div key={index} className="bg-red-50 p-2 rounded text-sm">
                      <span className="font-medium">{area.area}</span> - {area.issue}: {area.count} issues
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {data.insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-blue-50 p-2 rounded text-sm">
                      • {recommendation}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
