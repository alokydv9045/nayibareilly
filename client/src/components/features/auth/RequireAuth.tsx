"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { me as apiMe } from '@/lib/api/auth'
import { selectPrimaryRole, getDefaultRouteForRole, applyThemeForRole, type AdminRole } from '@/lib/constants/roles'

export default function RequireAuth({ children, allow }: { children: React.ReactNode; allow?: AdminRole[] }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const user = await apiMe()
        if (!user) throw new Error('no-user')
        const role = selectPrimaryRole(user.roles as string[])
        
        if (!role) {
          // No admin role found
          router.replace('/login')
          return
        }
        
        applyThemeForRole(role)
        
        if (allow && allow.length > 0 && !allow.includes(role)) {
          // User doesn't have required role, redirect to their default route
          const defaultRoute = getDefaultRouteForRole(role)
          router.replace(defaultRoute)
          return
        }
        
        setChecked(true)
      } catch {
        router.replace('/login')
      }
    })()
  }, [router, allow])

  if (!checked) return null
  return <>{children}</>
}