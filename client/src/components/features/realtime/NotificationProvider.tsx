"use client"
import { createContext, useCallback, useContext, useRef, useState, useEffect as _useEffect, useMemo } from 'react'
import { useNotifications, notificationsKeys, Notification, useMarkRead, useMarkAllRead } from '@/hooks/features/useNotifications'
import { useQueryClient } from '@tanstack/react-query'

export type LiveMeta = { kind?: 'issue' | 'system' | 'other'; severity?: 'info'|'warning'|'error'|'critical' }

type NotificationContextValue = {
  items: Notification[]
  unread: number
  addLive: (n: Omit<Notification, 'id'|'createdAt'|'read'> & { id?: string; createdAt?: string; read?: boolean; meta?: LiveMeta }) => void
  markRead: (id: string) => void
  markAll: () => void
  preferences: { sound: boolean; vibrate: boolean }
  togglePref: (k: keyof NotificationContextValue['preferences']) => void
  filter: 'all' | 'issue' | 'system'
  setFilter: (f: 'all' | 'issue' | 'system') => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: serverItems = [] } = useNotifications()
  const markReadMutation = useMarkRead()
  const markAllMutation = useMarkAllRead()
  const [live, setLive] = useState<Notification[]>([])
  const [liveMeta, setLiveMeta] = useState<Record<string, LiveMeta>>({})
  const [filter, setFilter] = useState<'all' | 'issue' | 'system'>('all')
  const [preferences, setPreferences] = useState(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('ns_alert_prefs') || '') || { sound: true, vibrate: false } } catch { /* noop */ }
    }
    return { sound: true, vibrate: false }
  })
  const qc = useQueryClient()
  const idCounter = useRef(0)

  // Merge server + live (dedupe by id) newest first
  const baseMerged = useMemo(() => {
    return [...live, ...serverItems].reduce<Notification[]>((acc, n) => {
      if (!acc.find(a => a.id === n.id)) acc.push(n)
      return acc
    }, []).sort((a,b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }, [live, serverItems])

  const merged = useMemo(() => {
    return baseMerged.filter(n => {
      if (filter === 'all') return true
      const meta = liveMeta[n.id]
      if (filter === 'issue') return meta?.kind === 'issue'
      if (filter === 'system') return meta?.kind === 'system'
      return true
    })
  }, [baseMerged, filter, liveMeta])

  const unread = useMemo(() => {
    return merged.filter(m => !m.read).length
  }, [merged])

  const playAlert = useCallback((severity?: string) => {
    if (typeof window === 'undefined') return
    if (preferences.sound && (severity === 'critical' || severity === 'error' || severity === 'warning')) {
      try {
        const AC = ((): typeof AudioContext | undefined => {
          if (typeof window !== 'undefined') {
            const win = window as typeof window & {
              AudioContext?: typeof AudioContext;
              webkitAudioContext?: typeof AudioContext;
            };
            return win.AudioContext || win.webkitAudioContext;
          }
          return undefined
        })()
        if (!AC) return
        const ctx = new AC()
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'sine'
        o.frequency.value = severity === 'critical' ? 880 : severity === 'error' ? 660 : 440
        o.connect(g); g.connect(ctx.destination)
        g.gain.setValueAtTime(0.001, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
        o.start(); o.stop(ctx.currentTime + 0.52)
      } catch { /* ignore */ }
    }
    if (preferences.vibrate && 'vibrate' in navigator && (severity === 'critical' || severity === 'error')) {
      if (typeof navigator.vibrate === 'function') navigator.vibrate([100, 80, 120])
    }
  }, [preferences.sound, preferences.vibrate])

  const addLive = useCallback((n: Omit<Notification, 'id'|'createdAt'|'read'> & { id?: string; createdAt?: string; read?: boolean; meta?: LiveMeta }) => {
    const id = n.id || `live-${Date.now()}-${idCounter.current++}`
    const createdAt = n.createdAt || new Date().toISOString()
    const item: Notification = { id, title: n.title, message: n.message, createdAt, read: n.read ?? false }
    
    setLive(prev => [item, ...prev].slice(0, 100))
    setLiveMeta(m => ({ ...m, [id]: { kind: n.meta?.kind || inferKind(item), severity: n.meta?.severity || 'info' } }))
    playAlert(n.meta?.severity)
  }, [playAlert])

  function inferKind(n: Notification): 'issue'|'system'|'other' {
    const t = n.title.toLowerCase()
    if (/issue/.test(t)) return 'issue'
    if (/system|alert|server/.test(t)) return 'system'
    return 'other'
  }

  const togglePref = (k: keyof NotificationContextValue['preferences']) => {
    setPreferences((p: { sound: boolean; vibrate: boolean }) => {
      const next = { ...p, [k]: !p[k] }
      if (typeof window !== 'undefined') localStorage.setItem('ns_alert_prefs', JSON.stringify(next))
      return next
    })
  }

  const markRead = useCallback((id: string) => {
    // optimistic update in local + react-query cache
    setLive(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    qc.setQueryData(notificationsKeys.list(), (old: Notification[] | undefined) => old?.map(n => n.id === id ? { ...n, read: true } : n) || old)
    markReadMutation.mutate(id, { onError: () => qc.invalidateQueries({ queryKey: notificationsKeys.all }) })
  }, [markReadMutation, qc])

  const markAll = useCallback(() => {
    setLive(prev => prev.map(n => ({ ...n, read: true })))
    qc.setQueryData(notificationsKeys.list(), (old: Notification[] | undefined) => old?.map(n => ({ ...n, read: true })) || old)
    markAllMutation.mutate(undefined, { onError: () => qc.invalidateQueries({ queryKey: notificationsKeys.all }) })
  }, [markAllMutation, qc])

  // Ensure server fetched items have meta mapping
  _useEffect(() => {
    if (serverItems.length === 0) return
    
    setLiveMeta(m => {
      const copy = { ...m }
      let hasChanges = false
      
      for (const it of serverItems) {
        if (!copy[it.id]) {
          copy[it.id] = { kind: inferKind(it), severity: 'info' }
          hasChanges = true
        }
      }
      
      return hasChanges ? copy : m
    })
  }, [serverItems.length, serverItems.map(item => item.id).join(',')])

  return (
    <NotificationContext.Provider value={{ items: merged, unread, addLive, markRead, markAll, preferences, togglePref, filter, setFilter }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationCenter() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotificationCenter must be used within NotificationProvider')
  return ctx
}