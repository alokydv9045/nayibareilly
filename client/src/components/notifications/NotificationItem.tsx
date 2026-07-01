'use client';

import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  Megaphone,
  MessageSquare,
  UserPlus,
  TrendingUp,
  CheckCheck,
  X,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

const typeIcons = {
  INFO: Info,
  SUCCESS: CheckCircle2,
  WARNING: AlertTriangle,
  ERROR: AlertCircle,
  ANNOUNCEMENT: Megaphone,
};

const typeColors = {
  INFO: 'text-emerald-500 bg-emerald-50 dark:bg-blue-950',
  SUCCESS: 'text-green-500 bg-green-50 dark:bg-green-950',
  WARNING: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950',
  ERROR: 'text-red-500 bg-red-50 dark:bg-red-950',
  ANNOUNCEMENT: 'text-slate-700 bg-purple-50 dark:bg-purple-950',
};

const categoryIcons = {
  issue_status: TrendingUp,
  assignment: UserPlus,
  comment: MessageSquare,
  escalation: AlertTriangle,
  resolution: CheckCircle2,
  announcement: Megaphone,
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  compact = false,
}: NotificationItemProps) {
  const router = useRouter();
  const TypeIcon = typeIcons[notification.type] || Info;
  const CategoryIcon = notification.category
    ? categoryIcons[notification.category as keyof typeof categoryIcons]
    : null;

  const handleClick = () => {
    // Mark as read if unread
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  return (
    <div
      className={cn(
        'group relative flex gap-3 border-b p-4 transition-colors hover:bg-muted/50',
        !notification.read && 'bg-emerald-50/50 dark:bg-blue-950/20',
        notification.actionUrl && 'cursor-pointer',
        compact && 'p-3'
      )}
      onClick={handleClick}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          typeColors[notification.type],
          compact && 'h-8 w-8'
        )}
      >
        {CategoryIcon ? (
          <CategoryIcon className={cn('h-5 w-5', compact && 'h-4 w-4')} />
        ) : (
          <TypeIcon className={cn('h-5 w-5', compact && 'h-4 w-4')} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4
              className={cn(
                'text-sm font-semibold leading-tight',
                !notification.read && 'text-foreground',
                notification.read && 'text-muted-foreground'
              )}
            >
              {notification.title}
            </h4>
            {notification.message && (
              <p
                className={cn(
                  'mt-1 text-sm',
                  !notification.read && 'text-foreground/80',
                  notification.read && 'text-muted-foreground',
                  compact && 'line-clamp-2'
                )}
              >
                {notification.message}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.read && onMarkAsRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleMarkAsRead}
                title="Mark as read"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                title="Delete"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span>

          {notification.priority === 'HIGH' && (
            <>
              <span>•</span>
              <span className="text-orange-500 font-medium">High Priority</span>
            </>
          )}

          {notification.priority === 'URGENT' && (
            <>
              <span>•</span>
              <span className="text-red-500 font-bold">URGENT</span>
            </>
          )}

          {notification.issue && (
            <>
              <span>•</span>
              <span className="font-mono">#{notification.issue.reportId}</span>
            </>
          )}

          {notification.actionUrl && (
            <>
              <span>•</span>
              <ExternalLink className="h-3 w-3" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationItem;
