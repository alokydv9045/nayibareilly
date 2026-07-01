'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  BarChart3, 
  Users, 
  Building2, 
  Shield, 
  Settings, 
  LogOut, 
  Briefcase, 
  ListChecks, 
  History, 
  UserCircle, 
  Inbox, 
  Activity, 
  Layers, 
  UserCog, 
  Crown, 
  FileText, 
  AlertTriangle, 
  Map,
  Database,
  Key,
  Globe,
  Menu,
  X
} from 'lucide-react'
import { useSession } from '@/lib/providers/SessionProvider'
import { toast } from 'react-hot-toast'
import socketService from '@/lib/services/socket-service'

interface OfficialLayoutProps {
  children: ReactNode
}

interface NavLinkItem {
  icon: any
  href: string
  label: string
}

interface RoleConfig {
  title: string
  icon: any
  iconBg: string
  links: NavLinkItem[]
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  tech_admin: {
    title: 'Tech Admin',
    icon: Crown,
    iconBg: 'from-amber-400 to-orange-500',
    links: [
      { icon: BarChart3, href: '/techadmin', label: 'Dashboard' },
      { icon: Users, href: '/techadmin/users', label: 'User Management' },
      { icon: Building2, href: '/techadmin/departments', label: 'Departments' },
      { icon: Layers, href: '/issues', label: 'Issue Override' },
      { icon: Activity, href: '/techadmin/analytics', label: 'Analytics & Reports' },
      { icon: Shield, href: '/techadmin/audit', label: 'Security & Audit' },
      { icon: Settings, href: '/techadmin/settings', label: 'System Settings' },
      { icon: Globe, href: '/techadmin/webhooks', label: 'Webhook Manager' },
      { icon: Database, href: '/techadmin/db-health', label: 'DB Health & Archiving' },
      { icon: Key, href: '/techadmin/api-keys', label: 'Developer Portal Keys' },
    ]
  },
  developer_admin: {
    title: 'Tech Admin',
    icon: Crown,
    iconBg: 'from-slate-700 to-slate-900',
    links: [
      { icon: BarChart3, href: '/techadmin', label: 'Dashboard' },
      { icon: Users, href: '/techadmin/users', label: 'User Management' },
      { icon: Building2, href: '/techadmin/departments', label: 'Departments' },
      { icon: Layers, href: '/issues', label: 'Issue Override' },
      { icon: Activity, href: '/techadmin/analytics', label: 'Analytics & Reports' },
      { icon: Shield, href: '/techadmin/audit', label: 'Security & Audit' },
      { icon: Settings, href: '/techadmin/settings', label: 'System Settings' },
      { icon: Globe, href: '/techadmin/webhooks', label: 'Webhook Manager' },
      { icon: Database, href: '/techadmin/db-health', label: 'DB Health & Archiving' },
      { icon: Key, href: '/techadmin/api-keys', label: 'Developer Portal Keys' },
    ]
  },
  mayor: {
    title: 'Mayor Panel',
    icon: Building2,
    iconBg: 'from-amber-400 to-orange-500',
    links: [
      { icon: BarChart3, href: '/mayor', label: 'Dashboard' },
      { icon: FileText, href: '/issues', label: 'All Issues' },
      { icon: Users, href: '/users', label: 'Users' },
    ]
  },
  dept_admin: {
    title: 'Dept Admin',
    icon: Building2,
    iconBg: 'from-amber-400 to-orange-500',
    links: [
      { icon: Layers, href: '/department', label: 'Overview' },
      { icon: UserCog, href: '/department/staff', label: 'Staff' },
      { icon: BarChart3, href: '/department/analytics', label: 'Analytics' },
      { icon: FileText, href: '/issues', label: 'Issues' },
      { icon: Users, href: '/users', label: 'Users' },
    ]
  },
  moderator: {
    title: 'Moderator',
    icon: Shield,
    iconBg: 'from-amber-400 to-orange-500',
    links: [
      { icon: BarChart3, href: '/moderator/dashboard', label: 'Dashboard' },
      { icon: Inbox, href: '/moderator/pending', label: 'Pending Reviews' },
      { icon: History, href: '/moderator/history', label: 'History' },
      { icon: Activity, href: '/moderator/analytics', label: 'Analytics' },
      { icon: FileText, href: '/issues', label: 'Issues' },
    ]
  },
  staff: {
    title: 'Field Staff',
    icon: Briefcase,
    iconBg: 'from-amber-400 to-orange-500',
    links: [
      { icon: ListChecks, href: '/staff', label: 'My Issues' },
      { icon: History, href: '/staff/completed', label: 'Completed' },
      { icon: UserCircle, href: '/staff/profile', label: 'My Profile' },
    ]
  }
}

export default function OfficialLayout({ children }: OfficialLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, handleLogoutSuccess } = useSession()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Connect socket if authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ns_token')
      if (token) {
        socketService.connect(token)
      }
    }
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ns_token')
      localStorage.removeItem('ns_user')
      handleLogoutSuccess()
      router.push('/login')
      toast.success('Logged out successfully')
    }
  }

  // Get primary role
  const getPrimaryRole = () => {
    if (!user || !user.roles) return 'staff'
    const roles = user.roles.map(r => r.toLowerCase())
    if (roles.includes('tech_admin')) return 'tech_admin'
    if (roles.includes('developer_admin')) return 'tech_admin'
    if (roles.includes('mayor')) return 'mayor'
    if (roles.includes('dept_admin')) return 'dept_admin'
    if (roles.includes('moderator')) return 'moderator'
    if (roles.includes('staff')) return 'staff'
    return 'staff'
  }

  const primaryRole = mounted ? getPrimaryRole() : 'staff'
  const config = ROLE_CONFIGS[primaryRole] || ROLE_CONFIGS.staff
  const IconHeader = config.icon

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-[90] flex items-center px-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-bold text-gray-900 ml-4 tracking-wide">{config.title}</span>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-gray-900/50 z-[95] backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col py-6 gap-6 z-[100] transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-gradient-to-br ${config.iconBg} rounded-xl shadow-sm shrink-0`}>
              <IconHeader className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-wide hidden lg:block">{config.title}</span>
            <span className="font-bold text-gray-900 text-lg tracking-wide lg:hidden">Menu</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col gap-2 mt-4 px-4 w-full overflow-y-auto">
          {config.links.map(({ icon: Icon, href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href))
            return (
              <Link 
                key={href} 
                href={href} 
                className={`flex items-center gap-3 p-3 rounded-xl transition-all w-full font-medium ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
        <div className="mt-auto px-4 w-full">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all font-medium"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 relative bg-gray-50 min-h-screen pt-16 lg:pt-0 w-full max-w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
