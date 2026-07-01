import { io, Socket } from 'socket.io-client';
import { config } from '@/lib/constants/app.config'
import { logger } from '@/lib/utils/logger'

// Socket event data types
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

interface UserStatsData {
  totalUsers: number;
  activeUsers?: number;
  verifiedUsers?: number;
  newUser?: {
    id: string;
    name: string;
    email: string;
    roles: string[];
    createdAt: string;
  };
  verifiedUser?: {
    id: string;
    name: string;
    email: string;
  };
}

interface SystemStatsData {
  totalUsers: number;
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  lastUpdated: string;
}

interface SystemAlertData {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: string;
  timestamp: string;
}

interface DepartmentStatsData {
  departmentId: string;
  stats: {
    totalIssues: number;
    resolvedIssues: number;
    pendingIssues: number;
    avgResolutionTime: number;
  };
  timestamp: string;
}

type SocketEventCallback<T = unknown> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

  // Use base URL without /api for Socket.IO server
  const serverUrl = config.socket.url || 'https://nayibareilly.onrender.com';
  const socketUrl = serverUrl.replace(/\/api$/, ''); // Remove /api if present

    this.socket = io(socketUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      logger.debug('✅ Socket connected');
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      logger.debug('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      logger.error('🔥 Socket connection error:', error);
    });

    this.socket.on('reconnect', () => {
      logger.debug('🔄 Socket reconnected');
    });

    // Admin-specific event listeners
    this.setupAdminListeners();
  }

  private setupAdminListeners(): void {
    if (!this.socket) return;

    // Issue updates
    this.socket.on('issue:created', (data: IssueEventData) => {
      logger.debug('📝 New issue created:', data);
      // Handle new issue notification
    });

    this.socket.on('issue:updated', (data: IssueEventData) => {
      logger.debug('📝 Issue updated:', data);
      // Handle issue update
    });

    this.socket.on('issue:assigned', (data: IssueEventData) => {
      logger.debug('👤 Issue assigned:', data);
      // Handle issue assignment
    });

    this.socket.on('issue:escalated', (data: IssueEventData) => {
      logger.debug('🚨 Issue escalated:', data);
      // Handle escalation notification
    });

    // User management events
    this.socket.on('user:login', (data: UserEventData) => {
      logger.debug('🔑 User logged in:', data);
      // Handle user login notification
    });

    this.socket.on('user:created', (data: UserEventData) => {
      logger.debug('👤 New user created:', data);
      // Handle new user notification
    });

    // New real-time user events
    this.socket.on('user:new', (data: UserStatsData) => {
      logger.debug('👤 New user registered:', data);
      // Handle new user registration with stats update
    });

    this.socket.on('user:verified', (data: UserStatsData) => {
      logger.debug('✅ User verified:', data);
      // Handle user verification with stats update
    });

    // System events
    this.socket.on('system:alert', (data: SystemAlertData) => {
      logger.debug('⚠️ System alert:', data);
      // Handle system alerts
    });

    this.socket.on('system:stats', (data: SystemStatsData) => {
      logger.debug('📊 System stats updated:', data);
      // Handle real-time system stats updates
    });

    this.socket.on('department:stats', (data: DepartmentStatsData) => {
      logger.debug('📊 Department stats updated:', data);
      // Handle real-time stats updates
    });
  }

  // Join the user room explicitly for citizen notifications
  joinUserRoom(userId: string) {
    this.joinRoom(`user:${userId}`)
  }

  // Event subscription methods
  onIssueCreated(callback: SocketEventCallback<IssueEventData>): void {
    this.socket?.on('issue:created', callback);
  }

  onIssueUpdated(callback: SocketEventCallback<IssueEventData>): void {
    this.socket?.on('issue:updated', callback);
  }

  onIssueAssigned(callback: SocketEventCallback<IssueEventData>): void {
    this.socket?.on('issue:assigned', callback);
  }

  onIssueEscalated(callback: SocketEventCallback<IssueEventData>): void {
    this.socket?.on('issue:escalated', callback);
  }

  onUserLogin(callback: SocketEventCallback<UserEventData>): void {
    this.socket?.on('user:login', callback);
  }

  onUserNew(callback: SocketEventCallback<UserStatsData>): void {
    this.socket?.on('user:new', callback);
  }

  onUserVerified(callback: SocketEventCallback<UserStatsData>): void {
    this.socket?.on('user:verified', callback);
  }

  onSystemAlert(callback: SocketEventCallback<SystemAlertData>): void {
    this.socket?.on('system:alert', callback);
  }

  onSystemStats(callback: SocketEventCallback<SystemStatsData>): void {
    this.socket?.on('system:stats', callback);
  }

  onDepartmentStats(callback: SocketEventCallback<DepartmentStatsData>): void {
    this.socket?.on('department:stats', callback);
  }

  // Event emission methods
  joinRoom(room: string): void {
    this.socket?.emit('join:room', room);
  }

  leaveRoom(room: string): void {
    this.socket?.emit('leave:room', room);
  }

  // Join role-specific rooms
  joinAdminRooms(user: { roles: string[]; departmentId?: string }): void {
    // Join role-based rooms
    user.roles.forEach(role => {
      this.joinRoom(`role:${role}`);
    });

    // Join department-specific rooms
    if (user.departmentId) {
      this.joinRoom(`department:${user.departmentId}`);
    }

    // Join general admin room
    this.joinRoom('admin');
  }

  // Clean up and disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected || false;
  }

  // Emit custom events
  emit(event: string, data: Record<string, unknown>): void {
    this.socket?.emit(event, data);
  }

  // Subscribe to an arbitrary socket event
  on<T = unknown>(event: string, callback: SocketEventCallback<T>): void {
    this.socket?.on(event, callback as SocketEventCallback)
  }

  // Remove event listeners
  off(event: string, callback?: SocketEventCallback): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.removeAllListeners(event);
    }
  }
}

// Create and export singleton instance
const socketService = new SocketService();
export default socketService;