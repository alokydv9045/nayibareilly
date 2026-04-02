"use client"
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import socketService from '@/lib/services/socket-service'
import { useNotificationCenter } from './NotificationProvider'

type AdminEvent = {
  id: string
  type: string
  message: string
  at: string
  severity?: 'info'|'warning'|'error'|'critical'
}

export default function AdminRealtimePanel() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const { addLive } = useNotificationCenter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ns_token') : null
    if (!token) return
    socketService.connect(token)

    const push = (e: Omit<AdminEvent,'id'|'at'> & { id?: string }) => {
      const evt: AdminEvent = { id: e.id || `adm-${Date.now()}-${Math.random().toString(16).slice(2)}`, at: new Date().toISOString(), type: e.type, message: e.message, severity: e.severity }
      setEvents(prev => [evt, ...prev].slice(0, 50))
    }

    // Escalations / assignments / system alerts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sock: any = (socketService as any).socket
    if (!sock) return
  interface IssuePayload { issue?: { title?: string } }
  interface AlertPayload { message?: string; type?: string }
  const onAssigned = (d: IssuePayload) => { push({ type: 'issue:assigned', message: d?.issue?.title || 'Issue assigned', severity: 'info' }); addLive({ title: 'Issue assigned', message: d?.issue?.title, meta: { kind: 'issue', severity: 'info' } }) }
  const onEscalated = (d: IssuePayload) => { push({ type: 'issue:escalated', message: d?.issue?.title || 'Issue escalated', severity: 'critical' }); addLive({ title: 'Issue escalated', message: d?.issue?.title, meta: { kind: 'issue', severity: 'critical' } }) }
  const onAlert = (d: AlertPayload) => { push({ type: 'system:alert', message: d?.message || 'System alert', severity: d?.type === 'error' ? 'error' : d?.type === 'warning' ? 'warning' : 'info' }); addLive({ title: 'System alert', message: d?.message, meta: { kind: 'system', severity: d?.type === 'error' ? 'error' : d?.type === 'warning' ? 'warning' : 'info' } }) }

  // Invalidate issue stats on any issue state change
  const invalidateStats = () => {
    queryClient.invalidateQueries({ queryKey: ['issueStats'] })
    queryClient.invalidateQueries({ queryKey: ['adminIssues'] })
  }

  const onIssueCreated = (d: IssuePayload) => { push({ type: 'issue:created', message: d?.issue?.title || 'New issue created', severity: 'info' }); invalidateStats() }
  const onIssueUpdated = (d: IssuePayload) => { push({ type: 'issue:updated', message: d?.issue?.title || 'Issue updated', severity: 'info' }); invalidateStats() }
  const onIssueResolved = (d: IssuePayload) => { push({ type: 'issue:resolved', message: d?.issue?.title || 'Issue resolved', severity: 'info' }); invalidateStats() }

    sock.on('issue:assigned', onAssigned)
    sock.on('issue:escalated', onEscalated)
    sock.on('system:alert', onAlert)
    sock.on('issue:created', onIssueCreated)
    sock.on('issue:updated', onIssueUpdated)
    sock.on('issue:resolved', onIssueResolved)

    return () => {
      sock.off('issue:assigned', onAssigned)
      sock.off('issue:escalated', onEscalated)
      sock.off('system:alert', onAlert)
      sock.off('issue:created', onIssueCreated)
      sock.off('issue:updated', onIssueUpdated)
      sock.off('issue:resolved', onIssueResolved)
    }
  }, [addLive, queryClient])

  const badge = (sev?: string) => {
    const cls = sev==='critical' ? 'bg-red-600' : sev==='error' ? 'bg-rose-500' : sev==='warning' ? 'bg-amber-500' : 'bg-slate-400'
    return <span className={`inline-block w-2 h-2 rounded-full ${cls} mr-2`} />
  }

  return (
    <div className="rounded-xl border p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Real-time Events</h3>
        <button className="text-xs underline" onClick={() => setEvents([])}>Clear</button>
      </div>
      <div className="space-y-2 max-h-72 overflow-auto text-xs">
        {events.length === 0 && <p className="text-muted-foreground text-[11px]">No live events yet</p>}
        {events.map(e => (
          <div key={e.id} className="flex items-start gap-2">
            {badge(e.severity)}
            <div className="flex-1">
              <p className="font-medium">{e.type}</p>
              <p className="opacity-70 break-all">{e.message}</p>
              <p className="opacity-40 text-[10px]">{new Date(e.at).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}