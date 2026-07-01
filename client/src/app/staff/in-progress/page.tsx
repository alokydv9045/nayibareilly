'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Search, CheckCircle, MapPin, Calendar, Play } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'

interface Issue {
  id: string
  title: string
  description: string
  category: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'IN_PROGRESS'
  location: {
    latitude: number
    longitude: number
    address: string
  }
  images: string[]
  createdAt: string
  startedAt: string
  estimatedCompletion: string
  citizen: {
    name: string
    email: string
  }
  progressNotes: Array<{
    id: string
    note: string
    createdAt: string
    images?: string[]
  }>
}

export default function StaffInProgressPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/staff/issues/in-progress', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setIssues(data.issues)
        }
      } catch (error) {
        console.error('Error fetching in-progress issues:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch in-progress issues',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const handleCompleteIssue = async (issueId: string) => {
    try {
      const response = await fetch(`/api/staff/issues/${issueId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setIssues(prev => prev.filter(issue => issue.id !== issueId))
        toast({
          title: 'Success',
          description: 'Issue marked as completed successfully'
        })
      }
    } catch (error) {
      console.error('Error completing issue:', error)
      toast({
        title: 'Error',
        description: 'Failed to complete issue',
        variant: 'destructive'
      })
    }
  }

  const addProgressNote = async (issueId: string, note: string) => {
    try {
      const response = await fetch(`/api/staff/issues/${issueId}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note })
      })
      
      if (response.ok) {
        const updatedIssue = await response.json()
        setIssues(prev => prev.map(issue => 
          issue.id === issueId ? updatedIssue.issue : issue
        ))
        toast({
          title: 'Success',
          description: 'Progress note added successfully'
        })
      }
    } catch (error) {
      console.error('Error adding progress note:', error)
      toast({
        title: 'Error',
        description: 'Failed to add progress note',
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
    return matchesSearch && matchesCategory && matchesPriority
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const calculateDaysInProgress = (startedAt: string) => {
    const started = new Date(startedAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - started.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Play className="h-8 w-8 text-emerald-600" />
        <h1 className="text-3xl font-bold text-slate-900">In Progress Issues</h1>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {filteredIssues.length} Active
        </Badge>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
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
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Issues Grid */}
      {filteredIssues.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Play className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No In-Progress Issues
            </h3>
            <p className="text-slate-600">
              You don&apos;t have any issues currently in progress.
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
                  <Badge className={getPriorityColor(issue.priority)}>
                    {issue.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span>{calculateDaysInProgress(issue.startedAt)} days in progress</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600 line-clamp-2">{issue.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{issue.location.address}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>Expected: {new Date(issue.estimatedCompletion).toLocaleDateString()}</span>
                </div>

                <Badge variant="outline" className="w-fit">
                  {issue.category.replace('_', ' ')}
                </Badge>

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

                {/* Progress Notes */}
                {issue.progressNotes && issue.progressNotes.length > 0 && (
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-semibold mb-2">Latest Progress:</h4>
                    <div className="bg-slate-50 p-2 rounded text-sm">
                      {issue.progressNotes[issue.progressNotes.length - 1].note}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleCompleteIssue(issue.id)}
                    className="flex-1"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                  <Button
                    onClick={() => {
                      const note = prompt('Add progress note:')
                      if (note) addProgressNote(issue.id, note)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}