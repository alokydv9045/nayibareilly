/**
 * Quick Actions Component
 * Contextual quick actions based on user role and current page
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserRoles } from '@/lib/rbac';
import { UserRole } from '@/lib/rbac';
import {
  Plus,
  FileText,
  Users,
  Building2,
  Settings,
  Download,
  AlertCircle,
  CheckSquare,
  BarChart3,
  FolderOpen,
  Upload,
  Eye,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Quick Action Interface
// ============================================================================

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  shortcut?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  disabled?: boolean;
}

export interface QuickActionGroup {
  label: string;
  actions: QuickAction[];
}

// ============================================================================
// Role-Specific Quick Actions
// ============================================================================

const QUICK_ACTIONS: Record<UserRole, QuickActionGroup[]> = {
  [UserRole.CITIZEN]: [
    {
      label: 'Common',
      actions: [
        {
          label: 'Report New Issue',
          icon: Plus,
          href: '/report',
          variant: 'default',
          shortcut: 'Ctrl+N',
        },
        {
          label: 'View My Issues',
          icon: FileText,
          href: '/my-issues',
        },
        {
          label: 'Check on Map',
          icon: Eye,
          href: '/map',
        },
      ],
    },
  ],

  [UserRole.MODERATOR]: [
    {
      label: 'Review',
      actions: [
        {
          label: 'Pending Reviews',
          icon: AlertCircle,
          href: '/moderator/pending',
          variant: 'default',
        },
        {
          label: 'Analytics',
          icon: BarChart3,
          href: '/moderator/analytics',
        },
        {
          label: 'Review History',
          icon: FolderOpen,
          href: '/moderator/history',
        },
      ],
    },
  ],

  [UserRole.STAFF]: [
    {
      label: 'Work',
      actions: [
        {
          label: 'My Assignments',
          icon: FileText,
          href: '/staff/assigned',
          variant: 'default',
        },
        {
          label: 'In Progress',
          icon: Zap,
          href: '/staff/in-progress',
        },
        {
          label: 'View on Map',
          icon: Eye,
          href: '/staff/map',
        },
      ],
    },
  ],

  [UserRole.DEPT_ADMIN]: [
    {
      label: 'Management',
      actions: [
        {
          label: 'Assign Issue',
          icon: Plus,
          href: '/department/assignments',
          variant: 'default',
        },
        {
          label: 'Manage Staff',
          icon: Users,
          href: '/department/staff',
        },
        {
          label: 'View Analytics',
          icon: Eye,
          href: '/department/analytics',
        },
      ],
    },
    {
      label: 'Reports',
      actions: [
        {
          label: 'Generate Report',
          icon: FileText,
          href: '/department/reports',
        },
        {
          label: 'Export Data',
          icon: Download,
          onClick: () => console.log('Export data'),
        },
      ],
    },
  ],

  [UserRole.MAYOR]: [
    {
      label: 'Executive',
      actions: [
        {
          label: 'City Overview',
          icon: Eye,
          href: '/mayor/overview',
          variant: 'default',
        },
        {
          label: 'Pending Approvals',
          icon: CheckSquare,
          href: '/mayor/approvals',
        },
        {
          label: 'All Departments',
          icon: Building2,
          href: '/mayor/departments',
        },
      ],
    },
    {
      label: 'Reports',
      actions: [
        {
          label: 'Analytics Dashboard',
          icon: Eye,
          href: '/mayor/analytics',
        },
        {
          label: 'Export Report',
          icon: Download,
          onClick: () => console.log('Export report'),
        },
      ],
    },
  ],

  [UserRole.SUPER_ADMIN]: [
    {
      label: 'Administration',
      actions: [
        {
          label: 'Add User',
          icon: Plus,
          href: '/superadmin/users/new',
          variant: 'default',
        },
        {
          label: 'Manage Users',
          icon: Users,
          href: '/superadmin/users',
        },
        {
          label: 'Manage Departments',
          icon: Building2,
          href: '/superadmin/departments',
        },
      ],
    },
    {
      label: 'System',
      actions: [
        {
          label: 'System Settings',
          icon: Settings,
          href: '/superadmin/settings',
        },
        {
          label: 'View Audit Log',
          icon: FileText,
          href: '/superadmin/audit',
        },
        {
          label: 'Diagnostics',
          icon: Eye,
          href: '/diagnostic',
        },
      ],
    },
    {
      label: 'Data',
      actions: [
        {
          label: 'Export All Data',
          icon: Download,
          onClick: () => console.log('Export all'),
        },
        {
          label: 'Import Data',
          icon: Upload,
          onClick: () => console.log('Import data'),
        },
      ],
    },
  ],
};

// ============================================================================
// Quick Actions Dropdown
// ============================================================================

export interface QuickActionsProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function QuickActions({
  className,
  variant = 'default',
  size = 'default',
}: QuickActionsProps) {
  const { primaryRole } = useUserRoles();
  const router = useRouter();

  const actionGroups = QUICK_ACTIONS[primaryRole] || [];

  const handleAction = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      router.push(action.href);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Zap className="h-4 w-4 mr-2" />
          Quick Actions
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {actionGroups.map((group, groupIndex) => (
          <React.Fragment key={group.label}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {group.label}
              </DropdownMenuLabel>
              {group.actions.map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    key={action.label}
                    onClick={() => handleAction(action)}
                    disabled={action.disabled}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{action.label}</span>
                    {action.shortcut && (
                      <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            {groupIndex < actionGroups.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// Quick Action Buttons (Primary Actions)
// ============================================================================

export interface QuickActionButtonsProps {
  className?: string;
  maxButtons?: number;
}

export function QuickActionButtons({
  className,
  maxButtons = 2,
}: QuickActionButtonsProps) {
  const { primaryRole } = useUserRoles();
  const router = useRouter();

  const actionGroups = QUICK_ACTIONS[primaryRole] || [];
  const primaryActions = actionGroups[0]?.actions.slice(0, maxButtons) || [];

  if (primaryActions.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {primaryActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.label}
            variant={action.variant || 'default'}
            size="sm"
            onClick={() => {
              if (action.onClick) {
                action.onClick();
              } else if (action.href) {
                router.push(action.href);
              }
            }}
            disabled={action.disabled}
          >
            <Icon className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Quick Action FAB (Floating Action Button)
// ============================================================================

export interface QuickActionFABProps {
  className?: string;
}

export function QuickActionFAB({ className }: QuickActionFABProps) {
  const { primaryRole } = useUserRoles();
  const router = useRouter();

  // Get primary action
  const primaryAction = QUICK_ACTIONS[primaryRole]?.[0]?.actions[0];

  if (!primaryAction) return null;

  const Icon = primaryAction.icon;

  return (
    <Button
      size="lg"
      className={cn(
        'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50',
        'hover:scale-110 transition-transform',
        className
      )}
      onClick={() => {
        if (primaryAction.onClick) {
          primaryAction.onClick();
        } else if (primaryAction.href) {
          router.push(primaryAction.href);
        }
      }}
    >
      <Icon className="h-6 w-6" />
      <span className="sr-only">{primaryAction.label}</span>
    </Button>
  );
}
