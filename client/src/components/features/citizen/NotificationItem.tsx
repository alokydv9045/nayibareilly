'use client'
import { formatDistanceToNow } from 'date-fns'

type NotificationItemProps = {
  title: string
  message?: string
  time: string | number | Date
  unread?: boolean
}

export default function NotificationItem({ title, message, time, unread }: NotificationItemProps) {
  const when = formatDistanceToNow(new Date(time), { addSuffix: true })
  return (
    <div className={`rounded-lg border p-4 ${unread ? 'bg-base-200' : 'bg-base-100'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium">{title}</h4>
          {message && <p className="text-sm text-base-content/70 mt-1">{message}</p>}
        </div>
        <span className="text-xs text-base-content/60 whitespace-nowrap">{when}</span>
      </div>
    </div>
  )
}
