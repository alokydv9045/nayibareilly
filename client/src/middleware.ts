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
  LOGIN_PATH, REGISTER_PATH, '/signup', '/forgot-password', '/reset-password', '/reports'
]

// Default dashboard for each role
const ROLE_DASHBOARD_MAP = {
  tech_admin: '/techadmin',
  developer_admin: '/techadmin',
  mayor: '/mayor',
  dept_admin: '/department',
  moderator: '/moderator',
  staff: '/staff',
  citizen: '/',
} as const

// ============================================================================
// Utility Functions
// ============================================================================

function normalizeRole(role: string): string {
  return String(role).toLowerCase()
}

function getHighestRole(roles: string[]): string {
  const roleHierarchy = [
    'tech_admin', 'developer_admin', 'mayor', 'dept_admin', 'moderator', 'staff', 'citizen',
  ]
  for (const role of roleHierarchy) {
    if (roles.map(normalizeRole).includes(role)) return role
  }
  return 'citizen'
}

function getRoleDashboard(role: string): string {
  const normalized = normalizeRole(role)
  return ROLE_DASHBOARD_MAP[normalized as keyof typeof ROLE_DASHBOARD_MAP] || '/'
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}

/**
 * Determines if the pathname is allowed for a given official role.
 * Tech admin gets access to all official routes since they are super admin.
 */
function isRouteAllowedForOfficial(pathname: string, highestRole: string): boolean {
  // Always allow static/api internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  ) return true

  // Allow reports and public shared pages
  if (pathname === '/reports' || pathname.startsWith('/reports/')) return true
  if (pathname === LOGIN_PATH || pathname === REGISTER_PATH) return true

  const normalized = normalizeRole(highestRole)

  // Tech admin: full access to all official panels
  if (normalized === 'tech_admin' || normalized === 'developer_admin') {
    return (
      pathname.startsWith('/techadmin') ||
      pathname.startsWith('/diagnostic') ||
      pathname.startsWith('/users') ||
      pathname.startsWith('/departments') ||
      pathname.startsWith('/issues') ||
      pathname.startsWith('/mayor') ||
      pathname.startsWith('/department') ||
      pathname.startsWith('/moderator') ||
      pathname.startsWith('/staff')
    )
  }

  if (normalized === 'mayor') {
    return (
      pathname.startsWith('/mayor') ||
      pathname.startsWith('/users') ||
      pathname.startsWith('/departments') ||
      pathname.startsWith('/issues')
    )
  }

  if (normalized === 'dept_admin') {
    return (
      pathname.startsWith('/department') ||
      pathname.startsWith('/users') ||
      pathname.startsWith('/issues')
    )
  }

  if (normalized === 'moderator') {
    return pathname.startsWith('/moderator') || pathname.startsWith('/issues')
  }

  if (normalized === 'staff') {
    return pathname.startsWith('/staff')
  }

  return false
}

// ============================================================================
// API Functions
// ============================================================================

interface RefreshResult {
  accessToken: string | null
  /** The raw Set-Cookie header from the refresh response, must be forwarded to the browser */
  setCookieHeader: string | null
}

/**
 * Call the backend refresh endpoint using the browser's cookies.
 * IMPORTANT: returns the Set-Cookie header so the middleware can forward the
 * rotated refresh-token cookie back to the browser — failing to do this was
 * the root cause of the redirect-to-login bug.
 */
async function fetchAccessToken(cookie: string | undefined): Promise<RefreshResult> {
  if (!cookie) return { accessToken: null, setCookieHeader: null }

  // Don't even bother calling the backend if the request carries no `rt` cookie
  if (!cookie.includes('rt=')) {
    return { accessToken: null, setCookieHeader: null }
  }

  try {
    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { cookie },
      credentials: 'include',
    })

    // Capture new cookie BEFORE checking res.ok — backend sets it before returning 2xx
    const setCookieHeader = res.headers.get('set-cookie')

    if (!res.ok) {
      return { accessToken: null, setCookieHeader: null }
    }

    const json = (await res.json()) as { data?: { accessToken?: string } }
    const accessToken = json?.data?.accessToken || null

    return { accessToken, setCookieHeader }
  } catch {
    return { accessToken: null, setCookieHeader: null }
  }
}

async function fetchMe(token: string): Promise<{ roles: string[] } | null> {
  try {
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data?: { user?: { roles?: string[] } } }
    const roles = (json?.data?.user?.roles || []).map((r) => String(r).toLowerCase())
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

  // Skip middleware for internals, static assets, and icons
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.png' ||
    pathname === '/icon.svg' ||
    pathname === '/apple-icon.png' ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  const incomingCookie = request.headers.get('cookie') || undefined
  const { accessToken, setCookieHeader } = await fetchAccessToken(incomingCookie)

  /**
   * Helper: build a NextResponse and forward the rotated refresh-token cookie
   * so the browser stays in sync with the backend's token rotation.
   */
  const withRotatedCookie = (response: NextResponse): NextResponse => {
    if (setCookieHeader) {
      response.headers.set('Set-Cookie', setCookieHeader)
    }
    return response
  }

  // ========================================================================
  // 1. Unauthenticated
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
  // 2. Fetch user roles
  // ========================================================================
  const me = await fetchMe(accessToken)
  const roles = me?.roles || []

  if (roles.length === 0) {
    url.pathname = LOGIN_PATH
    url.search = ''
    return NextResponse.redirect(url)
  }

  const highestRole = getHighestRole(roles)

  // Redirect away from login/register if already authenticated
  if (pathname === LOGIN_PATH || pathname === REGISTER_PATH) {
    url.pathname = getRoleDashboard(highestRole)
    url.search = ''
    return withRotatedCookie(NextResponse.redirect(url))
  }

  // ========================================================================
  // 3. Role-Based Route Isolation
  // ========================================================================
  if (highestRole === 'citizen') {
    const adminRoutes = [
      '/techadmin', '/mayor', '/department', '/moderator', '/staff', '/issues', '/users', '/diagnostic',
    ]
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      url.pathname = '/'
      url.search = ''
      return NextResponse.redirect(url)
    }
    return withRotatedCookie(NextResponse.next())
  } else {
    if (!isRouteAllowedForOfficial(pathname, highestRole)) {
      url.pathname = getRoleDashboard(highestRole)
      url.search = ''
      return withRotatedCookie(NextResponse.redirect(url))
    }
    return withRotatedCookie(NextResponse.next())
  }
}

export const config = {
  matcher: [
    // Exclude api routes, Next.js internals, static assets, and common image/icon files
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png|icon.svg|apple-icon.png|public).*)',
  ],
}
