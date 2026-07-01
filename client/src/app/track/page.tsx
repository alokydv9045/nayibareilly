"use client"
import { useState, useMemo } from 'react'
import CitizenLayout from '@/components/layout/CitizenLayout'
import RequireUser from '@/components/features/auth/RequireUser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import dynamic from 'next/dynamic'
import { useTrackIssueByCode, useTrackedIssueDetails, useRefetchOnSocket } from '@/hooks/api/useTrackIssue'
import { Search, AlertTriangle, RefreshCcw, ChevronRight } from 'lucide-react'
import type { MarkerData } from '@/components/features/citizen/LeafletMap'

const LeafletMap = dynamic(() => import('@/components/features/citizen/LeafletMap'), { ssr: false }) as unknown as React.ComponentType<{ center: [number, number]; markers: MarkerData[] }>

type Step = { key: string; label: string; desc: string }

const steps: Step[] = [
  { key: 'PENDING', label: 'Submitted', desc: 'Your issue was submitted' },
  { key: 'TRIAGED', label: 'Under Review', desc: 'Assigned to the right department' },
  { key: 'ASSIGNED_TO_STAFF', label: 'Assigned', desc: 'Assigned to a field staff' },
  { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Work has started' },
  { key: 'RESOLVED', label: 'Resolved', desc: 'Issue has been resolved' },
]

const statusToIndex: Record<string, number> = { PENDING: 0, TRIAGED: 1, ASSIGNED_TO_STAFF: 2, IN_PROGRESS: 3, RESOLVED: 4 }

export default function TrackIssuePage() {
  const [code, setCode] = useState('')
  const [query, setQuery] = useState('')

  const { data: tracked, isFetching, isError, error, refetch } = useTrackIssueByCode(query || undefined)
  const issueId = tracked?.id
  const { data: details } = useTrackedIssueDetails(issueId)
  useRefetchOnSocket(issueId)

  const progress = useMemo(() => {
    if (!tracked?.status) return 0
    const idx = statusToIndex[tracked.status] ?? 0
    const pct = Math.round((idx / (steps.length - 1)) * 100)
    return pct
  }, [tracked?.status])

  const showMap = !!(details?.latitude && details?.longitude)

  return (
    <RequireUser>
      <CitizenLayout>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="text-center space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent tracking-tight">
              Track Your Issue
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base px-2">
              Enter your unique Tracking Code (starts with REP-) to check the real-time status and progress of your civic issue report
            </p>
          </div>

          <Card className="animate-fadeInUp">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Input
                  placeholder="Enter tracking code (REP-XXXXXX)"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => { if (e.key === 'Enter') setQuery(code.trim()) }}
                  className="min-h-[44px] sm:flex-1 text-base"
                />
                <div className="flex gap-2 sm:gap-3">
                  <Button onClick={() => setQuery(code.trim())} disabled={!code.trim()} className="flex-1 sm:flex-none min-h-[44px] px-4 sm:px-5 touch-manipulation">
                    <Search className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Track</span>
                    <span className="sm:hidden">Find</span>
                  </Button>
                  {!!tracked && (
                    <Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="flex-1 sm:flex-none min-h-[44px] px-3 sm:px-5 touch-manipulation">
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Refresh</span>
                      <span className="sm:hidden">Update</span>
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 px-1">
                ðŸ’¡ Tip: Find your tracking code in the confirmation message you received when submitting your issue
              </p>
            </CardContent>
          </Card>

          {isFetching && (
            <Card>
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="text-center">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                  </div>
                  <p className="text-sm text-slate-500 mt-4">ðŸ” Searching for your issue...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>âŒ Issue Not Found</AlertTitle>
              <AlertDescription>
                {(error as { message?: string })?.message || 'No issue found with this tracking code. Please check the code and try again.'}
              </AlertDescription>
            </Alert>
          )}

          {!!tracked && (
            <Card className="animate-fadeInUp">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  <span className="text-base sm:text-lg md:text-xl leading-tight pr-2">ðŸ“ {tracked.title}</span>
                  <Badge 
                    variant={tracked.status === 'RESOLVED' ? 'default' : 'secondary'}
                    className={`w-fit text-xs sm:text-sm ${tracked.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : tracked.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : tracked.status === 'ASSIGNED_TO_STAFF' ? 'bg-cyan-100 text-cyan-800' : tracked.status === 'TRIAGED' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-blue-800'}`}
                  >
                    {tracked.status.replace('_', ' ')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Progress */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-600 overflow-x-auto pb-1">
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      {steps.map((s, i) => (
                        <div key={s.key} className="flex items-center gap-1 flex-shrink-0">
                          <span className={`whitespace-nowrap ${i <= (statusToIndex[tracked.status] ?? 0) ? 'text-emerald-600 font-medium' : ''}`}>{s.label}</span>
                          {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-slate-400 flex-shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Timeline + Location */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  {/* Timeline */}
                  <div>
                    <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Status Timeline</h3>
                    <div className="relative pl-3 sm:pl-4 lg:pl-6">
                      <div className="absolute left-1.5 sm:left-2 lg:left-3 top-0 bottom-0 w-0.5 bg-slate-200" />
                      <div className="space-y-3 sm:space-y-4">
                        {(tracked.timeline || []).map((t, idx) => (
                          <div key={idx} className="relative">
                            <div className={`absolute -left-1 top-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full ${t.status === 'RESOLVED' ? 'bg-green-500' : t.status === 'IN_PROGRESS' ? 'bg-yellow-500' : t.status === 'ASSIGNED_TO_STAFF' ? 'bg-cyan-500' : t.status === 'TRIAGED' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                            <div className="bg-slate-50 rounded-lg p-3 sm:p-4 ml-3 sm:ml-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                <span className="font-medium text-sm sm:text-base">{t.status.replace('_', ' ')}</span>
                                <span className="text-xs text-slate-500">{new Date(t.createdAt || t.at || '').toLocaleString()}</span>
                              </div>
                              {t.note && <p className="text-xs sm:text-sm text-slate-600 mt-1">{t.note}</p>}
                            </div>
                          </div>
                        ))}
                        {(!tracked.timeline || tracked.timeline.length === 0) && (
                          <div className="text-sm text-slate-500 bg-slate-50 rounded-lg p-4 sm:p-5 text-center">
                            ðŸ“‹ No timeline events yet - your issue is being processed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="font-semibold">Location</h3>
                    {showMap ? (
                      <div className="h-64 sm:h-72 rounded-lg overflow-hidden border border-slate-200">
                        <LeafletMap center={[details!.latitude!, details!.longitude!]} markers={[{ id: details!.id, name: details!.title, position: [details!.latitude!, details!.longitude!], priority: 'medium' }]} />
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 bg-slate-50 rounded-lg p-4 sm:p-5 text-center">
                        ðŸ“ No location information provided for this issue
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CitizenLayout>
    </RequireUser>
  )
}