'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { initializeSocket, disconnectSocket, requestUnreadCount } from '@/lib/socket';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message?: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ANNOUNCEMENT';
  category?: string;
  relatedIssueId?: string;
  relatedUserId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  read: boolean;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  expiresAt?: string;
  createdAt: string;
  readAt?: string;
  issue?: {
    id: string;
    reportId: string;
    title: string;
    status: string;
    priority: string;
  };
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  enableInApp: boolean;
  enableEmail: boolean;
  enablePush: boolean;
  issueStatusUpdates: boolean;
  issueAssignments: boolean;
  issueComments: boolean;
  issueEscalations: boolean;
  issueResolutions: boolean;
  systemAnnouncements: boolean;
  emailDigest: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'NEVER';
  quietHoursStart?: number;
  quietHoursEnd?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook for managing notifications with real-time updates
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const socketInitialized = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || socketInitialized.current) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
    
    try {
      const socket = initializeSocket({ url: apiUrl, token });
      socketInitialized.current = true;

      // Connection status
      socket.on('connect', () => {
        setIsConnected(true);
        requestUnreadCount();
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      // Real-time notification
      socket.on('notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Optional: Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/icons/icon-192x192.png',
            tag: notification.id,
          });
        }
      });

      // Unread count update
      socket.on('unread-count', ({ count }: { count: number }) => {
        setUnreadCount(count);
      });

      // Notification marked as read
      socket.on('notification:read:success', ({ id }: { id: string }) => {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
        );
      });

      return () => {
        disconnectSocket();
        socketInitialized.current = false;
      };
    } catch (err) {
      console.error('Socket initialization error:', err);
      setError('Failed to connect to notification service');
    }
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (options: {
    read?: boolean;
    type?: string;
    category?: string;
    priority?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_DEV || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'}/notifications?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error.message);
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark notification(s) as read
  const markAsRead = useCallback(async (notificationIds: string | string[]) => {
    try {
      const token = localStorage.getItem('token');
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_DEV || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'}/notifications/read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n => (ids.includes(n.id) ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - ids.length));
    } catch (err: unknown) {
      console.error('Error marking as read:', err);
      throw err;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_DEV || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'}/notifications/read-all`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err: unknown) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  }, []);

  // Delete notification(s)
  const deleteNotifications = useCallback(async (notificationIds: string | string[]) => {
    try {
      const token = localStorage.getItem('token');
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_DEV || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'}/notifications`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete notifications');
      }

      setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
      
      // Decrease unread count for unread notifications being deleted
      const deletedUnreadCount = notifications.filter(n => ids.includes(n.id) && !n.read).length;
      setUnreadCount(prev => Math.max(0, prev - deletedUnreadCount));
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Error fetching notifications:', error);
      throw err;
    }
  }, [notifications]);

  // Clear all read notifications
  const clearRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_DEV || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'}/notifications/read`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to clear read notifications');
      }

      setNotifications(prev => prev.filter(n => !n.read));
    } catch (err: unknown) {
      console.error('Error clearing read notifications:', err);
      throw err;
    }
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    isConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
    clearRead,
    requestNotificationPermission,
  };
}

/**
 * Hook for managing notification preferences
 */
export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_DEV || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'}/notifications/preferences`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      setPreferences(data.data);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error.message);
      console.error('Error fetching preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_DEV || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'}/notifications/preferences`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const data = await response.json();
      setPreferences(data.data);
      return data.data;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error.message);
      console.error('Error updating preferences:', error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    error,
    fetchPreferences,
    updatePreferences,
  };
}

const notificationHooks = {
  useNotifications,
  useNotificationPreferences,
};

export default notificationHooks;
