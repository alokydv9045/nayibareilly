'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { userStorage } from '@/lib/auth/auth-utils'
import { useRouter } from 'next/navigation'
import { 
  Users, CheckCircle, Clock, Eye, TrendingUp, AlertTriangle, Activity,
  Construction, HeartHandshake, Droplets, ArrowRight, Building
} from 'lucide-react'

export default function DepartmentAdminPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [user, setUser] = useState<{ id: string; name: string; role?: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = userStorage.get()
    if (userData) {
      setUser(userData as { id: string; name: string; role?: string })
    }
  }, [])

  // Navigate to specific department
  const navigateToDepartment = (departmentPath: string) => {
    router.push(`/department/${departmentPath}`)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-emerald-600/20 rounded-xl border border-emerald-500/30">
              <Building className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Department Administration</h1>
              <p className="text-emerald-200">Municipal Department Management & Oversight</p>
            </div>
          </div>
          
          {/* Welcome Message */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Welcome, {user.name}</h2>
            <p className="text-emerald-200">
              Manage municipal services across core departments. Select a department below to access specialized tools and staff management.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600/30">
              Department Overview
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-emerald-600/30">
              All Staff Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-emerald-600/30">
              Analytics & Reports
            </TabsTrigger>
          </TabsList>

          {/* Department Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Infrastructure & Public Works */}
              <Card className="bg-gradient-to-br from-orange-900/20 to-blue-900/20 backdrop-blur-lg border-orange-500/30 hover:border-orange-400/50 transition-all group cursor-pointer"
                    onClick={() => navigateToDepartment('infrastructure')}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-orange-600/30 rounded-xl">
                        <Construction className="h-6 w-6 text-orange-300" />
                      </div>
                      <div>
                        <CardTitle className="text-white group-hover:text-orange-200 transition-colors">
                          Infrastructure & Public Works
                        </CardTitle>
                        <p className="text-orange-200 text-sm">Roads & Construction</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-orange-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-orange-200 text-xs">Active Projects</p>
                        <p className="text-white text-lg font-bold">24</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-orange-200 text-xs">Staff Members</p>
                        <p className="text-white text-lg font-bold">15</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-200">PWD Engineering</span>
                        <span className="text-white">15 Engineers</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500/30 text-orange-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigateToDepartment('infrastructure')
                      }}
                    >
                      Access Department
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Environmental Services */}
              <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-lg border-green-500/30 hover:border-green-400/50 transition-all group cursor-pointer"
                    onClick={() => navigateToDepartment('health-environment')}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-green-600/30 rounded-xl">
                        <HeartHandshake className="h-6 w-6 text-green-300" />
                      </div>
                      <div>
                        <CardTitle className="text-white group-hover:text-green-200 transition-colors">
                          Environmental Services
                        </CardTitle>
                        <p className="text-green-200 text-sm">Waste Management & Environment</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-green-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-green-200 text-xs">Environmental Cases</p>
                        <p className="text-white text-lg font-bold">16</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-green-200 text-xs">Staff Members</p>
                        <p className="text-white text-lg font-bold">18</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-200">Environmental Staff</span>
                        <span className="text-white">18 Officers</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-green-600/30 hover:bg-green-600/50 border border-green-500/30 text-green-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigateToDepartment('health-environment')
                      }}
                    >
                      Access Department
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Water Supply & Utilities */}
              <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-lg border-emerald-500/30 hover:border-blue-400/50 transition-all group cursor-pointer"
                    onClick={() => navigateToDepartment('water')}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-emerald-600/30 rounded-xl">
                        <Droplets className="h-6 w-6 text-emerald-300" />
                      </div>
                      <div>
                        <CardTitle className="text-white group-hover:text-emerald-200 transition-colors">
                          Water Supply & Utilities
                        </CardTitle>
                        <p className="text-emerald-200 text-sm">Water, Sewerage & Utilities</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-emerald-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-emerald-200 text-xs">Active Connections</p>
                        <p className="text-white text-lg font-bold">1,245</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-emerald-200 text-xs">Staff Members</p>
                        <p className="text-white text-lg font-bold">15</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-200">Water Quality</span>
                        <Badge className="bg-green-600 text-white text-xs">Excellent</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-200">System Status</span>
                        <Badge className="bg-emerald-600 text-white text-xs">Operational</Badge>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/30 text-emerald-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigateToDepartment('water')
                      }}
                    >
                      Access Department
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-200 text-sm">Total Active Issues</p>
                      <p className="text-2xl font-bold text-white">68</p>
                      <p className="text-xs text-blue-400">Across All Departments</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm">Resolved Today</p>
                      <p className="text-2xl font-bold text-white">12</p>
                      <p className="text-xs text-green-400">94% Resolution Rate</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-200 text-sm">In Progress</p>
                      <p className="text-2xl font-bold text-white">28</p>
                      <p className="text-xs text-orange-400">Active Work</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">Total Staff</p>
                      <p className="text-2xl font-bold text-white">55</p>
                      <p className="text-xs text-purple-400">All Departments</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Staff Management Tab */}
          <TabsContent value="staff" className="space-y-6">
            <div className="grid gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Staff Overview by Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { dept: 'Infrastructure & Public Works', total: 15, available: 12, busy: 3, color: 'orange' },
                      { dept: 'Environmental Services', total: 18, available: 14, busy: 4, color: 'green' },
                      { dept: 'Water Supply & Utilities', total: 15, available: 12, busy: 3, color: 'blue' }
                    ].map((dept, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full bg-${dept.color}-500`}></div>
                          <div>
                            <h3 className="text-white font-medium">{dept.dept}</h3>
                            <p className="text-slate-300 text-sm">{dept.total} Total Staff</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-green-400 text-sm">{dept.available} Available</p>
                            <p className="text-yellow-400 text-sm">{dept.busy} Busy</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            onClick={() => {
                              const deptPath = dept.dept.includes('Infrastructure') ? 'infrastructure' :
                                              dept.dept.includes('Health') ? 'health-environment' : 'water'
                              navigateToDepartment(deptPath)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Staff
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { metric: 'Average Resolution Time', value: '4.2 hours', trend: '+12%', good: true },
                      { metric: 'Citizen Satisfaction', value: '87%', trend: '+5%', good: true },
                      { metric: 'Staff Utilization', value: '78%', trend: '-3%', good: false },
                      { metric: 'Issue Prevention', value: '65%', trend: '+8%', good: true }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">{item.metric}</p>
                          <p className="text-emerald-300 text-xs">Performance indicator</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-lg font-bold">{item.value}</p>
                          <p className={`text-xs ${item.good ? 'text-green-400' : 'text-red-400'}`}>
                            {item.trend}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    <span>Department Efficiency</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { dept: 'Infrastructure & Public Works', efficiency: 85, issues: 24, avgTime: '3.5h' },
                      { dept: 'Public Health & Environment', efficiency: 92, issues: 16, avgTime: '2.8h' },
                      { dept: 'Water Supply & Utilities', efficiency: 88, issues: 28, avgTime: '4.1h' }
                    ].map((dept, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-white text-sm font-medium">{dept.dept}</h4>
                          <Badge className={`${
                            dept.efficiency >= 90 ? 'bg-green-600' : 
                            dept.efficiency >= 80 ? 'bg-yellow-600' : 'bg-red-600'
                          } text-white text-xs`}>
                            {dept.efficiency}%
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>{dept.issues} Active Issues</span>
                          <span>Avg: {dept.avgTime}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${
                              dept.efficiency >= 90 ? 'bg-green-500' : 
                              dept.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${dept.efficiency}%` }}
                          ></div>
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