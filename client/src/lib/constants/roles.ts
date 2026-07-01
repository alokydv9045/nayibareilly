// Admin-only role system and backend maps from shared module
import type { AdminRole } from './role-map'
export type { AdminRole } from './role-map'
import { BACKEND_ROLES, ROLE_PERMISSIONS } from './role-map'

// Role to route mapping - updated hierarchy: Developer > Mayor > Department > Moderator > Staff > Citizens
export const roleToRoute: Record<AdminRole, string> = {
  DEVELOPER_ADMIN: '/techadmin',           // Developer (Platform Creator & Maintainer)
  SUPER_ADMIN: '/mayor',                    // Mayor (City-wide Management & Oversight)
  DEPT_ADMIN: '/department',                // Department Admins (5 departments with staff)
  MODERATOR: '/moderator/dashboard',        // Moderator (Content & Issue Review)
  STAFF: '/staff',                          // Staff Members (Field Workers)
}

// Role to DaisyUI theme mapping - updated for new hierarchy
export const roleToTheme: Record<AdminRole, string> = {
  DEVELOPER_ADMIN: 'developer',     // purple/dark theme for platform developer
  SUPER_ADMIN: 'mayor',             // blue theme for mayor oversight
  DEPT_ADMIN: 'department',         // green theme for department management
  MODERATOR: 'moderator',           // orange theme for moderation
  STAFF: 'staff',                   // teal theme for field staff
}

// Role display names - updated hierarchy
export const roleDisplayNames: Record<AdminRole, string> = {
  DEVELOPER_ADMIN: 'Platform Developer',
  SUPER_ADMIN: 'Mayor',
  DEPT_ADMIN: 'Department Admin',
  MODERATOR: 'Moderator',
  STAFF: 'Field Staff',
}

// Role descriptions - updated for new hierarchy
export const roleDescriptions: Record<AdminRole, string> = {
  DEVELOPER_ADMIN: 'Platform development, system maintenance, and technical oversight',
  SUPER_ADMIN: 'City-wide governance, all departments oversight, and policy decisions',
  DEPT_ADMIN: 'Department management, staff supervision, and departmental operations',
  MODERATOR: 'Content moderation, issue review, and citizen complaint processing',
  STAFF: 'Field work execution, issue resolution, and ground-level operations',
}

// Check if user can manage another role
export const canManageRole = (userRole: AdminRole, targetRole: string): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return permissions ? permissions.canManage.includes(targetRole as any) : false
}

// Check if user can create another role
export const canCreateRole = (userRole: AdminRole, targetRole: string): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return permissions ? permissions.canCreate.includes(targetRole as any) : false
}

// Get available roles that a user can create
export const getCreatableRoles = (userRole: AdminRole): string[] => {
  return [...(ROLE_PERMISSIONS[userRole]?.canCreate || [])]
}

// Select primary admin role from backend roles array
export const selectPrimaryRole = (roles?: string[] | null): AdminRole | null => {
  if (!roles || roles.length === 0) return null
  
  const r = roles.map((x) => String(x).toLowerCase())
  
  // Check for each role in priority order (highest to lowest)
  if (r.includes('tech_admin') || r.includes('techadmin') || r.includes('super_admin') || r.includes('superadmin') || r.includes('developer_admin') || r.includes('dev_admin')) return 'DEVELOPER_ADMIN'
  if (r.includes('mayor')) return 'SUPER_ADMIN'
  if (r.includes('dept_admin') || r.includes('department_admin')) return 'DEPT_ADMIN'
  if (r.includes('moderator') || r.includes('support')) return 'MODERATOR'
  if (r.includes('staff') || r.includes('officer')) return 'STAFF'
  
  return null // No admin role found (could be citizen)
}

// Apply theme based on admin role
export const applyThemeForRole = (role: AdminRole | null) => {
  if (typeof document === 'undefined') return
  
  const theme = role ? roleToTheme[role] : 'techadmin' // default to techadmin theme
  document.documentElement.setAttribute('data-theme', theme)
}

// Get default route for a role (handles citizens too)
export const getDefaultRouteForRole = (role: AdminRole | null): string => {
  if (!role) return '/' // Citizens (no admin role) go to homepage
  return roleToRoute[role] // Authorities go to their respective dashboards
}

// Check if user has specific admin role
export const hasRole = (userRoles: string[] | null | undefined, requiredRole: AdminRole): boolean => {
  if (!userRoles) return false
  const backendRole = BACKEND_ROLES[requiredRole]
  return userRoles.includes(backendRole)
}

// Check if user has any admin role
export const hasAnyAdminRole = (userRoles: string[] | null | undefined): boolean => {
  if (!userRoles) return false
  const adminRoles: string[] = Object.values(BACKEND_ROLES)
  return userRoles.some(role => adminRoles.includes(role))
}

// Check if user is a citizen (no admin roles)
export const isCitizen = (userRoles: string[] | null | undefined): boolean => {
  return !hasAnyAdminRole(userRoles)
}

// Check if route should be accessible by citizens only
export const isCitizenOnlyRoute = (pathname: string): boolean => {
  const citizenRoutes = [
    '/report',
    '/my-issues',
    '/profile',
    '/notifications',
    '/issue',
    '/app'
  ]
  return citizenRoutes.some(route => pathname.startsWith(route))
}

// Check if route should be accessible by admins only
export const isAdminOnlyRoute = (pathname: string): boolean => {
  const adminRoutes = ['/techadmin', '/mayor', '/department', '/moderator', '/issues', '/users', '/staff']
  return adminRoutes.some(route => pathname.startsWith(route))
}

// Get appropriate home route based on user role
export const getHomeRoute = (userRoles: string[] | null | undefined): string => {
  const role = selectPrimaryRole(userRoles)
  return getDefaultRouteForRole(role)
}
