'use client'
import { ReactNode } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'
import ErrorHandler from '@/components/ErrorBoundary'
import { usePathname } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import CitizenRealtimeBridge from '@/components/features/realtime/CitizenRealtimeBridge'
import { NotificationProvider } from '@/components/features/realtime/NotificationProvider'
import NotificationBell from '@/components/features/realtime/NotificationBell'
import MobileBottomNav from '@/components/layout/MobileBottomNav'

export default function AppFrame({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/superadmin') || pathname?.startsWith('/mayor') || pathname?.startsWith('/department') || pathname?.startsWith('/moderator') || pathname?.startsWith('/issues') || pathname?.startsWith('/users') || pathname?.startsWith('/staff') || false
  const isStaffRoute = pathname?.startsWith('/staff') || false

  // Determine theme based on route; admin/staff keep their own, public uses citizen
  const theme = isAdminRoute
    ? 'superadmin'
    : isStaffRoute
    ? 'staff'
    : 'citizen'

  // Listen for auth changes and invalidate queries
  useEffect(() => {
    const handleAuthChange = () => {
      // Clear all queries when auth state changes
      queryClient.clear()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:reset', handleAuthChange)
      window.addEventListener('storage', (e) => {
        if (e.key === 'ns_token') {
          handleAuthChange()
        }
      })

      return () => {
        window.removeEventListener('auth:reset', handleAuthChange)
        window.removeEventListener('storage', handleAuthChange)
      }
    }
  }, [queryClient])

  return (
    <div data-theme={theme} className="min-h-screen bg-blue-50">
      <QueryClientProvider client={queryClient}>
        {!isAdminRoute && <Navbar />}
        <NotificationProvider>
          {!isAdminRoute && <CitizenRealtimeBridge />}
          <ErrorHandler>
            <main id="main-content" aria-label="Main content" className="min-h-screen">

              {children}
            </main>
            {!isAdminRoute && <MobileBottomNav />}
          </ErrorHandler>
        </NotificationProvider>
        {!isAdminRoute && <Footer />}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </div>
  )
}