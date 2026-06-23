"use client"

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
  CheckCircle,
  Settings
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
          if ((fetchedSettings as any)[key] !== undefined && (fetchedSettings as any)[key] !== null) {
            (next as any)[key] = (fetchedSettings as any)[key];
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
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Topbar */}
      <header className="sticky top-16 lg:top-0 z-40 bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/techadmin">
            <Button variant="outline" className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shrink-0 h-9 w-9 p-0 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="p-2 bg-slate-50 rounded-lg hidden sm:block">
            <Settings className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              System Settings
              <Badge variant="outline" className="text-xs bg-gray-50 hidden sm:flex">TechAdmin</Badge>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Configure platform-wide settings and preferences</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-green-500/20 border border-green-500 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-700">Settings saved successfully!</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Settings */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Globe className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-gray-900">Platform Settings</CardTitle>
                  <CardDescription className="text-gray-500">
                    Basic platform configuration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-gray-500 text-sm mb-2">Platform Name</label>
                <Input
                  value={settings.platformName}
                  onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">Description</label>
                <Input
                  value={settings.platformDescription}
                  onChange={(e) => setSettings({...settings, platformDescription: e.target.value})}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">Platform URL</label>
                <Input
                  value={settings.platformUrl}
                  onChange={(e) => setSettings({...settings, platformUrl: e.target.value})}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">Support Email</label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">Support Phone</label>
                <Input
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
            </CardContent>
          </Card>

          {/* SLA Settings */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-orange-600" />
                <div>
                  <CardTitle className="text-gray-900">SLA Configuration</CardTitle>
                  <CardDescription className="text-gray-500">
                    Service Level Agreement timeframes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-gray-500 text-sm mb-2">High Priority SLA</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={settings.slaHighPriority}
                    onChange={(e) => setSettings({...settings, slaHighPriority: Number(e.target.value)})}
                    className="bg-white border-gray-200 text-gray-900"
                  />
                  <select
                    value={settings.slaUnit}
                    onChange={(e) => setSettings({...settings, slaUnit: e.target.value as 'hours' | 'days'})}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">Medium Priority SLA</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={settings.slaMediumPriority}
                    onChange={(e) => setSettings({...settings, slaMediumPriority: Number(e.target.value)})}
                    className="bg-white border-gray-200 text-gray-900"
                  />
                  <span className="text-gray-500">{settings.slaUnit}</span>
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">Low Priority SLA</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={settings.slaLowPriority}
                    onChange={(e) => setSettings({...settings, slaLowPriority: Number(e.target.value)})}
                    className="bg-white border-gray-200 text-gray-900"
                  />
                  <span className="text-gray-500">{settings.slaUnit}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6 text-yellow-600" />
                <div>
                  <CardTitle className="text-gray-900">Notification Settings</CardTitle>
                  <CardDescription className="text-gray-500">
                    Configure notification channels and triggers
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.emailNotificationsEnabled}
                    onChange={(e) => setSettings({...settings, emailNotificationsEnabled: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-gray-500">Enable Email Notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.smsNotificationsEnabled}
                    onChange={(e) => setSettings({...settings, smsNotificationsEnabled: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-gray-500">Enable SMS Notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.pushNotificationsEnabled}
                    onChange={(e) => setSettings({...settings, pushNotificationsEnabled: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-gray-500">Enable Push Notifications</span>
                </label>
              </div>

              <hr className="border-gray-200" />

              <div className="space-y-3">
                <p className="text-gray-900 font-semibold text-sm">Notification Triggers</p>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnIssueCreated}
                    onChange={(e) => setSettings({...settings, notifyOnIssueCreated: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-gray-500">Issue Created</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnIssueAssigned}
                    onChange={(e) => setSettings({...settings, notifyOnIssueAssigned: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-gray-500">Issue Assigned</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnIssueStatusChange}
                    onChange={(e) => setSettings({...settings, notifyOnIssueStatusChange: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-gray-500">Status Changed</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnIssueResolved}
                    onChange={(e) => setSettings({...settings, notifyOnIssueResolved: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-gray-500">Issue Resolved</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Mail className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle className="text-gray-900">Email Configuration</CardTitle>
                  <CardDescription className="text-gray-500">
                    SMTP server settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-gray-500 text-sm mb-2">SMTP Host</label>
                <Input
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                  className="bg-white border-gray-200 text-gray-900"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">SMTP Port</label>
                <Input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({...settings, smtpPort: Number(e.target.value)})}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">Username</label>
                <Input
                  value={settings.smtpUsername}
                  onChange={(e) => setSettings({...settings, smtpUsername: e.target.value})}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">Password</label>
                <Input
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">From Address</label>
                <Input
                  type="email"
                  value={settings.emailFromAddress}
                  onChange={(e) => setSettings({...settings, emailFromAddress: e.target.value})}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">From Name</label>
                <Input
                  value={settings.emailFromName}
                  onChange={(e) => setSettings({...settings, emailFromName: e.target.value})}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
            </CardContent>
          </Card>

          {/* SMS Settings */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-gray-900">SMS Configuration</CardTitle>
                  <CardDescription className="text-gray-500">
                    SMS provider settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-gray-500 text-sm mb-2">SMS Provider</label>
                <select
                  value={settings.smsProvider}
                  onChange={(e) => setSettings({...settings, smsProvider: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                >
                  <option value="twilio">Twilio</option>
                  <option value="nexmo">Nexmo</option>
                  <option value="plivo">Plivo</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">API Key</label>
                <Input
                  value={settings.smsApiKey}
                  onChange={(e) => setSettings({...settings, smsApiKey: e.target.value})}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">API Secret</label>
                <Input
                  type="password"
                  value={settings.smsApiSecret}
                  onChange={(e) => setSettings({...settings, smsApiSecret: e.target.value})}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">Sender Name</label>
                <Input
                  value={settings.smsSenderName}
                  onChange={(e) => setSettings({...settings, smsSenderName: e.target.value})}
                  className="bg-white border-gray-200 text-gray-900"
                  maxLength={11}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-gray-900">Security Settings</CardTitle>
                  <CardDescription className="text-gray-500">
                    Authentication and security configuration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-gray-500 text-sm mb-2">Session Timeout (minutes)</label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({...settings, sessionTimeout: Number(e.target.value)})}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">Max Login Attempts</label>
                <Input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({...settings, maxLoginAttempts: Number(e.target.value)})}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">Minimum Password Length</label>
                <Input
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => setSettings({...settings, passwordMinLength: Number(e.target.value)})}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.requireEmailVerification}
                    onChange={(e) => setSettings({...settings, requireEmailVerification: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-gray-500">Require Email Verification</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.requirePhoneVerification}
                    onChange={(e) => setSettings({...settings, requirePhoneVerification: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-gray-500">Require Phone Verification</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.enableTwoFactorAuth}
                    onChange={(e) => setSettings({...settings, enableTwoFactorAuth: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-gray-500">Enable Two-Factor Authentication</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Database Settings */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Database className="h-6 w-6 text-indigo-600" />
                <div>
                  <CardTitle className="text-gray-900">Database Settings</CardTitle>
                  <CardDescription className="text-gray-500">
                    Backup and maintenance configuration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.autoBackupEnabled}
                  onChange={(e) => setSettings({...settings, autoBackupEnabled: e.target.checked})}
                  className="rounded"
                />
                <span className="text-gray-500">Enable Automatic Backups</span>
              </label>
              <div>
                <label className="block text-gray-500 text-sm mb-2">Backup Frequency</label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                  disabled={!settings.autoBackupEnabled}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">Retention Period (days)</label>
                <Input
                  type="number"
                  value={settings.retentionDays}
                  onChange={(e) => setSettings({...settings, retentionDays: Number(e.target.value)})}
                  className="bg-white border-gray-200 text-gray-900"
                  disabled={!settings.autoBackupEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button (Bottom) */}
        <div className="mt-8 flex justify-center">
          <Button 
            className="bg-green-600 hover:bg-green-700 text-gray-900 px-12 py-6 text-lg"
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

