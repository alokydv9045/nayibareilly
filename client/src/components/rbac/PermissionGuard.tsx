/**
 * Permission Guard Components
 * Components for conditional rendering based on permissions
 */

'use client';

import React, { ReactNode } from 'react';
import {
  usePermission,
  useUserRoles,
  useGuard,
  Resource,
  Action,
  UserRole,
  GuardFunction,
  GuardContext,
  PermissionContext,
  hasPermission as checkPermission,
} from '@/lib/rbac';

// ============================================================================
// Can Component - Permission-based rendering
// ============================================================================

export interface CanProps {
  perform: Action;
  on: Resource;
  context?: Partial<PermissionContext>;
  children: ReactNode;
  fallback?: ReactNode;
  showReason?: boolean;
}

/**
 * Render children only if user has permission
 * @example
 * <Can perform={Action.UPDATE} on={Resource.ISSUE} context={{ resource: issue }}>
 *   <EditButton />
 * </Can>
 */
export function Can({
  perform,
  on,
  context,
  children,
  fallback = null,
  showReason = false,
}: CanProps) {
  const { allowed, checking, reason } = usePermission(on, perform, context);

  if (checking) {
    return <>{fallback}</>;
  }

  if (!allowed) {
    if (showReason && reason) {
      return (
        <div className="text-sm text-muted-foreground italic">{reason}</div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// Cannot Component - Inverse of Can
// ============================================================================

export interface CannotProps extends Omit<CanProps, 'fallback'> {
  otherwise?: ReactNode;
}

/**
 * Render children only if user does NOT have permission
 * @example
 * <Cannot perform={Action.DELETE} on={Resource.ISSUE}>
 *   <p>You cannot delete this issue</p>
 * </Cannot>
 */
export function Cannot({
  perform,
  on,
  context,
  children,
  otherwise = null,
}: CannotProps) {
  const { allowed, checking } = usePermission(on, perform, context);

  if (checking) {
    return <>{otherwise}</>;
  }

  if (allowed) {
    return <>{otherwise}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// HasRole Component - Role-based rendering
// ============================================================================

export interface HasRoleProps {
  role: UserRole | UserRole[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Render children only if user has the specified role(s)
 * @example
 * <HasRole role={UserRole.SUPER_ADMIN}>
 *   <AdminPanel />
 * </HasRole>
 */
export function HasRole({
  role,
  requireAll = false,
  children,
  fallback = null,
}: HasRoleProps) {
  const { roles, isLoading } = useUserRoles();

  if (isLoading) {
    return <>{fallback}</>;
  }

  const requiredRoles = Array.isArray(role) ? role : [role];

  const hasPermission = requireAll
    ? requiredRoles.every((r) => roles.includes(r))
    : requiredRoles.some((r) => roles.includes(r));

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// Guard Component - Custom guard function
// ============================================================================

export interface GuardProps {
  guard: GuardFunction;
  context?: GuardContext;
  children: ReactNode;
  fallback?: ReactNode;
  showReason?: boolean;
}

/**
 * Render children only if custom guard passes
 * @example
 * <Guard guard={requireAdmin}>
 *   <AdminSettings />
 * </Guard>
 */
export function Guard({
  guard,
  context,
  children,
  fallback = null,
  showReason = false,
}: GuardProps) {
  const { allowed, checking, reason } = useGuard(guard, context);

  if (checking) {
    return <>{fallback}</>;
  }

  if (!allowed) {
    if (showReason && reason) {
      return (
        <div className="text-sm text-muted-foreground italic">{reason}</div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// IsAuthenticated Component
// ============================================================================

export interface IsAuthenticatedProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Render children only if user is authenticated
 * @example
 * <IsAuthenticated fallback={<LoginPrompt />}>
 *   <Dashboard />
 * </IsAuthenticated>
 */
export function IsAuthenticated({
  children,
  fallback = null,
}: IsAuthenticatedProps) {
  const { roles, isLoading } = useUserRoles();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (roles.length === 0) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// IsGuest Component (not authenticated)
// ============================================================================

export interface IsGuestProps {
  children: ReactNode;
  otherwise?: ReactNode;
}

/**
 * Render children only if user is NOT authenticated
 * @example
 * <IsGuest>
 *   <LoginButton />
 * </IsGuest>
 */
export function IsGuest({ children, otherwise = null }: IsGuestProps) {
  const { roles, isLoading } = useUserRoles();

  if (isLoading) {
    return <>{otherwise}</>;
  }

  if (roles.length > 0) {
    return <>{otherwise}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// CanAny Component - Check multiple permissions
// ============================================================================

export interface CanAnyProps {
  checks: Array<{ perform: Action; on: Resource; context?: Partial<PermissionContext> }>;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Render children if user has ANY of the specified permissions
 * @example
 * <CanAny checks={[
 *   { perform: Action.UPDATE, on: Resource.ISSUE },
 *   { perform: Action.DELETE, on: Resource.ISSUE }
 * ]}>
 *   <IssueActions />
 * </CanAny>
 */
export function CanAny({ checks, children, fallback = null }: CanAnyProps) {
  const { roles } = useUserRoles();

  if (roles.length === 0) {
    return <>{fallback}</>;
  }

  const hasAnyPermission = checks.some((check) =>
    checkPermission(roles, check.on, check.perform, check.context)
  );

  if (!hasAnyPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// CanAll Component - Check multiple permissions
// ============================================================================

export interface CanAllProps extends CanAnyProps {}

/**
 * Render children only if user has ALL of the specified permissions
 * @example
 * <CanAll checks={[
 *   { perform: Action.UPDATE, on: Resource.ISSUE },
 *   { perform: Action.APPROVE, on: Resource.ISSUE }
 * ]}>
 *   <AdvancedActions />
 * </CanAll>
 */
export function CanAll({ checks, children, fallback = null }: CanAllProps) {
  const { roles } = useUserRoles();

  if (roles.length === 0) {
    return <>{fallback}</>;
  }

  const hasAllPermissions = checks.every((check) =>
    checkPermission(roles, check.on, check.perform, check.context)
  );

  if (!hasAllPermissions) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
