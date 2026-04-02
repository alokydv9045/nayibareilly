import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { trackIssueByReportId, getIssue } from '@/lib/api/issues'

export type IssueTimelineItem = {
  id?: string
  status: string
  note?: string | null
  createdAt?: string
  at?: string
  performedById?: string | null
}

export type TrackedIssue = {
  id: string
  title: string
  status: string
  reportId: string
  createdAt: string
  updatedAt?: string
  category?: { id?: string; name?: string; color?: string; icon?: string }
  timeline?: IssueTimelineItem[]
  // From full issue details
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  images?: Array<{ url: string }>
}

export const trackKeys = {
  all: ['track'] as const,
  byCode: (code: string) => [...trackKeys.all, 'code', code] as const,
  details: (id: string) => [...trackKeys.all, 'details', id] as const,
}

export function useTrackIssueByCode(code?: string) {
  return useQuery({
    enabled: !!code,
    queryKey: code ? trackKeys.byCode(code) : ['track', 'missing'],
    queryFn: async () => {
      const issue = await trackIssueByReportId(code as string)
      return issue as TrackedIssue
    },
    staleTime: 15000,
  })
}

export function useTrackedIssueDetails(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: id ? trackKeys.details(id) : ['track', 'details', 'missing'],
    queryFn: async () => {
      const issue = await getIssue(id as string)
      return issue as TrackedIssue
    },
    staleTime: 15000,
  })
}

// Minimal socket type
type SocketLike = { on: (e: string, cb: (data: { id?: string }) => void) => void; off: (e: string, cb: (data: { id?: string }) => void) => void }

export function useRefetchOnSocket(issueId?: string) {
  const qc = useQueryClient()
  useEffect(() => {
    let mounted = true
    let socket: SocketLike | null = null

    const init = async () => {
      try {
        const mod = await import('@/lib/services/socket-service')
        socket = (mod as unknown as { default?: SocketLike }).default || null
        if (!socket || !issueId) return

        const onStatus = (data: { id?: string }) => {
          if (!mounted) return
          if (data?.id === issueId) {
            qc.invalidateQueries({ queryKey: trackKeys.details(issueId) })
            qc.invalidateQueries({ queryKey: trackKeys.byCode('') })
          }
        }

        socket.on('issue:status', onStatus)
        socket.on('issue:update', onStatus)

        return () => {
          socket?.off('issue:status', onStatus)
          socket?.off('issue:update', onStatus)
        }
      } catch {
        // ignore in non-realtime environments
      }
    }

    let cleanup: (() => void) | undefined
    init().then((c) => {
      if (typeof c === 'function') cleanup = c
    })

    return () => {
      mounted = false
      if (cleanup) cleanup()
    }
  }, [issueId, qc])
}