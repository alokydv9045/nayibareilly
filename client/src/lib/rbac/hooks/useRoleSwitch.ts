/**
 * Role Switcher Hook
 * Hook for managing multi-role users and role switching
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import {
  UserRole,
  normalizeRoles,
  getUserRoleInfo,
  getRoleDashboardPath,
  getRoleLabel,
  getRoleIcon,
  getRoleColor,
  ROLE_METADATA,
} from '../roles';

// ============================================================================
// Local Storage Key
// ============================================================================

const PREFERRED_ROLE_KEY = 'preferred_role';

// ============================================================================
// Hook: useRoleSwitch
// ============================================================================

export interface UseRoleSwitchResult {
  // Current state
  currentRole: UserRole;
  availableRoles: UserRole[];
  canSwitchRoles: boolean;
  
  // Role information
  roleInfo: {
    label: string;
    icon: string;
    color: string;
    dashboardPath: string;
    level: number;
  };
  
  // Actions
  switchRole: (role: UserRole) => Promise<void>;
  switchToHighestRole: () => Promise<void>;
  resetToDefault: () => Promise<void>;
  
  // State
  isSwitching: boolean;
  error: string | null;
}

/**
 * Hook for managing role switching for multi-role users
 */
export function useRoleSwitch(): UseRoleSwitchResult {
  const { user, isLoading } = useSession();
  const router = useRouter();
  
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferredRole, setPreferredRole] = useState<UserRole | null>(null);

  // Load preferred role from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PREFERRED_ROLE_KEY);
      if (stored) {
        const normalizedStored = normalizeRoles([stored])[0];
        if (normalizedStored) {
          setPreferredRole(normalizedStored);
        }
      }
    }
  }, []);

  // Get user roles
  const availableRoles = useMemo(() => {
    return user?.roles ? normalizeRoles(user.roles) : [];
  }, [user?.roles]);

  // Determine current role
  const currentRole = useMemo(() => {
    const roleInfo = getUserRoleInfo(
      user?.roles || [],
      preferredRole || undefined
    );
    return roleInfo.primaryRole;
  }, [user?.roles, preferredRole]);

  // Check if user can switch roles
  const canSwitchRoles = useMemo(() => {
    return availableRoles.length > 1;
  }, [availableRoles]);

  // Get role information
  const roleInfo = useMemo(() => {
    const metadata = ROLE_METADATA[currentRole];
    return {
      label: getRoleLabel(currentRole),
      icon: getRoleIcon(currentRole),
      color: getRoleColor(currentRole),
      dashboardPath: getRoleDashboardPath(currentRole),
      level: metadata.level,
    };
  }, [currentRole]);

  /**
   * Switch to a specific role
   */
  const switchRole = useCallback(
    async (role: UserRole) => {
      if (isLoading) return;
      
      setIsSwitching(true);
      setError(null);

      try {
        // Validate that user has this role
        if (!availableRoles.includes(role)) {
          throw new Error(`You do not have the ${getRoleLabel(role)} role`);
        }

        // Save preference
        if (typeof window !== 'undefined') {
          localStorage.setItem(PREFERRED_ROLE_KEY, role);
        }
        setPreferredRole(role);

        // Navigate to new role's dashboard
        const dashboardPath = getRoleDashboardPath(role);
        router.push(dashboardPath);

        // Reload to apply new role permissions
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to switch role';
        setError(message);
        console.error('Role switch error:', err);
      } finally {
        setIsSwitching(false);
      }
    },
    [availableRoles, isLoading, router]
  );

  /**
   * Switch to the highest authority role
   */
  const switchToHighestRole = useCallback(async () => {
    if (!availableRoles.length) return;

    // Find highest role by level
    const highestRole = availableRoles.reduce((highest, current) => {
      return ROLE_METADATA[current].level > ROLE_METADATA[highest].level
        ? current
        : highest;
    });

    await switchRole(highestRole);
  }, [availableRoles, switchRole]);

  /**
   * Reset to default role (highest authority)
   */
  const resetToDefault = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PREFERRED_ROLE_KEY);
    }
    setPreferredRole(null);
    await switchToHighestRole();
  }, [switchToHighestRole]);

  return {
    currentRole,
    availableRoles,
    canSwitchRoles,
    roleInfo,
    switchRole,
    switchToHighestRole,
    resetToDefault,
    isSwitching,
    error,
  };
}

// ============================================================================
// Hook: useRoleSelection
// ============================================================================

export interface RoleOption {
  role: UserRole;
  label: string;
  icon: string;
  color: string;
  level: number;
  isCurrent: boolean;
}

export interface UseRoleSelectionResult {
  options: RoleOption[];
  currentOption: RoleOption | null;
  selectRole: (role: UserRole) => Promise<void>;
  isSelecting: boolean;
  error: string | null;
}

/**
 * Hook for rendering role selection UI
 */
export function useRoleSelection(): UseRoleSelectionResult {
  const {
    currentRole,
    availableRoles,
    switchRole,
    isSwitching,
    error,
  } = useRoleSwitch();

  const options = useMemo<RoleOption[]>(() => {
    return availableRoles.map((role) => {
      const metadata = ROLE_METADATA[role];
      return {
        role,
        label: metadata.label,
        icon: metadata.icon,
        color: metadata.color,
        level: metadata.level,
        isCurrent: role === currentRole,
      };
    });
  }, [availableRoles, currentRole]);

  const currentOption = useMemo(() => {
    return options.find((opt) => opt.isCurrent) || null;
  }, [options]);

  return {
    options,
    currentOption,
    selectRole: switchRole,
    isSelecting: isSwitching,
    error,
  };
}

// ============================================================================
// Utility: Clear Role Preference
// ============================================================================

/**
 * Clear stored role preference
 */
export function clearRolePreference(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PREFERRED_ROLE_KEY);
  }
}

/**
 * Get stored role preference
 */
export function getStoredRolePreference(): UserRole | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(PREFERRED_ROLE_KEY);
  if (!stored) return null;
  
  const normalized = normalizeRoles([stored])[0];
  return normalized || null;
}

/**
 * Set role preference
 */
export function setStoredRolePreference(role: UserRole): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PREFERRED_ROLE_KEY, role);
  }
}
