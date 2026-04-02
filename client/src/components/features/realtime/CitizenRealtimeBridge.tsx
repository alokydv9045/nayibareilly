'use client'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import socketService from '@/lib/services/socket-service'
import { notificationsKeys } from '@/hooks/features/useNotifications'
import { useNotificationCenter } from './NotificationProvider'
import { useMe } from '@/hooks/auth/useProfile'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function CitizenRealtimeBridge() {
  const qc = useQueryClient()
  const { data: me } = useMe()
  const router = useRouter()
  const { addLive } = useNotificationCenter()

  useEffect(() => {
    // Only run on client with a token
    const token = typeof window !== 'undefined' ? localStorage.getItem('ns_token') : null
    if (!token) return
    socketService.connect(token)

    // Join user room for personal notifications
    if (me?.id) socketService.joinUserRoom(me.id)

    interface BasicPayload { title?: string; message?: string; severity?: string; issue?: { title?: string } }
    const onNewNotification = (payload?: BasicPayload) => {
      qc.invalidateQueries({ queryKey: notificationsKeys.all })
      const title = payload?.title || 'New notification'
      addLive({ title, message: payload?.message })
      toast((t) => (
        <div className="flex items-center gap-3">
          <span>{title}</span>
          <button className="btn btn-xs" onClick={() => { toast.dismiss(t.id); router.push('/app/notifications') }}>View</button>
        </div>
      ))
    }

    // Subscribe to server-side event when a new notification arrives
    // Reuse generic off/on helpers
    socketService.onSystemAlert(() => {}) // ensure connection stable (no-op)
    // Directly use underlying socket listener via service
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(socketService as any).socket?.on('notification:new', onNewNotification)
    const sock = (socketService as unknown as { socket?: { on: (e: string, cb: (data: BasicPayload) => void) => void; off: (e: string, cb?: (data: BasicPayload) => void) => void } }).socket
    sock?.on('issue:created', (d: BasicPayload) => {
      onNewNotification({ title: 'Issue created', message: d?.issue?.title })
    })
    sock?.on('issue:updated', (d: BasicPayload) => {
      onNewNotification({ title: 'Issue updated', message: d?.issue?.title })
    })
    sock?.on('issue:escalated', (d: BasicPayload) => {
      onNewNotification({ title: 'Issue escalated', message: d?.issue?.title, severity: 'critical' })
    })

    const onReconnect = () => {
      if (me?.id) socketService.joinUserRoom(me.id)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(socketService as any).socket?.on('reconnect', onReconnect)

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(socketService as any).socket?.off('notification:new', onNewNotification)
  sock?.off('issue:created')
  sock?.off('issue:updated')
  sock?.off('issue:escalated')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(socketService as any).socket?.off('reconnect', onReconnect)
    }
  }, [me?.id, qc, router, addLive])

  return null
}