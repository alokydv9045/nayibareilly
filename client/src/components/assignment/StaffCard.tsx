'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Briefcase, 
  Award,
  CheckCircle
} from 'lucide-react'
import { StaffMember, DEPARTMENT_LABELS } from '@/lib/assignment'
import { WorkloadIndicator } from './WorkloadIndicator'
import { SkillMatchBadge } from './SkillMatchBadge'

interface StaffCardProps {
  staff: StaffMember
  matchScore?: number
  matchLevel?: 'excellent' | 'good' | 'fair' | 'poor'
  matchReasons?: string[]
  isTopMatch?: boolean
  isSelected?: boolean
  onSelect?: (staffId: string) => void
  showDetails?: boolean
  className?: string
}

export function StaffCard({
  staff,
  matchScore,
  matchLevel,
  matchReasons,
  isTopMatch = false,
  isSelected = false,
  onSelect,
  showDetails = true,
  className = ''
}: StaffCardProps) {
  const initials = staff.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const canAssign = staff.isAvailable && staff.currentWorkload < staff.maxCapacity

  return (
    <Card 
      className={`
        transition-all
        ${isSelected ? 'ring-2 ring-primary shadow-md' : ''}
        ${!canAssign ? 'opacity-60' : ''}
        ${onSelect ? 'cursor-pointer hover:shadow-lg' : ''}
        ${className}
      `}
      onClick={() => canAssign && onSelect?.(staff.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base truncate">{staff.name}</h3>
                {isSelected && (
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{staff.email}</span>
              </div>
            </div>
          </div>

          {matchScore !== undefined && matchLevel && (
            <SkillMatchBadge
              matchScore={matchScore}
              matchLevel={matchLevel}
              showScore
              isTopMatch={isTopMatch}
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Department & Role */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            <span>{DEPARTMENT_LABELS[staff.department]}</span>
          </Badge>
          
          <Badge variant="secondary">
            {staff.role.replace('_', ' ')}
          </Badge>
        </div>

        {/* Specializations */}
        {staff.specializations.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Specializations</p>
            <div className="flex flex-wrap gap-1">
              {staff.specializations.map(spec => (
                <Badge key={spec} variant="outline" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {showDetails && staff.skills.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Skills</p>
            <div className="flex flex-wrap gap-1">
              {staff.skills.slice(0, 4).map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {staff.skills.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{staff.skills.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        {showDetails && staff.experienceYears > 0 && (
          <p className="text-sm text-muted-foreground">
            {staff.experienceYears} {staff.experienceYears === 1 ? 'year' : 'years'} of experience
          </p>
        )}

        {/* Workload */}
        <WorkloadIndicator
          currentWorkload={staff.currentWorkload}
          maxCapacity={staff.maxCapacity}
          showProgress
          showLabel
          size="sm"
        />

        {/* Match Reasons */}
        {matchReasons && matchReasons.length > 0 && (
          <div className="space-y-1 pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground">Why this match?</p>
            <ul className="space-y-0.5">
              {matchReasons.slice(0, 3).map((reason, idx) => (
                <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Availability Status */}
        {!staff.isAvailable && (
          <div className="pt-2 border-t">
            <Badge variant="destructive" className="w-full justify-center">
              Currently Unavailable
            </Badge>
          </div>
        )}

        {staff.isAvailable && staff.currentWorkload >= staff.maxCapacity && (
          <div className="pt-2 border-t">
            <Badge variant="destructive" className="w-full justify-center">
              At Maximum Capacity
            </Badge>
          </div>
        )}

        {/* Action Button */}
        {onSelect && canAssign && !isSelected && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(staff.id)
            }}
          >
            <User className="h-4 w-4 mr-2" />
            Assign to {staff.name.split(' ')[0]}
          </Button>
        )}

        {isSelected && (
          <Button 
            variant="default" 
            size="sm" 
            className="w-full"
            disabled
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Selected
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
