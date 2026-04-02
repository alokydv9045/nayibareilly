/**
 * Type-Safe Permission Guards
 * Higher-order components and utilities for permission-based rendering
 */

import { ReactNode } from 'react';
import { UserRole } from './roles';
import { Resource, Action, hasPermission, PermissionContext } from './permissions';

// ============================================================================
// Guard Configuration
// ============================================================================

export interface GuardConfig {
  roles?: UserRole[];
  resource?: Resource;
  action?: Action;
  context?: Partial<PermissionContext>;
  fallback?: ReactNode;
  redirectTo?: string;
}

// ============================================================================
// Permission Check Result
// ============================================================================

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

// ============================================================================
// Role-Based Guards
// ============================================================================

/**
 * Check if user has any of the required roles
 */
export function requireAnyRole(
  userRoles: UserRole[],
  requiredRoles: UserRole[]
): PermissionCheckResult {
  const hasRole = requiredRoles.some((role) => userRoles.includes(role));

  return {
    allowed: hasRole,
    reason: hasRole
      ? undefined
      : `Requires one of: ${requiredRoles.join(', ')}`,
  };
}

/**
 * Check if user has all of the required roles
 */
export function requireAllRoles(
  userRoles: UserRole[],
  requiredRoles: UserRole[]
): PermissionCheckResult {
  const hasAllRoles = requiredRoles.every((role) => userRoles.includes(role));

  return {
    allowed: hasAllRoles,
    reason: hasAllRoles
      ? undefined
      : `Requires all of: ${requiredRoles.join(', ')}`,
  };
}

/**
 * Check if user does NOT have any of the excluded roles
 */
export function excludeRoles(
  userRoles: UserRole[],
  excludedRoles: UserRole[]
): PermissionCheckResult {
  const hasExcludedRole = excludedRoles.some((role) => userRoles.includes(role));

  return {
    allowed: !hasExcludedRole,
    reason: hasExcludedRole
      ? `Cannot have roles: ${excludedRoles.join(', ')}`
      : undefined,
  };
}

// ============================================================================
// Resource-Action Guards
// ============================================================================

/**
 * Check if user can perform an action on a resource
 */
export function requirePermission(
  userRoles: UserRole[],
  resource: Resource,
  action: Action,
  context?: Partial<PermissionContext>
): PermissionCheckResult {
  const allowed = hasPermission(userRoles, resource, action, context);

  return {
    allowed,
    reason: allowed
      ? undefined
      : `Permission denied: ${action} on ${resource}`,
  };
}

// ============================================================================
// Composite Guards
// ============================================================================

export type GuardContext = Record<string, unknown>;
export type GuardFunction = (userRoles: UserRole[], context?: GuardContext) => PermissionCheckResult;

/**
 * Combine multiple guards with AND logic (all must pass)
 */
export function combineGuardsAnd(...guards: GuardFunction[]): GuardFunction {
  return (userRoles: UserRole[], context?: GuardContext) => {
    for (const guard of guards) {
      const result = guard(userRoles, context);
      if (!result.allowed) {
        return result;
      }
    }
    return { allowed: true };
  };
}

/**
 * Combine multiple guards with OR logic (at least one must pass)
 */
export function combineGuardsOr(...guards: GuardFunction[]): GuardFunction {
  return (userRoles: UserRole[], context?: GuardContext) => {
    const reasons: string[] = [];

    for (const guard of guards) {
      const result = guard(userRoles, context);
      if (result.allowed) {
        return { allowed: true };
      }
      if (result.reason) {
        reasons.push(result.reason);
      }
    }

    return {
      allowed: false,
      reason: `All guards failed: ${reasons.join('; ')}`,
    };
  };
}

// ============================================================================
// Common Guard Presets
// ============================================================================

/**
 * Require authentication (any role)
 */
export const requireAuth: GuardFunction = (userRoles) => ({
  allowed: userRoles.length > 0,
  reason: userRoles.length === 0 ? 'Authentication required' : undefined,
});

/**
 * Require admin role (dept_admin, mayor, or super_admin)
 */
export const requireAdmin: GuardFunction = (userRoles) =>
  requireAnyRole(userRoles, [
    UserRole.DEPT_ADMIN,
    UserRole.MAYOR,
    UserRole.SUPER_ADMIN,
  ]);

/**
 * Require super admin role only
 */
export const requireSuperAdmin: GuardFunction = (userRoles) =>
  requireAnyRole(userRoles, [UserRole.SUPER_ADMIN]);

/**
 * Require moderator or higher
 */
export const requireModerator: GuardFunction = (userRoles) =>
  requireAnyRole(userRoles, [
    UserRole.MODERATOR,
    UserRole.STAFF,
    UserRole.DEPT_ADMIN,
    UserRole.MAYOR,
    UserRole.SUPER_ADMIN,
  ]);

/**
 * Require staff or higher
 */
export const requireStaff: GuardFunction = (userRoles) =>
  requireAnyRole(userRoles, [
    UserRole.STAFF,
    UserRole.DEPT_ADMIN,
    UserRole.MAYOR,
    UserRole.SUPER_ADMIN,
  ]);

/**
 * Only citizens (exclude all admin roles)
 */
export const requireCitizenOnly: GuardFunction = (userRoles) =>
  requireAnyRole(userRoles, [UserRole.CITIZEN]);

// ============================================================================
// Ownership Guards
// ============================================================================

/**
 * Check if user owns the resource
 */
export function requireOwnership(
  userId: string,
  resourceOwnerId?: string
): PermissionCheckResult {
  const isOwner = resourceOwnerId === userId;

  return {
    allowed: isOwner,
    reason: isOwner ? undefined : 'You do not own this resource',
  };
}

/**
 * Check if user owns resource OR has admin role
 */
export const requireOwnershipOrAdmin = (
  userRoles: UserRole[],
  context: { userId: string; resourceOwnerId?: string }
): PermissionCheckResult => {
  const ownershipCheck = requireOwnership(context.userId, context.resourceOwnerId);
  if (ownershipCheck.allowed) return ownershipCheck;

  const adminCheck = requireAdmin(userRoles);
  if (adminCheck.allowed) return adminCheck;

  return {
    allowed: false,
    reason: 'Must be owner or admin',
  };
};

// ============================================================================
// Department Guards
// ============================================================================

/**
 * Check if user belongs to a specific department
 */
export function requireDepartment(
  userDepartmentId?: string,
  requiredDepartmentId?: string
): PermissionCheckResult {
  const matches = userDepartmentId === requiredDepartmentId;

  return {
    allowed: matches,
    reason: matches ? undefined : 'Department mismatch',
  };
}

/**
 * Check if user is in the same department as the resource OR is admin
 */
export const requireSameDepartmentOrAdmin = (
  userRoles: UserRole[],
  context: { userDepartmentId?: string; resourceDepartmentId?: string }
): PermissionCheckResult => {
  const deptCheck = requireDepartment(
    context.userDepartmentId,
    context.resourceDepartmentId
  );
  if (deptCheck.allowed) return deptCheck;

  const adminCheck = requireAdmin(userRoles);
  if (adminCheck.allowed) return adminCheck;

  return {
    allowed: false,
    reason: 'Must be in same department or admin',
  };
};

// ============================================================================
// Status-Based Guards
// ============================================================================

/**
 * Check if resource is in one of the allowed statuses
 */
export function requireStatus(
  resourceStatus?: string,
  allowedStatuses?: string[]
): PermissionCheckResult {
  if (!resourceStatus || !allowedStatuses) {
    return { allowed: false, reason: 'Missing status information' };
  }

  const allowed = allowedStatuses.includes(resourceStatus);

  return {
    allowed,
    reason: allowed
      ? undefined
      : `Status must be one of: ${allowedStatuses.join(', ')}`,
  };
}

// ============================================================================
// Time-Based Guards
// ============================================================================

/**
 * Check if action is within allowed time window
 */
export function requireTimeWindow(
  createdAt?: Date | string,
  windowHours?: number
): PermissionCheckResult {
  if (!createdAt || !windowHours) {
    return { allowed: true }; // If no time restriction specified, allow
  }

  const created = new Date(createdAt);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

  const allowed = hoursSinceCreation <= windowHours;

  return {
    allowed,
    reason: allowed
      ? undefined
      : `Action must be performed within ${windowHours} hours of creation`,
  };
}

// ============================================================================
// Feature Flag Guards
// ============================================================================

/**
 * Check if a feature is enabled
 */
export function requireFeatureFlag(
  featureFlags: Record<string, boolean>,
  flagName: string
): PermissionCheckResult {
  const enabled = featureFlags[flagName] === true;

  return {
    allowed: enabled,
    reason: enabled ? undefined : `Feature '${flagName}' is not enabled`,
  };
}

// ============================================================================
// Guard Evaluation
// ============================================================================

/**
 * Evaluate a guard function and return result
 */
export function evaluateGuard(
  guard: GuardFunction,
  userRoles: UserRole[],
  context?: GuardContext
): PermissionCheckResult {
  try {
    return guard(userRoles, context);
  } catch (error) {
    return {
      allowed: false,
      reason: `Guard evaluation error: ${error}`,
    };
  }
}

/**
 * Evaluate multiple guards and return combined result
 */
export function evaluateGuards(
  guards: GuardFunction[],
  userRoles: UserRole[],
  context?: GuardContext,
  mode: 'AND' | 'OR' = 'AND'
): PermissionCheckResult {
  if (guards.length === 0) {
    return { allowed: true };
  }

  if (mode === 'AND') {
    return evaluateGuard(combineGuardsAnd(...guards), userRoles, context);
  } else {
    return evaluateGuard(combineGuardsOr(...guards), userRoles, context);
  }
}
