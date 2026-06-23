'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from '@/lib/providers/SessionProvider'
import { hasAnyAdminRole, isAdminOnlyRoute, getDefaultRouteForRole, selectPrimaryRole } from '@/lib/constants/roles'

interface RouteGuardProps {
  children: React.ReactNode
  requireCitizen?: boolean
  requireAdmin?: boolean
}

/**
 * RouteGuard - Client-side route protection
 * Prevents admins from accessing citizen routes and vice versa
 */
export function RouteGuard({ children, requireCitizen, requireAdmin }: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useSession()

  useEffect(() => {
    // Wait for session to load
    if (isLoading) return

    // If route requires authentication but user is not logged in
    if ((requireCitizen || requireAdmin) && !isAuthenticated) {
      console.log('🚫 RouteGuard: Unauthenticated access blocked, redirecting to /login')
      router.push('/login')
      return
    }

    if (!user || !isAuthenticated) return

    const userRoles = user.roles || []
    const isAdmin = hasAnyAdminRole(userRoles)
    const primaryRole = selectPrimaryRole(userRoles)

    // CITIZEN-ONLY PROTECTION: Block admins from citizen routes
    if (requireCitizen && isAdmin) {
      const adminDashboard = getDefaultRouteForRole(primaryRole)
      console.log(`🚫 RouteGuard: Admin ${primaryRole} blocked from citizen route ${pathname}`)
      console.log(`↪️ Redirecting to admin dashboard: ${adminDashboard}`)
      router.push(adminDashboard)
      return
    }

    // ADMIN-ONLY PROTECTION: Block citizens from admin routes
    if (requireAdmin && !isAdmin) {
      console.log(`🚫 RouteGuard: Citizen blocked from admin route ${pathname}`)
      console.log(`↪️ Redirecting to homepage: /`)
      router.push('/')
      return
    }

    // AUTO-DETECT: If no explicit requirement, check route pattern
    if (!requireCitizen && !requireAdmin) {
      // Check if admin is trying to access citizen-only route or public route (non-admin route)
      if (isAdmin && !isAdminOnlyRoute(pathname) && !pathname.startsWith('/reports')) {
        const adminDashboard = getDefaultRouteForRole(primaryRole)
        console.log(`🚫 RouteGuard: Admin ${primaryRole} auto-blocked from non-admin route ${pathname}`)
        console.log(`↪️ Redirecting to admin dashboard: ${adminDashboard}`)
        router.push(adminDashboard)
        return
      }

      // Check if citizen is trying to access admin-only route
      if (!isAdmin && isAdminOnlyRoute(pathname)) {
        console.log(`🚫 RouteGuard: Citizen auto-blocked from admin route ${pathname}`)
        console.log(`↪️ Redirecting to homepage: /`)
        router.push('/')
        return
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router, requireCitizen, requireAdmin])

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Render children if all checks pass
  return <>{children}</>
}

export default RouteGuard
