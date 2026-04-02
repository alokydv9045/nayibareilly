import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'

// ============================================================================
// Route Configuration
// ============================================================================

const LOGIN_PATH = '/login'
const REGISTER_PATH = '/register'

// Public routes (no authentication required)
const PUBLIC_ROUTES = [
  '/', '/about', '/services', '/contact', '/help', '/privacy', '/terms', '/guidelines',
  LOGIN_PATH, REGISTER_PATH, '/signup', '/forgot-password', '/reset-password'
]

// Routes that require specific roles
const PROTECTED_ROUTES: Record<string, string[]> = {
  '/superadmin': ['super_admin', 'developer_admin'],
  '/mayor': ['mayor', 'super_admin'],
  '/department': ['dept_admin', 'super_admin'],
  '/moderator': ['moderator', 'super_admin'],
  '/staff': ['staff', 'super_admin'],
  '/issues': ['moderator', 'dept_admin', 'mayor', 'super_admin'],
  '/users': ['dept_admin', 'mayor', 'super_admin'],
  '/diagnostic': ['super_admin'],
}

// Default dashboard for each role
const ROLE_DASHBOARD_MAP = {
  super_admin: '/superadmin',
  developer_admin: '/superadmin',
  mayor: '/mayor',
  dept_admin: '/department',
  moderator: '/moderator',
  staff: '/staff',
  citizen: '/', // Citizens go to homepage
} as const

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Normalize role to lowercase
 */
function normalizeRole(role: string): string {
  return String(role).toLowerCase()
}

/**
 * Check if user has any of the required roles
 */
function hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
  const normalizedUserRoles = userRoles.map(normalizeRole)
  const normalizedRequiredRoles = requiredRoles.map(normalizeRole)
  return normalizedRequiredRoles.some((role) => normalizedUserRoles.includes(role))
}

/**
 * Get highest priority role for redirect
 */
function getHighestRole(roles: string[]): string {
  const roleHierarchy = [
    'super_admin',
    'developer_admin',
    'mayor',
    'dept_admin',
    'moderator',
    'staff',
    'citizen',
  ]

  for (const role of roleHierarchy) {
    if (roles.includes(normalizeRole(role))) {
      return normalizeRole(role)
    }
  }

  return 'citizen'
}

/**
 * Get dashboard path for a role
 */
function getRoleDashboard(role: string): string {
  const normalized = normalizeRole(role)
  return (
    ROLE_DASHBOARD_MAP[normalized as keyof typeof ROLE_DASHBOARD_MAP] ||
    '/' // Default to homepage for unknown roles (like citizens)
  )
}

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}

/**
 * Check if route requires authentication
 */
function requiresAuth(pathname: string): boolean {
  // API routes handled separately
  if (pathname.startsWith('/api')) return false
  
  // Static assets don't require auth
  if (pathname.startsWith('/_next') || pathname.startsWith('/public')) return false
  
  // Public routes don't require auth
  if (isPublicRoute(pathname)) return false
  
  return true
}

/**
 * Check if user can access the route
 */
function canAccessRoute(pathname: string, userRoles: string[]): boolean {
  // Check if route has specific role requirements
  for (const [route, requiredRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return hasAnyRole(userRoles, requiredRoles)
    }
  }
  
  // Default: authenticated users can access non-protected routes
  return true
}

// ============================================================================
// API Functions
// ============================================================================

async function fetchAccessToken(cookie: string | undefined): Promise<string | null> {
  if (!cookie) return null
  try {
    const res = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { cookie },
      credentials: 'include'
    })
    if (!res.ok) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[MW] Refresh failed', res.status)
      }
      return null
    }
    const json = (await res.json()) as { data?: { accessToken?: string } }
    return json?.data?.accessToken || null
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[MW] Refresh fetch error', err)
    }
    return null
  }
}

async function fetchMe(token: string): Promise<{ roles: string[] } | null> {
  try {
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data?: { user?: { roles?: string[] } } }
    // Normalize roles to lowercase for consistent checks
    const roles = (json?.data?.user?.roles || []).map(r => String(r).toLowerCase())
    return { roles }
  } catch {
    return null
  }
}

// ============================================================================
// Main Middleware
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const url = request.nextUrl.clone()

  // ========================================================================
  // 1. Check if route is public
  // ========================================================================
  if (isPublicRoute(pathname)) {
    // If user is already authenticated and trying to access login, redirect to dashboard
    if (pathname === LOGIN_PATH || pathname === REGISTER_PATH) {
      const incomingCookie = request.headers.get('cookie') || undefined
      const accessToken = await fetchAccessToken(incomingCookie)

      if (accessToken) {
        const me = await fetchMe(accessToken)
        const roles = me?.roles || []

        if (roles.length > 0) {
          const highestRole = getHighestRole(roles)
          url.pathname = getRoleDashboard(highestRole)
          url.search = ''
          return NextResponse.redirect(url)
        }
      }
    }

    return NextResponse.next()
  }

  // ========================================================================
  // 2. Check authentication for protected routes
  // ========================================================================
  if (!requiresAuth(pathname)) {
    return NextResponse.next()
  }

  const incomingCookie = request.headers.get('cookie') || undefined
  const accessToken = await fetchAccessToken(incomingCookie)

  // Redirect to login if not authenticated
  if (!accessToken) {
    url.pathname = LOGIN_PATH
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ========================================================================
  // 3. Fetch user data and validate roles
  // ========================================================================
  const me = await fetchMe(accessToken)
  const roles = me?.roles || []

  if (roles.length === 0) {
    // No roles assigned, redirect to login
    url.pathname = LOGIN_PATH
    url.search = ''
    return NextResponse.redirect(url)
  }

  // ========================================================================
  // 4. Check route-specific permissions
  // ========================================================================
  if (!canAccessRoute(pathname, roles)) {
    // User doesn't have permission for this route
    // Redirect to their appropriate dashboard
    const highestRole = getHighestRole(roles)
    url.pathname = getRoleDashboard(highestRole)
    url.search = ''
    return NextResponse.redirect(url)
  }

  // ========================================================================
  // 5. Allow access
  // ========================================================================
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all routes except api and static files
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ]
}
