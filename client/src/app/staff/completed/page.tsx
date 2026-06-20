'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, Search, MapPin, Calendar, Clock, Star, Download } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'

interface Issue {
  id: string
  title: string
  description: string
  category: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'COMPLETED'
  location: {
    latitude: number
    longitude: number
    address: string
  }
  images: string[]
  completedImages: string[]
  createdAt: string
  startedAt: string
  completedAt: string
  timeTaken: number // in hours
  citizen: {
    name: string
    email: string
  }
  rating?: number
  feedback?: string
  completionNotes: string
}

export default function StaffCompletedPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/staff/issues/completed', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setIssues(data.issues)
        }
      } catch (error) {
        console.error('Error fetching completed issues:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch completed issues',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const downloadReport = async () => {
    try {
      const response = await fetch('/api/staff/reports/completed', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `completed-issues-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast({
          title: 'Success',
          description: 'Report downloaded successfully'
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

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.location.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter
    
    let matchesDate = true
    if (dateRange !== 'all') {
      const completedDate = new Date(issue.completedAt)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24))
      
      switch (dateRange) {
        case 'week':
          matchesDate = diffDays <= 7
          break
        case 'month':
          matchesDate = diffDays <= 30
          break
        case 'quarter':
          matchesDate = diffDays <= 90
          break
      }
    }
    
    return matchesSearch && matchesCategory && matchesPriority && matchesDate
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-600' : 'text-gray-300'}`}
      />
    ))
  }

  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${hours}h`
    }
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
  }

  const getAverageRating = () => {
    const ratedIssues = filteredIssues.filter(issue => issue.rating)
    if (ratedIssues.length === 0) return 0
    return ratedIssues.reduce((sum, issue) => sum + (issue.rating || 0), 0) / ratedIssues.length
  }

  const getAverageCompletionTime = () => {
    if (filteredIssues.length === 0) return 0
    return filteredIssues.reduce((sum, issue) => sum + issue.timeTaken, 0) / filteredIssues.length
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Completed Issues</h1>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {filteredIssues.length} Completed
          </Badge>
        </div>
        <Button onClick={downloadReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{filteredIssues.length}</div>
            <div className="text-sm text-gray-600">Issues Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
              {getAverageRating().toFixed(1)}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-600" />
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatDuration(Math.round(getAverageCompletionTime()))}
            </div>
            <div className="text-sm text-gray-600">Avg. Completion Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('all')
                setPriorityFilter('all')
                setDateRange('all')
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
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Completed Issues
            </h3>
            <p className="text-gray-600">
              No completed issues found matching your criteria.
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
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Completed in {formatDuration(issue.timeTaken)}</span>
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
                  <span>Completed: {new Date(issue.completedAt).toLocaleDateString()}</span>
                </div>

                <Badge variant="outline" className="w-fit">
                  {issue.category.replace('_', ' ')}
                </Badge>

                {/* Before/After Images */}
                <div className="space-y-2">
                  {issue.images && issue.images.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Before:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {issue.images.slice(0, 2).map((image, index) => (
                          <Image
                            key={index}
                            src={image}
                            alt={`Before ${index + 1}`}
                            width={100}
                            height={60}
                            className="w-full h-15 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {issue.completedImages && issue.completedImages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">After:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {issue.completedImages.slice(0, 2).map((image, index) => (
                          <Image
                            key={index}
                            src={image}
                            alt={`After ${index + 1}`}
                            width={100}
                            height={60}
                            className="w-full h-15 object-cover rounded-md border-2 border-green-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Completion Notes */}
                {issue.completionNotes && (
                  <div className="bg-green-50 p-2 rounded text-sm">
                    <h4 className="font-semibold text-green-800 mb-1">Completion Notes:</h4>
                    <p className="text-green-700">{issue.completionNotes}</p>
                  </div>
                )}

                {/* Rating and Feedback */}
                {issue.rating && (
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">Citizen Rating:</span>
                      <div className="flex">{getRatingStars(issue.rating)}</div>
                    </div>
                    {issue.feedback && (
                      <p className="text-sm text-gray-600 italic">&quot;{issue.feedback}&quot;</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}