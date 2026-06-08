import Link from 'next/link'
import StatusBadge from './StatusBadge'

export type Issue = {
  id: string
  title: string
  category: string
  status: 'open'|'in_progress'|'resolved'|'closed'
  createdAt?: string
}

export default function IssueCard({ issue }: { issue: Issue }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{issue.category}</div>
        <StatusBadge status={issue.status} />
      </div>
      <h3 className="mt-2 font-semibold">{issue.title}</h3>
      <div className="mt-3 text-sm">
  <Link href={`/reports/${issue.id}`} className="text-sky-700 hover:underline">View details</Link>
      </div>
    </div>
  )
}
