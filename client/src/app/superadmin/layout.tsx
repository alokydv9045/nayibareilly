'use client'
import { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Crown, BarChart3, Users, Building2, Shield, Settings, LogOut } from 'lucide-react'
import { tokenStorage, userStorage } from '@/lib/auth/auth-utils'
import { toast } from 'react-hot-toast'

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    tokenStorage.remove()
    userStorage.remove()
    router.push('/login')
    toast.success('Logged out successfully')
  }

  const navLinks = [
    { icon: BarChart3, href: '/superadmin', tip: 'Dashboard' },
    { icon: Users, href: '/superadmin/users', tip: 'Users' },
    { icon: Building2, href: '/superadmin/departments', tip: 'Departments' },
    { icon: Shield, href: '/superadmin/audit', tip: 'Security' },
    { icon: Settings, href: '/superadmin/settings', tip: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-white text-black flex">
      {/* Sticky Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-16 bg-amber-950 border-r border-amber-900 flex flex-col items-center py-6 gap-6 z-[100]">
        <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
          <Crown className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-col gap-4 mt-4">
          {navLinks.map(({ icon: Icon, href, tip }) => {
            const isActive = pathname === href || (href !== '/superadmin' && pathname?.startsWith(href))
            return (
              <Link key={href} href={href} title={tip}
                className={`p-2.5 rounded-xl transition-all ${isActive ? 'bg-amber-900 text-white' : 'text-amber-200/50 hover:text-white hover:bg-amber-900/50'}`}>
                <Icon className="h-5 w-5" />
              </Link>
            )
          })}
        </div>
        <div className="mt-auto">
          <button onClick={handleLogout} title="Logout"
            className="p-2.5 rounded-xl text-amber-200/50 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-16 relative">
        {children}
      </div>
    </div>
  )
}
