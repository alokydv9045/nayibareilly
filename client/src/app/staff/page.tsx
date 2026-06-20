"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'
import {
  Briefcase, AlertCircle, CheckCircle, Clock, MapPin, User, Calendar,
  Star, Navigation, Wrench, CheckCircle2, FileImage, MessageSquare,
  ArrowRight, RefreshCw, LogOut, Bell, ChevronRight, Phone,
  ListChecks, History, UserCircle, ClipboardCheck, BadgeCheck,
  Loader2, XCircle, Award
} from 'lucide-react'
import socketService from '@/lib/services/socket-service'
import { config } from '@/lib/constants/config'
import { tokenStorage, userStorage } from '@/lib/auth/auth-utils'
import { useRouter } from 'next/navigation'

interface AssignedIssue {
  id: string; title: string; category?: string; location?: string; address?: string
  latitude?: number; longitude?: number; priority: string
  status: 'ASSIGNED_TO_STAFF' | 'STAFF_EN_ROUTE' | 'STAFF_ON_SITE' | 'WORK_IN_PROGRESS' | 'IN_PROGRESS' | 'WORK_COMPLETED' | 'RESOLVED'
  citizenName?: string; citizenPhone?: string; description?: string
  assignedAt?: string; moderatorNotes?: string
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  CRITICAL: { label: 'Critical', color: 'bg-red-500/20 text-red-600 border-red-200', dot: 'bg-red-500' },
  HIGH:     { label: 'High',     color: 'bg-orange-500/20 text-orange-600 border-orange-200', dot: 'bg-orange-500' },
  MEDIUM:   { label: 'Medium',   color: 'bg-amber-500/20 text-amber-600 border-amber-200', dot: 'bg-amber-500' },
  LOW:      { label: 'Low',      color: 'bg-blue-500/20 text-blue-600 border-blue-200', dot: 'bg-blue-500' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ASSIGNED_TO_STAFF: { label: 'Assigned',    color: 'bg-blue-500/20 text-blue-600 border-blue-200',     icon: Briefcase },
  STAFF_EN_ROUTE:    { label: 'En Route',    color: 'bg-purple-500/20 text-purple-600 border-purple-200', icon: Navigation },
  STAFF_ON_SITE:     { label: 'On Site',     color: 'bg-amber-500/20 text-amber-600 border-amber-200',   icon: MapPin },
  WORK_IN_PROGRESS:  { label: 'Working',     color: 'bg-yellow-500/20 text-yellow-600 border-yellow-200', icon: Wrench },
  IN_PROGRESS:       { label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-200', icon: Wrench },
  WORK_COMPLETED:    { label: 'Completed',   color: 'bg-emerald-500/20 text-emerald-600 border-emerald-200', icon: CheckCircle2 },
  RESOLVED:          { label: 'Resolved',    color: 'bg-emerald-500/20 text-emerald-600 border-emerald-200', icon: BadgeCheck },
}

export default function StaffPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('assigned')
  const [assignedIssues, setAssignedIssues] = useState<AssignedIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [afterPhotos, setAfterPhotos] = useState<File[]>([])
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false)

  const apiBase = ((config as { api: { fullUrl?: string } }).api.fullUrl || 'https://nayibareilly.onrender.com/api').replace(/\/$/, '')

  useEffect(() => {
    void fetchAssignedIssues()
    try {
      const token = tokenStorage.get() || ''
      if (token) socketService.connect(token)
      const refresh = () => void fetchAssignedIssues()
      ;['issue:new','issue:created','issue:update','issue:updated','issue:status','issue:assigned'].forEach(e => socketService.on(e, refresh))
      return () => { ;['issue:new','issue:created','issue:update','issue:updated','issue:status','issue:assigned'].forEach(e => socketService.off(e, refresh)) }
    } catch { /* silent */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAssignedIssues = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${apiBase}/issues/assigned-to-me`, {
        headers: { Authorization: `Bearer ${tokenStorage.get()}` }
      })
      if (res.ok) {
        const data = await res.json()
        const items = data?.data?.items || data?.items || data || []
        setAssignedIssues(Array.isArray(items) ? items : [])
      } else { toast.error('Failed to fetch assigned issues') }
    } catch { toast.error('Error loading assigned issues') }
    finally { setLoading(false) }
  }

  const startWork = async (issueId: string) => {
    try {
      const res = await fetch(`${apiBase}/issues/${issueId}/start`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${tokenStorage.get()}` }
      })
      if (res.ok) { toast.success('Work started — navigate to site!'); void fetchAssignedIssues() }
      else toast.error('Failed to start work')
    } catch { toast.error('Error starting work') }
  }

  const completeIssue = async (issueId: string) => {
    if (!completionNotes.trim()) { toast.error('Please provide completion notes'); return }
    if (afterPhotos.length === 0) { toast.error('Please upload at least one after-photo'); return }
    setIsSubmittingCompletion(true)
    try {
      const payload = new FormData()
      afterPhotos.forEach(f => payload.append('after', f))
      payload.append('note', completionNotes)
      const res = await fetch(`${apiBase}/issues/${issueId}/resolve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${tokenStorage.get()}` },
        body: payload
      })
      if (res.ok) {
        setSelectedIssue(null); setCompletionNotes(''); setAfterPhotos([])
        toast.success('Work completed! Citizen will be notified to verify.')
        void fetchAssignedIssues()
      } else toast.error('Failed to mark complete. Please try again.')
    } catch { toast.error('Failed to complete issue.') }
    finally { setIsSubmittingCompletion(false) }
  }

  const active = assignedIssues.filter(i => i.status !== 'RESOLVED' && i.status !== 'WORK_COMPLETED')
  const completed = assignedIssues.filter(i => i.status === 'RESOLVED' || i.status === 'WORK_COMPLETED')
  const urgent = assignedIssues.filter(i => ['CRITICAL','HIGH'].includes(i.priority?.toUpperCase()))

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 text-amber-950 pb-8">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white border-b border-amber-200/60 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-950">Staff Dashboard</h1>
            <p className="text-xs text-teal-300/60 mt-0.5">Manage your assigned issues with real-time updates</p>
          </div>
          <div className="flex items-center gap-3">
            {urgent.length > 0 && (
              <Badge className="bg-red-500/20 text-red-600 border border-red-200 gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                {urgent.length} Urgent
              </Badge>
            )}
            <Button size="sm" variant="ghost" onClick={() => void fetchAssignedIssues()} disabled={loading}
              className="text-amber-800/80 hover:text-amber-950 hover:bg-amber-100/50 border border-amber-200/60">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" variant="ghost" className="text-amber-800/80 hover:text-amber-950 hover:bg-amber-100/50 border border-amber-200/60">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { label: 'Active Issues', value: active.length, sub: `${urgent.length} urgent`, icon: AlertCircle, color: 'text-orange-600', bg: 'from-orange-500/20 to-orange-600/10 border-orange-200' },
              { label: 'In Progress', value: assignedIssues.filter(i => ['IN_PROGRESS','WORK_IN_PROGRESS'].includes(i.status)).length, sub: 'Currently working', icon: Wrench, color: 'text-yellow-600', bg: 'from-yellow-500/20 to-yellow-600/10 border-yellow-200' },
              { label: 'Completed', value: completed.length, sub: 'Ready for verification', icon: CheckCircle, color: 'text-emerald-600', bg: 'from-emerald-500/20 to-emerald-600/10 border-emerald-200' },
              { label: 'My Rating', value: '4.8★', sub: 'Excellent performance', icon: Star, color: 'text-yellow-600', bg: 'from-amber-500/20 to-amber-600/10 border-amber-200' },
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
            <TabsList className="bg-white border border-amber-200/60  p-1">
              <TabsTrigger value="assigned" className="data-[state=active]:bg-teal-600/40 data-[state=active]:text-amber-950 text-amber-800/80 gap-2">
                <ListChecks className="h-4 w-4" />
                My Issues
                {active.length > 0 && <Badge className="bg-teal-600/40 text-teal-200 text-xs ml-1">{active.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-emerald-600/40 data-[state=active]:text-amber-950 text-amber-800/80 gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Completed
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-amber-100/50 data-[state=active]:text-amber-950 text-amber-800/80 gap-2">
                <UserCircle className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            {/* My Issues Tab */}
            <TabsContent value="assigned" className="mt-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-amber-800/80 gap-3">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <p className="text-sm">Loading your issues...</p>
                </div>
              ) : active.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-amber-800/80 gap-3">
                  <CheckCircle2 className="h-14 w-14 opacity-30" />
                  <p className="text-lg font-medium text-amber-800/80">All clear!</p>
                  <p className="text-sm">No active issues assigned to you.</p>
                </div>
              ) : (
                active.map((issue) => {
                  const priority = PRIORITY_CONFIG[issue.priority?.toUpperCase()] || PRIORITY_CONFIG.MEDIUM
                  const statusInfo = STATUS_CONFIG[issue.status] || { label: issue.status, color: 'bg-amber-100/50 text-amber-800/80 border-amber-200/60', icon: AlertCircle }
                  const StatusIcon = statusInfo.icon
                  const canStart = issue.status === 'ASSIGNED_TO_STAFF'
                  const canComplete = issue.status === 'IN_PROGRESS' || issue.status === 'WORK_IN_PROGRESS' || issue.status === 'STAFF_ON_SITE'

                  return (
                    <Card key={issue.id} className="bg-white border border-amber-200/60 hover:border-amber-200/60 transition-all ">
                      <CardContent className="p-6 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-amber-950">{issue.title}</h3>
                              <Badge className={`border text-xs ${priority.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${priority.dot} inline-block mr-1`} />
                                {priority.label}
                              </Badge>
                              {issue.category && (
                                <Badge className="bg-purple-500/20 text-purple-600 border border-purple-200 text-xs">{issue.category}</Badge>
                              )}
                            </div>
                            {issue.description && (
                              <p className="text-sm text-amber-800/80 line-clamp-2">{issue.description}</p>
                            )}
                          </div>
                          <Badge className={`border shrink-0 ${statusInfo.color} flex items-center gap-1.5`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusInfo.label}
                          </Badge>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 text-xs text-amber-800/80">
                          {issue.citizenName && (
                            <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-teal-400" />{issue.citizenName}</span>
                          )}
                          {(issue.location || issue.address) && (
                            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-teal-400" />{issue.location || issue.address}</span>
                          )}
                          {issue.assignedAt && (
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-teal-400" />Assigned {new Date(issue.assignedAt).toLocaleDateString()}</span>
                          )}
                        </div>

                        {/* Moderator notes */}
                        {issue.moderatorNotes && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-blue-600 mb-0.5">Assignment Notes</p>
                              <p className="text-xs text-amber-800/80 italic">&ldquo;{issue.moderatorNotes}&rdquo;</p>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
                          <div className="flex gap-2">
                            {issue.latitude && issue.longitude && (
                              <Button variant="outline" size="sm"
                                className="bg-blue-500/10 border-blue-200 text-blue-600 hover:bg-blue-500/20 gap-1.5"
                                onClick={() => window.open(`https://maps.google.com/?q=${issue.latitude},${issue.longitude}`, '_blank')}>
                                <Navigation className="h-3.5 w-3.5" />
                                Navigate
                              </Button>
                            )}
                            {issue.citizenPhone && (
                              <a href={`tel:${issue.citizenPhone}`}>
                                <Button variant="outline" size="sm"
                                  className="bg-emerald-500/10 border-emerald-200 text-emerald-600 hover:bg-emerald-500/20 gap-1.5">
                                  <Phone className="h-3.5 w-3.5" />
                                  Call
                                </Button>
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {canStart && (
                              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 gap-1.5"
                                onClick={() => startWork(issue.id)}>
                                <ArrowRight className="h-3.5 w-3.5" />
                                Start Work
                              </Button>
                            )}
                            {canComplete && (
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                                onClick={() => setSelectedIssue(issue.id)}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Completion Form */}
                        {selectedIssue === issue.id && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-emerald-600 mb-0.5">Complete This Issue</h4>
                              <p className="text-xs text-emerald-200/70">Upload photos and provide notes. Citizen will verify online.</p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-emerald-200">Work Completion Notes *</label>
                              <Textarea value={completionNotes} onChange={e => setCompletionNotes(e.target.value)}
                                placeholder="Describe the work completed, parts used, etc."
                                className="bg-white border-amber-200/60 text-amber-950 placeholder:text-amber-800/80 text-sm" rows={3} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-emerald-200">After Photos *</label>
                              <Input type="file" accept="image/*" multiple
                                onChange={e => e.target.files && setAfterPhotos(Array.from(e.target.files))}
                                className="bg-white border-amber-200/60 text-amber-950 text-sm" />
                              {afterPhotos.length > 0 && (
                                <p className="text-xs text-emerald-600 flex items-center gap-1">
                                  <FileImage className="h-3.5 w-3.5" />{afterPhotos.length} photo(s) selected
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-sm"
                                onClick={() => completeIssue(issue.id)} disabled={isSubmittingCompletion}>
                                {isSubmittingCompletion ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ClipboardCheck className="h-4 w-4 mr-2" />}
                                Submit Completion
                              </Button>
                              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-500/10 text-sm"
                                onClick={() => { setSelectedIssue(null); setCompletionNotes(''); setAfterPhotos([]) }}>
                                <XCircle className="h-4 w-4 mr-1" /> Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </TabsContent>

            {/* Completed Tab */}
            <TabsContent value="completed" className="mt-6 space-y-3">
              {completed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-amber-800/80 gap-3">
                  <History className="h-14 w-14 opacity-30" />
                  <p className="text-sm">No completed issues yet</p>
                </div>
              ) : (
                completed.map(issue => (
                  <Card key={issue.id} className="bg-white border border-amber-200/60 ">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-amber-950 mb-1">{issue.title}</h3>
                          <p className="text-xs text-amber-800/80 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-teal-400" />
                            {issue.location || issue.address || 'No location'}
                          </p>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-600 border border-emerald-200 gap-1.5 ml-3">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Resolved
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <Card className="bg-white border border-amber-200/60 ">
                <CardHeader>
                  <CardTitle className="text-amber-950 flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Staff Performance
                  </CardTitle>
                  <CardDescription className="text-amber-800/80">Your work statistics and ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Total Resolved', value: '145', icon: CheckCircle2, color: 'text-emerald-600' },
                      { label: 'Avg Rating', value: '4.8 ★', icon: Star, color: 'text-yellow-600' },
                      { label: 'Response Time', value: '1.2 hrs', icon: Clock, color: 'text-blue-600' },
                      { label: 'Completion Rate', value: '96%', icon: ChevronRight, color: 'text-teal-400' },
                    ].map((item, i) => {
                      const Icon = item.icon
                      return (
                        <div key={i} className="bg-white rounded-xl p-4 border border-amber-200/60">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className={`h-4 w-4 ${item.color}`} />
                            <p className="text-xs text-amber-800/80">{item.label}</p>
                          </div>
                          <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
    </div>
  )
}