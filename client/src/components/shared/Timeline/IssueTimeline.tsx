/**
 * IssueTimeline - Display issue history and status changes
 */

'use client'

import { format } from 'date-fns'
import { 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Image as ImageIcon,
  FileText,
  Users,
  AlertCircle,
  Archive,
  Edit3,
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import StatusBadge, { IssueStatus } from '@/components/shared/StatusBadge'

export type TimelineEventType = 
  | 'created'
  | 'status_change'
  | 'assigned'
  | 'comment'
  | 'update'
  | 'image_added'
  | 'location_updated'
  | 'priority_changed'
  | 'archived'
  | 'verified'
  | 'resolved'

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  title: string
  description?: string
  timestamp: string | Date
  user?: {
    id: string
    name: string
    avatar?: string
    role?: string
  }
  metadata?: {
    oldStatus?: IssueStatus
    newStatus?: IssueStatus
    oldPriority?: string
    newPriority?: string
    assignedTo?: string
    comment?: string
    imageCount?: number
    location?: string
  }
}

interface IssueTimelineProps {
  events: TimelineEvent[]
  className?: string
  showAvatar?: boolean
  compact?: boolean
}

const EVENT_CONFIG: Record<TimelineEventType, {
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  bgColor: string
}> = {
  created: {
    icon: FileText,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-100'
  },
  status_change: {
    icon: Clock,
    iconColor: 'text-slate-800',
    bgColor: 'bg-purple-100'
  },
  assigned: {
    icon: Users,
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  },
  comment: {
    icon: MessageSquare,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  update: {
    icon: Edit3,
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  image_added: {
    icon: ImageIcon,
    iconColor: 'text-pink-600',
    bgColor: 'bg-pink-100'
  },
  location_updated: {
    icon: MapPin,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  priority_changed: {
    icon: AlertCircle,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  archived: {
    icon: Archive,
    iconColor: 'text-slate-600',
    bgColor: 'bg-slate-100'
  },
  verified: {
    icon: CheckCircle2,
    iconColor: 'text-teal-600',
    bgColor: 'bg-teal-100'
  },
  resolved: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-100'
  }
}

export default function IssueTimeline({ 
  events, 
  className,
  showAvatar = true,
  compact = false
}: IssueTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No timeline events yet</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {events.map((event, index) => {
        const config = EVENT_CONFIG[event.type]
        const Icon = config.icon
        const isLast = index === events.length - 1

        return (
          <div key={event.id} className="relative">
            {/* Timeline Line */}
            {!isLast && (
              <div 
                className="absolute left-5 top-12 bottom-0 w-0.5 bg-border"
                aria-hidden="true"
              />
            )}

            {/* Event Content */}
            <div className="flex gap-4">
              {/* Icon */}
              <div className={cn(
                'relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0',
                config.bgColor
              )}>
                <Icon className={cn('w-5 h-5', config.iconColor)} />
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      {event.title}
                    </h4>
                    {event.metadata?.newStatus && (
                      <StatusBadge 
                        status={event.metadata.newStatus} 
                        size="sm"
                        showIcon={false}
                      />
                    )}
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(event.timestamp), 'MMM dd, HH:mm')}
                  </time>
                </div>

                {/* Description */}
                {event.description && !compact && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {event.description}
                  </p>
                )}

                {/* Metadata */}
                {event.metadata && !compact && (
                  <div className="space-y-1 text-sm">
                    {event.metadata.oldStatus && event.metadata.newStatus && (
                      <div className="flex items-center gap-2">
                        <StatusBadge 
                          status={event.metadata.oldStatus} 
                          size="sm"
                        />
                        <span className="text-muted-foreground">→</span>
                        <StatusBadge 
                          status={event.metadata.newStatus} 
                          size="sm"
                        />
                      </div>
                    )}

                    {event.metadata.assignedTo && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>Assigned to {event.metadata.assignedTo}</span>
                      </div>
                    )}

                    {event.metadata.comment && (
                      <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm">
                        {event.metadata.comment}
                      </div>
                    )}

                    {event.metadata.imageCount && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ImageIcon className="w-4 h-4" />
                        <span>{event.metadata.imageCount} image(s) added</span>
                      </div>
                    )}

                    {event.metadata.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.metadata.location}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* User Info */}
                {event.user && showAvatar && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={event.user.avatar} alt={event.user.name} />
                      <AvatarFallback className="text-xs">
                        {event.user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {event.user.name}
                      {event.user.role && ` • ${event.user.role}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
