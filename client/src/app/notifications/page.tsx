'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Filter, Loader2, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { useRouter } from 'next/navigation';
import RequireUser from '@/components/features/auth/RequireUser';
import CitizenLayout from '@/components/layout/CitizenLayout';

function NotificationCenterContent() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
    clearRead,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Fetch notifications based on filters
  useEffect(() => {
    interface NotificationOptions {
      limit: number;
      read?: boolean;
      type?: string;
      category?: string;
    }
    
    const options: NotificationOptions = { limit: 50 };

    if (filter === 'unread') {
      options.read = false;
    } else if (filter === 'read') {
      options.read = true;
    }

    if (typeFilter !== 'all') {
      options.type = typeFilter;
    }

    if (categoryFilter !== 'all') {
      options.category = categoryFilter;
    }

    fetchNotifications(options);
  }, [filter, typeFilter, categoryFilter, fetchNotifications]);

  const handleClearRead = async () => {
    if (confirm('Are you sure you want to delete all read notifications?')) {
      await clearRead();
    }
  };

  const filteredNotifications = notifications;

  return (
    <div className="container max-w-5xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-muted-foreground mt-1">
            Manage your notifications and preferences
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-slate-400'
              }`}
            />
            <span className="text-xs font-medium">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push('/notifications/preferences')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Unread</CardDescription>
            <CardTitle className="text-3xl">{unreadCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Today</CardDescription>
            <CardTitle className="text-3xl">
              {
                notifications.filter(
                  (n) =>
                    new Date(n.createdAt).toDateString() === new Date().toDateString()
                ).length
              }
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{notifications.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Tabs value={filter} onValueChange={(v: string) => setFilter(v as 'all' | 'unread' | 'read')}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread {unreadCount > 0 && `(${unreadCount})`}
                  </TabsTrigger>
                  <TabsTrigger value="read">Read</TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                  <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="issue_status">Status Updates</SelectItem>
                  <SelectItem value="assignment">Assignments</SelectItem>
                  <SelectItem value="comment">Comments</SelectItem>
                  <SelectItem value="escalation">Escalations</SelectItem>
                  <SelectItem value="resolution">Resolutions</SelectItem>
                  <SelectItem value="announcement">Announcements</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              )}
              {notifications.some((n) => n.read) && (
                <Button variant="outline" size="sm" onClick={handleClearRead}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium mb-1">No notifications</h4>
              <p className="text-sm text-muted-foreground max-w-sm">
                {filter === 'unread'
                  ? "You're all caught up! No unread notifications."
                  : 'No notifications to display with the current filters.'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotifications}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function NotificationsPageRoot() {
  return (
    <RequireUser>
      <CitizenLayout>
        <NotificationCenterContent />
      </CitizenLayout>
    </RequireUser>
  );
}