"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { me as apiMe } from '@/lib/api/auth'
import { tokenStorage } from '@/lib/auth/auth-utils'

type AuthState = 'checking' | 'authenticated' | 'unauthenticated'

export default function RequireUser({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  // Fast-path: if there's no token at all, don't even call the API
  const hasToken = typeof window !== 'undefined' && !!tokenStorage.get()
  const [authState, setAuthState] = useState<AuthState>(hasToken ? 'checking' : 'unauthenticated')

  useEffect(() => {
    let mounted = true

    if (!tokenStorage.get()) {
      router.replace('/login?reason=auth_required')
      return
    }

    const checkAuth = async () => {
      try {
        const user = await apiMe()
        if (!user) throw new Error('no-user')
        if (mounted) setAuthState('authenticated')
      } catch {
        if (mounted) {
          setAuthState('unauthenticated')
          router.replace('/login?reason=session_expired')
        }
      }
    }

    checkAuth()

    return () => { mounted = false }
  }, [router])

  if (authState === 'unauthenticated') return null

  if (authState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Verifying session...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
