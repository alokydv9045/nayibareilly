'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { config } from '../constants/app.config'
import { useRouter } from 'next/navigation';
import { getSocket } from '../services/socket'
import { unifiedLogout } from '../utils/unified-logout';
import { tokenStorage, userStorage } from '../auth/auth-utils';

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  departments: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, accessToken: string) => void;
  logout: () => void;
  isLoading: boolean;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = tokenStorage.get()
        const storedUser = userStorage.get()
        
        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(storedUser as User)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear invalid data
        tokenStorage.remove()
        userStorage.remove()
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const logout = useCallback(async () => {
    // Use unified logout utility
    await unifiedLogout({
      showToast: false, // Context logout is usually called programmatically
      silent: true,
      onSuccess: () => {
        // Clear local state
        setUser(null);
        setToken(null);
        
        // Navigate to login
        router.push('/login');
      },
      onError: (error) => {
        console.error('Logout error in auth-context:', error);
        // Still clear local state and navigate
        setUser(null);
        setToken(null);
        router.push('/login');
      }
    });
  }, [router]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const apiUrl = config.api.fullUrl
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.data.accessToken);
        tokenStorage.set(data.data.accessToken);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);

  // Auto refresh token
  useEffect(() => {
    if (!token) return;

    const refreshInterval = setInterval(async () => {
      const success = await refreshToken();
      if (!success) {
        logout();
      }
    }, 10 * 60 * 1000); // Refresh every 10 minutes

    return () => clearInterval(refreshInterval);
  }, [token, logout, refreshToken]);

  const login = (userData: User, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
    tokenStorage.set(accessToken);
    userStorage.set(userData);
    
    // Connect to Socket.IO and join admin rooms
    const sock = getSocket()
    // if socket has methods for joining rooms, call them here (legacy API compatibility)
    type SocketLike = { emit?: (...args: unknown[]) => void }
    try {
      const s = sock as unknown as SocketLike
      if (s && typeof s.emit === 'function') {
        s.emit('joinAdminRooms', userData)
      }
    } catch {
      // no-op
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}