'use client'
import { ReactNode, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Building2, Layers, UserCog, BarChart3, LogOut } from 'lucide-react'
import { tokenStorage, userStorage } from '@/lib/auth/auth-utils'

export default function DepartmentLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const navLinks = [
    { icon: Layers, href: '/department', tip: 'Overview' },
    { icon: UserCog, href: '/department/staff', tip: 'Staff' },
    { icon: BarChart3, href: '/department/analytics', tip: 'Analytics' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 text-amber-950 flex">
      {/* Sticky Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-16 bg-amber-950 border-r border-amber-900 flex flex-col items-center py-6 gap-4 z-[100]">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
          <Building2 className="h-6 w-6 text-amber-950" />
        </div>
        <nav className="flex flex-col gap-3 mt-4">
          {navLinks.map(({ icon: Icon, href, tip }) => {
            const isActive = pathname === href || (href !== '/department' && pathname?.startsWith(href))
            return (
              <Link key={href} href={href} title={tip}
                className={`p-2.5 rounded-xl transition-all ${isActive ? 'bg-blue-600/30 text-blue-600' : 'text-amber-200/50 hover:text-white hover:bg-amber-900/50'}`}>
                <Icon className="h-5 w-5" />
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto">
          <button onClick={() => { tokenStorage.remove(); userStorage.remove(); router.push('/login') }}
            title="Logout" className="p-2.5 rounded-xl text-amber-200/50 hover:text-red-400 hover:bg-red-500/10 transition-all">
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
