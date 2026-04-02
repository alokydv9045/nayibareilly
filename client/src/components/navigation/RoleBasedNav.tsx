/**
 * Role-Based Navigation Component
 * Automatically displays appropriate navigation based on user's role
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserRoles } from '@/lib/rbac';
import { getNavigationForRole, isNavigationItemActive, type NavigationItem } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ============================================================================
// Navigation Item Component
// ============================================================================

interface NavItemProps {
  item: NavigationItem;
  isActive: boolean;
  collapsed?: boolean;
}

function NavItem({ item, isActive, collapsed = false }: NavItemProps) {
  const Icon = item.icon;

  const content = (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
        'hover:bg-accent hover:text-accent-foreground',
        isActive && 'bg-primary text-primary-foreground hover:bg-primary/90',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', !collapsed && 'mr-0')} />
      {!collapsed && (
        <>
          <span className="flex-1 font-medium">{item.label}</span>
          {item.badge && (
            <span className="ml-auto bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
              {item.badge}
            </span>
          )}
          {item.children && <ChevronRight className="h-4 w-4 ml-auto" />}
        </>
      )}
    </Link>
  );

  if (collapsed && item.description) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-medium">{item.label}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground">{item.description}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

// ============================================================================
// Navigation Group Component
// ============================================================================

interface NavGroupProps {
  title: string;
  items: NavigationItem[];
  currentPath: string;
  collapsed?: boolean;
}

function NavGroup({ title, items, currentPath, collapsed = false }: NavGroupProps) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      )}
      <nav className="space-y-1">
        {items.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={isNavigationItemActive(item, currentPath)}
            collapsed={collapsed}
          />
        ))}
      </nav>
    </div>
  );
}

// ============================================================================
// Main Navigation Component
// ============================================================================

export interface RoleBasedNavProps {
  className?: string;
  collapsed?: boolean;
}

export function RoleBasedNav({ className, collapsed = false }: RoleBasedNavProps) {
  const { primaryRole, isLoading } = useUserRoles();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  const navigationGroups = getNavigationForRole(primaryRole);

  return (
    <div className={cn('space-y-6', className)}>
      {navigationGroups.map((group, index) => (
        <NavGroup
          key={`${group.title}-${index}`}
          title={group.title}
          items={group.items}
          currentPath={pathname || '/'}
          collapsed={collapsed}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Horizontal Navigation (for top navbar)
// ============================================================================

export interface HorizontalNavProps {
  className?: string;
  maxItems?: number;
}

export function HorizontalNav({ className, maxItems = 5 }: HorizontalNavProps) {
  const { primaryRole, isLoading } = useUserRoles();
  const pathname = usePathname();

  if (isLoading) return null;

  const navigationGroups = getNavigationForRole(primaryRole);
  const mainItems = navigationGroups[0]?.items.slice(0, maxItems) || [];

  return (
    <nav className={cn('flex items-center gap-1', className)}>
      {mainItems.map((item) => {
        const Icon = item.icon;
        const isActive = isNavigationItemActive(item, pathname || '/');

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-1 bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full text-xs">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

// ============================================================================
// Mobile Navigation
// ============================================================================

export interface MobileNavProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ className, isOpen, onClose }: MobileNavProps) {
  const { primaryRole } = useUserRoles();
  const pathname = usePathname();
  const navigationGroups = getNavigationForRole(primaryRole);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 w-72 bg-background border-r z-50',
          'transform transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {navigationGroups.map((group, index) => (
                <NavGroup
                  key={`${group.title}-${index}`}
                  title={group.title}
                  items={group.items}
                  currentPath={pathname || '/'}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
