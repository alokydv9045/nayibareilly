/**
 * Permission Management System
 * Centralized permission matrix with type-safe guards
 */

import { UserRole } from './roles';

// ============================================================================
// Resource Definitions
// ============================================================================

export enum Resource {
  // Issue Management
  ISSUE = 'issue',
  ISSUE_COMMENT = 'issue_comment',
  ISSUE_ATTACHMENT = 'issue_attachment',

  // User Management
  USER = 'user',
  USER_PROFILE = 'user_profile',

  // Department Management
  DEPARTMENT = 'department',
  STAFF_MEMBER = 'staff_member',

  // Category Management
  CATEGORY = 'category',

  // Analytics & Reports
  ANALYTICS = 'analytics',
  REPORT = 'report',

  // System Management
  SYSTEM_SETTINGS = 'system_settings',
  AUDIT_LOG = 'audit_log',

  // Notifications
  NOTIFICATION = 'notification',
}

// ============================================================================
// Action Definitions
// ============================================================================

export enum Action {
  // CRUD Operations
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',

  // Issue-Specific Actions
  APPROVE = 'approve',
  REJECT = 'reject',
  ASSIGN = 'assign',
  REASSIGN = 'reassign',
  RESOLVE = 'resolve',
  VERIFY = 'verify',
  REOPEN = 'reopen',
  ESCALATE = 'escalate',
  CLOSE = 'close',

  // User-Specific Actions
  INVITE = 'invite',
  SUSPEND = 'suspend',
  ACTIVATE = 'activate',
  CHANGE_ROLE = 'change_role',

  // Analytics Actions
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_DATA = 'export_data',

  // System Actions
  CONFIGURE = 'configure',
  AUDIT = 'audit',
  MANAGE = 'manage',
}

// ============================================================================
// Permission Definition
// ============================================================================

export interface Permission {
  resource: Resource;
  action: Action;
  roles: UserRole[];
  conditions?: PermissionCondition[];
}

export type PermissionCondition = (context: PermissionContext) => boolean;

// Resource interfaces for type safety
export interface IssueResource {
  id: string;
  reporterId: string;
  status: string;
  departmentId?: string;
  assignedToId?: string;
}

export interface UserResource {
  id: string;
  userId?: string;
}

export interface DepartmentResource {
  id: string;
  departmentId: string;
}

export interface NotificationResource {
  id: string;
  userId: string;
}

export interface PermissionContext {
  userId: string;
  userRoles: UserRole[];
  resource?: IssueResource | UserResource | DepartmentResource | NotificationResource | unknown;
  departmentId?: string;
  [key: string]: unknown;
}

// Helper functions for type-safe resource access
function isIssueResource(resource: unknown): resource is IssueResource {
  return typeof resource === 'object' && resource !== null && 'reporterId' in resource;
}

function isUserResource(resource: unknown): resource is UserResource {
  return typeof resource === 'object' && resource !== null && ('userId' in resource || 'id' in resource);
}

function isDepartmentResource(resource: unknown): resource is DepartmentResource {
  return typeof resource === 'object' && resource !== null && 'departmentId' in resource;
}

// ============================================================================
// Permission Matrix
// ============================================================================

export const PERMISSION_MATRIX: Permission[] = [
  // ========================================================================
  // ISSUE PERMISSIONS
  // ========================================================================

  // All authenticated users can read issues
  {
    resource: Resource.ISSUE,
    action: Action.READ,
    roles: [
      UserRole.CITIZEN,
      UserRole.MODERATOR,
      UserRole.STAFF,
      UserRole.DEPT_ADMIN,
      UserRole.MAYOR,
      UserRole.SUPER_ADMIN,
    ],
  },

  // Citizens can create issues
  {
    resource: Resource.ISSUE,
    action: Action.CREATE,
    roles: [UserRole.CITIZEN, UserRole.SUPER_ADMIN],
  },

  // Citizens can update their own issues (when status = PENDING)
  {
    resource: Resource.ISSUE,
    action: Action.UPDATE,
    roles: [UserRole.CITIZEN],
    conditions: [
      (ctx) => isIssueResource(ctx.resource) && ctx.resource.reporterId === ctx.userId,
      (ctx) => isIssueResource(ctx.resource) && ctx.resource.status === 'PENDING',
    ],
  },

  // Moderators can approve/reject issues
  {
    resource: Resource.ISSUE,
    action: Action.APPROVE,
    roles: [UserRole.MODERATOR, UserRole.SUPER_ADMIN],
  },
  {
    resource: Resource.ISSUE,
    action: Action.REJECT,
    roles: [UserRole.MODERATOR, UserRole.SUPER_ADMIN],
  },

  // Department admins can assign issues to staff
  {
    resource: Resource.ISSUE,
    action: Action.ASSIGN,
    roles: [UserRole.DEPT_ADMIN, UserRole.SUPER_ADMIN],
    conditions: [
      (ctx) => isIssueResource(ctx.resource) && ctx.resource.departmentId === ctx.departmentId,
    ],
  },

  // Staff can update assigned issues
  {
    resource: Resource.ISSUE,
    action: Action.UPDATE,
    roles: [UserRole.STAFF],
    conditions: [
      (ctx) => isIssueResource(ctx.resource) && ctx.resource.assignedToId === ctx.userId,
    ],
  },

  // Staff can resolve assigned issues
  {
    resource: Resource.ISSUE,
    action: Action.RESOLVE,
    roles: [UserRole.STAFF, UserRole.SUPER_ADMIN],
    conditions: [
      (ctx) => isIssueResource(ctx.resource) && ctx.resource.assignedToId === ctx.userId,
    ],
  },

  // Citizens can verify their own issues
  {
    resource: Resource.ISSUE,
    action: Action.VERIFY,
    roles: [UserRole.CITIZEN],
    conditions: [
      (ctx) => isIssueResource(ctx.resource) && ctx.resource.reporterId === ctx.userId,
    ],
  },

  // Department admins and mayors can escalate issues
  {
    resource: Resource.ISSUE,
    action: Action.ESCALATE,
    roles: [UserRole.DEPT_ADMIN, UserRole.MAYOR, UserRole.SUPER_ADMIN],
  },

  // Super admin can delete issues
  {
    resource: Resource.ISSUE,
    action: Action.DELETE,
    roles: [UserRole.SUPER_ADMIN],
  },

  // ========================================================================
  // ISSUE COMMENT PERMISSIONS
  // ========================================================================

  {
    resource: Resource.ISSUE_COMMENT,
    action: Action.CREATE,
    roles: [
      UserRole.CITIZEN,
      UserRole.MODERATOR,
      UserRole.STAFF,
      UserRole.DEPT_ADMIN,
      UserRole.MAYOR,
      UserRole.SUPER_ADMIN,
    ],
  },

  {
    resource: Resource.ISSUE_COMMENT,
    action: Action.UPDATE,
    roles: [
      UserRole.CITIZEN,
      UserRole.MODERATOR,
      UserRole.STAFF,
      UserRole.DEPT_ADMIN,
      UserRole.MAYOR,
      UserRole.SUPER_ADMIN,
    ],
    conditions: [
      (ctx) => isUserResource(ctx.resource) && ctx.resource.userId === ctx.userId,
    ],
  },

  {
    resource: Resource.ISSUE_COMMENT,
    action: Action.DELETE,
    roles: [UserRole.MODERATOR, UserRole.SUPER_ADMIN],
  },

  // ========================================================================
  // USER MANAGEMENT PERMISSIONS
  // ========================================================================

  // Users can read their own profile
  {
    resource: Resource.USER_PROFILE,
    action: Action.READ,
    roles: [
      UserRole.CITIZEN,
      UserRole.MODERATOR,
      UserRole.STAFF,
      UserRole.DEPT_ADMIN,
      UserRole.MAYOR,
      UserRole.SUPER_ADMIN,
    ],
  },

  // Users can update their own profile
  {
    resource: Resource.USER_PROFILE,
    action: Action.UPDATE,
    roles: [
      UserRole.CITIZEN,
      UserRole.MODERATOR,
      UserRole.STAFF,
      UserRole.DEPT_ADMIN,
      UserRole.MAYOR,
      UserRole.SUPER_ADMIN,
    ],
    conditions: [
      (ctx) => isUserResource(ctx.resource) && ctx.resource.id === ctx.userId,
    ],
  },

  // Super admin and mayor can manage all users
  {
    resource: Resource.USER,
    action: Action.READ,
    roles: [UserRole.MAYOR, UserRole.SUPER_ADMIN],
  },
  {
    resource: Resource.USER,
    action: Action.CREATE,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    resource: Resource.USER,
    action: Action.UPDATE,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    resource: Resource.USER,
    action: Action.SUSPEND,
    roles: [UserRole.MAYOR, UserRole.SUPER_ADMIN],
  },
  {
    resource: Resource.USER,
    action: Action.ACTIVATE,
    roles: [UserRole.MAYOR, UserRole.SUPER_ADMIN],
  },
  {
    resource: Resource.USER,
    action: Action.CHANGE_ROLE,
    roles: [UserRole.SUPER_ADMIN],
  },

  // ========================================================================
  // DEPARTMENT MANAGEMENT PERMISSIONS
  // ========================================================================

  // All can read departments
  {
    resource: Resource.DEPARTMENT,
    action: Action.READ,
    roles: [
      UserRole.CITIZEN,
      UserRole.MODERATOR,
      UserRole.STAFF,
      UserRole.DEPT_ADMIN,
      UserRole.MAYOR,
      UserRole.SUPER_ADMIN,
    ],
  },

  // Only super admin can create/update/delete departments
  {
    resource: Resource.DEPARTMENT,
    action: Action.CREATE,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    resource: Resource.DEPARTMENT,
    action: Action.UPDATE,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    resource: Resource.DEPARTMENT,
    action: Action.DELETE,
    roles: [UserRole.SUPER_ADMIN],
  },

  // Department admins can manage their staff
  {
    resource: Resource.STAFF_MEMBER,
    action: Action.READ,
    roles: [UserRole.DEPT_ADMIN, UserRole.MAYOR, UserRole.SUPER_ADMIN],
  },
  {
    resource: Resource.STAFF_MEMBER,
    action: Action.INVITE,
    roles: [UserRole.DEPT_ADMIN, UserRole.SUPER_ADMIN],
    conditions: [
      (ctx) => isDepartmentResource(ctx.resource) && ctx.resource.departmentId === ctx.departmentId,
    ],
  },
  {
    resource: Resource.STAFF_MEMBER,
    action: Action.ASSIGN,
    roles: [UserRole.DEPT_ADMIN, UserRole.SUPER_ADMIN],
    conditions: [
      (ctx) => isDepartmentResource(ctx.resource) && ctx.resource.departmentId === ctx.departmentId,
    ],
  },

  // ========================================================================
  // CATEGORY MANAGEMENT PERMISSIONS
  // ========================================================================

  {
    resource: Resource.CATEGORY,
    action: Action.READ,
    roles: [
      UserRole.CITIZEN,
      UserRole.MODERATOR,
      UserRole.STAFF,
      UserRole.DEPT_ADMIN,
      UserRole.MAYOR,
      UserRole.SUPER_ADMIN,
    ],
  },
  {
    resource: Resource.CATEGORY,
    action: Action.CREATE,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    resource: Resource.CATEGORY,
    action: Action.UPDATE,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    resource: Resource.CATEGORY,
    action: Action.DELETE,
    roles: [UserRole.SUPER_ADMIN],
  },

  // ========================================================================
  // ANALYTICS PERMISSIONS
  // ========================================================================

  {
    resource: Resource.ANALYTICS,
    action: Action.VIEW_ANALYTICS,
    roles: [
      UserRole.DEPT_ADMIN,
      UserRole.MAYOR,
      UserRole.SUPER_ADMIN,
    ],
  },

  {
    resource: Resource.ANALYTICS,
    action: Action.EXPORT_DATA,
    roles: [
      UserRole.MAYOR,
      UserRole.SUPER_ADMIN,
    ],
  },

  // ========================================================================
  // SYSTEM MANAGEMENT PERMISSIONS
  // ========================================================================

  {
    resource: Resource.SYSTEM_SETTINGS,
    action: Action.READ,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    resource: Resource.SYSTEM_SETTINGS,
    action: Action.CONFIGURE,
    roles: [UserRole.SUPER_ADMIN],
  },

  {
    resource: Resource.AUDIT_LOG,
    action: Action.READ,
    roles: [UserRole.MAYOR, UserRole.SUPER_ADMIN],
  },

  // ========================================================================
  // NOTIFICATION PERMISSIONS
  // ========================================================================

  {
    resource: Resource.NOTIFICATION,
    action: Action.READ,
    roles: [
      UserRole.CITIZEN,
      UserRole.MODERATOR,
      UserRole.STAFF,
      UserRole.DEPT_ADMIN,
      UserRole.MAYOR,
      UserRole.SUPER_ADMIN,
    ],
  },
  {
    resource: Resource.NOTIFICATION,
    action: Action.UPDATE,
    roles: [
      UserRole.CITIZEN,
      UserRole.MODERATOR,
      UserRole.STAFF,
      UserRole.DEPT_ADMIN,
      UserRole.MAYOR,
      UserRole.SUPER_ADMIN,
    ],
    conditions: [
      (ctx) => isUserResource(ctx.resource) && ctx.resource.userId === ctx.userId,
    ],
  },
];

// ============================================================================
// Permission Checking Utilities
// ============================================================================

/**
 * Check if a user has permission for a specific action on a resource
 */
export function hasPermission(
  userRoles: UserRole[],
  resource: Resource,
  action: Action,
  context?: Partial<PermissionContext>
): boolean {
  // Find matching permissions
  const matchingPermissions = PERMISSION_MATRIX.filter(
    (perm) => perm.resource === resource && perm.action === action
  );

  if (matchingPermissions.length === 0) {
    return false; // No permission defined = deny by default
  }

  // Check if user has any of the required roles
  return matchingPermissions.some((perm) => {
    // Check role match
    const hasRole = perm.roles.some((role) => userRoles.includes(role));
    if (!hasRole) return false;

    // Check conditions if any
    if (perm.conditions && perm.conditions.length > 0 && context) {
      const fullContext: PermissionContext = {
        userId: context.userId || '',
        userRoles,
        ...context,
      };

      // All conditions must be satisfied
      return perm.conditions.every((condition) => condition(fullContext));
    }

    return true;
  });
}

/**
 * Get all permissions for a user's roles
 */
export function getUserPermissions(roles: UserRole[]): Permission[] {
  return PERMISSION_MATRIX.filter((perm) =>
    perm.roles.some((role) => roles.includes(role))
  );
}

/**
 * Get all actions a user can perform on a resource
 */
export function getAllowedActions(
  userRoles: UserRole[],
  resource: Resource,
  context?: Partial<PermissionContext>
): Action[] {
  const actions = new Set<Action>();

  PERMISSION_MATRIX.forEach((perm) => {
    if (perm.resource === resource) {
      const hasRole = perm.roles.some((role) => userRoles.includes(role));
      if (hasRole) {
        // Check conditions if any
        if (perm.conditions && perm.conditions.length > 0 && context) {
          const fullContext: PermissionContext = {
            userId: context.userId || '',
            userRoles,
            ...context,
          };

          if (perm.conditions.every((condition) => condition(fullContext))) {
            actions.add(perm.action);
          }
        } else if (!perm.conditions || perm.conditions.length === 0) {
          actions.add(perm.action);
        }
      }
    }
  });

  return Array.from(actions);
}

/**
 * Check if user can perform any CRUD operation on a resource
 */
export function canPerformAnyAction(
  userRoles: UserRole[],
  resource: Resource,
  context?: Partial<PermissionContext>
): boolean {
  return getAllowedActions(userRoles, resource, context).length > 0;
}

// ============================================================================
// Bulk Permission Checks
// ============================================================================

export interface BulkPermissionCheck {
  resource: Resource;
  action: Action;
  context?: Partial<PermissionContext>;
}

/**
 * Check multiple permissions at once
 */
export function checkBulkPermissions(
  userRoles: UserRole[],
  checks: BulkPermissionCheck[]
): Record<string, boolean> {
  const results: Record<string, boolean> = {};

  checks.forEach((check, index) => {
    const key = `${check.resource}_${check.action}_${index}`;
    results[key] = hasPermission(
      userRoles,
      check.resource,
      check.action,
      check.context
    );
  });

  return results;
}
