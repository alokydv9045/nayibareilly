"use client"
import AnimatedHeading from '@/components/ui/AnimatedHeading'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Save,
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  Clock,
  Shield,
  Database,
  Globe,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useTechadminSettings, useUpdateSettings } from '@/hooks/api/useTechadminAPI'

interface SystemSettings {
  // Platform Settings
  platformName: string
  platformDescription: string
  platformUrl: string
  supportEmail: string
  supportPhone: string

  // SLA Settings
  slaHighPriority: number
  slaMediumPriority: number
  slaLowPriority: number
  slaUnit: 'hours' | 'days'

  // Notification Settings
  emailNotificationsEnabled: boolean
  smsNotificationsEnabled: boolean
  pushNotificationsEnabled: boolean
  notifyOnIssueCreated: boolean
  notifyOnIssueAssigned: boolean
  notifyOnIssueStatusChange: boolean
  notifyOnIssueResolved: boolean

  // Email Settings
  smtpHost: string
  smtpPort: number
  smtpUsername: string
  smtpPassword: string
  emailFromAddress: string
  emailFromName: string

  // SMS Settings
  smsProvider: string
  smsApiKey: string
  smsApiSecret: string
  smsSenderName: string

  // Security Settings
  sessionTimeout: number
  maxLoginAttempts: number
  passwordMinLength: number
  requireEmailVerification: boolean
  requirePhoneVerification: boolean
  enableTwoFactorAuth: boolean

  // Database Settings
  autoBackupEnabled: boolean
  backupFrequency: string
  retentionDays: number
}

export default function SystemSettingsPage() {
  const { data: fetchedSettings, isLoading } = useTechadminSettings()
  const updateSettingsMutation = useUpdateSettings()
  
  const loading = isLoading || updateSettingsMutation.isPending
  
  const [settings, setSettings] = useState<SystemSettings>({
    platformName: 'Nayi Bareilly',
    platformDescription: 'Civic Issue Management Platform',
    platformUrl: 'https://nayi-bareilly.com',
    supportEmail: 'support@nayi-bareilly.com',
    supportPhone: '+91 1234567890',
    slaHighPriority: 24,
    slaMediumPriority: 72,
    slaLowPriority: 168,
    slaUnit: 'hours',
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: true,
    pushNotificationsEnabled: false,
    notifyOnIssueCreated: true,
    notifyOnIssueAssigned: true,
    notifyOnIssueStatusChange: true,
    notifyOnIssueResolved: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    emailFromAddress: 'noreply@nayi-bareilly.com',
    emailFromName: 'Nayi Bareilly',
    smsProvider: 'twilio',
    smsApiKey: '',
    smsApiSecret: '',
    smsSenderName: 'NAYI-BRL',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    enableTwoFactorAuth: false,
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    retentionDays: 30
  })

  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (fetchedSettings) {
      // Ensure we don't set undefined values which cause uncontrolled input errors
      setSettings(prev => {
        const next = { ...prev };
        for (const key in fetchedSettings) {
          if ((fetchedSettings as unknown as Record<string, unknown>)[key] !== undefined && (fetchedSettings as unknown as Record<string, unknown>)[key] !== null) {
            (next as unknown as Record<string, unknown>)[key] = (fetchedSettings as unknown as Record<string, unknown>)[key];
          }
        }
        return next;
      })
    }
  }, [fetchedSettings])

  const handleSave = () => {
    updateSettingsMutation.mutate(settings, {
      onSuccess: () => {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    })
  }

  return (
    <div className="min-h-screen bg-transparent font-sans">
      <div className="max-w-[1440px] mx-auto px-10 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/superadmin">
              <Button 
                variant="outline" 
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <AnimatedHeading as="h1" className="text-3xl font-bold tracking-tight text-slate-900">System Settings</AnimatedHeading>
              <p className="text-slate-500 font-medium mt-1">Configure platform-wide settings and preferences</p>
            </div>
          </div>
          <Button 
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm px-6 h-11"
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3 shadow-sm">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <p className="text-emerald-800 font-medium">Settings saved successfully!</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Settings */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-blue-600">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-slate-900 text-lg font-bold">Platform Settings</CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-xs mt-1">
                    Basic platform configuration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Platform Name</label>
                <Input
                  value={settings.platformName}
                  onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <Input
                  value={settings.platformDescription}
                  onChange={(e) => setSettings({...settings, platformDescription: e.target.value})}
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Platform URL</label>
                <Input
                  value={settings.platformUrl}
                  onChange={(e) => setSettings({...settings, platformUrl: e.target.value})}
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Support Email</label>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Support Phone</label>
                  <Input
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SLA Settings */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-orange-600">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-slate-900 text-lg font-bold">SLA Configuration</CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-xs mt-1">
                    Service Level Agreement timeframes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">High Priority SLA</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={settings.slaHighPriority}
                    onChange={(e) => setSettings({...settings, slaHighPriority: Number(e.target.value)})}
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                  <select
                    value={settings.slaUnit}
                    onChange={(e) => setSettings({...settings, slaUnit: e.target.value as 'hours' | 'days'})}
                    className="h-11 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-4 text-slate-700 font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Medium Priority SLA</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={settings.slaMediumPriority}
                    onChange={(e) => setSettings({...settings, slaMediumPriority: Number(e.target.value)})}
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                  <span className="text-slate-500 font-medium px-2">{settings.slaUnit}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Low Priority SLA</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={settings.slaLowPriority}
                    onChange={(e) => setSettings({...settings, slaLowPriority: Number(e.target.value)})}
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                  <span className="text-slate-500 font-medium px-2">{settings.slaUnit}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-yellow-600">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-slate-900 text-lg font-bold">Notification Settings</CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-xs mt-1">
                    Configure notification channels and triggers
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      checked={settings.emailNotificationsEnabled}
                      onChange={(e) => setSettings({...settings, emailNotificationsEnabled: e.target.checked})}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-emerald-500 checked:border-emerald-500 transition-colors"
                    />
                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Enable Email Notifications</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      checked={settings.smsNotificationsEnabled}
                      onChange={(e) => setSettings({...settings, smsNotificationsEnabled: e.target.checked})}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-emerald-500 checked:border-emerald-500 transition-colors"
                    />
                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Enable SMS Notifications</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      checked={settings.pushNotificationsEnabled}
                      onChange={(e) => setSettings({...settings, pushNotificationsEnabled: e.target.checked})}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-emerald-500 checked:border-emerald-500 transition-colors"
                    />
                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Enable Push Notifications</span>
                </label>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <p className="text-slate-900 font-bold text-sm mb-4">Notification Triggers</p>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnIssueCreated}
                      onChange={(e) => setSettings({...settings, notifyOnIssueCreated: e.target.checked})}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-colors"
                    />
                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Issue Created</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnIssueAssigned}
                      onChange={(e) => setSettings({...settings, notifyOnIssueAssigned: e.target.checked})}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-colors"
                    />
                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Issue Assigned</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnIssueStatusChange}
                      onChange={(e) => setSettings({...settings, notifyOnIssueStatusChange: e.target.checked})}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-colors"
                    />
                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Status Changed</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnIssueResolved}
                      onChange={(e) => setSettings({...settings, notifyOnIssueResolved: e.target.checked})}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-colors"
                    />
                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Issue Resolved</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-emerald-600">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-slate-900 text-lg font-bold">Email Configuration</CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-xs mt-1">
                    SMTP server settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">SMTP Host</label>
                  <Input
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">SMTP Port</label>
                  <Input
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings({...settings, smtpPort: Number(e.target.value)})}
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                <Input
                  value={settings.smtpUsername}
                  onChange={(e) => setSettings({...settings, smtpUsername: e.target.value})}
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <Input
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">From Address</label>
                  <Input
                    type="email"
                    value={settings.emailFromAddress}
                    onChange={(e) => setSettings({...settings, emailFromAddress: e.target.value})}
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">From Name</label>
                  <Input
                    value={settings.emailFromName}
                    onChange={(e) => setSettings({...settings, emailFromName: e.target.value})}
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMS Settings */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-teal-600">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-slate-900 text-lg font-bold">SMS Configuration</CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-xs mt-1">
                    SMS provider settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">SMS Provider</label>
                <select
                  value={settings.smsProvider}
                  onChange={(e) => setSettings({...settings, smsProvider: e.target.value})}
                  className="w-full h-11 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-4 text-slate-700 font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                >
                  <option value="twilio">Twilio</option>
                  <option value="nexmo">Nexmo</option>
                  <option value="plivo">Plivo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">API Key</label>
                <Input
                  value={settings.smsApiKey}
                  onChange={(e) => setSettings({...settings, smsApiKey: e.target.value})}
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">API Secret</label>
                <Input
                  type="password"
                  value={settings.smsApiSecret}
                  onChange={(e) => setSettings({...settings, smsApiSecret: e.target.value})}
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Sender Name</label>
                <Input
                  value={settings.smsSenderName}
                  onChange={(e) => setSettings({...settings, smsSenderName: e.target.value})}
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  maxLength={11}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-rose-600">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-slate-900 text-lg font-bold">Security Settings</CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-xs mt-1">
                    Authentication and security configuration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Session Timeout (min)</label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({...settings, sessionTimeout: Number(e.target.value)})}
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Max Login Attempts</label>
                  <Input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings({...settings, maxLoginAttempts: Number(e.target.value)})}
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Minimum Password Length</label>
                <Input
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => setSettings({...settings, passwordMinLength: Number(e.target.value)})}
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      checked={settings.requireEmailVerification}
                      onChange={(e) => setSettings({...settings, requireEmailVerification: e.target.checked})}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-emerald-500 checked:border-emerald-500 transition-colors"
                    />
                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Require Email Verification</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      checked={settings.requirePhoneVerification}
                      onChange={(e) => setSettings({...settings, requirePhoneVerification: e.target.checked})}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-emerald-500 checked:border-emerald-500 transition-colors"
                    />
                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Require Phone Verification</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      checked={settings.enableTwoFactorAuth}
                      onChange={(e) => setSettings({...settings, enableTwoFactorAuth: e.target.checked})}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-emerald-500 checked:border-emerald-500 transition-colors"
                    />
                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Enable Two-Factor Authentication</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Database Settings */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-indigo-600">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-slate-900 text-lg font-bold">Database Settings</CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-xs mt-1">
                    Backup and maintenance configuration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <label className="flex items-center space-x-3 cursor-pointer group mb-2">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    checked={settings.autoBackupEnabled}
                    onChange={(e) => setSettings({...settings, autoBackupEnabled: e.target.checked})}
                    className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-emerald-500 checked:border-emerald-500 transition-colors"
                  />
                  <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Enable Automatic Backups</span>
              </label>
              <div className="opacity-90">
                <label className="block text-sm font-bold text-slate-700 mb-2">Backup Frequency</label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                  className="w-full h-11 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-4 text-slate-700 font-medium focus:ring-2 focus:ring-slate-900 outline-none disabled:opacity-50"
                  disabled={!settings.autoBackupEnabled}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Retention Period (days)</label>
                <Input
                  type="number"
                  value={settings.retentionDays}
                  onChange={(e) => setSettings({...settings, retentionDays: Number(e.target.value)})}
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors disabled:opacity-50"
                  disabled={!settings.autoBackupEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button (Bottom) */}
        <div className="mt-8 flex justify-center">
          <Button 
            className="bg-slate-900 hover:bg-slate-800 text-white px-12 h-14 rounded-xl text-base font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="h-5 w-5 mr-3" />
            {loading ? 'Saving Settings...' : 'Save All Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}

