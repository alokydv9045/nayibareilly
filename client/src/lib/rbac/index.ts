/**
 * RBAC (Role-Based Access Control) System
 * Central export file for all RBAC functionality
 */

// Role management
export {
  UserRole,
  USER_ROLES,
  ROLE_METADATA,
  type RoleMetadata,
  type UserRoleInfo,
  hasHigherOrEqualAuthority,
  hasHigherAuthority,
  getHighestRole,
  getRolesBelowLevel,
  getRolesAtOrBelowLevel,
  normalizeRole,
  normalizeRoles,
  hasAnyRole,
  hasAllRoles,
  getRoleLabel,
  getRoleDashboardPath,
  getRoleIcon,
  getRoleColor,
  determinePrimaryRole,
  getUserRoleInfo,
  ROLE_ROUTES,
  canAccessRoute,
  canUserAccessRoute,
} from './roles';

// Permission management
export {
  Resource,
  Action,
  type Permission,
  type PermissionCondition,
  type PermissionContext,
  PERMISSION_MATRIX,
  hasPermission,
  getUserPermissions,
  getAllowedActions,
  canPerformAnyAction,
  type BulkPermissionCheck,
  checkBulkPermissions,
} from './permissions';

// Guards
export {
  type GuardConfig,
  type PermissionCheckResult,
  type GuardFunction,
  type GuardContext,
  requireAnyRole,
  requireAllRoles,
  excludeRoles,
  requirePermission,
  combineGuardsAnd,
  combineGuardsOr,
  requireAuth,
  requireAdmin,
  requireTechAdmin,
  requireModerator,
  requireStaff,
  requireCitizenOnly,
  requireOwnership,
  requireOwnershipOrAdmin,
  requireDepartment,
  requireSameDepartmentOrAdmin,
  requireStatus,
  requireTimeWindow,
  requireFeatureFlag,
  evaluateGuard,
  evaluateGuards,
} from './guards';

// Hooks
export {
  useUserRoles,
  type UseUserRolesResult,
  usePermission,
  type UsePermissionResult,
  usePermissions,
  type PermissionCheck,
  type UsePermissionsResult,
  useAllowedActions,
  useGuard,
  useCanAccessRoute,
  useResourceOwnership,
  type UseResourceOwnershipResult,
} from './hooks/usePermissions';

export {
  useRoleSwitch,
  type UseRoleSwitchResult,
  useRoleSelection,
  type RoleOption,
  type UseRoleSelectionResult,
  clearRolePreference,
  getStoredRolePreference,
  setStoredRolePreference,
} from './hooks/useRoleSwitch';
