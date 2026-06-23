/**
 * Permission Hooks
 * React hooks for checking permissions in components
 */

'use client';

import { useMemo } from 'react';
import { useSession } from '@/hooks/useSession';
import { 
  UserRole, 
  normalizeRoles, 
  getUserRoleInfo,
  canUserAccessRoute,
  getRoleDashboardPath,
} from '../roles';
import {
  Resource,
  Action,
  hasPermission,
  getAllowedActions,
  PermissionContext,
} from '../permissions';
import {
  GuardFunction,
  PermissionCheckResult,
  evaluateGuard,
  GuardContext,
} from '../guards';

// ============================================================================
// Hook: useUserRoles
// ============================================================================

export interface UseUserRolesResult {
  roles: UserRole[];
  primaryRole: UserRole;
  canSwitchRoles: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
  isLoading: boolean;
}

/**
 * Hook to get current user's roles and role-related utilities
 */
export function useUserRoles(): UseUserRolesResult {
  const { user, isLoading } = useSession();

  return useMemo(() => {
    const roles = user?.roles ? normalizeRoles(user.roles) : [];
    const roleInfo = getUserRoleInfo(user?.roles || []);

    return {
      roles,
      primaryRole: roleInfo.primaryRole,
      canSwitchRoles: roleInfo.canSwitchRoles,
      hasRole: (role: UserRole) => roles.includes(role),
      hasAnyRole: (requiredRoles: UserRole[]) =>
        requiredRoles.some((r) => roles.includes(r)),
      hasAllRoles: (requiredRoles: UserRole[]) =>
        requiredRoles.every((r) => roles.includes(r)),
      isLoading,
    };
  }, [user?.roles, isLoading]);
}

// ============================================================================
// Hook: usePermission
// ============================================================================

export interface UsePermissionResult {
  allowed: boolean;
  checking: boolean;
  reason?: string;
}

/**
 * Hook to check if user has permission for a specific action on a resource
 */
export function usePermission(
  resource: Resource,
  action: Action,
  context?: Partial<PermissionContext>
): UsePermissionResult {
  const { user, isLoading } = useSession();
  const { roles } = useUserRoles();

  return useMemo(() => {
    if (isLoading) {
      return { allowed: false, checking: true };
    }

    if (!user || roles.length === 0) {
      return {
        allowed: false,
        checking: false,
        reason: 'Not authenticated',
      };
    }

    const fullContext: Partial<PermissionContext> = {
      userId: user.id,
      userRoles: roles,
      ...context,
    };

    const allowed = hasPermission(roles, resource, action, fullContext);

    return {
      allowed,
      checking: false,
      reason: allowed ? undefined : `Permission denied: ${action} on ${resource}`,
    };
  }, [user, roles, resource, action, context, isLoading]);
}

// ============================================================================
// Hook: usePermissions (Bulk)
// ============================================================================

export interface PermissionCheck {
  resource: Resource;
  action: Action;
  context?: Partial<PermissionContext>;
}

export type UsePermissionsResult = Record<string, UsePermissionResult>;

/**
 * Hook to check multiple permissions at once
 */
export function usePermissions(
  checks: PermissionCheck[]
): UsePermissionsResult {
  const { user, isLoading } = useSession();
  const { roles } = useUserRoles();

  return useMemo(() => {
    const results: UsePermissionsResult = {};

    if (isLoading) {
      checks.forEach((check, index) => {
        results[`${check.resource}_${check.action}_${index}`] = {
          allowed: false,
          checking: true,
        };
      });
      return results;
    }

    if (!user || roles.length === 0) {
      checks.forEach((check, index) => {
        results[`${check.resource}_${check.action}_${index}`] = {
          allowed: false,
          checking: false,
          reason: 'Not authenticated',
        };
      });
      return results;
    }

    checks.forEach((check, index) => {
      const fullContext: Partial<PermissionContext> = {
        userId: user.id,
        userRoles: roles,
        ...check.context,
      };

      const allowed = hasPermission(
        roles,
        check.resource,
        check.action,
        fullContext
      );

      results[`${check.resource}_${check.action}_${index}`] = {
        allowed,
        checking: false,
        reason: allowed
          ? undefined
          : `Permission denied: ${check.action} on ${check.resource}`,
      };
    });

    return results;
  }, [user, roles, checks, isLoading]);
}

// ============================================================================
// Hook: useAllowedActions
// ============================================================================

/**
 * Hook to get all actions user can perform on a resource
 */
export function useAllowedActions(
  resource: Resource,
  context?: Partial<PermissionContext>
): {
  actions: Action[];
  checking: boolean;
  canPerform: (action: Action) => boolean;
} {
  const { user, isLoading } = useSession();
  const { roles } = useUserRoles();

  return useMemo(() => {
    if (isLoading) {
      return {
        actions: [],
        checking: true,
        canPerform: () => false,
      };
    }

    if (!user || roles.length === 0) {
      return {
        actions: [],
        checking: false,
        canPerform: () => false,
      };
    }

    const fullContext: Partial<PermissionContext> = {
      userId: user.id,
      userRoles: roles,
      ...context,
    };

    const actions = getAllowedActions(roles, resource, fullContext);

    return {
      actions,
      checking: false,
      canPerform: (action: Action) => actions.includes(action),
    };
  }, [user, roles, resource, context, isLoading]);
}

// ============================================================================
// Hook: useGuard
// ============================================================================

/**
 * Hook to evaluate a guard function
 */
export function useGuard(
  guard: GuardFunction,
  context?: GuardContext
): PermissionCheckResult & { checking: boolean } {
  const { user, isLoading } = useSession();
  const { roles } = useUserRoles();

  return useMemo(() => {
    if (isLoading) {
      return {
        allowed: false,
        checking: true,
      };
    }

    if (!user || roles.length === 0) {
      return {
        allowed: false,
        checking: false,
        reason: 'Not authenticated',
      };
    }

    const result = evaluateGuard(guard, roles, context);

    return {
      ...result,
      checking: false,
    };
  }, [user, roles, guard, context, isLoading]);
}

// ============================================================================
// Hook: useCanAccessRoute
// ============================================================================

/**
 * Hook to check if user can access a specific route
 */
export function useCanAccessRoute(path: string): {
  canAccess: boolean;
  checking: boolean;
  redirectTo?: string;
} {
  const { user, isLoading } = useSession();
  const { roles, primaryRole } = useUserRoles();

  return useMemo(() => {
    if (isLoading) {
      return { canAccess: false, checking: true };
    }

    if (!user || roles.length === 0) {
      return {
        canAccess: false,
        checking: false,
        redirectTo: '/login',
      };
    }

    const canAccess = canUserAccessRoute(roles, path);

    return {
      canAccess,
      checking: false,
      redirectTo: canAccess ? undefined : getRoleDashboardPath(primaryRole),
    };
  }, [user, roles, primaryRole, path, isLoading]);
}

// ============================================================================
// Hook: useResourceOwnership
// ============================================================================

export interface UseResourceOwnershipResult {
  isOwner: boolean;
  canModify: boolean;
  canDelete: boolean;
  checking: boolean;
}

/**
 * Hook to check resource ownership and modification permissions
 */
export function useResourceOwnership(
  resourceOwnerId?: string
): UseResourceOwnershipResult {
  const { user, isLoading } = useSession();
  const { roles } = useUserRoles();

  return useMemo(() => {
    if (isLoading) {
      return {
        isOwner: false,
        canModify: false,
        canDelete: false,
        checking: true,
      };
    }

    if (!user) {
      return {
        isOwner: false,
        canModify: false,
        canDelete: false,
        checking: false,
      };
    }

    const isOwner = user.id === resourceOwnerId;

    // Admins can always modify/delete
    const isAdmin = roles.some((role) =>
      [UserRole.DEPT_ADMIN, UserRole.MAYOR, UserRole.TECH_ADMIN].includes(role)
    );

    return {
      isOwner,
      canModify: isOwner || isAdmin,
      canDelete: isAdmin, // Only admins can delete
      checking: false,
    };
  }, [user, roles, resourceOwnerId, isLoading]);
}
