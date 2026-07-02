'use client'
import AnimatedHeading from '@/components/ui/AnimatedHeading'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building2, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  Star,
  Award,
  Target,
  Activity,
  Zap
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Department {
  id: string
  name: string
  head: {
    name: string
    email: string
    experience: number
  }
  staff: {
    total: number
    active: number
    onLeave: number
  }
  performance: {
    totalIssues: number
    resolvedIssues: number
    avgResolutionTime: number
    citizenSatisfaction: number
    efficiencyScore: number
  }
  budget: {
    allocated: number
    used: number
    remaining: number
    utilizationRate: number
  }
  currentIssues: {
    pending: number
    inProgress: number
    overdue: number
    highPriority: number
  }
  recentAchievements: Array<{
    title: string
    description: string
    date: string
    impact: string
  }>
  kpis: {
    responseTime: number
    resolutionRate: number
    budgetCompliance: number
    staffProductivity: number
  }
}

export default function MayorDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/mayor/departments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setDepartments(data.departments)
        }
      } catch (error) {
        console.error('Error fetching departments:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch department data',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchDepartments()
  }, [toast])

  const updateDepartmentBudget = async (deptId: string, newBudget: number) => {
    try {
      const response = await fetch(`/api/mayor/departments/${deptId}/budget`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ budget: newBudget })
      })
      
      if (response.ok) {
        // Refresh data
        window.location.reload()
        toast({
          title: 'Success',
          description: 'Budget updated successfully'
        })
      }
    } catch (error) {
      console.error('Error updating budget:', error)
      toast({
        title: 'Error',
        description: 'Failed to update budget',
        variant: 'destructive'
      })
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBudgetUtilizationColor = (rate: number) => {
    if (rate <= 75) return 'bg-green-500'
    if (rate <= 90) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getOverallRating = (dept: Department) => {
    const scores = [
      dept.kpis.responseTime,
      dept.kpis.resolutionRate,
      dept.kpis.budgetCompliance,
      dept.kpis.staffProductivity
    ]
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="h-8 w-8 text-slate-800" />
        <AnimatedHeading as="h1" className="text-3xl font-bold text-slate-900">Department Management</AnimatedHeading>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {departments.length} Departments
        </Badge>
      </div>

      {/* Department Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {departments.map((dept) => {
          const resolutionRate = dept.performance.totalIssues > 0 
            ? Math.round((dept.performance.resolvedIssues / dept.performance.totalIssues) * 100)
            : 0
          const overallRating = getOverallRating(dept)

          return (
            <Card 
              key={dept.id} 
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                selectedDepartment === dept.id ? 'ring-2 ring-slate-700' : ''
              }`}
              onClick={() => setSelectedDepartment(selectedDepartment === dept.id ? null : dept.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className={`h-4 w-4 ${overallRating >= 80 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                    <span className={`text-sm font-bold ${getPerformanceColor(overallRating)}`}>
                      {overallRating}/100
                    </span>
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  Head: {dept.head.name} ({dept.head.experience}y exp)
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Staff Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm">Staff</span>
                  </div>
                  <Badge variant="outline">
                    {dept.staff.active}/{dept.staff.total} active
                  </Badge>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Resolution Rate</span>
                    <span className={getPerformanceColor(resolutionRate)}>{resolutionRate}%</span>
                  </div>
                  <Progress value={resolutionRate} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget Usage</span>
                    <span className={getPerformanceColor(100 - dept.budget.utilizationRate)}>
                      {dept.budget.utilizationRate}%
                    </span>
                  </div>
                  <Progress 
                    value={dept.budget.utilizationRate} 
                    className="h-2"
                  />
                </div>

                {/* Current Issues */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <div className="font-bold text-orange-600">{dept.currentIssues.pending}</div>
                    <div className="text-orange-600">Pending</div>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 rounded">
                    <div className="font-bold text-emerald-600">{dept.currentIssues.inProgress}</div>
                    <div className="text-emerald-600">In Progress</div>
                  </div>
                </div>

                {dept.currentIssues.overdue > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">{dept.currentIssues.overdue} overdue issues</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Department View */}
      {selectedDepartment && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {departments.find(d => d.id === selectedDepartment)?.name} - Detailed Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const dept = departments.find(d => d.id === selectedDepartment)
              if (!dept) return null

              return (
                <Tabs defaultValue="performance" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="budget">Budget</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  </TabsList>

                  <TabsContent value="performance" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Zap className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                          <div className={`text-xl font-bold ${getPerformanceColor(dept.kpis.responseTime)}`}>
                            {dept.kpis.responseTime}/100
                          </div>
                          <div className="text-sm text-slate-600">Response Time</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                          <div className={`text-xl font-bold ${getPerformanceColor(dept.kpis.resolutionRate)}`}>
                            {dept.kpis.resolutionRate}/100
                          </div>
                          <div className="text-sm text-slate-600">Resolution Rate</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <DollarSign className="h-6 w-6 text-slate-800 mx-auto mb-2" />
                          <div className={`text-xl font-bold ${getPerformanceColor(dept.kpis.budgetCompliance)}`}>
                            {dept.kpis.budgetCompliance}/100
                          </div>
                          <div className="text-sm text-slate-600">Budget Compliance</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Activity className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                          <div className={`text-xl font-bold ${getPerformanceColor(dept.kpis.staffProductivity)}`}>
                            {dept.kpis.staffProductivity}/100
                          </div>
                          <div className="text-sm text-slate-600">Staff Productivity</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Issue Resolution Metrics</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Total Issues Handled</span>
                            <span className="font-bold">{dept.performance.totalIssues}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Successfully Resolved</span>
                            <span className="font-bold text-green-600">{dept.performance.resolvedIssues}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Average Resolution Time</span>
                            <span className="font-bold">{dept.performance.avgResolutionTime}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Citizen Satisfaction</span>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-600" />
                              <span className="font-bold">{dept.performance.citizenSatisfaction}/5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Current Workload</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Pending Issues</span>
                            <Badge variant="outline">{dept.currentIssues.pending}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>In Progress</span>
                            <Badge variant="outline">{dept.currentIssues.inProgress}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>High Priority</span>
                            <Badge variant={dept.currentIssues.highPriority > 0 ? 'destructive' : 'outline'}>
                              {dept.currentIssues.highPriority}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Overdue</span>
                            <Badge variant={dept.currentIssues.overdue > 0 ? 'destructive' : 'outline'}>
                              {dept.currentIssues.overdue}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="budget" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-emerald-600">
                            ₹{dept.budget.allocated.toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-600">Allocated Budget</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            ₹{dept.budget.used.toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-600">Budget Used</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            ₹{dept.budget.remaining.toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-600">Remaining Budget</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Budget Utilization</span>
                          <span className="font-bold">{dept.budget.utilizationRate}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-4">
                          <div 
                            className={`h-4 rounded-full ${getBudgetUtilizationColor(dept.budget.utilizationRate)}`}
                            style={{ width: `${Math.min(dept.budget.utilizationRate, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => {
                            const newBudget = prompt(`Enter new budget for ${dept.name} (current: ₹${dept.budget.allocated.toLocaleString()}):`)
                            if (newBudget && !isNaN(Number(newBudget))) {
                              updateDepartmentBudget(dept.id, Number(newBudget))
                            }
                          }}
                          variant="outline"
                        >
                          Update Budget
                        </Button>
                        {dept.budget.utilizationRate > 90 && (
                          <div className="text-red-600 text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Budget utilization critical
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="staff" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Users className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-emerald-600">{dept.staff.total}</div>
                          <div className="text-sm text-slate-600">Total Staff</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-green-600">{dept.staff.active}</div>
                          <div className="text-sm text-slate-600">Active Staff</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-orange-600">{dept.staff.onLeave}</div>
                          <div className="text-sm text-slate-600">On Leave</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Department Head</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-slate-600">Name</div>
                          <div className="font-medium">{dept.head.name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Email</div>
                          <div className="font-medium">{dept.head.email}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Experience</div>
                          <div className="font-medium">{dept.head.experience} years</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Staff Efficiency</div>
                          <div className="font-medium">{dept.staff.active > 0 ? Math.round((dept.staff.active / dept.staff.total) * 100) : 0}%</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="achievements" className="mt-6">
                    <div className="space-y-4">
                      {dept.recentAchievements.length === 0 ? (
                        <div className="text-center py-8 text-slate-600">
                          No recent achievements recorded
                        </div>
                      ) : (
                        dept.recentAchievements.map((achievement, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Award className="h-6 w-6 text-yellow-600 mt-1" />
                                <div className="flex-1">
                                  <h4 className="font-semibold">{achievement.title}</h4>
                                  <p className="text-slate-600 text-sm mt-1">{achievement.description}</p>
                                  <div className="flex items-center justify-between mt-3">
                                    <span className="text-xs text-slate-500">
                                      {new Date(achievement.date).toLocaleDateString()}
                                    </span>
                                    <Badge variant="outline">
                                      Impact: {achievement.impact}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
