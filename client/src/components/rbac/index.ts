/**
 * RBAC Components
 * Export all permission and role-based UI components
 */

export {
  RoleSwitcher,
  RoleBadge,
  RoleIndicator,
  type RoleSwitcherProps,
} from './RoleSwitcher';

export {
  Can,
  Cannot,
  HasRole,
  Guard,
  IsAuthenticated,
  IsGuest,
  CanAny,
  CanAll,
  type CanProps,
  type CannotProps,
  type HasRoleProps,
  type GuardProps,
  type IsAuthenticatedProps,
  type IsGuestProps,
  type CanAnyProps,
  type CanAllProps,
} from './PermissionGuard';
