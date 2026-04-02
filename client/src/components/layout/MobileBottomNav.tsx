'use client'

import { usePathname } from 'next/navigation'
import { DynamicNavigation } from '@/components/navigation/DynamicNavigation'
import { useLanguage } from '@/hooks/ui/useLanguage'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const [language] = useLanguage()

  // Don't show bottom nav on admin/staff routes or specific pages
  const hideOnRoutes = ['/superadmin', '/mayor', '/department', '/moderator', '/issues', '/users', '/staff', '/login', '/register', '/get-started', '/forgot-password']
  const shouldHide = hideOnRoutes.some(route => pathname?.startsWith(route))

  if (shouldHide) {
    return null
  }

  return (
    <DynamicNavigation variant="mobile" language={language} />
  )
}
