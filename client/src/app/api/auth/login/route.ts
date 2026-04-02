import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/constants/config'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get CSRF token from request headers
    const csrfToken = request.headers.get('X-CSRF-Token') || request.headers.get('x-csrf-token')

    // Forward to server API with CSRF token
    const serverUrl = config.api.fullUrl || 'https://nayibareilly.onrender.com/api'
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Pass CSRF token to backend if available
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }
    
    // CRITICAL: Forward cookies from client to backend (including csrf-token cookie)
    const cookies = request.headers.get('cookie')
    if (cookies) {
      headers['Cookie'] = cookies
    }
    
    const response = await fetch(`${serverUrl}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Important for cookies
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Login failed' },
        { status: response.status }
      )
    }

    // Forward Set-Cookie headers from backend to client
    const setCookieHeaders = response.headers.getSetCookie()
    const nextResponse = NextResponse.json(data)
    
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach(cookie => {
        nextResponse.headers.append('Set-Cookie', cookie)
      })
    }

    return nextResponse
  } catch (error) {
    console.error('Fast login API error:', error)
    return NextResponse.json(
      { message: 'Network error. Please try again.' },
      { status: 500 }
    )
  }
}
