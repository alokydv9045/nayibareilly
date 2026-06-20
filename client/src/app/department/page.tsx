"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { userStorage, tokenStorage } from '@/lib/auth/auth-utils'
import { useRouter } from 'next/navigation'
import {
  Users, CheckCircle, Clock, Eye, TrendingUp, AlertTriangle, Activity,
  Construction, Droplets, ArrowRight, Building2, LogOut, RefreshCw,
  Bell, BarChart3, Leaf, ChevronRight, UserCog, Loader2, Layers, Shield
} from 'lucide-react'

interface DeptUser { id: string; name: string; role?: string }

const DEPARTMENTS = [
  {
    id: 'infrastructure',
    title: 'Infrastructure & Public Works',
    subtitle: 'Roads & Construction',
    icon: Construction,
    color: 'from-orange-600/20 to-orange-800/20 border-orange-200 hover:border-orange-400/60',
    iconBg: 'bg-orange-600/20',
    iconColor: 'text-orange-600',
    activeProjects: 24,
    staffCount: 15,
    extra: [{ label: 'PWD Engineering', value: '15 Engineers' }],
    path: 'infrastructure'
  },
  {
    id: 'health-environment',
    title: 'Environmental Services',
    subtitle: 'Waste Management & Environment',
    icon: Leaf,
    color: 'from-emerald-600/20 to-emerald-800/20 border-emerald-200 hover:border-emerald-400/60',
    iconBg: 'bg-emerald-600/20',
    iconColor: 'text-emerald-600',
    activeProjects: 16,
    staffCount: 18,
    extra: [{ label: 'Environmental Staff', value: '18 Officers' }],
    path: 'health-environment'
  },
  {
    id: 'water',
    title: 'Water Supply & Utilities',
    subtitle: 'Water, Sewerage & Utilities',
    icon: Droplets,
    color: 'from-blue-600/20 to-cyan-800/20 border-blue-200 hover:border-blue-400/60',
    iconBg: 'bg-blue-600/20',
    iconColor: 'text-blue-600',
    activeProjects: 28,
    staffCount: 15,
    extra: [
      { label: 'Water Quality', value: 'Excellent ✓' },
      { label: 'System Status', value: 'Operational' }
    ],
    path: 'water'
  }
]

const STAFF_LIST = [
  { dept: 'Infrastructure & Public Works', total: 15, available: 12, busy: 3, path: 'infrastructure' },
  { dept: 'Environmental Services', total: 18, available: 14, busy: 4, path: 'health-environment' },
  { dept: 'Water Supply & Utilities', total: 15, available: 12, busy: 3, path: 'water' }
]

const PERFORMANCE = [
  { metric: 'Average Resolution Time', value: '4.2 hours', trend: '+12%', up: true },
  { metric: 'Citizen Satisfaction', value: '87%', trend: '+5%', up: true },
  { metric: 'Staff Utilization', value: '78%', trend: '-3%', up: false },
  { metric: 'Issue Prevention Rate', value: '65%', trend: '+8%', up: true }
]

const EFFICIENCY = [
  { dept: 'Infrastructure & Public Works', efficiency: 85, issues: 24, avgTime: '3.5h' },
  { dept: 'Public Health & Environment', efficiency: 92, issues: 16, avgTime: '2.8h' },
  { dept: 'Water Supply & Utilities', efficiency: 88, issues: 28, avgTime: '4.1h' }
]

export default function DepartmentAdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState<DeptUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = userStorage.get()
    if (userData) setUser(userData as DeptUser)
  }, [])

  const logout = () => {
    tokenStorage.remove(); userStorage.remove()
    router.push('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 text-amber-950 pb-8">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white border-b border-amber-200/60 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-950">Department Administration</h1>
            <p className="text-xs text-blue-600/60 mt-0.5">Municipal Department Management & Oversight — {user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-500/20 text-blue-600 border border-blue-200 gap-1.5">
              <Shield className="h-3 w-3" />
              Dept Admin
            </Badge>
            <Button size="sm" variant="ghost"
              className="text-amber-800/80 hover:text-amber-950 hover:bg-amber-100/50 border border-amber-200/60">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { label: 'Active Issues', value: '68', sub: 'Across all departments', icon: AlertTriangle, color: 'text-amber-600', bg: 'from-amber-500/20 to-amber-600/10 border-amber-200' },
              { label: 'Resolved Today', value: '12', sub: '94% Resolution Rate', icon: CheckCircle, color: 'text-emerald-600', bg: 'from-emerald-500/20 to-emerald-600/10 border-emerald-200' },
              { label: 'In Progress', value: '28', sub: 'Active field work', icon: Clock, color: 'text-blue-600', bg: 'from-blue-500/20 to-blue-600/10 border-blue-200' },
              { label: 'Total Staff', value: '55', sub: 'All departments', icon: Users, color: 'text-purple-600', bg: 'from-purple-500/20 to-purple-600/10 border-purple-200' },
            ].map((card, i) => {
              const Icon = card.icon
              return (
                <Card key={i} className={`bg-gradient-to-br ${card.bg} border `}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-amber-800/80 mb-1">{card.label}</p>
                        <p className="text-3xl font-bold text-amber-950">{card.value}</p>
                        <p className={`text-xs mt-1 ${card.color}`}>{card.sub}</p>
                      </div>
                      <div className="p-2 bg-amber-100/50 rounded-xl">
                        <Icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border border-amber-200/60 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600/40 data-[state=active]:text-amber-950 text-amber-800/80 gap-2">
                <Layers className="h-4 w-4" />Department Overview
              </TabsTrigger>
              <TabsTrigger value="staff" className="data-[state=active]:bg-blue-600/40 data-[state=active]:text-amber-950 text-amber-800/80 gap-2">
                <UserCog className="h-4 w-4" />Staff Management
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600/40 data-[state=active]:text-amber-950 text-amber-800/80 gap-2">
                <BarChart3 className="h-4 w-4" />Analytics
              </TabsTrigger>
            </TabsList>

            {/* Department Cards */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {DEPARTMENTS.map((dept) => {
                  const Icon = dept.icon
                  return (
                    <Card key={dept.id}
                      className={`bg-gradient-to-br ${dept.color} border  cursor-pointer transition-all hover:scale-[1.02] group`}
                      onClick={() => router.push(`/department/${dept.path}`)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 ${dept.iconBg} rounded-xl`}>
                              <Icon className={`h-6 w-6 ${dept.iconColor}`} />
                            </div>
                            <div>
                              <CardTitle className="text-amber-950 text-sm font-semibold">{dept.title}</CardTitle>
                              <p className={`text-xs ${dept.iconColor} mt-0.5`}>{dept.subtitle}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-amber-800/80 group-hover:text-amber-950 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-amber-100/50 rounded-xl p-3">
                            <p className={`text-xs ${dept.iconColor} mb-1`}>Active Projects</p>
                            <p className="text-xl font-bold text-amber-950">{dept.activeProjects}</p>
                          </div>
                          <div className="bg-amber-100/50 rounded-xl p-3">
                            <p className={`text-xs ${dept.iconColor} mb-1`}>Staff Members</p>
                            <p className="text-xl font-bold text-amber-950">{dept.staffCount}</p>
                          </div>
                        </div>
                        {dept.extra.map((ex, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className={dept.iconColor}>{ex.label}</span>
                            <span className="text-amber-950 font-medium">{ex.value}</span>
                          </div>
                        ))}
                        <Button className={`w-full bg-amber-100/50 hover:bg-amber-200/50 border border-amber-200/60 ${dept.iconColor} text-sm`}
                          onClick={e => { e.stopPropagation(); router.push(`/department/${dept.path}`) }}>
                          Access Department
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* Staff Management */}
            <TabsContent value="staff" className="mt-6">
              <Card className="bg-white border border-amber-200/60 ">
                <CardHeader>
                  <CardTitle className="text-amber-950 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Staff Overview by Department
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {STAFF_LIST.map((dept, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-200/60 hover:border-amber-200/60 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-8 rounded-full ${i === 0 ? 'bg-orange-500' : i === 1 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                        <div>
                          <h3 className="text-sm font-medium text-amber-950">{dept.dept}</h3>
                          <p className="text-xs text-amber-800/80">{dept.total} Total Staff</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-emerald-600">{dept.available} Available</p>
                          <p className="text-xs text-amber-600">{dept.busy} On Task</p>
                        </div>
                        <Button variant="outline" size="sm"
                          className="bg-white border-amber-200/60 text-amber-800/80 hover:text-amber-950 hover:bg-amber-100/50 gap-1.5"
                          onClick={() => router.push(`/department/${dept.path}`)}>
                          <Eye className="h-3.5 w-3.5" />View
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card className="bg-white border border-amber-200/60 ">
                  <CardHeader>
                    <CardTitle className="text-amber-950 flex items-center gap-2 text-base">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {PERFORMANCE.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-200/60">
                        <div>
                          <p className="text-sm text-amber-950 font-medium">{item.metric}</p>
                          <p className="text-xs text-amber-800/80">Performance indicator</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-amber-950">{item.value}</p>
                          <p className={`text-xs ${item.up ? 'text-emerald-600' : 'text-red-600'}`}>{item.trend}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white border border-amber-200/60 ">
                  <CardHeader>
                    <CardTitle className="text-amber-950 flex items-center gap-2 text-base">
                      <Activity className="h-4 w-4 text-emerald-600" />
                      Department Efficiency
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {EFFICIENCY.map((dept, i) => (
                      <div key={i} className="p-3 bg-white rounded-xl border border-amber-200/60">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-amber-950">{dept.dept}</h4>
                          <Badge className={`text-xs border ${dept.efficiency >= 90 ? 'bg-emerald-500/20 text-emerald-600 border-emerald-200' : dept.efficiency >= 80 ? 'bg-amber-500/20 text-amber-600 border-amber-200' : 'bg-red-500/20 text-red-600 border-red-200'}`}>
                            {dept.efficiency}%
                          </Badge>
                        </div>
                        <div className="w-full bg-amber-100/50 rounded-full h-1.5 mb-2">
                          <div className={`h-1.5 rounded-full transition-all ${dept.efficiency >= 90 ? 'bg-emerald-500' : dept.efficiency >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${dept.efficiency}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-amber-800/80">
                          <span>{dept.issues} Active Issues</span>
                          <span>Avg: {dept.avgTime}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
    </div>
  )
}