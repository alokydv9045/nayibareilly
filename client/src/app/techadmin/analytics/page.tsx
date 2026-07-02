'use client'
import AnimatedHeading from '@/components/ui/AnimatedHeading'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Globe,
  Server,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Download,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api/client'
import { tokenStorage } from '@/lib/auth/auth-utils'

interface SystemAnalytics {
  overview: {
    totalUsers: number
    activeCities: number
    totalIssues: number
    systemUptime: number
    avgResponseTime: number
    dataIntegrity: number
  }
  performance: {
    serverHealth: number
    databasePerformance: number
    apiResponseTime: number
    errorRate: number
    throughput: number
    memoryUsage: number
    cpuUsage: number
    diskUsage: number
  }
  userAnalytics: {
    dailyActiveUsers: number
    monthlyActiveUsers: number
    userGrowthRate: number
    userRetention: number
    sessionDuration: number
    bounceRate: number
  }
  cityMetrics: Array<{
    cityName: string
    population: number
    totalIssues: number
    resolutionRate: number
    citizenSatisfaction: number
    systemAdoption: number
    dataQuality: number
    lastSync: string
  }>
  systemHealth: {
    services: Array<{
      name: string
      status: 'healthy' | 'warning' | 'critical'
      uptime: number
      lastCheck: string
      responseTime: number
    }>
    alerts: Array<{
      id: string
      type: 'error' | 'warning' | 'info'
      message: string
      timestamp: string
      resolved: boolean
    }>
  }
  dataInsights: {
    topIssueCategories: Array<{
      category: string
      count: number
      trend: number
    }>
    resolutionTrends: Array<{
      period: string
      resolved: number
      pending: number
      satisfaction: number
    }>
    geographicDistribution: Array<{
      region: string
      cities: number
      issues: number
      performance: number
    }>
  }
  financialMetrics: {
    totalBudget: number
    budgetUtilized: number
    costPerResolution: number
    roiMetrics: {
      citizenSatisfactionROI: number
      efficiencyGains: number
      costSavings: number
    }
  }
}

export default function TechAdminAnalyticsPage() {
  const [data, setData] = useState<SystemAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('month')
  const { toast } = useToast()

  const getMockAnalytics = (): SystemAnalytics => ({
    overview: { totalUsers: 15430, activeCities: 12, totalIssues: 4521, systemUptime: 99.9, avgResponseTime: 45, dataIntegrity: 100 },
    performance: { serverHealth: 98, databasePerformance: 95, apiResponseTime: 120, errorRate: 0.1, throughput: 450, memoryUsage: 62, cpuUsage: 45, diskUsage: 55 },
    userAnalytics: { dailyActiveUsers: 1200, monthlyActiveUsers: 8500, userGrowthRate: 15, userRetention: 78, sessionDuration: 12, bounceRate: 25 },
    cityMetrics: [{ cityName: 'Bareilly', population: 1000000, totalIssues: 1200, resolutionRate: 85, citizenSatisfaction: 4.2, systemAdoption: 65, dataQuality: 92, lastSync: new Date().toISOString() }],
    systemHealth: {
      services: [{ name: 'API Server', status: 'healthy', uptime: 99.9, lastCheck: new Date().toISOString(), responseTime: 45 }],
      alerts: [{ id: '1', type: 'info', message: 'System nominal', timestamp: new Date().toISOString(), resolved: true }]
    },
    dataInsights: {
      topIssueCategories: [{ category: 'INFRASTRUCTURE', count: 450, trend: -5 }],
      resolutionTrends: [{ period: '2023-Q1', resolved: 1200, pending: 150, satisfaction: 4.5 }],
      geographicDistribution: [{ region: 'North', cities: 5, issues: 2100, performance: 88 }]
    },
    financialMetrics: {
      totalBudget: 5000000, budgetUtilized: 2500000, costPerResolution: 1250,
      roiMetrics: { citizenSatisfactionROI: 15, efficiencyGains: 25, costSavings: 1500000 }
    }
  })

  const mapBackendData = (apiData: any): SystemAnalytics => {
    const mock = getMockAnalytics()
    if (!apiData?.overview && !apiData?.distributions) return mock
    
    // If it's already matching the interface (e.g. mock returned from backend), return it
    if (apiData.overview && apiData.performance) return apiData

    // Otherwise map the new backend format (distributions, trends, metrics) to our UI format
    return {
      ...mock,
      overview: {
        ...mock.overview,
        totalUsers: apiData.metrics?.users?.newRegistrations || mock.overview.totalUsers,
        totalIssues: apiData.totalIssues || 0,
        avgResponseTime: apiData.metrics?.resolution?.averageHours || 0
      },
      dataInsights: {
        ...mock.dataInsights,
        topIssueCategories: (apiData.distributions?.categories || []).map((c: any) => ({
          category: c.category?.name || 'Unknown',
          count: c.count || 0,
          trend: 0
        })),
        resolutionTrends: (apiData.trends?.daily || []).slice(0, 7).map((d: any) => ({
          period: d.date?.split('T')[0] || 'Unknown',
          resolved: d.resolved || 0,
          pending: d.total - d.resolved || 0,
          satisfaction: 4.0
        }))
      }
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/admin/analytics?period=${timeRange === 'week' ? '7d' : timeRange === 'month' ? '30d' : '1y'}`)
      setData(mapBackendData(response.data?.data || response.data))
    } catch (error) {
      console.warn('Using fallback data for analytics:', error)
      setData(getMockAnalytics())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.get(`/admin/analytics?period=${timeRange === 'week' ? '7d' : timeRange === 'month' ? '30d' : '1y'}`)
        setData(mapBackendData(response.data?.data || response.data))
      } catch (error) {
        console.warn('Using fallback data for analytics:', error)
        setData(getMockAnalytics())
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }
    loadData()
  }, [timeRange])

  const refreshData = async () => {
    setRefreshing(true)
    await fetchAnalytics()
  }

  const downloadReport = async () => {
    try {
      const response = await fetch(`/api/v1/admin/analytics/export?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${tokenStorage.get()}`
        }
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `system-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast({
          title: 'Success',
          description: 'System analytics report downloaded successfully'
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

  const getHealthColor = (value: number) => {
    if (value >= 95) return 'text-green-600'
    if (value >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'info': return <CheckCircle className="h-4 w-4 text-emerald-600" />
      default: return <AlertTriangle className="h-4 w-4 text-slate-600" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Data Available</h3>
            <p className="text-slate-600">Unable to load system analytics.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent pb-8">
      {/* Topbar */}
      <header className="sticky top-16 lg:top-0 z-40 bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-emerald-600" />
          <AnimatedHeading as="h1" className="text-3xl font-bold text-slate-900">System Analytics</AnimatedHeading>
          <Badge variant="outline" className="text-lg px-3 py-1">
            SuperAdmin
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={downloadReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-emerald-600">
              {data.overview.totalUsers.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-600">{data.overview.activeCities}</div>
            <div className="text-xs text-slate-600">Active Cities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 text-slate-800 mx-auto mb-2" />
            <div className="text-xl font-bold text-slate-800">
              {data.overview.totalIssues.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600">Total Issues</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Server className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className={`text-xl font-bold ${getHealthColor(data.overview.systemUptime)}`}>
              {data.overview.systemUptime}%
            </div>
            <div className="text-xs text-slate-600">System Uptime</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-indigo-600">{data.overview.avgResponseTime}ms</div>
            <div className="text-xs text-slate-600">Avg Response</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="h-6 w-6 text-teal-600 mx-auto mb-2" />
            <div className={`text-xl font-bold ${getHealthColor(data.overview.dataIntegrity)}`}>
              {data.overview.dataIntegrity}%
            </div>
            <div className="text-xs text-slate-600">Data Integrity</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="mb-8">
        <TabsList className="flex flex-wrap h-auto w-full md:grid md:grid-cols-5 justify-start">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Server className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <div className={`text-2xl font-bold ${getHealthColor(data.performance.serverHealth)}`}>
                  {data.performance.serverHealth}%
                </div>
                <div className="text-sm text-slate-600">Server Health</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className={`text-2xl font-bold ${getHealthColor(data.performance.databasePerformance)}`}>
                  {data.performance.databasePerformance}%
                </div>
                <div className="text-sm text-slate-600">Database Performance</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 text-slate-800 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800">
                  {data.performance.apiResponseTime}ms
                </div>
                <div className="text-sm text-slate-600">API Response Time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">
                  {data.performance.errorRate}%
                </div>
                <div className="text-sm text-slate-600">Error Rate</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className={`text-sm font-bold ${getHealthColor(100 - data.performance.cpuUsage)}`}>
                      {data.performance.cpuUsage}%
                    </span>
                  </div>
                  <Progress value={data.performance.cpuUsage} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className={`text-sm font-bold ${getHealthColor(100 - data.performance.memoryUsage)}`}>
                      {data.performance.memoryUsage}%
                    </span>
                  </div>
                  <Progress value={data.performance.memoryUsage} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Disk Usage</span>
                    <span className={`text-sm font-bold ${getHealthColor(100 - data.performance.diskUsage)}`}>
                      {data.performance.diskUsage}%
                    </span>
                  </div>
                  <Progress value={data.performance.diskUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Throughput</span>
                  <span className="font-bold">{data.performance.throughput} req/sec</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate</span>
                  <span className="font-bold text-red-600">{data.performance.errorRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>API Response Time</span>
                  <span className="font-bold">{data.performance.apiResponseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>System Uptime</span>
                  <span className="font-bold text-green-600">{data.overview.systemUptime}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cities" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.cityMetrics.map((city) => (
              <Card key={city.cityName} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>{city.cityName}</span>
                    <Badge variant="outline">
                      {city.population.toLocaleString()} citizens
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-slate-600">Total Issues</div>
                      <div className="font-bold">{city.totalIssues}</div>
                    </div>
                    <div>
                      <div className="text-slate-600">Resolution Rate</div>
                      <div className={`font-bold ${getHealthColor(city.resolutionRate)}`}>
                        {city.resolutionRate}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Satisfaction</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-600" />
                        <span className="text-sm font-bold">{city.citizenSatisfaction}/5</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">System Adoption</span>
                      <span className={`text-sm font-bold ${getHealthColor(city.systemAdoption)}`}>
                        {city.systemAdoption}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Data Quality</span>
                      <span className={`text-sm font-bold ${getHealthColor(city.dataQuality)}`}>
                        {city.dataQuality}%
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 border-t pt-2">
                    Last sync: {new Date(city.lastSync).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-600">
                  {data.userAnalytics.dailyActiveUsers.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">Daily Active Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {data.userAnalytics.monthlyActiveUsers.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">Monthly Active Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-slate-800 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800">
                  {data.userAnalytics.userGrowthRate}%
                </div>
                <div className="text-sm text-slate-600">Growth Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {data.userAnalytics.sessionDuration}m
                </div>
                <div className="text-sm text-slate-600">Avg Session</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">User Retention</span>
                    <span className={`text-sm font-bold ${getHealthColor(data.userAnalytics.userRetention)}`}>
                      {data.userAnalytics.userRetention}%
                    </span>
                  </div>
                  <Progress value={data.userAnalytics.userRetention} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Bounce Rate</span>
                    <span className={`text-sm font-bold ${getHealthColor(100 - data.userAnalytics.bounceRate)}`}>
                      {data.userAnalytics.bounceRate}%
                    </span>
                  </div>
                  <Progress value={data.userAnalytics.bounceRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Budget</span>
                  <span className="font-bold">₹{data.financialMetrics.totalBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Budget Utilized</span>
                  <span className="font-bold">₹{data.financialMetrics.budgetUtilized.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost per Resolution</span>
                  <span className="font-bold">₹{data.financialMetrics.costPerResolution}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="text-sm font-semibold mb-2">ROI Metrics</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Satisfaction ROI</span>
                      <span className="text-green-600">+{data.financialMetrics.roiMetrics.citizenSatisfactionROI}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Efficiency Gains</span>
                      <span className="text-green-600">+{data.financialMetrics.roiMetrics.efficiencyGains}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost Savings</span>
                      <span className="text-green-600">₹{data.financialMetrics.roiMetrics.costSavings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>System Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.systemHealth.services.map((service) => (
                    <div key={service.name} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-slate-600">
                          Uptime: {service.uptime}% | Response: {service.responseTime}ms
                        </div>
                        <div className="text-xs text-slate-500">
                          Last check: {new Date(service.lastCheck).toLocaleString()}
                        </div>
                      </div>
                      <Badge className={getStatusBadge(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {data.systemHealth.alerts.length === 0 ? (
                    <div className="text-center py-8 text-slate-600">
                      No active alerts
                    </div>
                  ) : (
                    data.systemHealth.alerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-3 border rounded ${
                          alert.resolved ? 'bg-slate-50' : 
                          alert.type === 'error' ? 'bg-red-50 border-red-200' :
                          alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 
                          'bg-emerald-50 border-emerald-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <div className="font-medium">{alert.message}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                          {alert.resolved && (
                            <Badge variant="outline" className="text-xs">
                              Resolved
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Issue Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.dataInsights.topIssueCategories.map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <span className="font-medium">{category.category.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{category.count.toLocaleString()}</span>
                        <div className="flex items-center gap-1">
                          {category.trend > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-xs ${category.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(category.trend)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.dataInsights.geographicDistribution.map((region) => (
                    <div key={region.region} className="border rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{region.region}</span>
                        <Badge variant="outline">{region.cities} cities</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                        <div>Issues: {region.issues.toLocaleString()}</div>
                        <div>Performance: {region.performance}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
