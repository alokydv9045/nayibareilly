'use client'
import { useMemo } from 'react'
import useSession from '@/hooks/auth/useSession'
import { useUnreadCount } from '@/hooks/features/useNotifications'
import { UserRole } from '@/lib/rbac/roles'
import { 
  PUBLIC_NAV,
  PUBLIC_AUTH_ACTIONS,
  getNavigationForRole, 
  getMobileNavigation,
  getRoleDisplayName,
  type NavItem,
  type NavGroup 
} from '@/lib/config/navigation'

export interface NavigationData {
  isAuthenticated: boolean
  userRole?: string
  roleDisplayName: string
  navigation: NavGroup[]
  mobileNavigation: NavItem[]
  publicNavigation: NavItem[]
  publicAuthActions: NavItem[]
  unreadCount: number
  pendingCount: number
}

export function useNavigation(language: 'en' | 'hi' = 'en'): NavigationData {
  const { user, isAuthenticated } = useSession()
  const { data: unreadCount = 0 } = useUnreadCount()

  // Get primary role (first role in the array) and cast to UserRole
  const primaryRole = user?.roles?.[0] as UserRole | undefined

  // Get role-based navigation
  const navigation = useMemo(() => {
    if (!isAuthenticated || !primaryRole) {
      return []
    }
    return getNavigationForRole(primaryRole)
  }, [isAuthenticated, primaryRole])

  // Get mobile navigation (max 5 items)
  const mobileNavigation = useMemo(() => {
    if (!isAuthenticated || !primaryRole) {
      return PUBLIC_NAV.filter(item => item.showInMobile).slice(0, 5)
    }
    return getMobileNavigation(primaryRole)
  }, [isAuthenticated, primaryRole])

  // Get role display name
  const roleDisplayName = useMemo(() => {
    if (!isAuthenticated || !primaryRole) {
      return language === 'hi' ? 'सार्वजनिक पोर्टल' : 'Public Portal'
    }
    return getRoleDisplayName(primaryRole, language)
  }, [isAuthenticated, primaryRole, language])

  // TODO: Fetch pending count based on role
  // For moderators: pending reviews
  // For staff: assigned issues
  const pendingCount = 0

  return {
    isAuthenticated,
    userRole: primaryRole,
    roleDisplayName,
    navigation,
    mobileNavigation,
    publicNavigation: PUBLIC_NAV,
    publicAuthActions: PUBLIC_AUTH_ACTIONS,
    unreadCount,
    pendingCount
  }
}
