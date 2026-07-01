'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useSession } from '@/lib/providers/SessionProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// Removed Select imports
import { getCSRFToken } from '@/lib/utils/csrf'
import { loginRateLimiter } from '@/lib/utils/rate-limiter'
import { getHomeRoute } from '@/lib/constants/roles'
import {
  Eye, EyeOff, Lock, User,
  ArrowRight, Loader2, Shield, AlertTriangle, Phone, CheckCircle
} from 'lucide-react'

export default function FastLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('citizen')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [needsName, setNeedsName] = useState(false)

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

  const handleRequestOtp = async () => {
    if (!phone.trim()) {
      toast.error('Please enter your mobile number');
      return;
    }
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/v1/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), name: name.trim() })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.message === 'Name is required for new registration') {
          setNeedsName(true);
          toast.error('Looks like you are new! Please enter your name to continue.');
        } else {
          toast.error(data.message || 'Failed to send OTP');
        }
        return;
      }
      
      setOtpSent(true);
      toast.success('OTP sent to your mobile. Check server logs in dev mode.');
      // Dev mode: OTP returned only in non-production, shown in server logs
      if (data.data?.otp) {
        // Dev-only convenience — do not leave in production
        console.info('[DEV] OTP for testing:', data.data.otp);
      }
    } catch (_) {
      toast.error('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    if (role === 'citizen') {
      if (!otpSent) {
        return handleRequestOtp();
      }
      if (!otp.trim()) return toast.error('Please enter OTP');
    } else {
      if (!email.trim() || !password.trim()) return;
    }

    // Rate limiting check
    const rateKey = `login:${role === 'citizen' ? phone : email.toLowerCase()}`
    if (!loginRateLimiter.check(rateKey)) {
      const resetMs = loginRateLimiter.getResetTime(rateKey)
      const minutes = resetMs ? Math.ceil(resetMs / 60000) : 5
      const remaining = loginRateLimiter.getRemainingAttempts(rateKey)
      toast.error(
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 mt-0.5 text-orange-500" />
          <div>
            <p className="font-semibold">Too many attempts</p>
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
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
      const endpoint = role === 'citizen' ? '/v1/auth/verify-otp' : '/v1/auth/login'
      const body = role === 'citizen' 
        ? JSON.stringify({ phone: phone.trim(), otp: otp.trim() })
        : JSON.stringify({ email: email.trim(), password })

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body
      })

      if (!response.ok) {
        loginRateLimiter.recordAttempt(rateKey)
        const error = await response.json()
        throw new Error(error.message || 'Authentication failed')
      }

      const data = await response.json()
      const { user, token } = data.data

      loginRateLimiter.clear(rateKey)

      if (typeof window !== 'undefined') {
        localStorage.setItem('ns_token', token)
        localStorage.setItem('ns_user', JSON.stringify(user))

        if (rememberMe && role !== 'citizen') {
          localStorage.setItem('rememberMe', 'true')
          localStorage.setItem('lastEmail', email)
        }
      }

      handleLoginSuccess(user, token)
      toast.success(role === 'citizen' && needsName ? 'Registration complete! Welcome!' : 'Welcome back!', { duration: 2000 })

      const destination = getHomeRoute(user.roles)

      // Use router.push for SPA navigation (preserves React state, avoids hard reload)
      router.push(destination)

    } catch (error) {
      console.error('Login error:', error)
      const message = error instanceof Error ? error.message : 'Authentication failed. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const isCitizen = role === 'citizen';
  const canSubmit = isCitizen 
    ? (otpSent ? otp.trim().length === 6 : (phone.trim().length >= 10 && (!needsName || name.trim().length > 0))) 
    : (email.trim() && password.trim());

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
<<<<<<< HEAD
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
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
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium text-slate-700">
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
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-semibold"
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
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
            className="h-4 w-4 text-emerald-500 border-slate-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-slate-700 cursor-pointer font-medium">
            Remember me
          </label>
        </div>
=======
        
        {/* Role Toggle Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => { setRole('citizen'); setOtpSent(false); setNeedsName(false); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              role === 'citizen' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Citizen
          </button>
          <button
            type="button"
            onClick={() => { setRole('staff'); setOtpSent(false); setNeedsName(false); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              role !== 'citizen' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Official Login
          </button>
        </div>

        {isCitizen ? (
          <>
            {needsName && !otpSent && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10 h-12 text-base"
                    disabled={otpSent}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Mobile Number
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="pl-10 h-12 text-base"
                  disabled={otpSent}
                  autoFocus
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {otpSent && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                    One-Time Password (OTP)
                  </Label>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="pl-10 h-12 text-base font-mono tracking-widest"
                    maxLength={6}
                    autoFocus
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
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
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-12 h-12 text-base"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </>
        )}
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9

        <Button
          type="submit"
<<<<<<< HEAD
          disabled={!canSubmit}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 shadow-md text-white font-semibold text-base transition-all border-0"
=======
          disabled={!canSubmit || isLoading}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base"
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isCitizen && !otpSent ? (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              ) : (
                <>
                  <span>{isCitizen ? 'Verify & Login' : 'Sign In'}</span>
                  <CheckCircle className="h-5 w-5" />
                </>
              )}
            </div>
          )}
        </Button>
      </form>

<<<<<<< HEAD
      {/* Register Link */}
      <div className="text-center pt-4 border-t border-slate-100">
        <p className="text-sm text-slate-600 font-medium">
          Don't have an account?{' '}
          <Link
            href="/get-started"
            className="text-emerald-600 hover:text-emerald-700 hover:underline font-bold"
          >
            Get started
          </Link>
        </p>
      </div>
=======
      {/* Register Link (Removed since OTP flow handles new users natively) */}
      {!isCitizen && (
        <div className="text-center pt-4 border-t border-gray-100 space-y-2">
          <p className="text-sm text-gray-600">
            Citizen trying to report an issue?{' '}
            <button
              type="button"
              onClick={() => { setRole('citizen'); setOtpSent(false); setNeedsName(false); }}
              className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
            >
              Login here
            </button>
          </p>
          <p className="text-sm text-gray-500">
            Forgot your password?{' '}
            <a href="/forgot-password" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
              Reset it
            </a>
          </p>
        </div>
      )}
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9
    </div>
  )
}
