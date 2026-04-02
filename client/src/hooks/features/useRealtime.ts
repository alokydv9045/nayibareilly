"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/utils/logger';
import { config } from '@/lib/constants/app.config';

// Real-time event types
export interface RealtimeEvent {
  type: 'status.updated' | 'assignment.updated' | 'comment.created' | 'photo.added' | 'sla.breached' | 'note.added';
  issueId: string;
  data: Record<string, unknown>;
  timestamp: string;
  userId?: string;
}

interface UseRealtimeOptions {
  issueId?: string;
  userId?: string;
  onEvent?: (event: RealtimeEvent) => void;
  autoReconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  transport?: 'sse' | 'websocket'; // Transport type selection
}

interface RealtimeState {
  isConnected: boolean;
  isConnecting: boolean;
  lastEvent: RealtimeEvent | null;
  error: string | null;
  reconnectAttempts: number;
}

// Server-Sent Events implementation for real-time updates
export function useRealtime({
  issueId,
  userId,
  onEvent,
  autoReconnect = true,
  reconnectDelay = 3000,
  maxReconnectAttempts = 5,
  transport: _transport = 'sse' // Default to SSE
}: UseRealtimeOptions = {}) {
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    isConnecting: false,
    lastEvent: null,
    error: null,
    reconnectAttempts: 0
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Build SSE URL with parameters
  const buildSSEUrl = useCallback(() => {
    // Initialize socket only on client side
    if (typeof window === 'undefined') return '';

    const baseUrl = config.api.fullUrl;
    const url = new URL(`${baseUrl}/realtime/events`, window.location.origin);
    
    if (issueId) url.searchParams.set('issueId', issueId);
    if (userId) url.searchParams.set('userId', userId);
    
    return url.toString();
  }, [issueId, userId]);

  // Internal connect function (not exposed)
  const connectInternal = useCallback(() => {
    if (!mountedRef.current) return;
    
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const url = buildSSEUrl();
      const eventSource = new EventSource(url);
      
      eventSource.onopen = () => {
        if (!mountedRef.current) return;
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0
        }));
        
        console.log('Realtime connection established');
      };

      eventSource.onmessage = (event) => {
        if (!mountedRef.current) return;
        
        try {
          const realtimeEvent: RealtimeEvent = JSON.parse(event.data);
          
          setState(prev => ({
            ...prev,
            lastEvent: realtimeEvent
          }));
          
          // Call custom event handler
          onEvent?.(realtimeEvent);
          
          // Show toast notifications for important events
          handleEventNotification(realtimeEvent);
          
        } catch (err) {
          console.error('Failed to parse realtime event:', err);
        }
      };

      eventSource.onerror = (error) => {
        if (!mountedRef.current) return;
        
        console.error('Realtime connection error:', error);
        
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: 'Connection failed'
        }));
        
        eventSource.close();
        
        // Auto-reconnect if enabled
        setState(prev => {
          const currentAttempts = prev.reconnectAttempts;
          if (autoReconnect && currentAttempts < maxReconnectAttempts) {
            // Schedule reconnection inline to avoid circular dependency
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            
            reconnectTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                connectInternal();
              }
            }, reconnectDelay);
            
            return {
              ...prev,
              reconnectAttempts: currentAttempts + 1
            };
          }
          return prev;
        });
      };

      eventSourceRef.current = eventSource;
      
    } catch (err) {
      console.error('Failed to establish realtime connection:', err);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to connect'
      }));
    }
  }, [buildSSEUrl, onEvent, autoReconnect, maxReconnectAttempts, reconnectDelay]);

  // Public connect function
  const connect = useCallback(() => {
    connectInternal();
  }, [connectInternal]);

  // Disconnect from SSE stream
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false
    }));
  }, []);

  // Handle event notifications
  const handleEventNotification = (event: RealtimeEvent) => {
    switch (event.type) {
      case 'status.updated':
        toast.success(`Issue status updated to: ${event.data.status}`);
        break;
      case 'assignment.updated':
        toast.success(`Issue assigned to: ${event.data.assignee}`);
        break;
      case 'comment.created':
        if (event.data.isPublic) {
          toast.success('New comment added to your issue');
        }
        break;
      case 'sla.breached':
        toast.error('Issue resolution deadline has been extended');
        break;
      default:
        // Don't show notifications for other event types
        break;
    }
  };

  // Send events (for WebSocket implementation)
  const sendEvent = useCallback((event: Omit<RealtimeEvent, 'timestamp'>) => {
    // This would be implemented for WebSocket bidirectional communication
    // For SSE, events are typically sent via regular HTTP API calls
    logger.debug('Sending event (not implemented for SSE):', event);
  }, []);

  // Connect on mount and when dependencies change
  useEffect(() => {
    mountedRef.current = true
    
    if (issueId || userId) {
      connect();
    }
    
    return () => {
      mountedRef.current = false
      disconnect();
      
      // Clear any pending reconnect timers
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [issueId, userId, connect, disconnect]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    disconnect();
    setState(prev => ({ ...prev, reconnectAttempts: 0 }));
    setTimeout(connect, 100);
  }, [disconnect, connect]);

  return {
    ...state,
    connect,
    disconnect,
    reconnect,
    sendEvent
  };
}

/**
 * @deprecated Use useRealtime with transport='websocket' instead
 * 
 * This function is maintained for backward compatibility only.
 * New code should use useRealtime({ transport: 'websocket', ... })
 * 
 * See: useRealtimeWebSocket.DEPRECATED.ts for migration guide
 */
export function useWebSocket({
  issueId,
  userId,
  onEvent,
  autoReconnect = true,
  reconnectDelay = 3000,
  maxReconnectAttempts = 5
}: UseRealtimeOptions = {}) {
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    isConnecting: false,
    lastEvent: null,
    error: null,
    reconnectAttempts: 0
  });

  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Build WebSocket URL
  const buildWSUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${window.location.host}`;
    const url = new URL('/ws/realtime', baseUrl);
    
    if (issueId) url.searchParams.set('issueId', issueId);
    if (userId) url.searchParams.set('userId', userId);
    
    return url.toString();
  }, [issueId, userId]);

  // Internal connect function for WebSocket
  const connectInternal = useCallback(() => {
    if (!mountedRef.current) return;
    
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const url = buildWSUrl();
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        if (!mountedRef.current) return;
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0
        }));
        
        console.log('WebSocket connection established');
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        
        try {
          const realtimeEvent: RealtimeEvent = JSON.parse(event.data);
          
          setState(prev => ({
            ...prev,
            lastEvent: realtimeEvent
          }));
          
          onEvent?.(realtimeEvent);
          
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        
        setState(prev => {
          const currentAttempts = prev.reconnectAttempts;
          const newState = {
            ...prev,
            isConnected: false,
            isConnecting: false
          };
          
          if (autoReconnect && currentAttempts < maxReconnectAttempts) {
            // Schedule reconnection inline
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            
            reconnectTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                connectInternal();
              }
            }, reconnectDelay);
            
            newState.reconnectAttempts = currentAttempts + 1;
          }
          
          return newState;
        });
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({
          ...prev,
          error: 'Connection error'
        }));
      };

      websocketRef.current = ws;
      
    } catch (err) {
      console.error('Failed to establish WebSocket connection:', err);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to connect'
      }));
    }
  }, [buildWSUrl, onEvent, autoReconnect, maxReconnectAttempts, reconnectDelay]);

  // Public connect function
  const connect = useCallback(() => {
    connectInternal();
  }, [connectInternal]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false
    }));
  }, []);

  // Send WebSocket message
  const sendEvent = useCallback((event: Omit<RealtimeEvent, 'timestamp'>) => {
    if (websocketRef.current && state.isConnected) {
      const message = {
        ...event,
        timestamp: new Date().toISOString()
      };
      
      websocketRef.current.send(JSON.stringify(message));
    }
  }, [state.isConnected]);

  // Connect on mount and when dependencies change
  useEffect(() => {
    if (issueId || userId) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [issueId, userId, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [disconnect]);

  const reconnect = useCallback(() => {
    disconnect();
    setState(prev => ({ ...prev, reconnectAttempts: 0 }));
    setTimeout(connect, 100);
  }, [disconnect, connect]);

  return {
    ...state,
    connect,
    disconnect,
    reconnect,
    sendEvent
  };
}

// Export the main hook (can switch between SSE/WebSocket implementations)
export const useRealtimeUpdates = useRealtime;