'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Search, Users, AlertCircle, Clock, CheckCircle, MapPin, Calendar, TrendingUp } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'

interface Issue {
  id: string
  title: string
  description: string
  category: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
  location: {
    latitude: number
    longitude: number
    address: string
    ward: string
  }
  images: string[]
  createdAt: string
  assignedTo?: {
    id: string
    name: string
    role: string
  }
  citizen: {
    name: string
    email: string
  }
  department: string
}

interface DepartmentStats {
  total: number
  pending: number
  assigned: number
  inProgress: number
  completed: number
  avgResolutionTime: number
  satisfactionRating: number
}

export default function DepartmentIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [stats, setStats] = useState<DepartmentStats>({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    avgResolutionTime: 0,
    satisfactionRating: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [issuesResponse, statsResponse] = await Promise.all([
          fetch('/api/department/issues', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          fetch('/api/department/stats', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        ])

        if (issuesResponse.ok) {
          const issuesData = await issuesResponse.json()
          setIssues(issuesData.issues)
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.stats)
        }
      } catch (error) {
        console.error('Error fetching department data:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch department data',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const assignIssue = async (issueId: string, staffId: string) => {
    try {
      const response = await fetch(`/api/department/issues/${issueId}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ staffId })
      })
      
      if (response.ok) {
        const updatedIssue = await response.json()
        setIssues(prev => prev.map(issue => 
          issue.id === issueId ? updatedIssue.issue : issue
        ))
        toast({
          title: 'Success',
          description: 'Issue assigned successfully'
        })
      }
    } catch (error) {
      console.error('Error assigning issue:', error)
      toast({
        title: 'Error',
        description: 'Failed to assign issue',
        variant: 'destructive'
      })
    }
  }

  const updateIssuePriority = async (issueId: string, priority: string) => {
    try {
      const response = await fetch(`/api/department/issues/${issueId}/priority`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priority })
      })
      
      if (response.ok) {
        const updatedIssue = await response.json()
        setIssues(prev => prev.map(issue => 
          issue.id === issueId ? updatedIssue.issue : issue
        ))
        toast({
          title: 'Success',
          description: 'Issue priority updated successfully'
        })
      }
    } catch (error) {
      console.error('Error updating priority:', error)
      toast({
        title: 'Error',
        description: 'Failed to update priority',
        variant: 'destructive'
      })
    }
  }

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.location.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter
    const matchesTab = activeTab === 'all' || issue.status === activeTab.toUpperCase()
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesTab
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'ASSIGNED': return <Users className="h-4 w-4" />
      case 'IN_PROGRESS': return <TrendingUp className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Department Issues Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.avgResolutionTime}h</div>
            <div className="text-sm text-gray-600">Avg. Resolution</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="POTHOLE">Pothole</SelectItem>
                <SelectItem value="STREET_LIGHT">Street Light</SelectItem>
                <SelectItem value="GARBAGE">Garbage</SelectItem>
                <SelectItem value="WATER_LEAK">Water Leak</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="HIGH">High Priority</SelectItem>
                <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                <SelectItem value="LOW">Low Priority</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('all')
                setPriorityFilter('all')
                setStatusFilter('all')
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Issues</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Issues Grid */}
          {filteredIssues.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Issues Found
                </h3>
                <p className="text-gray-600">
                  No issues found matching your criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredIssues.map((issue) => (
                <Card key={issue.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{issue.title}</CardTitle>
                      <div className="flex flex-col gap-1">
                        <Badge className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                        <Badge className={getStatusColor(issue.status)} variant="outline">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(issue.status)}
                            {issue.status.replace('_', ' ')}
                          </div>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 line-clamp-2">{issue.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{issue.location.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>

                    <Badge variant="outline" className="w-fit">
                      Ward {issue.location.ward}
                    </Badge>

                    {issue.assignedTo && (
                      <div className="bg-blue-50 p-2 rounded text-sm">
                        <span className="font-semibold">Assigned to:</span> {issue.assignedTo.name}
                      </div>
                    )}

                    {issue.images && issue.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {issue.images.slice(0, 2).map((image, index) => (
                          <Image
                            key={index}
                            src={image}
                            alt={`Issue ${index + 1}`}
                            width={100}
                            height={80}
                            className="w-full h-20 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {issue.status === 'PENDING' && (
                        <Button
                          onClick={() => {
                            const staffId = prompt('Enter Staff ID to assign:')
                            if (staffId) assignIssue(issue.id, staffId)
                          }}
                          size="sm"
                          className="flex-1"
                        >
                          Assign
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          const priority = prompt('Enter new priority (HIGH/MEDIUM/LOW):')
                          if (priority && ['HIGH', 'MEDIUM', 'LOW'].includes(priority.toUpperCase())) {
                            updateIssuePriority(issue.id, priority.toUpperCase())
                          }
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Update Priority
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}