'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/providers/SessionProvider'
import { 
  User, 
  LogIn,
  UserPlus,
  Menu, 
  FileText
} from 'lucide-react'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import LogoutButton from '@/components/features/auth/LogoutButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { PublicNavbar } from '@/components/navigation/PublicNavbar'
import { useNavigation } from '@/hooks/navigation/useNavigation'
import { useLanguage } from '@/hooks/ui/useLanguage'

export default function Navbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage, toggleLanguage] = useLanguage()
  
  // Use session manager instead of local state
  const { user, isAuthenticated, isLoading: sessionLoading, handleLogoutSuccess, updateActivity } = useSession()
  const { mobileNavigation, unreadCount } = useNavigation(language)

  // Fix hydration issue by waiting for client mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update activity on navigation
  useEffect(() => {
    if (isAuthenticated) {
      updateActivity()
    }
  }, [isAuthenticated, updateActivity])

  // Role-aware desktop navigation for authenticated users: reuse prioritized mobile items
  const desktopNavItems = isAuthenticated ? mobileNavigation : []

  // If not authenticated, show the new PublicNavbar (desktop + mobile)
  if (mounted && !sessionLoading && !isAuthenticated) {
    return <PublicNavbar language={language} onLanguageChange={setLanguage} />
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 min-w-0">
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent truncate">
              NayiBareilly
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {desktopNavItems.map((item) => {
              const Icon = item.icon
              const label = language === 'hi' && item.nameHi ? item.nameHi : item.name
              const showBadge = item.badge === 'notifications' && unreadCount > 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 group"
                >
                  <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{label}</span>
                  {showBadge && (
                    <span className="absolute -top-2 -right-3 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )
            })}
            {/* Language toggle */}
            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="h-9 w-9 p-0" title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}>
              <Globe className="h-4 w-4" />
            </Button>
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!mounted || sessionLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-pulse bg-gray-200 h-10 w-10 rounded-full"></div>
                <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl} alt={user.name || user.email} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                        {(user.name || user.email || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/my-issues')}>
                    <FileText className="mr-2 h-4 w-4" />
                    My Issues
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-red-600 focus:text-red-700 focus:bg-red-50">
                    <LogoutButton 
                      variant="ghost" 
                      showIcon={true}
                      showConfirmDialog={true}
                      className="w-full justify-start p-2 h-auto text-red-600 hover:text-red-700 hover:bg-transparent"
                      onLogoutComplete={handleLogoutSuccess}
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  <Link href="/get-started">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Let&apos;s Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 touch-manipulation">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm sm:w-80 p-0">
                <SheetHeader className="p-4 sm:p-6 border-b">
                  <SheetTitle className="text-left">
                    <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                      NayiBareilly
                    </div>
                  </SheetTitle>
                  <SheetDescription className="text-left text-sm text-gray-600">
                    नई सोच, नया समाधान, नई बरेली
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 sm:mt-8 space-y-2 sm:space-y-4 px-4 sm:px-6">
                  {desktopNavItems.map((item) => {
                    const Icon = item.icon
                    const label = language === 'hi' && item.nameHi ? item.nameHi : item.name
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation"
                      >
                        <Icon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{label}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {!mounted || sessionLoading ? (
                  <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 px-4 sm:px-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="animate-pulse bg-gray-200 h-10 w-10 rounded-full"></div>
                      <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                    </div>
                  </div>
                ) : user ? (
                  <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 px-4 sm:px-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={user.avatarUrl} alt={user.name || user.email} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white text-sm">
                          {(user.name || user.email || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{user.name || 'User'}</div>
                        <div className="text-sm text-gray-500 truncate">{user.email}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start h-12 touch-manipulation" onClick={() => {
                        router.push('/profile')
                        setMobileMenuOpen(false)
                      }}>
                        <User className="mr-3 h-4 w-4" />
                        Profile
                      </Button>
                      <Button variant="ghost" className="w-full justify-start h-12 touch-manipulation" onClick={() => {
                        router.push('/my-issues')
                        setMobileMenuOpen(false)
                      }}>
                        <FileText className="mr-3 h-4 w-4" />
                        My Issues
                      </Button>
                      <LogoutButton 
                        variant="ghost" 
                        showIcon={true}
                        showConfirmDialog={true}
                        className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation"
                        onLogoutComplete={() => {
                          handleLogoutSuccess()
                          setMobileMenuOpen(false)
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 px-4 sm:px-6 space-y-3">
                    <Button variant="ghost" className="w-full justify-start h-12 touch-manipulation" asChild>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <LogIn className="mr-3 h-4 w-4" />
                        Sign In
                      </Link>
                    </Button>
                    <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 touch-manipulation" asChild>
                      <Link href="/get-started" onClick={() => setMobileMenuOpen(false)}>
                        <UserPlus className="mr-3 h-4 w-4" />
                        Let&apos;s Get Started
                      </Link>
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}