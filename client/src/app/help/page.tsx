import AnimatedHeading from '@/components/ui/AnimatedHeading'
import PublicLayout from '@/components/layout/PublicLayout'

export default function HelpPage() {
  return (
    <PublicLayout>
      <AnimatedHeading as="h1" className="text-3xl font-bold mb-4">Help Center</AnimatedHeading>
      <p className="text-muted-foreground max-w-2xl">Frequently asked questions and guides.</p>
    </PublicLayout>
  )
}
