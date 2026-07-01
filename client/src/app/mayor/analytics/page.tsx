'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  CheckCircle, 
  AlertTriangle,
  Star,
  MapPin,
  Download,
  Crown,
  Target
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface CityAnalytics {
  summary: {
    totalIssues: number
    resolvedIssues: number
    avgResolutionTime: number
    citizenSatisfaction: number
    budgetEfficiency: number
    populationServed: number
    wardsCovered: number
    departmentCount: number
  }
  trends: {
    issueGrowth: number // percentage change
    resolutionImprovement: number
    satisfactionTrend: number
    budgetUtilization: number
  }
  departmentComparison: Array<{
    name: string
    issues: number
    resolved: number
    avgTime: number
    budget: number
    budgetUsed: number
    satisfaction: number
    efficiency: number
  }>
  wardAnalysis: Array<{
    ward: string
    population: number
    issues: number
    resolved: number
    avgResolutionTime: number
    satisfaction: number
    infrastructureScore: number
  }>
  categoryBreakdown: Array<{
    category: string
    count: number
    percentage: number
    trend: number
    avgResolutionTime: number
  }>
  timeAnalysis: {
    monthlyData: Array<{
      month: string
      issues: number
      resolved: number
      satisfaction: number
    }>
    peakHours: Array<{
      hour: number
      issueCount: number
    }>
    seasonalTrends: Array<{
      season: string
      issueTypes: string[]
      volume: number
    }>
  }
  cityKPIs: {
    serviceDelivery: number
    digitalAdoption: number
    citizenEngagement: number
    resourceOptimization: number
    environmentalImpact: number
    economicGrowth: number
  }
  comparativeAnalysis: {
    peerCities: Array<{
      name: string
      population: number
      resolutionRate: number
      satisfaction: number
      budgetPerCapita: number
    }>
    rankings: {
      nationalRank: number
      stateRank: number
      categoryRanks: Array<{
        category: string
        rank: number
        total: number
      }>
    }
  }
}

export default function MayorAnalyticsPage() {
  const [data, setData] = useState<CityAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('year')
  const [viewType, setViewType] = useState('overview')
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/mayor/analytics?range=${timeRange}&view=${viewType}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.ok) {
          const analyticsData = await response.json()
          setData(analyticsData)
        }
      } catch (error) {
        console.error('Error fetching mayor analytics:', error)
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
  }, [timeRange, viewType, toast])

  const downloadReport = async () => {
    try {
      const response = await fetch(`/api/mayor/analytics/export?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `city-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`
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

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <div className="h-4 w-4 bg-slate-400 rounded-full" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-slate-600'
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRankingBadge = (rank: number, total: number) => {
    const percentage = (rank / total) * 100
    if (percentage <= 20) return 'bg-green-100 text-green-800'
    if (percentage <= 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-800"></div>
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
            <p className="text-slate-600">Unable to load analytics data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-slate-800" />
          <h1 className="text-3xl font-bold text-slate-900">City Analytics Dashboard</h1>
          <Crown className="h-6 w-6 text-yellow-600" />
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="comparison">Comparison</SelectItem>
              <SelectItem value="trends">Trends</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={downloadReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* City Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-600">
              {data.summary.populationServed.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600">Citizens Served</div>
            <div className="text-xs text-emerald-600 mt-1">{data.summary.wardsCovered} wards</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{getResolutionRate()}%</div>
            <div className="text-sm text-slate-600">Resolution Rate</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {getTrendIcon(data.trends.resolutionImprovement)}
              <span className={`text-xs ${getTrendColor(data.trends.resolutionImprovement)}`}>
                {Math.abs(data.trends.resolutionImprovement)}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">
              {data.summary.citizenSatisfaction.toFixed(1)}
            </div>
            <div className="text-sm text-slate-600">Satisfaction Score</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {getTrendIcon(data.trends.satisfactionTrend)}
              <span className={`text-xs ${getTrendColor(data.trends.satisfactionTrend)}`}>
                {Math.abs(data.trends.satisfactionTrend)}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-slate-800 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800">
              {data.summary.budgetEfficiency}%
            </div>
            <div className="text-sm text-slate-600">Budget Efficiency</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {getTrendIcon(data.trends.budgetUtilization)}
              <span className={`text-xs ${getTrendColor(data.trends.budgetUtilization)}`}>
                {Math.abs(data.trends.budgetUtilization)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* City KPIs */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            City Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Service Delivery</span>
                <span className={`text-sm font-bold ${getPerformanceColor(data.cityKPIs.serviceDelivery)}`}>
                  {data.cityKPIs.serviceDelivery}/100
                </span>
              </div>
              <Progress value={data.cityKPIs.serviceDelivery} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Digital Adoption</span>
                <span className={`text-sm font-bold ${getPerformanceColor(data.cityKPIs.digitalAdoption)}`}>
                  {data.cityKPIs.digitalAdoption}/100
                </span>
              </div>
              <Progress value={data.cityKPIs.digitalAdoption} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Citizen Engagement</span>
                <span className={`text-sm font-bold ${getPerformanceColor(data.cityKPIs.citizenEngagement)}`}>
                  {data.cityKPIs.citizenEngagement}/100
                </span>
              </div>
              <Progress value={data.cityKPIs.citizenEngagement} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Resource Optimization</span>
                <span className={`text-sm font-bold ${getPerformanceColor(data.cityKPIs.resourceOptimization)}`}>
                  {data.cityKPIs.resourceOptimization}/100
                </span>
              </div>
              <Progress value={data.cityKPIs.resourceOptimization} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Environmental Impact</span>
                <span className={`text-sm font-bold ${getPerformanceColor(data.cityKPIs.environmentalImpact)}`}>
                  {data.cityKPIs.environmentalImpact}/100
                </span>
              </div>
              <Progress value={data.cityKPIs.environmentalImpact} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Economic Growth</span>
                <span className={`text-sm font-bold ${getPerformanceColor(data.cityKPIs.economicGrowth)}`}>
                  {data.cityKPIs.economicGrowth}/100
                </span>
              </div>
              <Progress value={data.cityKPIs.economicGrowth} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Department Performance Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.departmentComparison.map((dept) => {
                const resolutionRate = dept.issues > 0 ? Math.round((dept.resolved / dept.issues) * 100) : 0
                const budgetEfficiency = dept.budget > 0 ? Math.round((dept.budgetUsed / dept.budget) * 100) : 0

                return (
                  <div key={dept.name} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{dept.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={resolutionRate >= 80 ? 'default' : 'secondary'}>
                          {resolutionRate}%
                        </Badge>
                        <Star className={`h-4 w-4 ${dept.satisfaction >= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs text-slate-600">
                      <div>Issues: {dept.issues}</div>
                      <div>Avg Time: {dept.avgTime}h</div>
                      <div>Budget: {budgetEfficiency}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Ward Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Ward Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.wardAnalysis.slice(0, 5).map((ward) => {
                const resolutionRate = ward.issues > 0 ? Math.round((ward.resolved / ward.issues) * 100) : 0

                return (
                  <div key={ward.ward} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">Ward {ward.ward}</span>
                      </div>
                      <Badge variant={resolutionRate >= 80 ? 'default' : resolutionRate >= 60 ? 'secondary' : 'destructive'}>
                        {resolutionRate}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                      <div>Population: {ward.population.toLocaleString()}</div>
                      <div>Issues: {ward.issues}</div>
                      <div>Satisfaction: {ward.satisfaction.toFixed(1)}/5</div>
                      <div>Infrastructure: {ward.infrastructureScore}/100</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown and Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Issue Category Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.categoryBreakdown.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="font-medium">{category.category.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-bold">{category.count}</div>
                      <div className="text-xs text-slate-600">{category.percentage}%</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(category.trend)}
                      <span className={`text-xs ${getTrendColor(category.trend)}`}>
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
            <CardTitle>City Rankings & Benchmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Overall Rankings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>National Rank</span>
                    <Badge className={getRankingBadge(data.comparativeAnalysis.rankings.nationalRank, 100)}>
                      #{data.comparativeAnalysis.rankings.nationalRank}/100
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>State Rank</span>
                    <Badge className={getRankingBadge(data.comparativeAnalysis.rankings.stateRank, 20)}>
                      #{data.comparativeAnalysis.rankings.stateRank}/20
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Category Rankings</h4>
                <div className="space-y-2">
                  {data.comparativeAnalysis.rankings.categoryRanks.map((rank) => (
                    <div key={rank.category} className="flex justify-between items-center">
                      <span className="text-sm">{rank.category}</span>
                      <Badge variant="outline" className={getRankingBadge(rank.rank, rank.total)}>
                        #{rank.rank}/{rank.total}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Peer City Comparison</h4>
                <div className="space-y-2">
                  {data.comparativeAnalysis.peerCities.slice(0, 3).map((city) => (
                    <div key={city.name} className="text-sm border rounded p-2">
                      <div className="font-medium">{city.name}</div>
                      <div className="text-xs text-slate-600">
                        Resolution: {city.resolutionRate}% | Satisfaction: {city.satisfaction}/5
                      </div>
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