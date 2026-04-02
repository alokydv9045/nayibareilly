// Shared role constants and helpers for admin routing/auth

export type AdminRole = 'DEVELOPER_ADMIN' | 'SUPER_ADMIN' | 'DEPT_ADMIN' | 'MODERATOR' | 'STAFF'

// Backend API roles mapping (lowercase with underscores) - Updated Hierarchy
export const BACKEND_ROLES = {
  DEVELOPER_ADMIN: 'developer_admin', // Platform Developer & Maintainer
  SUPER_ADMIN: 'mayor',              // Mayor (City-wide Management)
  DEPT_ADMIN: 'dept_admin',          // Department Administrators (5 departments)
  MODERATOR: 'moderator',            // Content & Issue Moderators
  STAFF: 'staff',                    // Field Staff Members
} as const

// Role hierarchy levels (higher number = higher authority) - New Structure
export const ROLE_HIERARCHY = {
  DEVELOPER_ADMIN: 5, // Platform Creator - Full Technical Control
  SUPER_ADMIN: 4,     // Mayor - City-wide Governance & All Departments
  DEPT_ADMIN: 3,      // Department Heads - PWD, Water, Health, Waste, Traffic
  MODERATOR: 2,       // Content Moderators - Issue Review & Processing
  STAFF: 1,           // Field Workers - Ground Level Operations
  CITIZEN: 0,         // Public Users - Issue Reporting & Tracking
} as const

// Permissions mapping - Updated for new hierarchy
export const ROLE_PERMISSIONS = {
  DEVELOPER_ADMIN: {
    canManage: ['SUPER_ADMIN', 'DEPT_ADMIN', 'MODERATOR', 'STAFF', 'CITIZEN'] as const,
    canCreate: ['SUPER_ADMIN', 'DEPT_ADMIN', 'MODERATOR', 'STAFF', 'CITIZEN'] as const,
    canDelete: ['SUPER_ADMIN', 'DEPT_ADMIN', 'MODERATOR', 'STAFF', 'CITIZEN'] as const,
    canViewLogs: true,
    canManageSystem: true,
    canManageIntegrations: true,
    canAccessDeveloperTools: true,
    canModifyPlatform: true,
  },
  SUPER_ADMIN: {
    canManage: ['DEPT_ADMIN', 'MODERATOR', 'STAFF', 'CITIZEN'] as const,
    canCreate: ['DEPT_ADMIN', 'MODERATOR', 'STAFF', 'CITIZEN'] as const,
    canDelete: ['DEPT_ADMIN', 'MODERATOR', 'STAFF', 'CITIZEN'] as const,
    canViewLogs: true,
    canManageSystem: false,
    canManageIntegrations: false,
    canAccessDeveloperTools: false,
    canViewAllDepartments: true,
    canOverrideDecisions: true,
  },
  DEPT_ADMIN: {
    canManage: ['STAFF', 'CITIZEN'] as const, // Only within their department
    canCreate: ['STAFF', 'CITIZEN'] as const,
    canDelete: ['STAFF'] as const, // Can remove staff from their department
    canViewLogs: false,
    canManageSystem: false,
    canManageIntegrations: false,
    canAccessDeveloperTools: false,
    canViewAllDepartments: false,
    canManageDepartmentStaff: true,
  },
  MODERATOR: {
    canManage: ['CITIZEN'] as const,
    canCreate: ['CITIZEN'] as const,
    canDelete: [] as const,
    canViewLogs: false,
    canManageSystem: false,
    canManageIntegrations: false,
  },
  STAFF: {
    canManage: ['CITIZEN'] as const,
    canCreate: ['CITIZEN'] as const,
    canDelete: [] as const,
    canViewLogs: false,
    canManageSystem: false,
    canManageIntegrations: false,
  },
} as const

// Normalize backend-provided roles to our AdminRole or CITIZEN fallback
export function pickPrimaryRole(
  roles?: unknown
): AdminRole | 'CITIZEN' {
  const r = Array.isArray(roles) ? roles.map((x) => String(x).toLowerCase()) : []
  if (r.includes('developer_admin') || r.includes('dev_admin')) return 'DEVELOPER_ADMIN'
  if (r.includes('super_admin') || r.includes('superadmin') || r.includes('mayor')) return 'SUPER_ADMIN'
  if (r.includes('dept_admin') || r.includes('department_admin')) return 'DEPT_ADMIN'
  if (r.includes('moderator') || r.includes('support')) return 'MODERATOR'
  if (r.includes('staff') || r.includes('officer')) return 'STAFF'
  return 'CITIZEN'
}
