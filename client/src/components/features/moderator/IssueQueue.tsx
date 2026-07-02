/**
 * IssueQueue - Display and manage pending issues queue
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, RefreshCw, Filter, CheckCircle } from 'lucide-react'
import { IssueCard } from './IssueCard'
import { useModeratorAPI } from '@/hooks/api/useModeratorAPI'
import socketService from '@/lib/services/socket-service'
import { Skeleton } from '@/components/ui/skeleton'
import toast from 'react-hot-toast'

interface Issue {
  id: string
  title: string
  description: string
  address: string
  reporterName: string
  createdAt: string
  priority: string
  categoryName?: string
  images?: Array<{ id: string; url: string }>
  reportId: string
}

interface IssueQueueProps {
  onApprove: (issueId: string) => void
  onReject: (issueId: string) => void
  onRequestInfo: (issueId: string) => void
  onMarkSpam: (issueId: string) => void
  actionLoading: string | null
}

export function IssueQueue({
  onApprove,
  onReject,
  onRequestInfo,
  onMarkSpam,
  actionLoading
}: IssueQueueProps) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('newest')

  const { fetchPending } = useModeratorAPI()

  const loadIssues = async () => {
    try {
      setLoading(true)
      console.log('[IssueQueue] Starting to fetch pending issues...')
      const data = await fetchPending()
      console.log('[IssueQueue] Fetched issues:', data)
      console.log('[IssueQueue] Number of issues:', data.length)
      setIssues(data)
    } catch (error) {
      console.error('[IssueQueue] Error loading issues:', error)
      if (error instanceof Error) {
        console.error('[IssueQueue] Error message:', error.message)
        console.error('[IssueQueue] Error stack:', error.stack)
      }
      toast.error('Failed to load pending issues')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIssues()

    // Listen for real-time updates
    const handleNewIssue = () => {
      loadIssues()
      toast('New issue added to queue', { icon: 'ðŸ””' })
    }

    const handleIssueUpdate = () => {
      loadIssues()
    }

    socketService.on('issue:new', handleNewIssue)
    socketService.on('issue:update', handleIssueUpdate)
    socketService.on('issue:deleted', handleIssueUpdate)

    return () => {
      socketService.off('issue:new', handleNewIssue)
      socketService.off('issue:update', handleIssueUpdate)
      socketService.off('issue:deleted', handleIssueUpdate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter and sort issues
  const filteredIssues = useMemo(() => {
    let filtered = [...issues]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(query) ||
          issue.description.toLowerCase().includes(query) ||
          issue.address.toLowerCase().includes(query) ||
          issue.reporterName.toLowerCase().includes(query) ||
          issue.reportId.toLowerCase().includes(query)
      )
    }

    // Priority filter
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(
        (issue) => issue.priority.toUpperCase() === priorityFilter
      )
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'priority':
        const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
        filtered.sort((a, b) => {
          const aPriority = priorityOrder[a.priority.toUpperCase() as keyof typeof priorityOrder] ?? 4
          const bPriority = priorityOrder[b.priority.toUpperCase() as keyof typeof priorityOrder] ?? 4
          return aPriority - bPriority
        })
        break
    }

    return filtered
  }, [issues, searchQuery, priorityFilter, sortBy])

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Pending Issues Queue
            </CardTitle>
            <CardDescription className="text-orange-200">
              {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} awaiting review
            </CardDescription>
          </div>
          <Button
            onClick={loadIssues}
            disabled={loading}
            variant="outline"
            size="sm"
            className="text-white border-white/20 hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-300" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-orange-300"
            />
          </div>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white/10 border-white/20">
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-12 text-orange-300">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-semibold mb-2">All caught up!</p>
            <p>
              {searchQuery || priorityFilter !== 'ALL'
                ? 'No issues match your filters'
                : 'No pending reviews at the moment'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onApprove={onApprove}
                onReject={onReject}
                onRequestInfo={onRequestInfo}
                onMarkSpam={onMarkSpam}
                loading={actionLoading === issue.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}