"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute'

export default function ModeratorPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard
    router.replace('/moderator/dashboard')
  }, [router])

  return (
    <ProtectedRoute requiredRoles={['moderator']}>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Redirecting to moderator dashboard...</p>
        </div>
      </div>
    </ProtectedRoute>
  )
}
