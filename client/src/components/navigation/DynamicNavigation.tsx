'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useNavigation } from '@/hooks/navigation/useNavigation'
import type { NavItem } from '@/lib/config/navigation'
import { Separator } from '@/components/ui/separator'

interface DynamicNavigationProps {
  variant?: 'sidebar' | 'mobile'
  language?: 'en' | 'hi'
  className?: string
}

export function DynamicNavigation({ 
  variant = 'sidebar',
  language = 'en',
  className 
}: DynamicNavigationProps) {
  const pathname = usePathname()
  const { navigation, mobileNavigation, unreadCount, pendingCount, isAuthenticated } = useNavigation(language)

  const items = variant === 'mobile' ? mobileNavigation : navigation.flatMap(group => group.items)

  const getBadgeCount = (item: NavItem): number => {
    if (item.badge === 'notifications') return unreadCount
    if (item.badge === 'pending') return pendingCount
    return 0
  }

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const label = language === 'hi' && item.nameHi ? item.nameHi : item.name
    const badgeCount = getBadgeCount(item)

    if (variant === 'mobile') {
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex flex-col items-center gap-1 p-2 rounded-lg min-w-[44px] min-h-[44px] justify-center transition-colors',
            isActive 
              ? 'text-sky-600 bg-sky-50' 
              : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50/50'
          )}
          aria-label={label}
          aria-current={isActive ? 'page' : undefined}
        >
          <div className="relative">
            <Icon className="h-5 w-5" />
            {badgeCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-white text-[8px] font-medium"
                aria-label={`${badgeCount} unread`}
              >
                {badgeCount > 9 ? '9+' : badgeCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-none font-medium truncate max-w-[60px]">
            {label}
          </span>
        </Link>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent min-h-[44px] transition-colors group',
          isActive ? 'bg-accent font-medium' : ''
        )}
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="h-4 w-4 shrink-0 group-hover:scale-110 transition-transform" />
        <span className="flex-1">{label}</span>
        {badgeCount > 0 && (
          <span 
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 text-white text-[10px] px-1 font-medium"
            aria-label={`${badgeCount} unread`}
          >
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </Link>
    )
  }

  if (!isAuthenticated && variant === 'sidebar') {
    return null
  }

  if (variant === 'mobile') {
    return (
      <div className={cn(
        'fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 lg:hidden',
        className
      )}>
        <nav 
          className="flex items-center justify-around py-2 px-4 max-w-screen-xl mx-auto"
          aria-label="Mobile navigation"
        >
          {items.map(renderNavItem)}
        </nav>
      </div>
    )
  }

  return (
    <nav className={cn('space-y-1', className)} aria-label="Main navigation">
      {navigation.map((group, groupIndex) => (
        <div key={groupIndex}>
          {group.title && (
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {language === 'hi' && group.titleHi ? group.titleHi : group.title}
            </div>
          )}
          <div className="space-y-1">
            {group.items.map(renderNavItem)}
          </div>
          {groupIndex < navigation.length - 1 && (
            <Separator className="my-2" />
          )}
        </div>
      ))}
    </nav>
  )
}
