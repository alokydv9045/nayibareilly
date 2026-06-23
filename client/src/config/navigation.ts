/**
 * Navigation Configuration
 * Centralized navigation items for all roles
 */

import {
  Home,
  FileText,
  AlertCircle,
  User,
  Bell,
  Settings,
  HelpCircle,
  MapPin,
  Users,
  Building2,
  BarChart3,
  CheckSquare,
  ClipboardList,
  Shield,
  Briefcase,
  Eye,
  UserCog,
  TrendingUp,
  FolderOpen,
  type LucideIcon,
} from 'lucide-react';
import { UserRole } from '@/lib/rbac';

// ============================================================================
// Navigation Item Interface
// ============================================================================

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: string | number;
  children?: NavigationItem[];
  external?: boolean;
  requiresPermission?: {
    resource: string;
    action: string;
  };
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

// ============================================================================
// Common Navigation Items
// ============================================================================

const commonItems = {
  profile: {
    label: 'Profile',
    href: '/profile',
    icon: User,
    description: 'Manage your profile',
  },
  notifications: {
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
    description: 'View notifications',
  },
  help: {
    label: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
    description: 'Get help',
  },
  settings: {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Account settings',
  },
};

// ============================================================================
// Role-Specific Navigation
// ============================================================================

export const NAVIGATION_CONFIG: Record<UserRole, NavigationGroup[]> = {
  // ==========================================================================
  // CITIZEN NAVIGATION
  // ==========================================================================
  [UserRole.CITIZEN]: [
    {
      title: 'Main',
      items: [
        {
          label: 'Home',
          href: '/',
          icon: Home,
          description: 'Return to homepage',
        },
        {
          label: 'Report Issue',
          href: '/report',
          icon: AlertCircle,
          description: 'Report a new civic issue',
        },
        {
          label: 'My Issues',
          href: '/my-issues',
          icon: FileText,
          description: 'Track your reported issues',
        },
        {
          label: 'Map View',
          href: '/map',
          icon: MapPin,
          description: 'View issues on map',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        commonItems.profile,
        commonItems.notifications,
        commonItems.help,
      ],
    },
  ],

  // ==========================================================================
  // MODERATOR NAVIGATION
  // ==========================================================================
  [UserRole.MODERATOR]: [
    {
      title: 'Main',
      items: [
        {
          label: 'Dashboard',
          href: '/moderator/dashboard',
          icon: Home,
          description: 'Moderator dashboard overview',
        },
        {
          label: 'Pending Review',
          href: '/moderator/pending',
          icon: Eye,
          description: 'Issues awaiting review',
        },
        {
          label: 'Analytics',
          href: '/moderator/analytics',
          icon: BarChart3,
          description: 'Performance analytics',
        },
        {
          label: 'Review History',
          href: '/moderator/history',
          icon: FolderOpen,
          description: 'Historical review data',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        commonItems.profile,
        commonItems.notifications,
        commonItems.help,
      ],
    },
  ],

  // ==========================================================================
  // STAFF NAVIGATION
  // ==========================================================================
  [UserRole.STAFF]: [
    {
      title: 'Main',
      items: [
        {
          label: 'Dashboard',
          href: '/staff',
          icon: Home,
          description: 'Staff dashboard',
        },
        {
          label: 'Assigned to Me',
          href: '/staff/assigned',
          icon: Briefcase,
          description: 'Your assigned issues',
        },
        {
          label: 'In Progress',
          href: '/staff/in-progress',
          icon: TrendingUp,
          description: 'Issues you\'re working on',
        },
        {
          label: 'Completed',
          href: '/staff/completed',
          icon: CheckSquare,
          description: 'Completed issues',
        },
      ],
    },
    {
      title: 'Tools',
      items: [
        {
          label: 'Map View',
          href: '/staff/map',
          icon: MapPin,
          description: 'View issues on map',
        },
        {
          label: 'All Issues',
          href: '/issues',
          icon: ClipboardList,
          description: 'Browse all issues',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        commonItems.profile,
        commonItems.notifications,
        commonItems.help,
      ],
    },
  ],

  // ==========================================================================
  // DEPARTMENT ADMIN NAVIGATION
  // ==========================================================================
  [UserRole.DEPT_ADMIN]: [
    {
      title: 'Main',
      items: [
        {
          label: 'Dashboard',
          href: '/department',
          icon: Home,
          description: 'Department dashboard',
        },
        {
          label: 'Department Issues',
          href: '/department/issues',
          icon: ClipboardList,
          description: 'All department issues',
        },
        {
          label: 'Staff Management',
          href: '/department/staff',
          icon: Users,
          description: 'Manage your staff',
        },
        {
          label: 'Analytics',
          href: '/department/analytics',
          icon: BarChart3,
          description: 'Performance analytics',
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          label: 'Assignments',
          href: '/department/assignments',
          icon: Briefcase,
          description: 'Assign issues to staff',
        },
        {
          label: 'Reports',
          href: '/department/reports',
          icon: FileText,
          description: 'Generate reports',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        commonItems.profile,
        commonItems.notifications,
        commonItems.settings,
        commonItems.help,
      ],
    },
  ],

  // ==========================================================================
  // MAYOR NAVIGATION
  // ==========================================================================
  [UserRole.MAYOR]: [
    {
      title: 'Main',
      items: [
        {
          label: 'Dashboard',
          href: '/mayor',
          icon: Home,
          description: 'Executive dashboard',
        },
        {
          label: 'Overview',
          href: '/mayor/overview',
          icon: Eye,
          description: 'City-wide overview',
        },
        {
          label: 'Departments',
          href: '/mayor/departments',
          icon: Building2,
          description: 'All departments',
        },
        {
          label: 'Analytics',
          href: '/mayor/analytics',
          icon: BarChart3,
          description: 'City-wide analytics',
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          label: 'Approvals',
          href: '/mayor/approvals',
          icon: CheckSquare,
          description: 'Pending approvals',
        },
        {
          label: 'All Issues',
          href: '/issues',
          icon: ClipboardList,
          description: 'All city issues',
        },
        {
          label: 'Reports',
          href: '/mayor/reports',
          icon: FileText,
          description: 'Executive reports',
        },
        {
          label: 'Users',
          href: '/users',
          icon: Users,
          description: 'User management',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        commonItems.profile,
        commonItems.notifications,
        commonItems.settings,
        commonItems.help,
      ],
    },
  ],

  // ==========================================================================
  // TECH ADMIN NAVIGATION
  // ==========================================================================
  [UserRole.TECH_ADMIN]: [
    {
      title: 'Main',
      items: [
        {
          label: 'Dashboard',
          href: '/techadmin',
          icon: Home,
          description: 'Admin dashboard',
        },
        {
          label: 'System Overview',
          href: '/techadmin/overview',
          icon: Eye,
          description: 'System-wide overview',
        },
        {
          label: 'Analytics',
          href: '/techadmin/analytics',
          icon: BarChart3,
          description: 'System analytics',
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          label: 'Users',
          href: '/techadmin/users',
          icon: Users,
          description: 'User management',
        },
        {
          label: 'Departments',
          href: '/techadmin/departments',
          icon: Building2,
          description: 'Department management',
        },
        {
          label: 'Issues',
          href: '/issues',
          icon: ClipboardList,
          description: 'All issues',
        },
        {
          label: 'Categories',
          href: '/techadmin/categories',
          icon: FolderOpen,
          description: 'Category management',
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          label: 'Settings',
          href: '/techadmin/settings',
          icon: Settings,
          description: 'System settings',
        },
        {
          label: 'Audit Log',
          href: '/techadmin/audit',
          icon: Shield,
          description: 'Activity audit log',
        },
        {
          label: 'Diagnostics',
          href: '/diagnostic',
          icon: UserCog,
          description: 'System diagnostics',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        commonItems.profile,
        commonItems.notifications,
        commonItems.help,
      ],
    },
  ],
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get navigation for a specific role
 */
export function getNavigationForRole(role: UserRole): NavigationGroup[] {
  return NAVIGATION_CONFIG[role] || NAVIGATION_CONFIG[UserRole.CITIZEN];
}

/**
 * Get all navigation items (flattened) for a role
 */
export function getFlatNavigationForRole(role: UserRole): NavigationItem[] {
  const groups = getNavigationForRole(role);
  return groups.flatMap((group) => group.items);
}

/**
 * Find navigation item by href
 */
export function findNavigationItem(
  role: UserRole,
  href: string
): NavigationItem | undefined {
  const items = getFlatNavigationForRole(role);
  return items.find((item) => item.href === href);
}

/**
 * Check if path matches navigation item
 */
export function isNavigationItemActive(
  item: NavigationItem,
  currentPath: string
): boolean {
  if (item.href === currentPath) return true;
  
  // Check if current path starts with item href (for nested routes)
  if (currentPath.startsWith(item.href + '/')) return true;
  
  // Check children
  if (item.children) {
    return item.children.some((child) =>
      isNavigationItemActive(child, currentPath)
    );
  }
  
  return false;
}
