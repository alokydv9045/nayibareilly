"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { me as apiMe } from '@/lib/api/auth'

export default function RequireUser({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      try {
        const user = await apiMe()
        if (!user) throw new Error('no-user')
        if (mounted) setOk(true)
      } catch {
        if (mounted) router.replace('/login')
      }
    }

    checkAuth()

    return () => {
      mounted = false
    }
  }, [router])

  if (!ok) return null
  return <>{children}</>
}
