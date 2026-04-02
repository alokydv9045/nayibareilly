'use client'
import { useEffect, useState } from 'react'

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const duration = 800
    const from = 0
    const to = value
    let raf = 0
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      setDisplay(Math.round(from + (to - from) * p))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <span>{display.toLocaleString()}</span>
}

export default function QuickStats({ total, inProgress, resolved }: { total?: number; inProgress?: number; resolved?: number } = {}) {
  const stats = [
    { label: 'My Issues', value: total ?? 0 },
    { label: 'In Progress', value: inProgress ?? 0 },
    { label: 'Resolved', value: resolved ?? 0 },
  ]
  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-white p-4">
          <div className="text-2xl font-bold"><AnimatedNumber value={s.value} /></div>
          <div className="text-xs text-muted-foreground">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
