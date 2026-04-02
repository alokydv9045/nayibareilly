/**
 * StatusTransition - Visual display of status changes with before/after
 */

'use client'

import { ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import StatusBadge, { IssueStatus } from '@/components/shared/StatusBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils/helpers'

interface StatusTransitionProps {
  oldStatus: IssueStatus
  newStatus: IssueStatus
  timestamp: string | Date
  user?: {
    name: string
    avatar?: string
    role?: string
  }
  reason?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function StatusTransition({
  oldStatus,
  newStatus,
  timestamp,
  user,
  reason,
  className,
  size = 'md'
}: StatusTransitionProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const badgeSizes = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const
  }

  return (
    <div className={cn(
      'p-4 rounded-lg border bg-card',
      className
    )}>
      {/* Status Change */}
      <div className="flex items-center gap-3 mb-3">
        <StatusBadge status={oldStatus} size={badgeSizes[size]} />
        <ArrowRight className={cn(
          'text-muted-foreground shrink-0',
          size === 'sm' && 'w-4 h-4',
          size === 'md' && 'w-5 h-5',
          size === 'lg' && 'w-6 h-6'
        )} />
        <StatusBadge status={newStatus} size={badgeSizes[size]} />
      </div>

      {/* Reason */}
      {reason && (
        <p className={cn(
          'text-muted-foreground mb-3',
          sizeClasses[size]
        )}>
          {reason}
        </p>
      )}

      {/* User & Timestamp */}
      <div className="flex items-center justify-between gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <Avatar className={cn(
              size === 'sm' && 'w-6 h-6',
              size === 'md' && 'w-8 h-8',
              size === 'lg' && 'w-10 h-10'
            )}>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className={sizeClasses[size]}>
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className={cn('font-medium', sizeClasses[size])}>
                {user.name}
              </span>
              {user.role && (
                <span className={cn('text-muted-foreground', sizeClasses[size])}>
                  {user.role}
                </span>
              )}
            </div>
          </div>
        )}

        <time className={cn('text-muted-foreground whitespace-nowrap', sizeClasses[size])}>
          {format(new Date(timestamp), 'MMM dd, HH:mm')}
        </time>
      </div>
    </div>
  )
}
