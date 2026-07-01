'use client'
import { usePathname, useRouter } from 'next/navigation'
import { 
  BarChart3, Users, Settings, FileText, 
  Activity, X, Home, Shield, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/helpers'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    description: 'Overview and analytics'
  },
  {
    title: 'Issue Management',
    href: '/admin/issues',
    icon: AlertTriangle,
    description: 'Manage reported issues'
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users and roles'
  },
  {
    title: 'Activity Logs',
    href: '/admin/logs',
    icon: Activity,
    description: 'System activity logs'
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: FileText,
    description: 'Generate reports'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System settings'
  }
]


export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    // Check if current route matches the href
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out z-50",
        "lg:translate-x-0 lg:static lg:top-0 lg:h-screen lg:pt-16",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <div className="flex justify-between items-center p-4 border-b lg:hidden">
            <h2 className="text-lg font-semibold text-slate-900">Admin Menu</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 p-4 space-y-2">
            {/* Back to main site */}
            <div className="mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/')}
                className="w-full justify-start"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Site
              </Button>
            </div>

            {sidebarItems.map((item) => {
              const isItemActive = isActive(item.href)
              
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href)
                    onClose()
                  }}
                  className={cn(
                    "w-full flex items-start p-3 rounded-lg text-left transition-colors",
                    "hover:bg-slate-100 group",
                    isItemActive 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                      : "text-slate-700"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 mt-0.5 mr-3 flex-shrink-0",
                    isItemActive ? "text-emerald-600" : "text-slate-500 group-hover:text-slate-700"
                  )} />
                  <div>
                    <div className={cn(
                      "font-medium text-sm",
                      isItemActive ? "text-emerald-700" : "text-slate-900"
                    )}>
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Shield className="h-4 w-4" />
              <span>Admin Panel v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}