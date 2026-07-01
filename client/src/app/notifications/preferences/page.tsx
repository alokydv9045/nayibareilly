'use client';

import { ArrowLeft, Bell, Mail, Smartphone, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNotificationPreferences } from '@/hooks/useNotifications';
import { useToast } from '@/components/ui/use-toast';
import RequireUser from '@/components/features/auth/RequireUser';
import CitizenLayout from '@/components/layout/CitizenLayout';

function NotificationPreferencesContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { preferences, isLoading, updatePreferences } = useNotificationPreferences();

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await updatePreferences({ [key]: value });
      toast({
        title: 'Preference updated',
        description: 'Your notification preference has been saved.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update preference. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEmailDigestChange = async (value: string) => {
    try {
      await updatePreferences({ emailDigest: value as 'NEVER' | 'DAILY' | 'WEEKLY' | 'IMMEDIATE' | 'HOURLY' });
      toast({
        title: 'Email digest updated',
        description: 'Your email notification frequency has been changed.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update email digest. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleQuietHoursChange = async (start: number, end: number) => {
    try {
      await updatePreferences({
        quietHoursStart: start,
        quietHoursEnd: end,
      });
      toast({
        title: 'Quiet hours updated',
        description: 'Your quiet hours have been set.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update quiet hours. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !preferences) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Notification Preferences</h1>
        <p className="text-muted-foreground mt-1">
          Customize how and when you receive notifications
        </p>
      </div>

      {/* Delivery Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="in-app" className="font-medium">
                  In-App Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications in the app and browser
                </p>
              </div>
            </div>
            <Switch
              id="in-app"
              checked={preferences.enableInApp}
              onCheckedChange={(checked: boolean) => handleToggle('enableInApp', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/10 p-2">
                <Mail className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <Label htmlFor="email" className="font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              id="email"
              checked={preferences.enableEmail}
              onCheckedChange={(checked: boolean) => handleToggle('enableEmail', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/10 p-2">
                <Smartphone className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <Label htmlFor="push" className="font-medium">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get push notifications on your device
                </p>
              </div>
            </div>
            <Switch
              id="push"
              checked={preferences.enablePush}
              onCheckedChange={(checked: boolean) => handleToggle('enablePush', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
          <CardDescription>
            Select which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="status" className="font-medium">
                Issue Status Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                When an issue status changes
              </p>
            </div>
            <Switch
              id="status"
              checked={preferences.issueStatusUpdates}
              onCheckedChange={(checked: boolean) =>
                handleToggle('issueStatusUpdates', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="assignments" className="font-medium">
                Issue Assignments
              </Label>
              <p className="text-sm text-muted-foreground">
                When an issue is assigned to you
              </p>
            </div>
            <Switch
              id="assignments"
              checked={preferences.issueAssignments}
              onCheckedChange={(checked: boolean) =>
                handleToggle('issueAssignments', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="comments" className="font-medium">
                New Comments
              </Label>
              <p className="text-sm text-muted-foreground">
                When someone comments on your issues
              </p>
            </div>
            <Switch
              id="comments"
              checked={preferences.issueComments}
              onCheckedChange={(checked: boolean) => handleToggle('issueComments', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="escalations" className="font-medium">
                Issue Escalations
              </Label>
              <p className="text-sm text-muted-foreground">
                When an issue is escalated
              </p>
            </div>
            <Switch
              id="escalations"
              checked={preferences.issueEscalations}
              onCheckedChange={(checked: boolean) =>
                handleToggle('issueEscalations', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="resolutions" className="font-medium">
                Issue Resolutions
              </Label>
              <p className="text-sm text-muted-foreground">
                When your issue is resolved
              </p>
            </div>
            <Switch
              id="resolutions"
              checked={preferences.issueResolutions}
              onCheckedChange={(checked: boolean) =>
                handleToggle('issueResolutions', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="announcements" className="font-medium">
                System Announcements
              </Label>
              <p className="text-sm text-muted-foreground">
                Important system updates and announcements
              </p>
            </div>
            <Switch
              id="announcements"
              checked={preferences.systemAnnouncements}
              onCheckedChange={(checked: boolean) =>
                handleToggle('systemAnnouncements', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      {preferences.enableEmail && (
        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>
              Configure how often you receive email notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Email Digest Frequency</Label>
              <Select
                value={preferences.emailDigest}
                onValueChange={handleEmailDigestChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                  <SelectItem value="HOURLY">Hourly</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="NEVER">Never</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {preferences.emailDigest === 'IMMEDIATE'
                  ? 'Get emails as soon as notifications arrive'
                  : preferences.emailDigest === 'NEVER'
                  ? 'Never send email notifications'
                  : `Receive a summary of notifications ${preferences.emailDigest.toLowerCase()}`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>
            Set hours when you don&apos;t want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select
                value={preferences.quietHoursStart?.toString() || 'none'}
                onValueChange={(value) => {
                  if (value === 'none') {
                    handleQuietHoursChange(0, 0);
                  } else {
                    handleQuietHoursChange(
                      parseInt(value),
                      preferences.quietHoursEnd || 7
                    );
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No quiet hours</SelectItem>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {preferences.quietHoursStart !== null && (
              <div className="space-y-2">
                <Label>End Time</Label>
                <Select
                  value={preferences.quietHoursEnd?.toString() || '7'}
                  onValueChange={(value) =>
                    handleQuietHoursChange(
                      preferences.quietHoursStart || 22,
                      parseInt(value)
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {preferences.quietHoursStart !== null && (
            <p className="text-sm text-muted-foreground mt-3">
              Notifications will be held during quiet hours and delivered afterwards
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function NotificationPreferencesPage() {
  return (
    <RequireUser>
      <CitizenLayout>
        <NotificationPreferencesContent />
      </CitizenLayout>
    </RequireUser>
  );
}
