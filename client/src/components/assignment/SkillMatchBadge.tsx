'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Star, TrendingUp } from 'lucide-react'
import { getMatchLevelColor } from '@/lib/assignment/matcher'

interface SkillMatchBadgeProps {
  matchScore: number
  matchLevel: 'excellent' | 'good' | 'fair' | 'poor'
  showScore?: boolean
  showRecommended?: boolean
  isTopMatch?: boolean
  className?: string
}

export function SkillMatchBadge({
  matchScore,
  matchLevel,
  showScore = true,
  showRecommended = false,
  isTopMatch = false,
  className = ''
}: SkillMatchBadgeProps) {
  const color = getMatchLevelColor(matchLevel)

  const badgeVariant = 
    color === 'green' ? 'default' :
    color === 'red' ? 'destructive' :
    'secondary'

  const badgeStyle = {
    backgroundColor:
      color === 'blue' ? '#3b82f6' :
      color === 'yellow' ? '#f59e0b' :
      color === 'green' ? '#10b981' :
      undefined,
    color: ['blue', 'yellow', 'green'].includes(color) ? 'white' : undefined
  }

  const levelLabels = {
    excellent: 'Excellent Match',
    good: 'Good Match',
    fair: 'Fair Match',
    poor: 'Poor Match'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={badgeVariant}
        className="flex items-center gap-1"
        style={badgeStyle}
      >
        <TrendingUp className="h-3 w-3" />
        <span>{levelLabels[matchLevel]}</span>
        {showScore && <span className="ml-1">({matchScore}%)</span>}
      </Badge>
      
      {(showRecommended || isTopMatch) && (
        <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 border-amber-300 text-amber-700">
          <Star className="h-3 w-3 fill-amber-400" />
          <span>Recommended</span>
        </Badge>
      )}
    </div>
  )
}
