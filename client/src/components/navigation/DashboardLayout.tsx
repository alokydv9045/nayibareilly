/**
 * Dashboard Layout with Sidebar
 * Complete layout with role-based navigation, header, and content area
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RoleBasedNav, MobileNav } from './RoleBasedNav';
import { Breadcrumbs } from './Breadcrumbs';
import { QuickActions } from './QuickActions';
import { RoleSwitcher, RoleBadge } from '@/components/rbac';
import { useUserRoles } from '@/lib/rbac';
import { useSession } from '@/hooks/useSession';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// ============================================================================
// Logo Component
// ============================================================================

function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
        N
      </div>
      {!collapsed && (
        <span className="text-2xl font-bold">
          <span className="text-slate-900">Nayi</span><span className="text-emerald-500">Bareilly</span>
        </span>
      )}
    </Link>
  );
}

// ============================================================================
// User Menu
// ============================================================================

function UserMenu() {
  const { user } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Clear tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }

      // Redirect to login
      router.push('/login');
      
      // Optional: Call logout API
      // await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={(user as User)?.avatar} alt={user?.name || 'User'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// Dashboard Layout
// ============================================================================

export interface DashboardLayoutProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
  showQuickActions?: boolean;
  className?: string;
}

export function DashboardLayout({
  children,
  showBreadcrumbs = true,
  showQuickActions = true,
  className,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { canSwitchRoles } = useUserRoles();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <MobileNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-30 hidden md:block border-r bg-background transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Logo collapsed={sidebarCollapsed} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Role Badge */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b">
            <RoleBadge className="w-full justify-center" />
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <RoleBasedNav collapsed={sidebarCollapsed} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          'transition-all duration-300',
          'md:ml-64',
          sidebarCollapsed && 'md:ml-16'
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-full items-center justify-between px-4 md:px-6">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Logo (mobile only) */}
              <div className="md:hidden">
                <Logo />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              </Button>

              {/* Role Switcher */}
              {canSwitchRoles && (
                <div className="hidden md:block">
                  <RoleSwitcher variant="ghost" showIcon={false} />
                </div>
              )}

              {/* User Menu */}
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          {/* Breadcrumbs and Quick Actions */}
          {(showBreadcrumbs || showQuickActions) && (
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {showBreadcrumbs && <Breadcrumbs />}
              {showQuickActions && (
                <div className="flex items-center gap-2">
                  <QuickActions variant="outline" />
                </div>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className={className}>{children}</div>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// Simple Layout (no sidebar)
// ============================================================================

export interface SimpleLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
}

export function SimpleLayout({
  children,
  title,
  description,
  showHeader = true,
}: SimpleLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <header className="border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Logo />
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="container mx-auto px-4 py-8">
        {(title || description) && (
          <div className="mb-8 text-center">
            {title && <h1 className="text-4xl font-bold mb-2">{title}</h1>}
            {description && (
              <p className="text-xl text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
