'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminNavbar } from './AdminNavbar'
import { AdminFooter } from './AdminFooter'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface AdminLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AdminLayout({ children, className = '' }: AdminLayoutProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      // Backward-compatible key migration
      const legacyKey = 'nagarsetu_admin_session'
      const newKey = 'nayibareilly_admin_session'
      let session = localStorage.getItem(newKey)
      if (!session) {
        const legacy = localStorage.getItem(legacyKey)
        if (legacy) {
          try {
            // Basic validation then migrate
            const parsed = JSON.parse(legacy)
            localStorage.setItem(newKey, JSON.stringify(parsed))
            localStorage.removeItem(legacyKey)
            session = JSON.stringify(parsed)
          } catch {
            // If legacy invalid, just remove it
            localStorage.removeItem(legacyKey)
          }
        }
      }
      if (!session) {
        router.push('/login')
        return
      }

      try {
        const sessionData = JSON.parse(session)
        const now = new Date().getTime()
        
        // Check if session is expired (24 hours)
        if (now - sessionData.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(newKey)
          router.push('/login')
          return
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error('Invalid session data:', error)
        localStorage.removeItem(newKey)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />
      <ErrorBoundary>
        <main className={`flex-1 ${className}`}>
          {children}
        </main>
      </ErrorBoundary>
      <AdminFooter />
    </div>
  )
}
