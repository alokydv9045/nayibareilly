"use client"
import CitizenLayout from '@/components/layout/CitizenLayout'
import RequireUser from '@/components/features/auth/RequireUser'
import { useMe, useUpdateProfile } from '@/hooks/auth/useProfile'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePassword } from '@/lib/api/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  User, Mail, Lock, Shield, Upload, Camera, 
  Save, Key, AlertCircle, CheckCircle, 
  Settings, Bell, Award, Eye, EyeOff, Activity, Star, TrendingUp, Globe
} from 'lucide-react'

// Simple toast fallback
const toast = {
  success: (message: string) => alert(`âœ… ${message}`),
  error: (message: string) => alert(`âŒ ${message}`)
}

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long').optional().or(z.literal('')),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

const pwdSchema = z.object({
  currentPassword: z.string().min(6, 'Current password required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PwdForm = z.infer<typeof pwdSchema>

export default function ProfilePage() {
  const { data: me } = useMe()
  const { mutateAsync, isPending } = useUpdateProfile()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({ resolver: zodResolver(schema) })
  const { register: regPwd, handleSubmit: handlePwd, formState: { errors: pwdErrors }, reset: resetPwd } = useForm<PwdForm>({ resolver: zodResolver(pwdSchema) })
  const [pwdPending, setPwdPending] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (me) {
      reset({ 
        name: me.name || '', 
        avatarUrl: me.avatarUrl || ''
      })
    }
  }, [me, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      await mutateAsync({ 
        name: data.name || undefined, 
        avatarUrl: data.avatarUrl || undefined
      })
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile')
    }
  })

  const onChangePwd = handlePwd(async (data) => {
    setPwdPending(true)
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      resetPwd()
      toast.success('Password updated successfully!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update password')
    } finally {
      setPwdPending(false)
    }
  })

  // Mock data for profile completion and stats
  const profileCompletion = 75
  const userStats = {
    issuesReported: 12,
    issuesResolved: 8,
    communityPoints: 245,
    memberSince: '2024'
  }

  return (
    <RequireUser>
      <CitizenLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-2xl p-8 mb-8 text-white">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                    <AvatarImage src={me?.avatarUrl || ''} alt={me?.name || 'User'} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {me?.name?.charAt(0) || me?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg group-hover:scale-110 transition-transform">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {me?.name || 'Welcome'}
                  </h1>
                  <p className="text-blue-100 mb-4 flex items-center justify-center md:justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    {me?.email}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{userStats.issuesReported}</div>
                      <div className="text-xs text-blue-100">Issues Reported</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{userStats.issuesResolved}</div>
                      <div className="text-xs text-blue-100">Resolved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{userStats.communityPoints}</div>
                      <div className="text-xs text-blue-100">Community Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{userStats.memberSince}</div>
                      <div className="text-xs text-blue-100">Member Since</div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Badge className="bg-white/20 text-white border-white/30 mb-4">
                    <Award className="h-3 w-3 mr-1" />
                    Active Citizen
                  </Badge>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-sm text-blue-100 mb-2">Profile Completion</div>
                    <Progress value={profileCompletion} className="h-2 bg-white/20" />
                    <div className="text-xs text-blue-100 mt-1">{profileCompletion}% Complete</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-1/2 mb-2 sm:mb-0">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Activity</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input 
                            id="name"
                            placeholder="Enter your full name" 
                            {...register('name')} 
                          />
                          {errors.name && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.name.message}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email"
                            value={me?.email || ''} 
                            disabled 
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="avatarUrl">Profile Picture URL</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="avatarUrl"
                            placeholder="https://example.com/avatar.jpg" 
                            {...register('avatarUrl')} 
                            className="pl-10"
                          />
                        </div>
                        {errors.avatarUrl && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.avatarUrl.message}
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={isPending} 
                        className="w-full min-h-[44px]"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        Account Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                          <Shield className="h-10 w-10 text-green-600" />
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mb-4">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Unverified Account
                        </Badge>
                        <p className="text-sm text-gray-600 mb-4">
                          Verify your account to unlock premium features and faster support.
                        </p>
                      </div>
                      
                      <Button variant="outline" className="w-full min-h-[44px]">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload ID Document
                      </Button>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Verification Benefits:</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            Priority support response
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            Enhanced issue tracking
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            Increased credibility score
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            Access to premium features
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-red-600" />
                      Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={onChangePwd} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input 
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"} 
                            {...regPwd('currentPassword')} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {pwdErrors.currentPassword && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {pwdErrors.currentPassword.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input 
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"} 
                            {...regPwd('newPassword')} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {pwdErrors.newPassword && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {pwdErrors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Input 
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"} 
                            {...regPwd('confirmPassword')} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {pwdErrors.confirmPassword && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {pwdErrors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={pwdPending}
                        className="w-full"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        {pwdPending ? 'Updating...' : 'Update Password'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { action: 'Reported streetlight issue', time: '2 hours ago' },
                          { action: 'Updated profile information', time: '1 day ago' },
                          { action: 'Commented on water supply issue', time: '3 days ago' },
                          { action: 'Liked community post', time: '1 week ago' },
                        ].map((activity, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                              <p className="text-xs text-gray-500">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-600" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                          <Award className="h-8 w-8 text-yellow-600" />
                          <div>
                            <p className="font-medium text-gray-900">Active Reporter</p>
                            <p className="text-sm text-gray-600">Reported 10+ issues</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="font-medium text-gray-900">Community Helper</p>
                            <p className="text-sm text-gray-600">Helped resolve 5+ issues</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <User className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">Verified Citizen</p>
                            <p className="text-sm text-gray-600">Profile verification complete</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-purple-600" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { label: 'Email notifications for issue updates', enabled: true },
                        { label: 'SMS alerts for urgent issues', enabled: false },
                        { label: 'Community newsletter', enabled: true },
                        { label: 'Mobile push notifications', enabled: true },
                      ].map((setting, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{setting.label}</span>
                          <Button 
                            variant={setting.enabled ? "default" : "outline"}
                            size="sm"
                          >
                            {setting.enabled ? 'Enabled' : 'Disabled'}
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-green-600" />
                        Privacy Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { label: 'Show profile to other users', enabled: true },
                        { label: 'Allow others to see my reports', enabled: true },
                        { label: 'Display name on public reports', enabled: false },
                        { label: 'Share location for better suggestions', enabled: true },
                      ].map((setting, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{setting.label}</span>
                          <Button 
                            variant={setting.enabled ? "default" : "outline"}
                            size="sm"
                          >
                            {setting.enabled ? 'On' : 'Off'}
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CitizenLayout>
    </RequireUser>
  )
}