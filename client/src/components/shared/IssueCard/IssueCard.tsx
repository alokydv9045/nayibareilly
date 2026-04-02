/**
 * Base IssueCard Component - Standardized card for displaying issues
 * This base component provides consistent structure and styling
 * Role-specific variants extend this for custom layouts and actions
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import StatusBadge, { IssueStatus } from '@/components/shared/StatusBadge'
import PriorityBadge, { IssuePriority } from '@/components/shared/PriorityBadge'
import { 
  MapPin, 
  Calendar, 
  User, 
  Image as ImageIcon, 
  ChevronDown, 
  ChevronUp,
  Hash,
  MessageSquare,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/helpers'

export interface BaseIssue {
  id: string
  reportId?: string
  title: string
  description: string
  category?: string
  categoryName?: string
  status: IssueStatus
  priority?: IssuePriority
  address?: string
  location?: {
    latitude: number
    longitude: number
  }
  reporterName?: string
  reporterId?: string
  assignedTo?: string
  assignedToName?: string
  departmentName?: string
  createdAt: string | Date
  updatedAt?: string | Date
  images?: Array<{ id: string; url: string; altText?: string }>
  commentsCount?: number
  viewsCount?: number
}

export interface IssueCardProps {
  issue: BaseIssue
  variant?: 'default' | 'compact' | 'detailed'
  showActions?: boolean
  actions?: React.ReactNode
  onClick?: () => void
  className?: string
  expandable?: boolean
  defaultExpanded?: boolean
}

export default function IssueCard({
  issue,
  variant = 'default',
  showActions = false,
  actions,
  onClick,
  className,
  expandable = false,
  defaultExpanded = false
}: IssueCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [showImages, setShowImages] = useState(false)

  const hasImages = issue.images && issue.images.length > 0
  const truncatedDescription = issue.description.length > 150 
    ? `${issue.description.slice(0, 150)}...` 
    : issue.description

  const cardContent = (
    <>
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {issue.priority && (
                <PriorityBadge priority={issue.priority} size="sm" />
              )}
              <StatusBadge status={issue.status} size="sm" />
              {(issue.category || issue.categoryName) && (
                <Badge variant="outline" className="text-xs">
                  {issue.categoryName || issue.category}
                </Badge>
              )}
              {issue.departmentName && (
                <Badge variant="secondary" className="text-xs">
                  {issue.departmentName}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-foreground line-clamp-2 mb-1">
              {issue.title}
            </h3>

            {/* Report ID */}
            {issue.reportId && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Hash className="w-3 h-3" />
                <span className="font-mono">{issue.reportId}</span>
              </div>
            )}
          </div>

          {/* Expand Button */}
          {expandable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(!expanded)
              }}
              className="shrink-0"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-3">
        {/* Description */}
        {variant !== 'compact' && (
          <p className="text-sm text-muted-foreground">
            {expanded || variant === 'detailed' ? issue.description : truncatedDescription}
          </p>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {/* Location */}
          {issue.address && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{issue.address}</span>
            </div>
          )}

          {/* Reporter */}
          {issue.reporterName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4 shrink-0" />
              <span className="truncate">{issue.reporterName}</span>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              {format(new Date(issue.createdAt), 'MMM dd, yyyy')}
            </span>
          </div>

          {/* Assigned To */}
          {issue.assignedToName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4 shrink-0" />
              <span className="truncate">Assigned: {issue.assignedToName}</span>
            </div>
          )}

          {/* Comments Count */}
          {typeof issue.commentsCount === 'number' && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>{issue.commentsCount} comments</span>
            </div>
          )}

          {/* Views Count */}
          {typeof issue.viewsCount === 'number' && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="w-4 h-4 shrink-0" />
              <span>{issue.viewsCount} views</span>
            </div>
          )}
        </div>

        {/* Images */}
        {hasImages && (expanded || variant === 'detailed') && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setShowImages(!showImages)
              }}
              className="text-xs"
            >
              <ImageIcon className="w-3 h-3 mr-1.5" />
              {showImages ? 'Hide' : 'Show'} {issue.images!.length} image(s)
            </Button>

            {showImages && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {issue.images!.map((img) => (
                  <div 
                    key={img.id} 
                    className="relative aspect-video rounded-lg overflow-hidden bg-muted"
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || 'Issue image'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && actions && (
          <div className="pt-2 border-t">
            {actions}
          </div>
        )}
      </CardContent>
    </>
  )

  if (onClick) {
    return (
      <Card 
        className={cn(
          'cursor-pointer hover:shadow-md transition-all',
          className
        )}
        onClick={onClick}
      >
        {cardContent}
      </Card>
    )
  }

  return (
    <Card className={cn('transition-all', className)}>
      {cardContent}
    </Card>
  )
}
