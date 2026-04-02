/**
 * IssueCard - Display individual issue with actions
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Calendar,
  User,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  MessageSquare,
  Flag
} from 'lucide-react'
import { format } from 'date-fns'
import Image from 'next/image'

interface Issue {
  id: string
  title: string
  description: string
  address: string
  reporterName: string
  createdAt: string
  priority: string
  categoryName?: string
  images?: Array<{ id: string; url: string }>
  reportId: string
}

interface IssueCardProps {
  issue: Issue
  onApprove: (issueId: string) => void
  onReject: (issueId: string) => void
  onRequestInfo: (issueId: string) => void
  onMarkSpam: (issueId: string) => void
  loading?: boolean
}

export function IssueCard({
  issue,
  onApprove,
  onReject,
  onRequestInfo,
  onMarkSpam,
  loading
}: IssueCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showImages, setShowImages] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-600 text-white'
      case 'HIGH':
        return 'bg-orange-600 text-white'
      case 'MEDIUM':
        return 'bg-yellow-600 text-white'
      default:
        return 'bg-blue-600 text-white'
    }
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getPriorityColor(issue.priority)}>
                {issue.priority}
              </Badge>
              {issue.categoryName && (
                <Badge variant="outline" className="text-orange-300 border-orange-300">
                  {issue.categoryName}
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {issue.title}
            </h3>
            <p className="text-sm text-orange-200">
              Report ID: {issue.reportId}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-white hover:bg-white/10"
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-2 text-sm text-orange-200">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{issue.reporterName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(issue.createdAt), 'MMM dd, yyyy HH:mm')}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5" />
            <span>{issue.address}</span>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="space-y-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-sm font-medium text-white mb-2">Description:</p>
              <p className="text-sm text-orange-200 whitespace-pre-wrap">
                {issue.description}
              </p>
            </div>

            {/* Images */}
            {issue.images && issue.images.length > 0 && (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImages(!showImages)}
                  className="mb-2 text-white border-white/20 hover:bg-white/10"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {showImages ? 'Hide' : 'Show'} Images ({issue.images.length})
                </Button>
                {showImages && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {issue.images.map((img) => (
                      <div
                        key={img.id}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <Image
                          src={img.url}
                          alt="Issue evidence"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4">
              <Button
                onClick={() => onApprove(issue.id)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => onReject(issue.id)}
                disabled={loading}
                variant="destructive"
                size="sm"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => onRequestInfo(issue.id)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Info
              </Button>
              <Button
                onClick={() => onMarkSpam(issue.id)}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <Flag className="h-4 w-4 mr-2" />
                Spam
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
