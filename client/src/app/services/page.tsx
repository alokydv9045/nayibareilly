import PublicLayout from '@/components/layout/PublicLayout'

// Metadata for this page
export const metadata = {
  title: 'Municipal Services',
  description: 'Explore comprehensive municipal services available through NayiBareilly. Access civic amenities, report issues, and connect with government services.',
  keywords: ['municipal services', 'civic services', 'government services', 'Bareilly municipality', 'public services'],
}

export default function ServicesPage() {
  return (
    <PublicLayout>
      <h1 className="text-3xl font-bold mb-4">Services</h1>
      <p className="text-muted-foreground max-w-2xl">Explore municipal services and how NayiBareilly streamlines citizen engagement.</p>
    </PublicLayout>
  )
}
