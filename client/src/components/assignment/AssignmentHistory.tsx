'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Clock, 
  User, 
  ArrowRight, 
  Calendar,
  MessageSquare
} from 'lucide-react'
import { AssignmentHistory as AssignmentHistoryType } from '@/lib/assignment'
import { format } from 'date-fns'

interface AssignmentHistoryProps {
  history: AssignmentHistoryType[]
  isLoading?: boolean
  className?: string
}

const TYPE_LABELS = {
  initial: 'Assigned',
  reassignment: 'Reassigned',
  unassignment: 'Unassigned'
}

const TYPE_COLORS = {
  initial: 'default',
  reassignment: 'secondary',
  unassignment: 'destructive'
} as const

export function AssignmentHistory({
  history,
  isLoading = false,
  className = ''
}: AssignmentHistoryProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Assignment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 animate-pulse bg-slate-200 dark:bg-slate-800 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Assignment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No assignment history yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Assignment History
        </CardTitle>
        <CardDescription>
          Track all assignment changes for this issue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div key={entry.id}>
              <div className="flex items-start gap-3">
                {/* Timeline Indicator */}
                <div className="flex flex-col items-center">
                  <div className={`
                    w-3 h-3 rounded-full border-2 mt-1
                    ${index === 0 ? 'bg-primary border-primary' : 'bg-slate-300 border-slate-300'}
                  `} />
                  {index < history.length - 1 && (
                    <div className="w-0.5 h-full min-h-[40px] bg-slate-200 dark:bg-slate-700 mt-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={TYPE_COLORS[entry.type]}>
                        {TYPE_LABELS[entry.type]}
                      </Badge>
                      
                      <div className="flex items-center gap-1.5 text-sm">
                        {entry.fromAssigneeName && (
                          <>
                            <span className="text-muted-foreground">from</span>
                            <span className="font-medium">{entry.fromAssigneeName}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          </>
                        )}
                        <span className="text-muted-foreground">to</span>
                        <span className="font-medium">{entry.toAssigneeName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(entry.changedAt), 'MMM d, h:mm a')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <User className="h-3 w-3" />
                    <span>by {entry.changedByName}</span>
                  </div>

                  {entry.reason && (
                    <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded text-sm">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-slate-700 dark:text-slate-300">{entry.reason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {index < history.length - 1 && <Separator className="my-0" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
