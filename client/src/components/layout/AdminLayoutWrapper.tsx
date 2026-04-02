'use client'

import { ReactNode } from 'react'
import { RouteGuard } from '@/components/features/auth/RouteGuard'
import { useSession } from '@/lib/providers/SessionProvider'
import { selectPrimaryRole } from '@/lib/constants/roles'

interface AdminLayoutWrapperProps {
  children: ReactNode
}

/**
 * AdminLayoutWrapper - Layout wrapper for admin-only pages
 * Automatically blocks citizen users from accessing admin routes
 */
export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const { user } = useSession()
  const primaryRole = user ? selectPrimaryRole(user.roles) : null

  return (
    <RouteGuard requireAdmin>
      <div className="admin-interface min-h-screen bg-background">
        {/* Admin-specific styling */}
        <style jsx global>{`
          .admin-interface {
            --admin-primary: 220 70% 50%;
            --admin-accent: 280 60% 50%;
          }
        `}</style>
        
        {children}
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && user && (
          <div className="fixed bottom-4 right-4 bg-purple-100 text-purple-900 px-3 py-2 rounded-lg text-xs shadow-lg">
            🛡️ Admin Mode: {primaryRole} - {user.email}
          </div>
        )}
      </div>
    </RouteGuard>
  )
}

export default AdminLayoutWrapper