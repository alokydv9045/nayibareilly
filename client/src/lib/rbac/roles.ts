/**
 * Role Management System
 * Centralized role definitions, hierarchy, and utilities
 */

// ============================================================================
// Role Definitions
// ============================================================================

export enum UserRole {
  CITIZEN = 'citizen',
  MODERATOR = 'moderator',
  STAFF = 'staff',
  DEPT_ADMIN = 'dept_admin',
  MAYOR = 'mayor',
  SUPER_ADMIN = 'super_admin',
}

export const USER_ROLES = Object.values(UserRole);

// ============================================================================
// Role Metadata
// ============================================================================

export interface RoleMetadata {
  name: UserRole;
  label: string;
  description: string;
  level: number; // Hierarchy level (higher = more authority)
  icon: string;
  color: string;
  dashboardPath: string;
}

export const ROLE_METADATA: Record<UserRole, RoleMetadata> = {
  [UserRole.CITIZEN]: {
    name: UserRole.CITIZEN,
    label: 'Citizen',
    description: 'Report and track civic issues',
    level: 1,
    icon: '👤',
    color: '#3B82F6', // emerald-500
    dashboardPath: '/', // Citizens go to home page, not dashboard
  },
  [UserRole.MODERATOR]: {
    name: UserRole.MODERATOR,
    label: 'Moderator',
    description: 'Review and approve citizen reports',
    level: 2,
    icon: '🛡️',
    color: '#8B5CF6', // violet-500
    dashboardPath: '/moderator/dashboard',
  },
  [UserRole.STAFF]: {
    name: UserRole.STAFF,
    label: 'Field Staff',
    description: 'Resolve assigned issues',
    level: 3,
    icon: '🔧',
    color: '#10B981', // green-500
    dashboardPath: '/staff',
  },
  [UserRole.DEPT_ADMIN]: {
    name: UserRole.DEPT_ADMIN,
    label: 'Department Admin',
    description: 'Manage department staff and issues',
    level: 4,
    icon: '🏢',
    color: '#F59E0B', // amber-500
    dashboardPath: '/department',
  },
  [UserRole.MAYOR]: {
    name: UserRole.MAYOR,
    label: 'Mayor',
    description: 'Executive oversight and approvals',
    level: 5,
    icon: '👨‍💼',
    color: '#EF4444', // red-500
    dashboardPath: '/mayor',
  },
  [UserRole.SUPER_ADMIN]: {
    name: UserRole.SUPER_ADMIN,
    label: 'Super Admin',
    description: 'Full system administration',
    level: 6,
    icon: '⚡',
    color: '#DC2626', // red-600
    dashboardPath: '/superadmin',
  },
};

// ============================================================================
// Role Hierarchy Utilities
// ============================================================================

/**
 * Check if a role has higher or equal authority than another role
 */
export function hasHigherOrEqualAuthority(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  return (
    ROLE_METADATA[userRole].level >= ROLE_METADATA[requiredRole].level
  );
}

/**
 * Check if a role has higher authority than another role
 */
export function hasHigherAuthority(
  userRole: UserRole,
  targetRole: UserRole
): boolean {
  return ROLE_METADATA[userRole].level > ROLE_METADATA[targetRole].level;
}

/**
 * Get the highest authority role from an array of roles
 */
export function getHighestRole(roles: UserRole[]): UserRole | null {
  if (!roles || roles.length === 0) return null;

  return roles.reduce((highest, current) => {
    return ROLE_METADATA[current].level > ROLE_METADATA[highest].level
      ? current
      : highest;
  });
}

/**
 * Get all roles below a certain authority level
 */
export function getRolesBelowLevel(level: number): UserRole[] {
  return USER_ROLES.filter((role) => ROLE_METADATA[role].level < level);
}

/**
 * Get all roles at or below a certain authority level
 */
export function getRolesAtOrBelowLevel(level: number): UserRole[] {
  return USER_ROLES.filter((role) => ROLE_METADATA[role].level <= level);
}

/**
 * Normalize role string to UserRole enum (case-insensitive)
 */
export function normalizeRole(role: string): UserRole | null {
  const normalized = role.toLowerCase();
  return USER_ROLES.find((r) => r === normalized) || null;
}

/**
 * Normalize array of role strings to UserRole enums
 */
export function normalizeRoles(roles: string[]): UserRole[] {
  return roles
    .map(normalizeRole)
    .filter((role): role is UserRole => role !== null);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  return requiredRoles.every((role) => userRoles.includes(role));
}

// ============================================================================
// Role Display Utilities
// ============================================================================

/**
 * Get display label for a role
 */
export function getRoleLabel(role: UserRole): string {
  return ROLE_METADATA[role]?.label || role;
}

/**
 * Get dashboard path for a role
 */
export function getRoleDashboardPath(role: UserRole): string {
  return ROLE_METADATA[role]?.dashboardPath || '/'; // Default to homepage for unknown roles
}

/**
 * Get role icon
 */
export function getRoleIcon(role: UserRole): string {
  return ROLE_METADATA[role]?.icon || '👤';
}

/**
 * Get role color
 */
export function getRoleColor(role: UserRole): string {
  return ROLE_METADATA[role]?.color || '#6B7280';
}

// ============================================================================
// Multi-Role Management
// ============================================================================

export interface UserRoleInfo {
  roles: UserRole[];
  primaryRole: UserRole;
  canSwitchRoles: boolean;
}

/**
 * Determine primary role for a user with multiple roles
 * Uses highest authority role by default
 */
export function determinePrimaryRole(
  roles: UserRole[],
  preferredRole?: UserRole
): UserRole {
  // If preferred role exists and user has it, use it
  if (preferredRole && roles.includes(preferredRole)) {
    return preferredRole;
  }

  // Otherwise, use highest authority role
  return getHighestRole(roles) || UserRole.CITIZEN;
}

/**
 * Get user role information
 */
export function getUserRoleInfo(
  roles: string[],
  preferredRole?: string
): UserRoleInfo {
  const normalizedRoles = normalizeRoles(roles);
  const normalizedPreferred = preferredRole
    ? normalizeRole(preferredRole)
    : undefined;

  return {
    roles: normalizedRoles,
    primaryRole: determinePrimaryRole(normalizedRoles, normalizedPreferred || undefined),
    canSwitchRoles: normalizedRoles.length > 1,
  };
}

// ============================================================================
// Role-Based Route Mapping
// ============================================================================

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  [UserRole.CITIZEN]: [
    '/',
    '/report',
    '/my-issues',
    '/reports/:id',
    '/profile',
    '/notifications',
    '/help',
  ],
  [UserRole.MODERATOR]: [
    '/moderator',
    '/moderator/dashboard',
    '/moderator/pending', 
    '/moderator/analytics',
    '/moderator/history',
    '/reports/:id',
    '/profile',
    '/notifications',
    '/help',
  ],
  [UserRole.STAFF]: [
    '/staff',
    '/staff/assigned',
    '/staff/in-progress',
    '/staff/completed',
    '/reports/:id',
    '/profile',
    '/notifications',
  ],
  [UserRole.DEPT_ADMIN]: [
    '/department',
    '/department/staff',
    '/department/issues',
    '/department/analytics',
    '/reports/:id',
    '/profile',
    '/notifications',
  ],
  [UserRole.MAYOR]: [
    '/mayor',
    '/mayor/overview',
    '/mayor/departments',
    '/mayor/analytics',
    '/mayor/approvals',
    '/reports/:id',
    '/profile',
    '/notifications',
  ],
  [UserRole.SUPER_ADMIN]: [
    '/superadmin',
    '/superadmin/users',
    '/superadmin/departments',
    '/superadmin/settings',
    '/superadmin/analytics',
    '/superadmin/audit',
    '/reports/:id',
    '/profile',
    '/notifications',
  ],
};

/**
 * Check if a role has access to a specific route
 */
export function canAccessRoute(role: UserRole, path: string): boolean {
  const allowedRoutes = ROLE_ROUTES[role] || [];

  // Exact match
  if (allowedRoutes.includes(path)) return true;

  // Pattern match (e.g., /issue/:id matches /issue/123)
  return allowedRoutes.some((route) => {
    const pattern = route.replace(/:\w+/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(path);
  });
}

/**
 * Check if any of user's roles can access a route
 */
export function canUserAccessRoute(roles: UserRole[], path: string): boolean {
  return roles.some((role) => canAccessRoute(role, path));
}
