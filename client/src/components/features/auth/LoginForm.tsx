"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { login as apiLogin, me as apiMe } from '@/lib/api/auth'
import { applyThemeForRole, selectPrimaryRole, getDefaultRouteForRole } from '@/lib/constants/roles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Eye, EyeOff, Github, Mail } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiLogin({ email, password })
      const user = await apiMe()
      const primary = selectPrimaryRole(user?.roles as string[])
      
      if (!primary) {
        toast.error('Access denied: No admin privileges found')
        setLoading(false)
        return
      }
      
      applyThemeForRole(primary)
      const target = getDefaultRouteForRole(primary)
      toast.success("Welcome back!")
      router.push(target)
      router.refresh()
    } catch (err: unknown) {
      type MaybeMessage = { message?: unknown }
      const msg = (e: unknown): string => {
        if (typeof e === 'string') return e
        if (e && typeof e === 'object' && 'message' in (e as MaybeMessage)) {
          const m = (e as MaybeMessage).message
          if (typeof m === 'string') return m
        }
        return 'Login failed'
      }
      toast.error(msg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Button type="button" variant="outline" disabled className="w-full border-gray-300 text-gray-500">
          <Github className="mr-2 h-4 w-4" /> GitHub
        </Button>
        <Button type="button" variant="outline" disabled className="w-full border-gray-300 text-gray-500">
          <Mail className="mr-2 h-4 w-4" /> Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm text-sky-600 hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-10" />
            <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90" size="lg">
          {loading ? 'Signing inâ€¦' : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}