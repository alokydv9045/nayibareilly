'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Crown, 
  Clock, 
  AlertTriangle,
  Building2,
  Star,
  MapPin,
  Calendar,
  FileText,
  BarChart3
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface MayorDashboardData {
  summary: {
    totalIssues: number
    resolvedIssues: number
    pendingApprovals: number
    activeDepartments: number
    avgResolutionTime: number
    citizenSatisfaction: number
    budgetUtilization: number
    staffEfficiency: number
  }
  recentIssues: Array<{
    id: string
    title: string
    category: string
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    status: string
    department: string
    location: string
    createdAt: string
    requiresApproval?: boolean
  }>
  departmentPerformance: Array<{
    name: string
    totalIssues: number
    resolvedIssues: number
    avgResolutionTime: number
    budget: number
    budgetUsed: number
    satisfaction: number
  }>
  cityMetrics: {
    populationServed: number
    wardsCovered: number
    infrastructureScore: number
    environmentScore: number
    serviceQuality: number
  }
  urgentMatters: Array<{
    id: string
    title: string
    description: string
    type: 'approval' | 'escalation' | 'budget'
    priority: 'HIGH' | 'URGENT'
    department: string
    daysWaiting: number
  }>
}

export default function MayorOverviewPage() {
  const [data, setData] = useState<MayorDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/mayor/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.ok) {
          const dashboardData = await response.json()
          setData(dashboardData)
        }
      } catch (error) {
        console.error('Error fetching mayor dashboard:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch dashboard data',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [toast])

  const handleApproval = async (itemId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/mayor/approvals/${itemId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved })
      })
      
      if (response.ok) {
        // Refresh data
        window.location.reload()
        toast({
          title: 'Success',
          description: `Item ${approved ? 'approved' : 'rejected'} successfully`
        })
      }
    } catch (error) {
      console.error('Error processing approval:', error)
      toast({
        title: 'Error',
        description: 'Failed to process approval',
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

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBudgetUtilizationColor = (percentage: number) => {
    if (percentage <= 80) return 'bg-green-500'
    if (percentage <= 95) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
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
            <p className="text-gray-600">Unable to load dashboard data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Crown className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-900">Mayor Dashboard</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Executive Overview
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{data.summary.totalIssues}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
            <div className="text-xs text-green-600 mt-1">
              {getResolutionRate()}% resolved
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{data.summary.pendingApprovals}</div>
            <div className="text-sm text-gray-600">Pending Approvals</div>
            {data.summary.pendingApprovals > 5 && (
              <div className="text-xs text-red-600 mt-1">Requires attention</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{data.summary.activeDepartments}</div>
            <div className="text-sm text-gray-600">Active Departments</div>
            <div className="text-xs text-blue-600 mt-1">
              {data.summary.staffEfficiency}% efficiency
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{data.summary.citizenSatisfaction.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Citizen Satisfaction</div>
            <div className="flex justify-center mt-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(data.summary.citizenSatisfaction) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* City Performance Metrics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            City Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Infrastructure Score</span>
                <span className={`text-sm font-bold ${getPerformanceColor(data.cityMetrics.infrastructureScore)}`}>
                  {data.cityMetrics.infrastructureScore}/100
                </span>
              </div>
              <Progress value={data.cityMetrics.infrastructureScore} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Environment Score</span>
                <span className={`text-sm font-bold ${getPerformanceColor(data.cityMetrics.environmentScore)}`}>
                  {data.cityMetrics.environmentScore}/100
                </span>
              </div>
              <Progress value={data.cityMetrics.environmentScore} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Service Quality</span>
                <span className={`text-sm font-bold ${getPerformanceColor(data.cityMetrics.serviceQuality)}`}>
                  {data.cityMetrics.serviceQuality}/100
                </span>
              </div>
              <Progress value={data.cityMetrics.serviceQuality} className="h-2" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.cityMetrics.populationServed.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Citizens Served</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{data.cityMetrics.wardsCovered}</div>
              <div className="text-sm text-gray-600">Wards Covered</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Urgent Matters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Urgent Matters Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.urgentMatters.length === 0 ? (
              <div className="text-center py-4 text-gray-600">
                No urgent matters pending
              </div>
            ) : (
              <div className="space-y-4">
                {data.urgentMatters.map((matter) => (
                  <div key={matter.id} className="border border-red-200 rounded-lg p-3 bg-red-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-red-800">{matter.title}</h4>
                      <Badge variant="destructive">{matter.priority}</Badge>
                    </div>
                    <p className="text-sm text-red-700 mb-2">{matter.description}</p>
                    <div className="flex items-center justify-between text-xs text-red-600">
                      <span>{matter.department}</span>
                      <span>Waiting {matter.daysWaiting} days</span>
                    </div>
                    {matter.type === 'approval' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleApproval(matter.id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproval(matter.id, false)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent City Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentIssues.slice(0, 5).map((issue) => (
                <div key={issue.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm line-clamp-1">{issue.title}</h4>
                    <Badge variant={issue.priority === 'HIGH' ? 'destructive' : issue.priority === 'MEDIUM' ? 'default' : 'secondary'}>
                      {issue.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {issue.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {issue.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {issue.requiresApproval && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Requires Mayor Approval
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Department Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Department</th>
                  <th className="text-center py-2">Issues</th>
                  <th className="text-center py-2">Resolution Rate</th>
                  <th className="text-center py-2">Avg. Time</th>
                  <th className="text-center py-2">Budget Usage</th>
                  <th className="text-center py-2">Satisfaction</th>
                </tr>
              </thead>
              <tbody>
                {data.departmentPerformance.map((dept) => {
                  const resolutionRate = dept.totalIssues > 0 
                    ? Math.round((dept.resolvedIssues / dept.totalIssues) * 100)
                    : 0
                  const budgetUsage = Math.round((dept.budgetUsed / dept.budget) * 100)
                  
                  return (
                    <tr key={dept.name} className="border-b">
                      <td className="py-3">
                        <div className="font-medium">{dept.name}</div>
                      </td>
                      <td className="text-center py-3">{dept.totalIssues}</td>
                      <td className="text-center py-3">
                        <Badge variant={resolutionRate >= 80 ? 'default' : resolutionRate >= 60 ? 'secondary' : 'destructive'}>
                          {resolutionRate}%
                        </Badge>
                      </td>
                      <td className="text-center py-3">{formatTime(dept.avgResolutionTime)}</td>
                      <td className="text-center py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getBudgetUtilizationColor(budgetUsage)}`}
                              style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{budgetUsage}%</span>
                        </div>
                      </td>
                      <td className="text-center py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Star className={`h-4 w-4 ${dept.satisfaction >= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          <span>{dept.satisfaction.toFixed(1)}</span>
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
    </div>
  )
}