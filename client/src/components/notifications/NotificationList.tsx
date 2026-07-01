'use client';

import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationListProps {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  onMarkAsRead: (id: string | string[]) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string | string[]) => void;
  compact?: boolean;
}

export function NotificationList({
  notifications,
  unreadCount,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  compact = false,
}: NotificationListProps) {
  const router = useRouter();

  const handleViewAll = () => {
    router.push('/notifications');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="h-8 text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Notification list */}
      {isLoading && notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h4 className="font-medium mb-1">No notifications</h4>
          <p className="text-sm text-muted-foreground max-w-sm">
            You’re all caught up! We’ll notify you when something important happens.
          </p>
        </div>
      ) : (
        <>
          <ScrollArea className={compact ? 'h-[400px]' : 'flex-1'}>
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                  compact={compact}
                />
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          {compact && notifications.length > 0 && (
            <>
              <Separator />
              <div className="p-3">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleViewAll}
                >
                  View all notifications
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default NotificationList;
