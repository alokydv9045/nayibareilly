'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from '@/lib/providers/SessionProvider';
import { tokenStorage } from '@/lib/auth/auth-utils';
import socketService from '@/lib/services/socket-service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

// Local interfaces to match socket service types
interface IssueEventData {
  issueId: string;
  issue: {
    title: string;
    status: string;
    priority: string;
    assignedTo?: string;
    department: string;
  };
  user: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
}

interface UserEventData {
  userId: string;
  email: string;
  name: string;
  role: string;
  timestamp: string;
}

interface SystemAlertData {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: string;
  timestamp: string;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: unknown;
}

export function RealTimeNotifications() {
  const { user } = useSession();
  const token = tokenStorage.get();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user || !token) return;

    // Connect to real-time updates
    socketService.connect(token);
    socketService.joinAdminRooms(user);

    // Set up notification handlers
    const handleIssueCreated = (data: IssueEventData) => {
      const notification: Notification = {
        id: `issue-${data.issueId}-${Date.now()}`,
        type: 'info',
        title: 'New Issue Created',
        message: `Issue "${data.issue.title}" has been created`,
        timestamp: new Date().toISOString(),
        read: false,
        data
      };
      addNotification(notification);
      toast.success('New issue created');
    };

    const handleIssueUpdated = (data: IssueEventData) => {
      const notification: Notification = {
        id: `issue-update-${data.issueId}-${Date.now()}`,
        type: 'info',
        title: 'Issue Updated',
        message: `Issue "${data.issue.title}" status changed to ${data.issue.status}`,
        timestamp: new Date().toISOString(),
        read: false,
        data
      };
      addNotification(notification);
    };

    const handleIssueEscalated = (data: IssueEventData) => {
      const notification: Notification = {
        id: `escalation-${data.issueId}-${Date.now()}`,
        type: 'warning',
        title: 'Issue Escalated',
        message: `Issue "${data.issue.title}" has been escalated`,
        timestamp: new Date().toISOString(),
        read: false,
        data
      };
      addNotification(notification);
      toast.error('Issue escalated', {
        icon: 'ðŸš¨',
        duration: 5000
      });
    };

    const handleSystemAlert = (data: SystemAlertData) => {
      const notification: Notification = {
        id: `alert-${Date.now()}`,
        type: data.type,
        title: 'System Alert',
        message: data.message,
        timestamp: new Date().toISOString(),
        read: false,
        data
      };
      addNotification(notification);
      
      // Show toast based on alert type
      switch (data.type) {
        case 'error':
          toast.error(data.message);
          break;
        case 'warning':
          toast(data.message, { icon: 'âš ï¸' });
          break;
        case 'success':
          toast.success(data.message);
          break;
        default:
          toast(data.message);
      }
    };

    const handleUserLogin = (data: UserEventData) => {
      if (user.roles.includes('super_admin')) {
        const notification: Notification = {
          id: `login-${data.userId}-${Date.now()}`,
          type: 'info',
          title: 'User Login',
          message: `${data.name} (${data.role}) logged in`,
          timestamp: new Date().toISOString(),
          read: false,
          data
        };
        addNotification(notification);
      }
    };

    // Subscribe to events
    socketService.onIssueCreated(handleIssueCreated);
    socketService.onIssueUpdated(handleIssueUpdated);
    socketService.onIssueEscalated(handleIssueEscalated);
    socketService.onSystemAlert(handleSystemAlert);
    socketService.onUserLogin(handleUserLogin);

    // Cleanup
    return () => {
      socketService.off('issue:created');
      socketService.off('issue:updated');
      socketService.off('issue:escalated');
      socketService.off('system:alert');
      socketService.off('user:login');
    };
  }, [user, token]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep max 50 notifications
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-emerald-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 max-h-96 overflow-hidden bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <>
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all read
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearAll}>
                      Clear all
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                    !notification.read ? 'bg-emerald-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}