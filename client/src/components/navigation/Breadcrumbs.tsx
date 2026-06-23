/**
 * Breadcrumb Navigation Component
 * Automatic breadcrumb generation based on current route
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserRoles } from '@/lib/rbac';
import { UserRole } from '@/lib/rbac/roles';
import { getFlatNavigationForRole } from '@/config/navigation';

// ============================================================================
// Breadcrumb Item Interface
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

// ============================================================================
// Generate Breadcrumbs from Path
// ============================================================================

function generateBreadcrumbs(pathname: string, role: string): BreadcrumbItem[] {
  const navigationItems = getFlatNavigationForRole(role as UserRole);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always add home as first item
  const homeItem = navigationItems.find((item) => 
    item.href === '/dashboard' || 
    item.href === '/moderator' ||
    item.href === '/staff' ||
    item.href === '/department' ||
    item.href === '/mayor' ||
    item.href === '/techadmin'
  );

  if (homeItem) {
    breadcrumbs.push({
      label: 'Home',
      href: homeItem.href,
      isCurrentPage: pathname === homeItem.href,
    });
  }

  // If we're on home, return just home
  if (pathname === homeItem?.href) {
    return breadcrumbs;
  }

  // Split path into segments
  const segments = pathname.split('/').filter(Boolean);

  // Build breadcrumb path progressively
  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const isLast = i === segments.length - 1;

    // Try to find matching navigation item
    const navItem = navigationItems.find((item) => item.href === currentPath);

    if (navItem) {
      breadcrumbs.push({
        label: navItem.label,
        href: navItem.href,
        isCurrentPage: isLast,
      });
    } else {
      // Generate label from segment (capitalize and replace hyphens)
      const label = segments[i]
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrentPage: isLast,
      });
    }
  }

  return breadcrumbs;
}

// ============================================================================
// Breadcrumb Component
// ============================================================================

export interface BreadcrumbsProps {
  className?: string;
  items?: BreadcrumbItem[];
  showHome?: boolean;
  separator?: React.ReactNode;
  maxItems?: number;
}

export function Breadcrumbs({
  className,
  items: customItems,
  showHome = true,
  separator = <ChevronRight className="h-4 w-4" />,
  maxItems,
}: BreadcrumbsProps) {
  const pathname = usePathname();
  const { primaryRole } = useUserRoles();

  // Use custom items or generate from pathname
  const breadcrumbs = customItems || generateBreadcrumbs(pathname || '/', primaryRole);

  // Limit items if maxItems is set
  let displayItems = breadcrumbs;
  if (maxItems && breadcrumbs.length > maxItems) {
    const firstItem = breadcrumbs[0];
    const lastItems = breadcrumbs.slice(-(maxItems - 1));
    displayItems = [
      firstItem,
      { label: '...', href: '#', isCurrentPage: false },
      ...lastItems,
    ];
  }

  // Don't show breadcrumbs if only one item
  if (displayItems.length <= 1 && !showHome) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-2 text-sm', className)}
    >
      <ol className="flex items-center space-x-2">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const showSeparator = index < displayItems.length - 1;

          return (
            <li key={item.href + index} className="flex items-center space-x-2">
              {item.label === '...' ? (
                <span className="text-muted-foreground">...</span>
              ) : item.isCurrentPage || isLast ? (
                <span
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {index === 0 && showHome ? (
                    <Home className="h-4 w-4" />
                  ) : (
                    item.label
                  )}
                </Link>
              )}
              {showSeparator && (
                <span className="text-muted-foreground">{separator}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ============================================================================
// Breadcrumb with Actions
// ============================================================================

export interface BreadcrumbsWithActionsProps extends BreadcrumbsProps {
  actions?: React.ReactNode;
}

export function BreadcrumbsWithActions({
  actions,
  ...breadcrumbProps
}: BreadcrumbsWithActionsProps) {
  return (
    <div className="flex items-center justify-between">
      <Breadcrumbs {...breadcrumbProps} />
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ============================================================================
// Page Header with Breadcrumbs
// ============================================================================

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <Breadcrumbs items={breadcrumbs} />
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
