"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'
import { Briefcase, AlertCircle, CheckCircle, Clock, MapPin, User, Calendar, Star, Navigation, MapPinned, Wrench, CheckCircle2, FileImage, MessageSquare, ArrowRight } from 'lucide-react'
import socketService from '@/lib/services/socket-service'
import { config } from '@/lib/constants/config'
import { tokenStorage } from '@/lib/auth/auth-utils'

interface AssignedIssue {
  id: string
  title: string
  category?: string
  location?: string
  address?: string
  latitude?: number
  longitude?: number
  priority: string
  status: 'ASSIGNED_TO_STAFF' | 'STAFF_EN_ROUTE' | 'STAFF_ON_SITE' | 'WORK_IN_PROGRESS' | 'IN_PROGRESS' | 'WORK_COMPLETED' | 'RESOLVED'
  citizenName?: string
  citizenPhone?: string
  description?: string
  assignedAt?: string
  moderatorNotes?: string
}

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState('assigned')
  const [assignedIssues, setAssignedIssues] = useState<AssignedIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [afterPhotos, setAfterPhotos] = useState<File[]>([])

  useEffect(() => {
    void fetchAssignedIssues()

    // Connect socket and subscribe to issue updates for realtime refresh
    try {
      const token = tokenStorage.get() || ''
      if (token) socketService.connect(token)

      const onAnyUpdate = () => {
        void fetchAssignedIssues()
      }

      // Subscribe to a wide set of events to ensure updates propagate
      socketService.on('issue:new', onAnyUpdate)
      socketService.on('issue:created', onAnyUpdate)
      socketService.on('issue:update', onAnyUpdate)
      socketService.on('issue:updated', onAnyUpdate)
      socketService.on('issue:status', onAnyUpdate)
      socketService.on('issue:assigned', onAnyUpdate)

      return () => {
        socketService.off('issue:new', onAnyUpdate)
        socketService.off('issue:created', onAnyUpdate)
        socketService.off('issue:update', onAnyUpdate)
        socketService.off('issue:updated', onAnyUpdate)
        socketService.off('issue:status', onAnyUpdate)
        socketService.off('issue:assigned', onAnyUpdate)
      }
    } catch {
      // Silent fail for socket connection
    }
  }, [])

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
        setAssignedIssues(items)
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
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${tokenStorage.get()}`,
        },
      })
      if (response.ok) {
        toast.success('Work started successfully')
        void fetchAssignedIssues()
      } else {
        toast.error('Failed to start work')
      }
    } catch {
      toast.error('Error starting work')
    }
  }

  const completeIssue = async (issueId: string) => {
    if (!completionNotes.trim()) {
      alert('Please provide completion notes')
      return
    }
    if (afterPhotos.length === 0) {
      alert('Please upload at least one after photo')
      return
    }

    try {
      const apiBase = (config.api.fullUrl || 'https://nayibareilly.onrender.com/api').replace(/\/$/, '')
      const payload = new FormData()
      afterPhotos.forEach((file) => payload.append('after', file))
      payload.append('note', completionNotes)

      const response = await fetch(`${apiBase}/issues/${issueId}/resolve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${tokenStorage.get()}`,
        },
        body: payload,
      })
      if (response.ok) {
        setSelectedIssue(null)
        setCompletionNotes('')
        setAfterPhotos([])
        toast.success('Work completed! Citizen will be notified to verify.')
        void fetchAssignedIssues()
      } else {
        toast.error('Failed to complete issue. Please try again.')
      }
    } catch {
      toast.error('Failed to complete issue. Please try again.')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'CRITICAL':
        return 'bg-red-500'
      case 'high':
      case 'HIGH':
        return 'bg-orange-500'
      case 'medium':
      case 'MEDIUM':
        return 'bg-yellow-500'
      case 'low':
      case 'LOW':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ASSIGNED_TO_STAFF':
        return { label: 'Assigned', color: 'bg-blue-500', icon: Briefcase }
      case 'STAFF_EN_ROUTE':
        return { label: 'En Route', color: 'bg-purple-500', icon: MapPinned }
      case 'STAFF_ON_SITE':
        return { label: 'On Site', color: 'bg-orange-500', icon: MapPinned }
      case 'WORK_IN_PROGRESS':
      case 'IN_PROGRESS':
        return { label: 'In Progress', color: 'bg-yellow-500', icon: Wrench }
      case 'WORK_COMPLETED':
      case 'RESOLVED':
        return { label: 'Completed', color: 'bg-green-500', icon: CheckCircle2 }
      default:
        return { label: 'Unknown', color: 'bg-gray-500', icon: AlertCircle }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-blue-900">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-teal-600 rounded-xl">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Staff Dashboard</h1>
                <p className="text-cyan-200">Manage your assigned issues with real-time status updates</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-teal-600 text-white px-4 py-2 text-lg">
              <Briefcase className="h-4 w-4 mr-2" />
              Staff Member
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-200 text-sm">Assigned Issues</p>
                  <p className="text-3xl font-bold text-white">{assignedIssues.length}</p>
                  <p className="text-xs text-yellow-400">
                    {assignedIssues.filter((i) => String(i.priority).toUpperCase() === 'CRITICAL' || String(i.priority).toUpperCase() === 'HIGH').length} urgent
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-200 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-white">{assignedIssues.filter((i) => i.status === 'RESOLVED').length}</p>
                  <p className="text-xs text-green-400">Ready for verification</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-200 text-sm">In Progress</p>
                  <p className="text-3xl font-bold text-white">{assignedIssues.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'WORK_IN_PROGRESS').length}</p>
                  <p className="text-xs text-blue-400">Currently working</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-200 text-sm">Performance</p>
                  <p className="text-3xl font-bold text-white">4.8</p>
                  <p className="text-xs text-yellow-400">â˜… Excellent rating</p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-lg">
            <TabsTrigger value="assigned" className="data-[state=active]:bg-teal-600">My Issues</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-teal-600">Completed</TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-teal-600">My Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>My Assigned Issues</span>
                </CardTitle>
                <CardDescription className="text-cyan-200">Update status and complete your assigned tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12 text-cyan-300">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50 animate-pulse" />
                    <p>Loading your assigned issues...</p>
                  </div>
                ) : assignedIssues.filter((i) => i.status !== 'RESOLVED').length === 0 ? (
                  <div className="text-center py-12 text-cyan-300">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No active issues assigned. Great job!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedIssues
                      .filter((i) => i.status !== 'RESOLVED')
                      .map((issue) => {
                        const info = getStatusInfo(issue.status)
                        const StatusIcon = info.icon
                        const canStart = issue.status === 'ASSIGNED_TO_STAFF'
                        const canComplete = issue.status === 'IN_PROGRESS' || issue.status === 'WORK_IN_PROGRESS'

                        return (
                          <Card key={issue.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <h3 className="text-xl font-semibold text-white">{issue.title}</h3>
                                      <Badge className={getPriorityColor(issue.priority)}>{String(issue.priority).toUpperCase()}</Badge>
                                      {issue.category && <Badge className="bg-purple-500">{issue.category}</Badge>}
                                    </div>
                                    {issue.description && <p className="text-cyan-200 mb-3">{issue.description}</p>}
                                    <div className="grid grid-cols-2 gap-2 text-sm text-cyan-200">
                                      <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4" />
                                        <span>{issue.citizenName || 'Citizen'}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{issue.location ?? issue.address ?? ''}</span>
                                      </div>
                                      {issue.assignedAt && (
                                        <div className="flex items-center space-x-2">
                                          <Calendar className="h-4 w-4" />
                                          <span>Assigned {new Date(issue.assignedAt).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Badge className={`${info.color} px-4 py-2 text-lg`}>
                                      <StatusIcon className="h-4 w-4 mr-2" />
                                      {info.label}
                                    </Badge>
                                  </div>
                                </div>

                                {issue.moderatorNotes && (
                                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                                    <div className="flex items-start space-x-2">
                                      <MessageSquare className="h-4 w-4 text-blue-300 mt-1" />
                                      <div>
                                        <p className="text-blue-200 text-sm font-semibold mb-1">Assignment Notes:</p>
                                        <p className="text-white text-sm italic">&ldquo;{issue.moderatorNotes}&rdquo;</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                  <div className="flex items-center space-x-2">
                                    {issue.latitude && issue.longitude && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-blue-600/20 border-blue-500 text-blue-300 hover:bg-blue-600/30"
                                        onClick={() => window.open(`https://maps.google.com/?q=${issue.latitude},${issue.longitude}`, '_blank')}
                                      >
                                        <Navigation className="h-4 w-4 mr-1" />
                                        Navigate
                                      </Button>
                                    )}
                                    {issue.citizenPhone && (
                                      <a href={`tel:${issue.citizenPhone}`}>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="bg-green-600/20 border-green-500 text-green-300 hover:bg-green-600/30"
                                        >
                                          Call Citizen
                                        </Button>
                                      </a>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    {canStart && (
                                      <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={() => startWork(issue.id)}>
                                        <ArrowRight className="h-4 w-4 mr-1" /> Start Work
                                      </Button>
                                    )}
                                    {canComplete && (
                                      <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={() => setSelectedIssue(issue.id)}>
                                        <CheckCircle2 className="h-4 w-4 mr-1" /> Complete Work
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {selectedIssue === issue.id && (
                                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 space-y-4">
                                    <h4 className="text-green-200 font-semibold text-lg">Complete This Issue</h4>
                                    <p className="text-green-300 text-sm">Upload photos and provide completion notes. Citizen will be notified to verify online.</p>

                                    <div>
                                      <label className="block text-green-200 text-sm font-semibold mb-2">Work Completion Notes *</label>
                                      <Textarea
                                        value={completionNotes}
                                        onChange={(e) => setCompletionNotes(e.target.value)}
                                        placeholder="Describe the work completed, parts used, materials, tools, etc..."
                                        className="bg-white/10 border-white/20 text-white"
                                        rows={3}
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-green-200 text-sm font-semibold mb-2">After Photos (Work Completed) *</label>
                                      <Input type="file" accept="image/*" multiple onChange={(e) => e.target.files && setAfterPhotos(Array.from(e.target.files))} className="bg-white/10 border-white/20 text-white" />
                                      {afterPhotos.length > 0 && (
                                        <div className="flex items-center space-x-2 text-sm text-green-200 mt-2">
                                          <FileImage className="h-4 w-4" />
                                          <span>{afterPhotos.length} after photo(s) selected</span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center space-x-2 pt-2">
                                      <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => completeIssue(issue.id)}>
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Submit Completion
                                      </Button>
                                      <Button
                                        variant="outline"
                                        className="bg-red-600/20 border-red-500 text-red-300 hover:bg-red-600/30"
                                        onClick={() => {
                                          setSelectedIssue(null)
                                          setCompletionNotes('')
                                          setAfterPhotos([])
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Completed Issues</span>
                </CardTitle>
                <CardDescription className="text-cyan-200">View your completed work history</CardDescription>
              </CardHeader>
              <CardContent>
                {assignedIssues.filter((i) => i.status === 'RESOLVED').length === 0 ? (
                  <div className="text-center py-12 text-cyan-300">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No completed issues yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedIssues
                      .filter((i) => i.status === 'RESOLVED')
                      .map((issue) => (
                        <Card key={issue.id} className="bg-white/5 border-white/10">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-white font-semibold">{issue.title}</h3>
                                <p className="text-cyan-200 text-sm">{issue.location ?? issue.address ?? ''}</p>
                              </div>
                              <Badge className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" /> Completed
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Staff Performance</CardTitle>
                <CardDescription className="text-cyan-200">Your work statistics and ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-white">
                  <div className="flex items-center justify-between">
                    <span>Total Issues Resolved:</span>
                    <span className="font-bold">145</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Rating:</span>
                    <span className="font-bold text-yellow-400">4.8 â˜…</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Response Time:</span>
                    <span className="font-bold text-green-400">1.2 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completion Rate:</span>
                    <span className="font-bold text-green-400">96%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}