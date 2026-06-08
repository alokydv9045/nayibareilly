"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import toast from 'react-hot-toast'
import { 
  Clock, 
  MapPin, 
  User, 
  Calendar, 
  Star, 
  Navigation, 
  ArrowRight,
  Filter,
  Search,
  PlayCircle,
  AlertTriangle
} from 'lucide-react'
import socketService from '@/lib/services/socket-service'
import { config } from '@/lib/constants/config'
import { tokenStorage } from '@/lib/auth/auth-utils'
import Link from 'next/link'

interface AssignedIssue {
  id: string
  title: string
  category?: string
  location?: string
  address?: string
  latitude?: number
  longitude?: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'ASSIGNED_TO_STAFF'
  citizenName?: string
  citizenPhone?: string
  description?: string
  assignedAt?: string
  moderatorNotes?: string
  createdAt?: string
  dueDate?: string
}

const priorityConfig = {
  LOW: { label: 'Low', className: 'bg-green-100 text-green-800 border-green-200' },
  MEDIUM: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  HIGH: { label: 'High', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  CRITICAL: { label: 'Critical', className: 'bg-red-100 text-red-800 border-red-200' },
}

export default function StaffAssignedPage() {
  const [assignedIssues, setAssignedIssues] = useState<AssignedIssue[]>([])
  const [filteredIssues, setFilteredIssues] = useState<AssignedIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  useEffect(() => {
    void fetchAssignedIssues()

    // Real-time updates
    try {
      const token = tokenStorage.get() || ''
      if (token) socketService.connect(token)

      const onUpdate = () => {
        void fetchAssignedIssues()
      }

      socketService.on('issue:assigned', onUpdate)
      socketService.on('issue:updated', onUpdate)

      return () => {
        socketService.off('issue:assigned', onUpdate)
        socketService.off('issue:updated', onUpdate)
      }
    } catch {
      // Silent fail for socket connection
    }
  }, [])

  // Filter issues based on search and priority
  useEffect(() => {
    let filtered = assignedIssues.filter(issue => 
      issue.status === 'ASSIGNED_TO_STAFF'
    )

    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(issue => issue.priority === priorityFilter)
    }

    setFilteredIssues(filtered)
  }, [assignedIssues, searchTerm, priorityFilter])

  const fetchAssignedIssues = async () => {
    setLoading(true)
    try {
      const apiBase = (config.api.fullUrl || 'https://nayibareilly.onrender.com/api').replace(/\/$/, '')
      const response = await fetch(`${apiBase}/issues/assigned-to-me`, {
        headers: {
          Authorization: `Bearer ${tokenStorage.get()}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const items = (data.items || data.data || data).items || data.items || data
        setAssignedIssues(Array.isArray(items) ? items : [])
      } else {
        toast.error('Failed to fetch assigned issues')
      }
    } catch {
      toast.error('Error loading assigned issues')
    } finally {
      setLoading(false)
    }
  }

  const startWork = async (issueId: string) => {
    try {
      const apiBase = (config.api.fullUrl || 'https://nayibareilly.onrender.com/api').replace(/\/$/, '')
      const response = await fetch(`${apiBase}/issues/${issueId}/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenStorage.get()}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast.success('Work started on issue')
        void fetchAssignedIssues()
      } else {
        toast.error('Failed to start work')
      }
    } catch {
      toast.error('Error starting work')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysOverdue = (assignedAt?: string) => {
    if (!assignedAt) return 0
    const assigned = new Date(assignedAt)
    const now = new Date()
    const diffTime = now.getTime() - assigned.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assigned Issues</h1>
            <p className="text-gray-600 mt-2">
              Issues assigned to you for resolution
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {filteredIssues.length} Assigned
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by title, location, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="all">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Issues Grid */}
      {filteredIssues.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Clock className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No assigned issues
          </h3>
          <p className="text-gray-600">
            You don&apos;t have any issues assigned to you at the moment.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredIssues.map((issue) => {
            const daysOverdue = getDaysOverdue(issue.assignedAt)
            
            return (
              <Card key={issue.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge 
                          className={priorityConfig[issue.priority]?.className || priorityConfig.MEDIUM.className}
                        >
                          {issue.priority === 'CRITICAL' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {priorityConfig[issue.priority]?.label || 'Medium'}
                        </Badge>
                        {daysOverdue > 2 && (
                          <Badge variant="destructive">
                            {daysOverdue} days overdue
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-2">{issue.title}</CardTitle>
                      <CardDescription className="text-base">
                        {issue.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => startWork(issue.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Work
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Issue Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{issue.location || issue.address || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Assigned: {formatDate(issue.assignedAt)}</span>
                    </div>
                    {issue.citizenName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{issue.citizenName}</span>
                      </div>
                    )}
                    {issue.category && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="h-4 w-4" />
                        <span>{issue.category}</span>
                      </div>
                    )}
                  </div>

                  {/* Moderator Notes */}
                  {issue.moderatorNotes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h5 className="font-medium text-blue-900 mb-1">Moderator Notes:</h5>
                      <p className="text-blue-800 text-sm">{issue.moderatorNotes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-2">
                      {issue.latitude && issue.longitude && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`https://maps.google.com/maps?q=${issue.latitude},${issue.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            Navigate
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/reports/${issue.id}`}>
                          View Details
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}