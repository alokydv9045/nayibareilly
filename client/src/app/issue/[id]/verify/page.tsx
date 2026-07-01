'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { Star, CheckCircle, XCircle, MapPin, Calendar, User, Building2, AlertCircle } from 'lucide-react'
import api from '@/lib/api/endpoints'
import { userStorage } from '@/lib/auth/auth-utils'

interface Issue {
  id: string
  reportId: string
  title: string
  description: string
  status: string
  priority: string
  location: string
  category?: {
    id: string
    name: string
  }
  department?: {
    id: string
    name: string
  }
  assignedTo?: {
    id: string
    name: string
  }
  reporter: {
    id: string
    name: string
  }
  resolutionSummary?: string
  createdAt: string
  resolvedAt?: string
}

export default function VerifyIssuePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [feedback, setFeedback] = useState('')
  const [decision, setDecision] = useState<'verify' | 'reopen' | ''>('')
  const [reopenReason, setReopenReason] = useState('')
  const [issueId, setIssueId] = useState<string>('')

  useEffect(() => {
    const unwrapParams = async () => {
      const { id } = await params
      setIssueId(id)
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    if (!issueId) return
    
    const loadIssue = async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`/issues/${issueId}`)
        const issueData = data?.data as Issue
        
        if (!issueData) {
          toast.error('Issue not found')
          router.push('/my-issues')
          return
        }

        // Check if user is the reporter
        const currentUser = userStorage.get()
        if (currentUser && issueData.reporter.id !== currentUser.id) {
          toast.error('You can only verify your own issues')
          router.push('/my-issues')
          return
        }

        // Check if issue is in verifiable state
        const verifiableStatuses = ['WORK_COMPLETED', 'PENDING_CITIZEN_VERIFICATION', 'RESOLVED']
        if (!verifiableStatuses.includes(issueData.status)) {
          toast.error(`Issue cannot be verified in ${issueData.status} status`)
          router.push(`/reports/${issueId}`)
          return
        }

        setIssue(issueData)
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; message?: string }
        const message = err?.response?.data?.message || 'Failed to load issue'
        toast.error(message)
        router.push('/my-issues')
      } finally {
        setLoading(false)
      }
    }

    loadIssue()
  }, [issueId, router])

  const handleSubmit = async () => {
    if (!decision) {
      toast.error('Please select whether to verify or reopen the issue')
      return
    }

    if (decision === 'verify' && rating === 0) {
      toast.error('Please provide a rating')
      return
    }

    if (decision === 'reopen' && !reopenReason.trim()) {
      toast.error('Please provide a reason for reopening')
      return
    }

    if (!issueId) {
      toast.error('Invalid issue ID')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        rating: decision === 'verify' ? rating : undefined,
        feedback: decision === 'verify' ? feedback : undefined,
        reopen: decision === 'reopen',
        reopenReason: decision === 'reopen' ? reopenReason : undefined
      }

      await api.post(`/issues/${issueId}/verify`, payload)

      if (decision === 'verify') {
        toast.success('Thank you for verifying! Your feedback helps us improve.')
      } else {
        toast.success('Issue reopened. Our team will work on it again.')
      }

      // Redirect to issue details or my issues
      setTimeout(() => {
        router.push(`/reports/${issueId}`)
      }, 1500)

    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      const message = err?.response?.data?.message || 'Failed to submit verification'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading issue...</p>
        </div>
      </div>
    )
  }

  if (!issue) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Verify Issue Resolution</h1>
          <p className="text-emerald-200">
            Please review the resolution and provide your feedback
          </p>
        </div>

        {/* Issue Summary Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>{issue.title}</span>
              <Badge className="bg-green-600">
                {issue.status.replace(/_/g, ' ')}
              </Badge>
            </CardTitle>
            <CardDescription className="text-emerald-200">
              Report ID: {issue.reportId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-emerald-200">
              <p className="mb-4">{issue.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-orange-300" />
                  <span>Category: {issue.category?.name || 'Uncategorized'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-emerald-300" />
                  <span>Department: {issue.department?.name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-green-300" />
                  <span>Handled by: {issue.assignedTo?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-purple-300" />
                  <span>Reported: {new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
                {issue.resolvedAt && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-300" />
                    <span>Resolved: {new Date(issue.resolvedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {issue.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-red-300" />
                    <span>{issue.location}</span>
                  </div>
                )}
              </div>

              {issue.resolutionSummary && (
                <div className="mt-4 p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-300 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-100 mb-1">Resolution Summary:</p>
                      <p className="text-green-200">{issue.resolutionSummary}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verification Form */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Your Verification</CardTitle>
            <CardDescription className="text-emerald-200">
              Was the issue resolved to your satisfaction?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Decision Selection */}
            <div className="space-y-3">
              <button
                onClick={() => setDecision('verify')}
                className={`w-full flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                  decision === 'verify'
                    ? 'bg-green-900/30 border-green-500'
                    : 'bg-green-900/10 border-green-500/30 hover:bg-green-900/20'
                }`}
              >
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                  decision === 'verify' ? 'border-green-500 bg-green-500' : 'border-green-500/50'
                }`}>
                  {decision === 'verify' && <CheckCircle className="h-4 w-4 text-white" />}
                </div>
                <div className="flex items-center space-x-2 flex-1 text-left">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <div>
                    <p className="text-white font-semibold">Yes, issue is resolved</p>
                    <p className="text-emerald-200 text-sm">The issue has been fixed to my satisfaction</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setDecision('reopen')}
                className={`w-full flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                  decision === 'reopen'
                    ? 'bg-red-900/30 border-red-500'
                    : 'bg-red-900/10 border-red-500/30 hover:bg-red-900/20'
                }`}
              >
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                  decision === 'reopen' ? 'border-red-500 bg-red-500' : 'border-red-500/50'
                }`}>
                  {decision === 'reopen' && <XCircle className="h-4 w-4 text-white" />}
                </div>
                <div className="flex items-center space-x-2 flex-1 text-left">
                  <XCircle className="h-5 w-5 text-red-300" />
                  <div>
                    <p className="text-white font-semibold">No, reopen this issue</p>
                    <p className="text-emerald-200 text-sm">The issue is not resolved or needs more work</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Verify Option - Rating and Feedback */}
            {decision === 'verify' && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div>
                  <Label className="text-white mb-3 block">Rate the resolution quality</Label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            star <= (hoveredRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-400'
                          }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-4 text-white font-semibold">
                        {rating} {rating === 1 ? 'star' : 'stars'}
                      </span>
                    )}
                  </div>
                  <p className="text-emerald-200 text-sm mt-2">
                    {rating === 5 && 'â­ Excellent!'}
                    {rating === 4 && 'ðŸ‘ Good'}
                    {rating === 3 && 'ðŸ˜Š Satisfactory'}
                    {rating === 2 && 'ðŸ˜• Needs improvement'}
                    {rating === 1 && 'ðŸ˜ž Poor'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="feedback" className="text-white mb-2 block">
                    Additional feedback (optional)
                  </Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share your experience or suggestions for improvement..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-emerald-300/50 min-h-[120px]"
                  />
                  <p className="text-emerald-300 text-sm mt-2">
                    Your feedback helps us improve our services
                  </p>
                </div>
              </div>
            )}

            {/* Reopen Option - Reason */}
            {decision === 'reopen' && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div>
                  <Label htmlFor="reopenReason" className="text-white mb-2 block">
                    Why are you reopening this issue? *
                  </Label>
                  <Textarea
                    id="reopenReason"
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    placeholder="Please explain why the issue is not resolved (e.g., problem persists, incomplete work, different issue)..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-emerald-300/50 min-h-[120px]"
                    required
                  />
                  <p className="text-emerald-300 text-sm mt-2">
                    <AlertCircle className="inline h-4 w-4 mr-1" />
                    Be specific so our team can address your concerns
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => router.push(`/reports/${issueId}`)}
                className="border-white/30 text-white hover:bg-white/10"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !decision}
                className={
                  decision === 'verify'
                    ? 'bg-green-600 hover:bg-green-700'
                    : decision === 'reopen'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-slate-600'
                }
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : decision === 'verify' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Resolution
                  </>
                ) : decision === 'reopen' ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reopen Issue
                  </>
                ) : (
                  'Select an option'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-900/20 border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3 text-emerald-200">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Important Information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your verification helps us maintain service quality</li>
                  <li>If you choose to reopen, the issue will be assigned back to the department</li>
                  <li>You can provide feedback even if you verify the resolution</li>
                  <li>Your rating and feedback are shared with the service team</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}