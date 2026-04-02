/**
 * Role Switcher Component
 * Allows users with multiple roles to switch between them
 */

'use client';

import React, { useState } from 'react';
import { useRoleSelection } from '@/lib/rbac';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check, RefreshCw, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RoleSwitcherProps {
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
}

export function RoleSwitcher({
  className,
  showIcon = true,
  variant = 'outline',
}: RoleSwitcherProps) {
  const { options, currentOption, selectRole, isSelecting, error } = useRoleSelection();
  const [isOpen, setIsOpen] = useState(false);

  // Don't show if user only has one role
  if (options.length <= 1) {
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            className={cn(
              'w-full justify-between',
              isSelecting && 'opacity-50 cursor-not-allowed'
            )}
            disabled={isSelecting}
          >
            <span className="flex items-center gap-2">
              {showIcon && currentOption && (
                <span className="text-lg">{currentOption.icon}</span>
              )}
              <span className="font-medium">
                {currentOption?.label || 'Select Role'}
              </span>
            </span>
            {isSelecting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Switch Role
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {options.map((option) => (
            <DropdownMenuItem
              key={option.role}
              onClick={() => {
                selectRole(option.role);
                setIsOpen(false);
              }}
              disabled={isSelecting || option.isCurrent}
              className={cn(
                'flex items-center justify-between cursor-pointer',
                option.isCurrent && 'bg-accent'
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{option.icon}</span>
                <span>{option.label}</span>
              </span>
              {option.isCurrent && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}

          {error && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm text-red-500">{error}</div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Compact Role Badge (shows current role without dropdown)
 */
export function RoleBadge({ className }: { className?: string }) {
  const { currentOption } = useRoleSelection();

  if (!currentOption) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
        className
      )}
      style={{
        backgroundColor: `${currentOption.color}20`,
        color: currentOption.color,
      }}
    >
      <span>{currentOption.icon}</span>
      <span>{currentOption.label}</span>
    </div>
  );
}

/**
 * Role Indicator (shows all user's roles)
 */
export function RoleIndicator({ className }: { className?: string }) {
  const { options } = useRoleSelection();

  if (options.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => (
        <div
          key={option.role}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            option.isCurrent && 'ring-2 ring-offset-2'
          )}
          style={{
            backgroundColor: `${option.color}20`,
            color: option.color,
            ...(option.isCurrent && { '--tw-ring-color': option.color } as React.CSSProperties),
          }}
          title={option.isCurrent ? 'Current role' : undefined}
        >
          <span>{option.icon}</span>
          <span>{option.label}</span>
          {option.isCurrent && <Check className="h-3 w-3" />}
        </div>
      ))}
    </div>
  );
}
