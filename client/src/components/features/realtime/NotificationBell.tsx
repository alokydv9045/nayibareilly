"use client"
import { Bell } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNotificationCenter } from './NotificationProvider'
import { Settings } from 'lucide-react'
import NotificationItem from '@/components/features/citizen/NotificationItem'

export default function NotificationBell() {
  const { items, unread, markRead, markAll, preferences, togglePref, filter, setFilter } = useNotificationCenter()
  const [showPrefs, setShowPrefs] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button aria-label="Notifications" onClick={() => setOpen(o => !o)} className="relative p-2 rounded-full hover:bg-accent transition">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-none px-1 py-[2px] rounded-full min-w-[16px] text-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[480px] overflow-auto bg-white border rounded-xl shadow-lg z-50 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm">Notifications</h4>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 text-[10px] bg-accent/40 rounded px-1 py-1">
                {(['all','issue','system'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-2 py-0.5 rounded ${filter===f?'bg-primary text-white':'bg-white hover:bg-accent'}`}>{f}</button>
                ))}
              </div>
              <button aria-label="Preferences" onClick={() => setShowPrefs(p=>!p)} className={`p-1 rounded hover:bg-accent ${showPrefs?'bg-accent':''}`}><Settings className="h-3 w-3"/></button>
              {unread > 0 && <button className="text-xs underline" onClick={() => markAll()}>Mark all</button>}
            </div>
          </div>
          {showPrefs && (
            <div className="border rounded-lg p-2 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span>Sound</span>
                <input type="checkbox" checked={preferences.sound} onChange={() => togglePref('sound')} />
              </div>
              <div className="flex items-center justify-between">
                <span>Vibrate</span>
                <input type="checkbox" checked={preferences.vibrate} onChange={() => togglePref('vibrate')} />
              </div>
              <p className="text-[10px] opacity-60">Critical / error alerts trigger audio & vibration (if allowed).</p>
            </div>
          )}
          {items.length === 0 && <div className="text-xs text-muted-foreground py-4 text-center">No notifications</div>}
          {items.slice(0, 30).map(n => (
            <div key={n.id} className="group relative">
              <NotificationItem title={n.title} message={n.message} time={n.createdAt} unread={!n.read} />
              {!n.read && (
                <button onClick={() => markRead(n.id)} className="absolute top-2 right-2 text-xs opacity-70 hover:opacity-100 underline">Read</button>
              )}
            </div>
          ))}
          {items.length > 30 && <div className="text-[10px] text-center text-muted-foreground">Showing latest 30</div>}
        </div>
      )}
    </div>
  )
}