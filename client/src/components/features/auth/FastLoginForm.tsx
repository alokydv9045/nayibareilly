'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useSession } from '@/lib/providers/SessionProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { getCSRFToken } from '@/lib/utils/csrf'
import { loginRateLimiter } from '@/lib/utils/rate-limiter'
import {
  Eye, EyeOff, Lock, User,
  ArrowRight, Loader2, Shield, AlertTriangle
} from 'lucide-react'

export default function FastLoginForm() {
  const _router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('citizen')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { handleLoginSuccess } = useSession()

  // Load remembered email on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const remembered = localStorage.getItem('rememberMe')
      const lastEmail = localStorage.getItem('lastEmail')
      if (remembered === 'true' && lastEmail) {
        setEmail(lastEmail)
        setRememberMe(true)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading || !email.trim() || !password.trim()) return

    // Check rate limit before attempting login
    const rateKey = `login:${email.toLowerCase()}`
    if (!loginRateLimiter.check(rateKey)) {
      const resetMs = loginRateLimiter.getResetTime(rateKey)
      const minutes = resetMs ? Math.ceil(resetMs / 60000) : 5
      const remaining = loginRateLimiter.getRemainingAttempts(rateKey)
      toast.error(
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 mt-0.5 text-orange-500" />
          <div>
            <p className="font-semibold">Too many login attempts</p>
            <p className="text-sm">
              {remaining === 0 
                ? `Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}`
                : `${remaining} attempt${remaining > 1 ? 's' : ''} remaining`
              }
            </p>
          </div>
        </div>,
        { duration: 5000 }
      )
      return
    }

    setIsLoading(true)

    try {
      // Get CSRF token first (with credentials to ensure cookie is sent)
      const csrfToken = await getCSRFToken()
      
      if (!csrfToken) {
        toast.error('Security token not available. Please refresh the page.')
        setIsLoading(false)
        return
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      }
      
      // Fast login - direct API call with CSRF and credentials
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
      const response = await fetch(`${apiUrl}/v1/auth/login`, {
        method: 'POST',
        headers,
        credentials: 'include', // CRITICAL: Include cookies
        body: JSON.stringify({ email: email.trim(), password, role })
      })

      if (!response.ok) {
        // Record failed attempt
        loginRateLimiter.recordAttempt(rateKey)
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()
      const { user, token } = data.data

      // Clear rate limit on successful login
      loginRateLimiter.clear(rateKey)

      // Store auth data immediately
      if (typeof window !== 'undefined') {
        localStorage.setItem('ns_token', token)
        localStorage.setItem('ns_user', JSON.stringify(user))

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true')
          localStorage.setItem('lastEmail', email)
        }
      }

      // Notify session manager
      handleLoginSuccess(user, token)

      // Show success and redirect immediately
      toast.success('Welcome back!', { duration: 1000 })

      // Determine redirect destination based on user roles
      let destination = '/' // Default to homepage for citizens
      if (user.roles?.includes('super_admin')) {
        destination = '/superadmin'
      } else if (user.roles?.includes('dept_admin')) {
        destination = '/department'
      } else if (user.roles?.includes('mayor')) {
        destination = '/mayor'
      } else if (user.roles?.includes('moderator')) {
        destination = '/moderator/dashboard'
      } else if (user.roles?.includes('staff')) {
        destination = '/staff'
      } else if (user.roles?.includes('citizen')) {
        destination = '/' // Citizens go to homepage
      }

      // Instant redirect
      window.location.href = destination

    } catch (error) {
      console.error('Login error:', error)
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const canSubmit = email.trim() && password.trim() && !isLoading

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 h-12 text-base"
              autoComplete="email"
              autoFocus
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium text-gray-700">
            Login As
          </Label>
          <div className="relative">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="pl-10 h-12 text-base">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="citizen">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Citizen
                  </div>
                </SelectItem>
                <SelectItem value="staff">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Staff
                  </div>
                </SelectItem>
                <SelectItem value="moderator">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Moderator
                  </div>
                </SelectItem>
                <SelectItem value="dept_admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Department Admin
                  </div>
                </SelectItem>
                <SelectItem value="mayor">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Mayor
                  </div>
                </SelectItem>
                <SelectItem value="super_admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Super Admin
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 pr-12 h-12 text-base"
              autoComplete="current-password"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-gray-700 cursor-pointer">
            Remember me
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold text-base"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Sign In</span>
              <ArrowRight className="h-5 w-5" />
            </div>
          )}
        </Button>
      </form>

      {/* Register Link */}
      <div className="text-center pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/get-started"
            className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
          >
            Get started
          </Link>
        </p>
      </div>
    </div>
  )
}
