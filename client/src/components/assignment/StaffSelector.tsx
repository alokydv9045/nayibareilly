'use client'

import React, { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X, Users } from 'lucide-react'
import type { 
  AssignmentFilters,
  Department,
  StaffSpecialization,
  WorkloadStatus
} from '@/lib/assignment'
import { 
  DEPARTMENT_LABELS,
  STAFF_SPECIALIZATIONS,
  StaffMember
} from '@/lib/assignment'
import { StaffCard } from './StaffCard'
import { useStaffMatches } from '@/lib/assignment/hooks'

interface StaffSelectorProps {
  issueCategory: string
  selectedStaffId?: string
  onSelectStaff: (staffId: string) => void
  staff: StaffMember[]
  showMatchScores?: boolean
  className?: string
}

export function StaffSelector({
  issueCategory,
  selectedStaffId,
  onSelectStaff,
  staff,
  showMatchScores = true,
  className = ''
}: StaffSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<AssignmentFilters>({
    availableOnly: true
  })

  const { matches, isLoading: matchesLoading } = useStaffMatches(
    issueCategory,
    undefined,
    showMatchScores
  )

  // Create a map of staff matches
  const matchMap = useMemo(() => {
    const map = new Map()
    matches.forEach(match => {
      map.set(match.staffId, match)
    })
    return map
  }, [matches])

  // Filter staff
  const filteredStaff = useMemo(() => {
    let result = staff

    // Apply filters
    if (filters.department) {
      result = result.filter(s => s.department === filters.department)
    }

    if (filters.specialization) {
      result = result.filter(s => s.specializations.includes(filters.specialization!))
    }

    if (filters.workloadStatus) {
      result = result.filter(s => {
        const percentage = (s.currentWorkload / s.maxCapacity) * 100
        switch (filters.workloadStatus) {
          case 'available': return percentage === 0
          case 'light': return percentage > 0 && percentage < 40
          case 'moderate': return percentage >= 40 && percentage < 70
          case 'heavy': return percentage >= 70 && percentage < 100
          case 'full': return percentage >= 100
          default: return true
        }
      })
    }

    if (filters.availableOnly) {
      result = result.filter(s => s.isAvailable && s.currentWorkload < s.maxCapacity)
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.skills.some(skill => skill.toLowerCase().includes(query))
      )
    }

    // Sort by match score if available
    if (showMatchScores && matches.length > 0) {
      result = [...result].sort((a, b) => {
        const matchA = matchMap.get(a.id)
        const matchB = matchMap.get(b.id)
        if (matchA && matchB) {
          return matchB.matchScore - matchA.matchScore
        }
        return 0
      })
    }

    return result
  }, [staff, filters, searchQuery, showMatchScores, matches, matchMap])

  const clearFilters = () => {
    setFilters({ availableOnly: true })
    setSearchQuery('')
  }

  const hasActiveFilters = 
    filters.department || 
    filters.specialization || 
    filters.workloadStatus || 
    searchQuery

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-primary/10' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Department Filter */}
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={filters.department || 'all'}
                  onValueChange={(value) =>
                    setFilters({ ...filters, department: value === 'all' ? undefined : value as Department })
                  }
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {Object.entries(DEPARTMENT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specialization Filter */}
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Select
                  value={filters.specialization || 'all'}
                  onValueChange={(value) =>
                    setFilters({ ...filters, specialization: value === 'all' ? undefined : value as StaffSpecialization })
                  }
                >
                  <SelectTrigger id="specialization">
                    <SelectValue placeholder="All Specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    {Object.values(STAFF_SPECIALIZATIONS).map(spec => (
                      <SelectItem key={spec} value={spec}>
                        {spec.charAt(0).toUpperCase() + spec.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Workload Filter */}
              <div className="space-y-2">
                <Label htmlFor="workload">Workload</Label>
                <Select
                  value={filters.workloadStatus || 'all'}
                  onValueChange={(value) =>
                    setFilters({ ...filters, workloadStatus: value === 'all' ? undefined : value as WorkloadStatus })
                  }
                >
                  <SelectTrigger id="workload">
                    <SelectValue placeholder="All Workloads" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Workloads</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="light">Light Load</SelectItem>
                    <SelectItem value="moderate">Moderate Load</SelectItem>
                    <SelectItem value="heavy">Heavy Load</SelectItem>
                    <SelectItem value="full">Full Capacity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="availableOnly"
                checked={filters.availableOnly}
                onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Label htmlFor="availableOnly" className="cursor-pointer">
                Show only available staff
              </Label>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {filteredStaff.length} {filteredStaff.length === 1 ? 'staff member' : 'staff members'}
              {hasActiveFilters && ` found`}
            </span>
          </div>

          {showMatchScores && matches.length > 0 && (
            <Badge variant="secondary">
              Sorted by best match
            </Badge>
          )}
        </div>
      </div>

      {/* Staff List */}
      {matchesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-slate-50 dark:bg-slate-900">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">No staff members found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your filters or search criteria
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredStaff.map((member, index) => {
            const match = matchMap.get(member.id)
            return (
              <StaffCard
                key={member.id}
                staff={member}
                matchScore={match?.matchScore}
                matchLevel={match?.matchLevel}
                matchReasons={match?.matchReasons}
                isTopMatch={showMatchScores && index === 0}
                isSelected={selectedStaffId === member.id}
                onSelect={onSelectStaff}
                showDetails={true}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
