import { cn } from '@/lib/utils/helpers'

export default function StatusBadge({ status }: { status: 'open'|'in_progress'|'resolved'|'closed' }) {
  const map: Record<string, string> = {
    open: 'bg-amber-100 text-amber-800',
    in_progress: 'bg-sky-100 text-sky-800',
    resolved: 'bg-emerald-100 text-emerald-800',
    closed: 'bg-slate-100 text-slate-800',
  }
  if (!status) {
    return null
  }
  return <span className={cn('inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full', map[status])}>{status.replace('_',' ')}</span>
}