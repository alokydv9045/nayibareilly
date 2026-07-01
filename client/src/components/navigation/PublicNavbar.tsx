'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, LogIn, UserPlus, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useNavigation } from '@/hooks/navigation/useNavigation'

interface PublicNavbarProps {
  language?: 'en' | 'hi'
  onLanguageChange?: (lang: 'en' | 'hi') => void
}

export function PublicNavbar({ language = 'en', onLanguageChange }: PublicNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { publicNavigation, isAuthenticated } = useNavigation(language)

  // Don't show public navbar if user is authenticated
  if (isAuthenticated) {
    return null
  }

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en'
    onLanguageChange?.(newLang)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center justify-between px-6 py-4 bg-white border-b border-border">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl">🏛️</div>
          <div>
            <div className="text-2xl font-bold">
              {language === 'hi' ? (
                <><span className="text-slate-900">नयी </span><span className="text-emerald-500">बरेली</span></>
              ) : (
                <><span className="text-slate-900">Nayi</span><span className="text-emerald-500">Bareilly</span></>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {language === 'hi' ? 'स्मार्ट सिटी' : 'Smart City'}
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {publicNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const label = language === 'hi' && item.nameHi ? item.nameHi : item.name

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                  isActive
                    ? 'text-sky-600 bg-sky-50'
                    : 'text-slate-700 hover:text-sky-600 hover:bg-sky-50/50'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="gap-2 min-h-[44px]"
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4" />
            {language === 'en' ? 'हिंदी' : 'English'}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/login')}
            className="gap-2 min-h-[44px]"
          >
            <LogIn className="h-4 w-4" />
            {language === 'hi' ? 'लॉगिन' : 'Login'}
          </Button>
          <Button
            onClick={() => router.push('/register')}
            className="gap-2 min-h-[44px]"
          >
            <UserPlus className="h-4 w-4" />
            {language === 'hi' ? 'रजिस्टर करें' : 'Register'}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border sticky top-0 z-40">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-xl">🏛️</div>
          <div>
            <div className="text-2xl font-bold">
              {language === 'hi' ? (
                <><span className="text-slate-900">नयी </span><span className="text-emerald-500">बरेली</span></>
              ) : (
                <><span className="text-slate-900">Nayi</span><span className="text-emerald-500">Bareilly</span></>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {language === 'hi' ? 'स्मार्ट सिटी' : 'Smart City'}
            </div>
          </div>
        </Link>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="min-h-[44px] min-w-[44px] p-2"
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/login')}
            className="gap-1 min-h-[44px] text-xs"
          >
            <LogIn className="h-4 w-4" />
            {language === 'hi' ? 'लॉगिन' : 'Login'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-h-[44px] min-w-[44px] p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[73px] bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white p-4 space-y-2" onClick={(e) => e.stopPropagation()}>
            {publicNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const label = language === 'hi' && item.nameHi ? item.nameHi : item.name

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                    isActive
                      ? 'text-sky-600 bg-sky-50'
                      : 'text-slate-700 hover:text-sky-600 hover:bg-sky-50/50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              )
            })}
            <div className="pt-4 border-t border-border">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false)
                  router.push('/register')
                }}
                className="w-full gap-2 min-h-[44px]"
              >
                <UserPlus className="h-4 w-4" />
                {language === 'hi' ? 'रजिस्टर करें' : 'Register'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
