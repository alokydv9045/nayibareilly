'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Menu, Bell, Search, LogOut, Settings, Users, Shield, FileText, Activity,
  ChevronRight, X, BarChart3, Building2, Palette, Moon, Sun, UserCircle, Database, Flag
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCSRFToken } from '@/lib/utils/csrf'
import { config } from '@/lib/constants/config'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import { toast } from 'react-hot-toast'
import { me as apiMe } from '@/lib/api/auth'
import { selectPrimaryRole, roleDisplayNames } from '@/lib/constants/roles'
import type { AdminRole } from '@/lib/constants/role-map'

interface AdminNavbarProps {
  className?: string
}

export function AdminNavbar({ className = '' }: AdminNavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [notifications] = useState(3)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: AdminRole | null }>({
    name: 'Admin User',
    email: 'admin@nayibareilly.gov.in',
    role: null
  })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [userStats, setUserStats] = useState<{ totalUsers: number; totalCitizens: number }>({
    totalUsers: 0,
    totalCitizens: 0
  })

  useEffect(() => {
    // Get current user info
    const fetchUserInfo = async () => {
      try {
        const user = await apiMe()
        if (user) {
          const role = selectPrimaryRole(user.roles as string[])
          setCurrentUser({
            name: user.name || 'Admin User',
            email: user.email || 'admin@nayibareilly.gov.in',
            role
          })
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
      }
    }
    fetchUserInfo()

    // Fetch user statistics for moderators and admins
    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem('ns_token')
        if (!token) return

        const API_URL = config.api.fullUrl || 'https://nayibareilly.onrender.com/api'
        const response = await fetch(`${API_URL.replace(/\/$/, '')}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          const users = data.users || []
          const totalUsers = users.length
          const totalCitizens = users.filter((u: { roles: string[] }) => 
            u.roles.includes('citizen') || u.roles.includes('CITIZEN')
          ).length

          setUserStats({ totalUsers, totalCitizens })
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error)
      }
    }
    fetchUserStats()
  }, [])

  const handleLogout = async () => {
    try {
      // Get CSRF token
      const csrfToken = await getCSRFToken()
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      // Add CSRF token if available
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken
      }
      
      const API_URL = config.api.fullUrl || 'https://nayibareilly.onrender.com/api'
      await fetch(`${API_URL.replace(/\/$/, '')}/auth/logout`, { 
        method: 'POST', 
        credentials: 'include',
        headers 
      })
    } catch {}
    localStorage.removeItem('ns_token')
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // This would apply dark mode styling - for now just toggle state
    toast.success(`Switched to ${!isDarkMode ? 'dark' : 'light'} mode`)
  }

  const handleThemeChange = (theme: string) => {
    document.documentElement.setAttribute('data-theme', theme)
    toast.success(`Theme changed to ${theme}`)
  }

  // Role-based navigation items
  type NavItem = { name: string; href: string; icon: LucideIcon }

  const getNavigationItems = (userRole: AdminRole | null) => {
    const baseItems: NavItem[] = [
      { name: 'Issues', href: '/issues', icon: FileText },
      { name: 'Users', href: '/users', icon: Users },
    ]

    const roleSpecificItems: Partial<Record<AdminRole, NavItem[]>> = {
      SUPER_ADMIN: [
        { name: 'Tech Admin', href: '/techadmin', icon: Shield },
        { name: 'Mayor Portal', href: '/mayor', icon: Shield },
        { name: 'System Health', href: '/techadmin/diagnostic', icon: Database },
      ],
      DEPT_ADMIN: [
        { name: 'Department', href: '/department', icon: Building2 },
        { name: 'Staff', href: '/department/staff', icon: Users },
      ],
      MODERATOR: [
        { name: 'Moderation', href: '/moderator', icon: Flag },
      ],
      STAFF: [
        { name: 'Staff Portal', href: '/staff', icon: UserCircle },
      ],
      DEVELOPER_ADMIN: [
        { name: 'Developer', href: '/techadmin/developer', icon: Shield },
      ]
    }

    if (userRole && roleSpecificItems[userRole]) {
      return [...baseItems, ...(roleSpecificItems[userRole] as NavItem[])]
    }
    
    return baseItems
  }

  const navigation = getNavigationItems(currentUser.role)

  // Breadcrumb generation
  const generateBreadcrumbs = (path: string) => {
    const segments = path.split('/').filter(Boolean)
    const breadcrumbs: { name: string; href: string }[] = []
    
    let currentPath = ''
    segments.forEach((segment) => {
      currentPath += `/${segment}`
      
      const name = segment.charAt(0).toUpperCase() + segment.slice(1)
      breadcrumbs.push({ name, href: currentPath })
    })
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs(pathname)

  return (
    <>
      {/* Main Navigation Header */}
      <header className={`bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50 ${className}`}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo, Mobile Menu, and Breadcrumbs */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden min-h-[44px] min-w-[44px] touch-manipulation"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Logo */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Shield className={`h-6 w-6 sm:h-8 sm:w-8 ${
                  currentUser.role === 'SUPER_ADMIN' ? 'text-slate-800' :
                  currentUser.role === 'DEPT_ADMIN' ? 'text-emerald-600' :
                  currentUser.role === 'MODERATOR' ? 'text-orange-600' :
                  currentUser.role === 'DEVELOPER_ADMIN' ? 'text-indigo-600' :
                  'text-green-600'
                }`} />
                <span className="hidden xs:inline text-2xl font-bold">
                  <span className="text-slate-900">Nayi</span><span className="text-emerald-500">Bareilly</span> <span className="text-lg font-bold text-slate-900">Admin</span>
                </span>
                <span className="text-lg font-bold text-slate-900 xs:hidden">
                  Admin
                </span>
              </div>

              {/* Breadcrumbs */}
              <nav className="hidden sm:flex items-center space-x-1 sm:space-x-2 text-sm text-slate-500">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center">
                    {index > 0 && <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mx-1" />}
                    <a
                      href={crumb.href}
                      className={`hover:text-slate-700 transition-colors px-1 py-0.5 rounded ${
                        index === breadcrumbs.length - 1 ? 'text-slate-900 font-medium' : ''
                      }`}
                    >
                      {crumb.name}
                    </a>
                  </div>
                ))}
              </nav>
            </div>

            {/* Right: Search, Theme Toggle, Notifications, Profile */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Search */}
              <div className="hidden lg:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search admin panel..."
                    className="pl-10 w-64 border-slate-300 min-h-[40px]"
                  />
                </div>
              </div>

              {/* Mobile Search Button */}
              <Button variant="ghost" size="sm" className="lg:hidden min-h-[44px] min-w-[44px] touch-manipulation">
                <Search className="h-5 w-5" />
              </Button>

              {/* User Statistics - Show for moderators and admins */}
              {(currentUser.role === 'MODERATOR' || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'DEPT_ADMIN') && (
                <div className="hidden xl:flex items-center space-x-4 px-4 border-l border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <div className="text-xs">
                      <p className="text-slate-500">Total Users</p>
                      <p className="font-semibold text-slate-900">{userStats.totalUsers}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserCircle className="h-4 w-4 text-emerald-500" />
                    <div className="text-xs">
                      <p className="text-slate-500">Citizens</p>
                      <p className="font-semibold text-emerald-600">{userStats.totalCitizens}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Theme Toggle Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px] touch-manipulation">
                    <Palette className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleThemeChange('techadmin')}>
                    <div className="flex items-center space-x-2">
<<<<<<< HEAD
                      <div className="w-4 h-4 bg-slate-700 rounded"></div>
                      <span>Super Admin (Purple)</span>
=======
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span>Tech Admin (Purple)</span>
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange('orgadmin')}>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                      <span>Organization (Blue)</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange('moderator')}>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span>Moderator (Orange)</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange('staff')}>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Staff (Green)</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={toggleTheme}>
                    {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative min-h-[44px] min-w-[44px] touch-manipulation">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                    {notifications > 99 ? '99+' : notifications}
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-auto px-2 sm:px-3 space-x-1 sm:space-x-2 touch-manipulation">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/admin.png" alt="Admin" />
                      <AvatarFallback className={`
                        ${currentUser.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          currentUser.role === 'DEPT_ADMIN' ? 'bg-emerald-100 text-blue-800' :
                          currentUser.role === 'MODERATOR' ? 'bg-orange-100 text-orange-800' :
                          currentUser.role === 'DEVELOPER_ADMIN' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-green-100 text-green-800'}
                      `}>
                        {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{currentUser.name}</p>
                      <div className="flex items-center space-x-1">
                        <Badge variant="outline" className={`text-xs ${
                          currentUser.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          currentUser.role === 'DEPT_ADMIN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          currentUser.role === 'MODERATOR' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          currentUser.role === 'DEVELOPER_ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {currentUser.role ? roleDisplayNames[currentUser.role] : 'Admin'}
                        </Badge>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser.email}
                      </p>
                      {currentUser.role && (
                        <Badge variant="outline" className={`text-xs w-fit mt-1 ${
                          currentUser.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          currentUser.role === 'DEPT_ADMIN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          currentUser.role === 'MODERATOR' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          currentUser.role === 'DEVELOPER_ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          <Shield className="h-3 w-3 mr-1" />
                          {roleDisplayNames[currentUser.role]}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* User Statistics */}
                  {(currentUser.role === 'MODERATOR' || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'DEPT_ADMIN') && (
                    <>
                      <div className="px-2 py-2 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-muted-foreground">Total Users:</span>
                          <Badge variant="secondary" className="ml-2">{userStats.totalUsers}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Citizens:</span>
                          <Badge variant="secondary" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200">{userStats.totalCitizens}</Badge>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/users')}>
                    <Users className="mr-2 h-4 w-4" />
                    User Management
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/techadmin/diagnostic')}>
                    <Activity className="mr-2 h-4 w-4" />
                    System Health
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/techadmin/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Bar */}
        <div className="hidden md:block border-t border-slate-200">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 py-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 py-2 text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? `border-b-2 ${
                            currentUser.role === 'SUPER_ADMIN' ? 'border-slate-700 text-slate-800' :
                            currentUser.role === 'DEPT_ADMIN' ? 'border-emerald-500 text-emerald-600' :
                            currentUser.role === 'MODERATOR' ? 'border-orange-500 text-orange-600' :
                            currentUser.role === 'DEVELOPER_ADMIN' ? 'border-indigo-500 text-indigo-600' :
                            'border-green-500 text-green-600'
                          }`
                        : 'text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </a>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Shield className={`h-6 w-6 ${
                  currentUser.role === 'SUPER_ADMIN' ? 'text-slate-800' :
                  currentUser.role === 'DEPT_ADMIN' ? 'text-emerald-600' :
                  currentUser.role === 'MODERATOR' ? 'text-orange-600' :
                  currentUser.role === 'DEVELOPER_ADMIN' ? 'text-indigo-600' :
                  'text-green-600'
                }`} />
                <span className="text-2xl font-bold">
                  <span className="text-slate-900">Nayi</span><span className="text-emerald-500">Bareilly</span> <span className="text-lg font-bold text-slate-900">Admin</span>
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)} className="min-h-[44px] min-w-[44px] touch-manipulation">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-2 px-2 pb-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors touch-manipulation ${
                      pathname === item.href
                        ? `${
                            currentUser.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border-r-4 border-slate-700' :
                            currentUser.role === 'DEPT_ADMIN' ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-500' :
                            currentUser.role === 'MODERATOR' ? 'bg-orange-50 text-orange-700 border-r-4 border-orange-500' :
                            currentUser.role === 'DEVELOPER_ADMIN' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-500' :
                            'bg-green-50 text-green-700 border-r-4 border-green-500'
                          }`
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </a>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}