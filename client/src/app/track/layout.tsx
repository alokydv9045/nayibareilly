import type { Metadata } from 'next'

// Metadata for track pages
export const metadata: Metadata = {
  title: 'Track Issue Status',
  description: 'Track the progress of your reported civic issues in real-time. Enter your tracking code to see updates, timeline, and resolution status.',
  keywords: ['track issue', 'issue status', 'civic progress', 'NayiBareilly tracking'],
}

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}