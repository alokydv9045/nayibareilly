/**
 * IssueCardCitizen - Citizen-specific issue card variant
 * Shows tracking link and citizen-specific metadata
 */

'use client'

import Link from 'next/link'
import IssueCard, { IssueCardProps } from './IssueCard'
import { Button } from '@/components/ui/button'
import { Eye, MessageSquare, MapPin } from 'lucide-react'

interface IssueCardCitizenProps extends Omit<IssueCardProps, 'actions'> {
  showViewButton?: boolean
  showMapButton?: boolean
}

export default function IssueCardCitizen({
  issue,
  showViewButton = true,
  showMapButton = false,
  ...props
}: IssueCardCitizenProps) {

  const actions = (
    <div className="flex items-center gap-2 flex-wrap">
      {showViewButton && (
        <Link href={`/issue/${issue.id}`} className="flex-1">
          <Button variant="default" size="sm" className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </Link>
      )}
      
      {showMapButton && issue.location && (
        <Link href={`/map?issue=${issue.id}`}>
          <Button variant="outline" size="sm">
            <MapPin className="w-4 h-4 mr-2" />
            Show on Map
          </Button>
        </Link>
      )}

      <Link href={`/issue/${issue.id}#comments`}>
        <Button variant="ghost" size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          Comment
        </Button>
      </Link>
    </div>
  )

  return (
    <IssueCard
      issue={issue}
      showActions
      actions={actions}
      expandable
      className="hover:border-primary/50"
      {...props}
    />
  )
}
