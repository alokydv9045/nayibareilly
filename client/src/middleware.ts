import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const envApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'
const apiUrl = envApiUrl.endsWith('/api') ? envApiUrl : `${envApiUrl}/api`

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
  console.log(`[MW] fetchAccessToken called, cookie length: ${cookie ? cookie.length : 0}, cookie value: ${cookie}`)
  if (!cookie) return null
  try {
    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { cookie },
      credentials: 'include'
    })
    console.log(`[MW] refresh status: ${res.status}`)
    if (!res.ok) {
      console.warn('[MW] Refresh failed', res.status)
      return null
    }
    const json = (await res.json()) as { data?: { accessToken?: string } }
    console.log(`[MW] refresh returned accessToken: ${json?.data?.accessToken ? 'YES' : 'NO'}`)
    return json?.data?.accessToken || null
  } catch (err) {
    console.warn('[MW] Refresh fetch error', err)
    return null
  }
}

async function fetchMe(token: string): Promise<{ roles: string[] } | null> {
  try {
    console.log(`[MW] fetchMe called with token: ${token ? token.substring(0, 15) : 'null'}...`)
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log(`[MW] fetchMe status: ${res.status}`)
    if (!res.ok) return null
    const json = (await res.json()) as { data?: { user?: { roles?: string[] } } }
    const roles = (json?.data?.user?.roles || []).map(r => String(r).toLowerCase())
    console.log(`[MW] fetchMe roles: ${JSON.stringify(roles)}`)
    return { roles }
  } catch (err) {
    console.warn('[MW] fetchMe error', err)
    return null
  }
}

// ============================================================================
// Main Middleware
// ============================================================================

/**
 * Check if the requested route is allowed for the official's highest role.
 * Officials are strictly isolated to their own modules/panels and shared reports/api/auth.
 */
function isRouteAllowedForOfficial(pathname: string, highestRole: string): boolean {
  if (pathname.startsWith('/_next') || pathname.startsWith('/public') || pathname.startsWith('/api') || pathname === '/favicon.ico') {
    return true
  }

  // Allow reports pages (both the list and specific report details)
  if (pathname === '/reports' || pathname.startsWith('/reports/')) {
    return true
  }

  // Allow login/register (redirect checks are done separately in middleware)
  if (pathname === LOGIN_PATH || pathname === REGISTER_PATH) {
    return true
  }

  const normalized = normalizeRole(highestRole)

  if (normalized === 'super_admin' || normalized === 'developer_admin') {
    return pathname.startsWith('/superadmin') || 
           pathname.startsWith('/diagnostic') || 
           pathname.startsWith('/users') || 
           pathname.startsWith('/departments') || 
           pathname.startsWith('/issues')
  }

  if (normalized === 'mayor') {
    return pathname.startsWith('/mayor') || 
           pathname.startsWith('/users') || 
           pathname.startsWith('/departments') || 
           pathname.startsWith('/issues')
  }

  if (normalized === 'dept_admin') {
    return pathname.startsWith('/department') || 
           pathname.startsWith('/users') || 
           pathname.startsWith('/issues')
  }

  if (normalized === 'moderator') {
    return pathname.startsWith('/moderator') || 
           pathname.startsWith('/issues')
  }

  if (normalized === 'staff') {
    return pathname.startsWith('/staff')
  }

  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log(`[MIDDLEWARE_TRIGGERED] Path: ${pathname}`)
  const url = request.nextUrl.clone()

  // Skip middleware checks for API, static files, next internals, and icons
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/public') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  const incomingCookie = request.headers.get('cookie') || undefined
  const accessToken = await fetchAccessToken(incomingCookie)

  // ========================================================================
  // 1. Unauthenticated Users
  // ========================================================================
  if (!accessToken) {
    if (isPublicRoute(pathname)) {
      return NextResponse.next()
    }
    url.pathname = LOGIN_PATH
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ========================================================================
  // 2. Authenticated Users - Load user context
  // ========================================================================
  const me = await fetchMe(accessToken)
  const roles = me?.roles || []

  if (roles.length === 0) {
    url.pathname = LOGIN_PATH
    url.search = ''
    return NextResponse.redirect(url)
  }

  const highestRole = getHighestRole(roles)

  // Redirect authenticated users away from Login/Register pages
  if (pathname === LOGIN_PATH || pathname === REGISTER_PATH) {
    url.pathname = getRoleDashboard(highestRole)
    url.search = ''
    return NextResponse.redirect(url)
  }

  // ========================================================================
  // 3. Role-Based Route Isolation
  // ========================================================================
  if (highestRole === 'citizen') {
    // Citizens cannot access any official panel route
    const adminRoutes = ['/superadmin', '/mayor', '/department', '/moderator', '/staff', '/issues', '/users', '/diagnostic']
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      url.pathname = '/'
      url.search = ''
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  } else {
    // Official users (non-citizens) can only access allowed official routes
    if (!isRouteAllowedForOfficial(pathname, highestRole)) {
      url.pathname = getRoleDashboard(highestRole)
      url.search = ''
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Match all routes except api and static files
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ]
}
