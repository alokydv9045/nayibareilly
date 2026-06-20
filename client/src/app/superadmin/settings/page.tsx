"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { useSuperadminSettings, useUpdateSettings } from '@/hooks/api/useSuperadminAPI'

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
  const { data: fetchedSettings, isLoading } = useSuperadminSettings()
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
      setSettings(fetchedSettings)
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
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/superadmin">
                <Button variant="outline" className="bg-amber-100/50 text-amber-950 border-amber-200/60 hover:bg-amber-200/50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-amber-950">System Settings</h1>
                <p className="text-purple-200">Configure platform-wide settings and preferences</p>
              </div>
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-amber-950"
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-green-500/20 border border-green-500 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-200">Settings saved successfully!</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Settings */}
          <Card className="bg-amber-100/50  border-amber-200/60">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Globe className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-amber-950">Platform Settings</CardTitle>
                  <CardDescription className="text-purple-200">
                    Basic platform configuration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-purple-200 text-sm mb-2">Platform Name</label>
                <Input
                  value={settings.platformName}
                  onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Description</label>
                <Input
                  value={settings.platformDescription}
                  onChange={(e) => setSettings({...settings, platformDescription: e.target.value})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Platform URL</label>
                <Input
                  value={settings.platformUrl}
                  onChange={(e) => setSettings({...settings, platformUrl: e.target.value})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Support Email</label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Support Phone</label>
                <Input
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                />
              </div>
            </CardContent>
          </Card>

          {/* SLA Settings */}
          <Card className="bg-amber-100/50  border-amber-200/60">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-orange-600" />
                <div>
                  <CardTitle className="text-amber-950">SLA Configuration</CardTitle>
                  <CardDescription className="text-purple-200">
                    Service Level Agreement timeframes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-purple-200 text-sm mb-2">High Priority SLA</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={settings.slaHighPriority}
                    onChange={(e) => setSettings({...settings, slaHighPriority: Number(e.target.value)})}
                    className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                  />
                  <select
                    value={settings.slaUnit}
                    onChange={(e) => setSettings({...settings, slaUnit: e.target.value as 'hours' | 'days'})}
                    className="bg-amber-100/50 border border-amber-200/60 rounded-lg px-3 py-2 text-amber-950"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Medium Priority SLA</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={settings.slaMediumPriority}
                    onChange={(e) => setSettings({...settings, slaMediumPriority: Number(e.target.value)})}
                    className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                  />
                  <span className="text-purple-200">{settings.slaUnit}</span>
                </div>
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Low Priority SLA</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={settings.slaLowPriority}
                    onChange={(e) => setSettings({...settings, slaLowPriority: Number(e.target.value)})}
                    className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                  />
                  <span className="text-purple-200">{settings.slaUnit}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-amber-100/50  border-amber-200/60">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6 text-yellow-600" />
                <div>
                  <CardTitle className="text-amber-950">Notification Settings</CardTitle>
                  <CardDescription className="text-purple-200">
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
                  <span className="text-purple-200">Enable Email Notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.smsNotificationsEnabled}
                    onChange={(e) => setSettings({...settings, smsNotificationsEnabled: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-purple-200">Enable SMS Notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.pushNotificationsEnabled}
                    onChange={(e) => setSettings({...settings, pushNotificationsEnabled: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-purple-200">Enable Push Notifications</span>
                </label>
              </div>

              <hr className="border-amber-200/60" />

              <div className="space-y-3">
                <p className="text-amber-950 font-semibold text-sm">Notification Triggers</p>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnIssueCreated}
                    onChange={(e) => setSettings({...settings, notifyOnIssueCreated: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-purple-200">Issue Created</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnIssueAssigned}
                    onChange={(e) => setSettings({...settings, notifyOnIssueAssigned: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-purple-200">Issue Assigned</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnIssueStatusChange}
                    onChange={(e) => setSettings({...settings, notifyOnIssueStatusChange: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-purple-200">Status Changed</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnIssueResolved}
                    onChange={(e) => setSettings({...settings, notifyOnIssueResolved: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-purple-200">Issue Resolved</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card className="bg-amber-100/50  border-amber-200/60">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Mail className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle className="text-amber-950">Email Configuration</CardTitle>
                  <CardDescription className="text-purple-200">
                    SMTP server settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-purple-200 text-sm mb-2">SMTP Host</label>
                <Input
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">SMTP Port</label>
                <Input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({...settings, smtpPort: Number(e.target.value)})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Username</label>
                <Input
                  value={settings.smtpUsername}
                  onChange={(e) => setSettings({...settings, smtpUsername: e.target.value})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Password</label>
                <Input
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">From Address</label>
                <Input
                  type="email"
                  value={settings.emailFromAddress}
                  onChange={(e) => setSettings({...settings, emailFromAddress: e.target.value})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">From Name</label>
                <Input
                  value={settings.emailFromName}
                  onChange={(e) => setSettings({...settings, emailFromName: e.target.value})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                />
              </div>
            </CardContent>
          </Card>

          {/* SMS Settings */}
          <Card className="bg-amber-100/50  border-amber-200/60">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-amber-950">SMS Configuration</CardTitle>
                  <CardDescription className="text-purple-200">
                    SMS provider settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-purple-200 text-sm mb-2">SMS Provider</label>
                <select
                  value={settings.smsProvider}
                  onChange={(e) => setSettings({...settings, smsProvider: e.target.value})}
                  className="w-full bg-amber-100/50 border border-amber-200/60 rounded-lg px-3 py-2 text-amber-950"
                >
                  <option value="twilio">Twilio</option>
                  <option value="nexmo">Nexmo</option>
                  <option value="plivo">Plivo</option>
                </select>
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">API Key</label>
                <Input
                  value={settings.smsApiKey}
                  onChange={(e) => setSettings({...settings, smsApiKey: e.target.value})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">API Secret</label>
                <Input
                  type="password"
                  value={settings.smsApiSecret}
                  onChange={(e) => setSettings({...settings, smsApiSecret: e.target.value})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Sender Name</label>
                <Input
                  value={settings.smsSenderName}
                  onChange={(e) => setSettings({...settings, smsSenderName: e.target.value})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                  maxLength={11}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-amber-100/50  border-amber-200/60">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-purple-600" />
                <div>
                  <CardTitle className="text-amber-950">Security Settings</CardTitle>
                  <CardDescription className="text-purple-200">
                    Authentication and security configuration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-purple-200 text-sm mb-2">Session Timeout (minutes)</label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({...settings, sessionTimeout: Number(e.target.value)})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Max Login Attempts</label>
                <Input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({...settings, maxLoginAttempts: Number(e.target.value)})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Minimum Password Length</label>
                <Input
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => setSettings({...settings, passwordMinLength: Number(e.target.value)})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
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
                  <span className="text-purple-200">Require Email Verification</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.requirePhoneVerification}
                    onChange={(e) => setSettings({...settings, requirePhoneVerification: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-purple-200">Require Phone Verification</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.enableTwoFactorAuth}
                    onChange={(e) => setSettings({...settings, enableTwoFactorAuth: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-purple-200">Enable Two-Factor Authentication</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Database Settings */}
          <Card className="bg-amber-100/50  border-amber-200/60">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Database className="h-6 w-6 text-indigo-600" />
                <div>
                  <CardTitle className="text-amber-950">Database Settings</CardTitle>
                  <CardDescription className="text-purple-200">
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
                <span className="text-purple-200">Enable Automatic Backups</span>
              </label>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Backup Frequency</label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                  className="w-full bg-amber-100/50 border border-amber-200/60 rounded-lg px-3 py-2 text-amber-950"
                  disabled={!settings.autoBackupEnabled}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Retention Period (days)</label>
                <Input
                  type="number"
                  value={settings.retentionDays}
                  onChange={(e) => setSettings({...settings, retentionDays: Number(e.target.value)})}
                  className="bg-amber-100/50 border-amber-200/60 text-amber-950"
                  disabled={!settings.autoBackupEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button (Bottom) */}
        <div className="mt-8 flex justify-center">
          <Button 
            className="bg-green-600 hover:bg-green-700 text-amber-950 px-12 py-6 text-lg"
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
