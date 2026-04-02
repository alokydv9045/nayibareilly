import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export interface SocketConfig {
  url: string;
  token: string;
}

/**
 * Initialize Socket.IO client
 */
export function initializeSocket(config: SocketConfig): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(config.url, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    auth: {
      token: config.token,
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✓ Socket.IO connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('✗ Socket.IO disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error.message);
  });

  socket.on('error', (error) => {
    console.error('Socket.IO error:', error);
  });

  // Welcome message
  socket.on('connected', (data) => {
    console.log('Socket.IO welcome:', data);
  });

  return socket;
}

/**
 * Get current socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

/**
 * Join an issue room
 */
export function joinIssueRoom(issueId: string): void {
  socket?.emit('join:issue', issueId);
}

/**
 * Leave an issue room
 */
export function leaveIssueRoom(issueId: string): void {
  socket?.emit('leave:issue', issueId);
}

/**
 * Join a department room
 */
export function joinDepartmentRoom(departmentId: string): void {
  socket?.emit('join:department', departmentId);
}

/**
 * Leave a department room
 */
export function leaveDepartmentRoom(departmentId: string): void {
  socket?.emit('leave:department', departmentId);
}

/**
 * Request unread notification count
 */
export function requestUnreadCount(): void {
  socket?.emit('request:unread-count');
}

/**
 * Mark notification as read (via socket)
 */
export function markNotificationRead(notificationId: string): void {
  socket?.emit('notification:read', notificationId);
}

const socketService = {
  initializeSocket,
  getSocket,
  disconnectSocket,
  isSocketConnected,
  joinIssueRoom,
  leaveIssueRoom,
  joinDepartmentRoom,
  leaveDepartmentRoom,
  requestUnreadCount,
  markNotificationRead,
};

export default socketService;
