import AnimatedHeading from '@/components/ui/AnimatedHeading'
import PublicLayout from '@/components/layout/PublicLayout'

export default function TermsPage() {
  return (
    <PublicLayout>
      <AnimatedHeading as="h1" className="text-3xl font-bold mb-4">Terms of Service</AnimatedHeading>
      <p className="text-muted-foreground max-w-2xl">Please review the terms governing your use of NayiBareilly.</p>
    </PublicLayout>
  )
}
