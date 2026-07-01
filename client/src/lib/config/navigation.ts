import { 
  Home, 
  PlusCircle, 
  List, 
  Map, 
  Bell, 
  User, 
  HelpCircle,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Shield,
  Flag,
  CheckCircle,
  BarChart3,
  Building2,
  ClipboardList,
  UserCog,
  Database,
  BookOpen,
  LogIn,
  UserPlus,
  Info,
  Wrench,
  type LucideIcon
} from 'lucide-react'
import { UserRole } from '@/lib/rbac/roles'

export interface NavItem {
  name: string
  nameHi?: string // Hindi name
  href: string
  icon: LucideIcon
  roles?: UserRole[] // Allowed roles, undefined = public
  badge?: 'notifications' | 'pending' | 'urgent' // Dynamic badge type
  showInMobile?: boolean // Show in mobile bottom nav
  requireAuth?: boolean // Requires authentication
  priority?: number // Mobile nav priority (1-5, lower = higher priority)
}

export interface NavGroup {
  title?: string
  titleHi?: string
  items: NavItem[]
}

// Public navigation (no login required)
export const PUBLIC_NAV: NavItem[] = [
  { 
    name: 'Home', 
    nameHi: 'होम',
    href: '/', 
    icon: Home,
    showInMobile: true,
    priority: 1
  },
  { 
    name: 'Reports', 
    nameHi: 'रिपोर्ट',
    href: '/reports', 
    icon: FileText,
    showInMobile: true,
    priority: 2
  },
  { 
    name: 'Public Map', 
    nameHi: 'पब्लिक मैप',
    href: '/public-map', 
    icon: Map,
    showInMobile: true,
    priority: 3
  },
  { 
    name: 'About', 
    nameHi: 'जानकारी',
    href: '/about', 
    icon: Info,
    showInMobile: false,
    priority: 5
  },
  { 
    name: 'Guidelines', 
    nameHi: 'दिशानिर्देश',
    href: '/guidelines', 
    icon: BookOpen,
    showInMobile: false,
    priority: 6
  },
]

// Public auth actions (shown in navbar when not logged in)
export const PUBLIC_AUTH_ACTIONS: NavItem[] = [
  {
    name: 'Login',
    nameHi: 'लॉगिन',
    href: '/login',
    icon: LogIn,
    showInMobile: true,
    priority: 4
  },
  {
    name: 'Register',
    nameHi: 'रजिस्टर',
    href: '/register',
    icon: UserPlus,
    showInMobile: true,
    priority: 5
  },
]

// Citizen navigation
export const CITIZEN_NAV: NavGroup[] = [
  {
    items: [
      { 
        name: 'Dashboard', 
        nameHi: 'डैशबोर्ड',
        href: '/', 
        icon: Home,
        roles: [UserRole.CITIZEN],
        requireAuth: true,
        showInMobile: true,
        priority: 1
      },
      { 
        name: 'Report Issue', 
        nameHi: 'समस्या दर्ज करें',
        href: '/report', 
        icon: PlusCircle,
        roles: [UserRole.CITIZEN],
        requireAuth: true,
        showInMobile: true,
        priority: 2
      },
      { 
        name: 'My Issues', 
        nameHi: 'मेरी समस्याएं',
        href: '/my-issues', 
        icon: List,
        roles: [UserRole.CITIZEN],
        requireAuth: true,
        showInMobile: true,
        priority: 3
      },
      { 
        name: 'Map', 
        nameHi: 'मानचित्र',
        href: '/map', 
        icon: Map,
        roles: [UserRole.CITIZEN],
        requireAuth: true,
        showInMobile: true,
        priority: 4
      },
      { 
        name: 'Notifications', 
        nameHi: 'सूचनाएं',
        href: '/notifications', 
        icon: Bell,
        roles: [UserRole.CITIZEN],
        badge: 'notifications',
        requireAuth: true,
        showInMobile: true,
        priority: 5
      },
    ]
  },
  {
    title: 'Account',
    titleHi: 'खाता',
    items: [
      { 
        name: 'Profile', 
        nameHi: 'प्रोफ़ाइल',
        href: '/profile', 
        icon: User,
        roles: [UserRole.CITIZEN],
        requireAuth: true,
        showInMobile: false
      },
      { 
        name: 'Help', 
        nameHi: 'सहायता',
        href: '/help', 
        icon: HelpCircle,
        roles: [UserRole.CITIZEN],
        requireAuth: true,
        showInMobile: false
      },
    ]
  }
]

// Moderator navigation
export const MODERATOR_NAV: NavGroup[] = [
  {
    items: [
      { 
        name: 'Dashboard', 
        nameHi: 'डैशबोर्ड',
        href: '/moderator/dashboard', 
        icon: LayoutDashboard,
        roles: [UserRole.MODERATOR],
        requireAuth: true,
        showInMobile: true,
        priority: 1
      },
      { 
        name: 'Review Queue', 
        nameHi: 'समीक्षा कतार',
        href: '/moderator/review', 
        icon: CheckCircle,
        roles: [UserRole.MODERATOR],
        badge: 'pending',
        requireAuth: true,
        showInMobile: true,
        priority: 2
      },
      { 
        name: 'All Reports', 
        nameHi: 'सभी रिपोर्ट',
        href: '/moderator/reports', 
        icon: FileText,
        roles: [UserRole.MODERATOR],
        requireAuth: true,
        showInMobile: true,
        priority: 3
      },
      { 
        name: 'Flagged', 
        nameHi: 'फ़्लैग किए गए',
        href: '/moderator/flagged', 
        icon: Flag,
        roles: [UserRole.MODERATOR],
        requireAuth: true,
        showInMobile: false
      },
      { 
        name: 'Analytics', 
        nameHi: 'विश्लेषण',
        href: '/moderator/analytics', 
        icon: BarChart3,
        roles: [UserRole.MODERATOR],
        requireAuth: true,
        showInMobile: true,
        priority: 4
      },
    ]
  },
  {
    title: 'Management',
    titleHi: 'प्रबंधन',
    items: [
      { 
        name: 'Categories', 
        nameHi: 'श्रेणियां',
        href: '/moderator/categories', 
        icon: ClipboardList,
        roles: [UserRole.MODERATOR],
        requireAuth: true,
        showInMobile: false
      },
      { 
        name: 'Users', 
        nameHi: 'उपयोगकर्ता',
        href: '/moderator/users', 
        icon: Users,
        roles: [UserRole.MODERATOR],
        requireAuth: true,
        showInMobile: true,
        priority: 5
      },
    ]
  }
]

// Staff navigation
export const STAFF_NAV: NavGroup[] = [
  {
    items: [
      { 
        name: 'Dashboard', 
        nameHi: 'डैशबोर्ड',
        href: '/staff/dashboard', 
        icon: LayoutDashboard,
        roles: [UserRole.STAFF],
        requireAuth: true,
        showInMobile: true,
        priority: 1
      },
      { 
        name: 'Assigned Issues', 
        nameHi: 'सौंपे गए मुद्दे',
        href: '/staff/assigned', 
        icon: ClipboardList,
        roles: [UserRole.STAFF],
        badge: 'pending',
        requireAuth: true,
        showInMobile: true,
        priority: 2
      },
      { 
        name: 'In Progress', 
        nameHi: 'प्रगति में',
        href: '/staff/in-progress', 
        icon: Wrench,
        roles: [UserRole.STAFF],
        requireAuth: true,
        showInMobile: true,
        priority: 3
      },
      { 
        name: 'Completed', 
        nameHi: 'पूर्ण',
        href: '/staff/completed', 
        icon: CheckCircle,
        roles: [UserRole.STAFF],
        requireAuth: true,
        showInMobile: false
      },
      { 
        name: 'Map View', 
        nameHi: 'मानचित्र दृश्य',
        href: '/staff/map', 
        icon: Map,
        roles: [UserRole.STAFF],
        requireAuth: true,
        showInMobile: true,
        priority: 4
      },
      { 
        name: 'Notifications', 
        nameHi: 'सूचनाएं',
        href: '/staff/notifications', 
        icon: Bell,
        roles: [UserRole.STAFF],
        badge: 'notifications',
        requireAuth: true,
        showInMobile: true,
        priority: 5
      },
    ]
  }
]

// Department Admin navigation
export const DEPT_ADMIN_NAV: NavGroup[] = [
  {
    items: [
      { 
        name: 'Dashboard', 
        nameHi: 'डैशबोर्ड',
        href: '/admin/dashboard', 
        icon: LayoutDashboard,
        roles: [UserRole.DEPT_ADMIN],
        requireAuth: true,
        showInMobile: true,
        priority: 1
      },
      { 
        name: 'Analytics', 
        nameHi: 'विश्लेषण',
        href: '/admin/analytics', 
        icon: BarChart3,
        roles: [UserRole.DEPT_ADMIN],
        requireAuth: true,
        showInMobile: true,
        priority: 2
      },
      { 
        name: 'Reports', 
        nameHi: 'रिपोर्ट',
        href: '/admin/reports', 
        icon: FileText,
        roles: [UserRole.DEPT_ADMIN],
        requireAuth: true,
        showInMobile: true,
        priority: 3
      },
    ]
  },
  {
    title: 'Management',
    titleHi: 'प्रबंधन',
    items: [
      { 
        name: 'Users', 
        nameHi: 'उपयोगकर्ता',
        href: '/admin/users', 
        icon: Users,
        roles: [UserRole.DEPT_ADMIN],
        requireAuth: true,
        showInMobile: true,
        priority: 4
      },
      { 
        name: 'Departments', 
        nameHi: 'विभाग',
        href: '/admin/departments', 
        icon: Building2,
        roles: [UserRole.DEPT_ADMIN],
        requireAuth: true,
        showInMobile: false
      },
      { 
        name: 'Staff', 
        nameHi: 'कर्मचारी',
        href: '/admin/staff', 
        icon: UserCog,
        roles: [UserRole.DEPT_ADMIN],
        requireAuth: true,
        showInMobile: false
      },
      { 
        name: 'Categories', 
        nameHi: 'श्रेणियां',
        href: '/admin/categories', 
        icon: ClipboardList,
        roles: [UserRole.DEPT_ADMIN],
        requireAuth: true,
        showInMobile: false
      },
    ]
  },
  {
    title: 'System',
    titleHi: 'सिस्टम',
    items: [
      { 
        name: 'Settings', 
        nameHi: 'सेटिंग्स',
        href: '/admin/settings', 
        icon: Settings,
        roles: [UserRole.DEPT_ADMIN],
        requireAuth: true,
        showInMobile: true,
        priority: 5
      },
      { 
        name: 'Audit Logs', 
        nameHi: 'ऑडिट लॉग',
        href: '/admin/audit', 
        icon: Database,
        roles: [UserRole.DEPT_ADMIN],
        requireAuth: true,
        showInMobile: false
      },
      { 
        name: 'Notifications', 
        nameHi: 'सूचनाएं',
        href: '/admin/notifications', 
        icon: Bell,
        roles: [UserRole.DEPT_ADMIN],
        badge: 'notifications',
        requireAuth: true,
        showInMobile: false
      },
    ]
  }
]

// Mayor navigation
export const MAYOR_NAV: NavGroup[] = [
  {
    items: [
      { 
        name: 'Dashboard', 
        nameHi: 'डैशबोर्ड',
        href: '/mayor/dashboard', 
        icon: LayoutDashboard,
        roles: [UserRole.MAYOR],
        requireAuth: true,
        showInMobile: true,
        priority: 1
      },
      { 
        name: 'City Overview', 
        nameHi: 'शहर अवलोकन',
        href: '/mayor/overview', 
        icon: BarChart3,
        roles: [UserRole.MAYOR],
        requireAuth: true,
        showInMobile: true,
        priority: 2
      },
      { 
        name: 'All Reports', 
        nameHi: 'सभी रिपोर्ट',
        href: '/mayor/reports', 
        icon: FileText,
        roles: [UserRole.MAYOR],
        requireAuth: true,
        showInMobile: true,
        priority: 3
      },
      { 
        name: 'Departments', 
        nameHi: 'विभाग',
        href: '/mayor/departments', 
        icon: Building2,
        roles: [UserRole.MAYOR],
        requireAuth: true,
        showInMobile: true,
        priority: 4
      },
      { 
        name: 'Notifications', 
        nameHi: 'सूचनाएं',
        href: '/mayor/notifications', 
        icon: Bell,
        roles: [UserRole.MAYOR],
        badge: 'notifications',
        requireAuth: true,
        showInMobile: true,
        priority: 5
      },
    ]
  }
]

// Super Admin navigation
export const SUPERADMIN_NAV: NavGroup[] = [
  {
    items: [
      { 
        name: 'Dashboard', 
        nameHi: 'डैशबोर्ड',
        href: '/superadmin', 
        icon: LayoutDashboard,
        roles: [UserRole.SUPER_ADMIN],
        requireAuth: true,
        showInMobile: true,
        priority: 1
      },
      { 
        name: 'System Overview', 
        nameHi: 'सिस्टम अवलोकन',
        href: '/superadmin/analytics', 
        icon: BarChart3,
        roles: [UserRole.SUPER_ADMIN],
        requireAuth: true,
        showInMobile: true,
        priority: 2
      },
      { 
        name: 'All Admins', 
        nameHi: 'सभी व्यवस्थापक',
        href: '/superadmin/users', 
        icon: Shield,
        roles: [UserRole.SUPER_ADMIN],
        requireAuth: true,
        showInMobile: true,
        priority: 3
      },
      { 
        name: 'System Logs', 
        nameHi: 'सिस्टम लॉग',
        href: '/superadmin/audit', 
        icon: Database,
        roles: [UserRole.SUPER_ADMIN],
        requireAuth: true,
        showInMobile: true,
        priority: 4
      },
      { 
        name: 'Global Settings', 
        nameHi: 'वैश्विक सेटिंग्स',
        href: '/superadmin/settings', 
        icon: Settings,
        roles: [UserRole.SUPER_ADMIN],
        requireAuth: true,
        showInMobile: true,
        priority: 5
      },
    ]
  }
]

// Get navigation based on user role
export function getNavigationForRole(role?: UserRole): NavGroup[] {
  if (!role) return []
  
  switch (role) {
    case UserRole.CITIZEN:
      return CITIZEN_NAV
    case UserRole.MODERATOR:
      return MODERATOR_NAV
    case UserRole.STAFF:
      return STAFF_NAV
    case UserRole.DEPT_ADMIN:
      return DEPT_ADMIN_NAV
    case UserRole.MAYOR:
      return MAYOR_NAV
    case UserRole.SUPER_ADMIN:
      return SUPERADMIN_NAV
    default:
      return []
  }
}

// Get mobile navigation items (max 5, sorted by priority)
export function getMobileNavigation(role?: UserRole): NavItem[] {
  if (!role) {
    return PUBLIC_NAV
      .filter(item => item.showInMobile)
      .sort((a, b) => (a.priority || 999) - (b.priority || 999))
      .slice(0, 5)
  }
  
  const navGroups = getNavigationForRole(role)
  const allItems = navGroups.flatMap(group => group.items)
  return allItems
    .filter(item => item.showInMobile)
    .sort((a, b) => (a.priority || 999) - (b.priority || 999))
    .slice(0, 5)
}

// Get role display name
export function getRoleDisplayName(role: UserRole, language: 'en' | 'hi' = 'en'): string {
  const roleNames: Record<UserRole, { en: string; hi: string }> = {
    [UserRole.CITIZEN]: { en: 'Citizen Portal', hi: 'नागरिक पोर्टल' },
    [UserRole.MODERATOR]: { en: 'Moderator Portal', hi: 'मॉडरेटर पोर्टल' },
    [UserRole.STAFF]: { en: 'Staff Portal', hi: 'कर्मचारी पोर्टल' },
    [UserRole.DEPT_ADMIN]: { en: 'Dept Admin Portal', hi: 'विभाग व्यवस्थापक पोर्टल' },
    [UserRole.MAYOR]: { en: 'Mayor Portal', hi: 'मेयर पोर्टल' },
    [UserRole.SUPER_ADMIN]: { en: 'Super Admin Portal', hi: 'सुपर व्यवस्थापक पोर्टल' },
  }
  
  return roleNames[role]?.[language] || roleNames[role]?.en || 'Portal'
}
