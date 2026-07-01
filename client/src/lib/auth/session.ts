import { NextRequest, NextResponse } from 'next/server'
import 'server-only'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthUser {
  id: string
  email: string
  role: string
  departmentId?: string
}

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthUser
}

/**
 * Verify JWT token and extract user information
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  })
}

/**
 * Extract token from Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    return null
  }

  // Support both "Bearer <token>" and just "<token>"
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return authHeader
}

/**
 * Middleware to authenticate API requests
 * Returns user object if authenticated, otherwise returns error response
 */
export async function authenticate(
  request: NextRequest
): Promise<{ user: AuthUser } | { error: NextResponse }> {
  const token = extractToken(request)

  if (!token) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required. Please provide a valid token.' },
        { status: 401 }
      ),
    }
  }

  const user = verifyToken(token)

  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Invalid or expired token. Please login again.' },
        { status: 401 }
      ),
    }
  }

  return { user }
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(user: AuthUser, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role)
}

/**
 * Middleware to authorize user role
 */
export function authorize(
  user: AuthUser,
  allowedRoles: string[]
): { authorized: true } | { error: NextResponse } {
  if (!requireRole(user, allowedRoles)) {
    return {
      error: NextResponse.json(
        { 
          error: 'Access denied. Insufficient permissions.',
          requiredRoles: allowedRoles,
          userRole: user.role
        },
        { status: 403 }
      ),
    }
  }

  return { authorized: true }
}

/**
 * Combined authentication and authorization middleware
 */
export async function authenticateAndAuthorize(
  request: NextRequest,
  allowedRoles: string[]
): Promise<{ user: AuthUser } | { error: NextResponse }> {
  // First authenticate
  const authResult = await authenticate(request)

  if ('error' in authResult) {
    return authResult
  }

  // Then authorize
  const authzResult = authorize(authResult.user, allowedRoles)

  if ('error' in authzResult) {
    return authzResult
  }

  return { user: authResult.user }
}

/**
 * Role constants for easy reference
 */
export const Roles = {
  TECH_ADMIN: 'TECH_ADMIN',
  MAYOR: 'MAYOR',
  DEPARTMENT_ADMIN: 'DEPARTMENT_ADMIN',
  MODERATOR: 'MODERATOR',
  STAFF: 'STAFF',
  CITIZEN: 'CITIZEN',
} as const

/**
 * Common role groups
 */
export const RoleGroups = {
  ADMIN: [Roles.TECH_ADMIN, Roles.MAYOR, Roles.DEPARTMENT_ADMIN],
  STAFF_AND_ADMIN: [Roles.TECH_ADMIN, Roles.MAYOR, Roles.DEPARTMENT_ADMIN, Roles.MODERATOR, Roles.STAFF],
  ALL: Object.values(Roles),
} as const
