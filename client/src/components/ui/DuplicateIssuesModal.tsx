'use client'

import React from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, MapPin, Calendar, ThumbsUp, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export interface DuplicateIssue {
  id: string
  reportId: string
  title: string
  description: string
  status: string
  createdAt: string
  voteCount: number
  distance: number
  category?: {
    id: string
    name: string
  }
  images?: Array<{ url: string }>
}

interface DuplicateIssuesModalProps {
  open: boolean
  onClose: () => void
  duplicates: DuplicateIssue[]
  onSubmitAnyway: () => void
  isSubmitting?: boolean
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'APPROVED':
      return 'bg-green-100 text-green-800'
    case 'IN_PROGRESS':
    case 'ASSIGNED_TO_STAFF':
    case 'STAFF_EN_ROUTE':
    case 'STAFF_ON_SITE':
    case 'WORK_IN_PROGRESS':
      return 'bg-emerald-100 text-blue-800'
    case 'RESOLVED':
    case 'CITIZEN_VERIFIED':
      return 'bg-green-100 text-green-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

const getStatusLabel = (status: string) => {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

export function DuplicateIssuesModal({
  open,
  onClose,
  duplicates,
  onSubmitAnyway,
  isSubmitting = false
}: DuplicateIssuesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <DialogTitle className="text-xl">Similar Issues Found</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            We found {duplicates.length} similar issue{duplicates.length > 1 ? 's' : ''} nearby. 
            Please review {duplicates.length > 1 ? 'them' : 'it'} before submitting to avoid duplicates.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {duplicates.map((issue) => (
            <Card key={issue.id} className="border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  {/* Header with status and distance */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg line-clamp-2">{issue.title}</h3>
                      {issue.category && (
                        <Badge variant="outline" className="mt-1">
                          {issue.category.name}
                        </Badge>
                      )}
                    </div>
                    <Badge className={getStatusColor(issue.status)}>
                      {getStatusLabel(issue.status)}
                    </Badge>
                  </div>

                  {/* Description */}
                  {issue.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {issue.description}
                    </p>
                  )}

                  {/* Image preview */}
                  {issue.images && issue.images.length > 0 && (
                    <div className="relative w-full h-32 rounded-md overflow-hidden bg-slate-100">
                      <Image
                        src={issue.images[0].url}
                        alt={issue.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{issue.distance}m away</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{issue.voteCount} vote{issue.voteCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* View details link */}
                  <Link
                    href={`/track/${issue.reportId}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-blue-800 font-medium"
                  >
                    View full details
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmitAnyway}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Anyway'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
