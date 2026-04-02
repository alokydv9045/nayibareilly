/**
 * Advanced Filter Builder Component
 * Multi-criteria filtering for issues search
 */

'use client'

import { useState } from 'react'
import { X, Filter, Calendar, MapPin, Image, Save, Trash2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface FilterCriteria {
  search?: string;
  status?: string[];
  priority?: string[];
  categories?: string[];
  departments?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  dateFrom?: string;
  dateTo?: string;
  location?: {
    lat?: number;
    lng?: number;
    radius?: number;
  } | string;
  hasImages?: boolean;
  hasMedia?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

interface FilterBuilderProps {
  filters: FilterCriteria
  onFiltersChange: (filters: FilterCriteria) => void
  onClear: () => void
  onSave?: (name: string, filters: FilterCriteria) => void
  className?: string
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REJECTED', label: 'Rejected' },
]

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'votes', label: 'Votes' },
]

export function FilterBuilder({
  filters,
  onFiltersChange,
  onClear,
  onSave,
  className
}: FilterBuilderProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'page' || key === 'limit' || key === 'sortBy' || key === 'sortOrder') return false
    if (Array.isArray(value)) return value.length > 0
    return value !== null && value !== undefined && value !== ''
  }).length

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatus = filters.status || []
    const newStatus = checked
      ? [...currentStatus, status]
      : currentStatus.filter((s: string) => s !== status)
    onFiltersChange({ ...filters, status: newStatus })
  }

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const currentPriority = filters.priority || []
    const newPriority = checked
      ? [...currentPriority, priority]
      : currentPriority.filter((p: string) => p !== priority)
    onFiltersChange({ ...filters, priority: newPriority })
  }

  const handleSaveFilter = () => {
    if (onSave && saveName.trim()) {
      onSave(saveName, filters)
      setSaveName('')
      setShowSaveDialog(false)
    }
  }

  return (
    <Card className={cn("p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <h3 className="font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8"
          >
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-180"
            )} />
          </Button>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-8 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Status Filter */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Status</Label>
            <div className="grid grid-cols-2 gap-3">
              {STATUS_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={filters.status?.includes(option.value) || false}
                    onCheckedChange={(checked) => 
                      handleStatusChange(option.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`status-${option.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Priority</Label>
            <div className="grid grid-cols-2 gap-3">
              {PRIORITY_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${option.value}`}
                    checked={filters.priority?.includes(option.value) || false}
                    onCheckedChange={(checked) =>
                      handlePriorityChange(option.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`priority-${option.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date Range
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">To</Label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </Label>
            <Input
              type="text"
              placeholder="Search by location..."
              value={typeof filters.location === 'string' ? filters.location : ''}
              onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
              className="h-9"
            />
          </div>

          {/* Media Filter */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="w-4 h-4 inline mr-1" />
              Media
            </Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-media"
                checked={filters.hasMedia === true}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, hasMedia: checked ? true : undefined })
                }
              />
              <label htmlFor="has-media" className="text-sm cursor-pointer">
                Only issues with photos/videos
              </label>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Sort By</Label>
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={filters.sortBy || 'createdAt'}
                onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.sortOrder || 'desc'}
                onValueChange={(value) => onFiltersChange({ ...filters, sortOrder: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Save Filter */}
          {onSave && (
            <div className="pt-4 border-t">
              {!showSaveDialog ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                  className="w-full"
                  disabled={activeFilterCount === 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Filter
                </Button>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Filter name..."
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="h-9"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveFilter}
                      disabled={!saveName.trim()}
                      className="flex-1"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowSaveDialog(false)
                        setSaveName('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Filters - Always Visible */}
      {!isExpanded && activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {(filters.status?.length ?? 0) > 0 && (
            <div className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
              Status: {filters.status?.length ?? 0}
            </div>
          )}
          {(filters.priority?.length ?? 0) > 0 && (
            <div className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
              Priority: {filters.priority?.length ?? 0}
            </div>
          )}
          {filters.dateFrom && (
            <div className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
              From: {new Date(filters.dateFrom).toLocaleDateString()}
            </div>
          )}
          {filters.location && (
            <div className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
              Location: {typeof filters.location === 'string' ? filters.location : 'Coordinates set'}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

/**
 * Saved Filters List Component
 */
export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: FilterCriteria;
  createdAt: string;
}

interface SavedFiltersListProps {
  searches: SavedSearch[]
  onSelect: (search: SavedSearch) => void
  onDelete: (searchId: string) => void
  className?: string
}

export function SavedFiltersList({
  searches,
  onSelect,
  onDelete,
  className
}: SavedFiltersListProps) {
  if (searches.length === 0) {
    return null
  }

  return (
    <Card className={cn("p-4", className)}>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Save className="w-4 h-4" />
        Saved Filters
      </h3>
      <div className="space-y-2">
        {searches.map((search) => (
          <div
            key={search.id}
            className="flex items-center justify-between p-2 rounded-md hover:bg-accent group"
          >
            <button
              onClick={() => onSelect(search)}
              className="flex-1 text-left text-sm"
            >
              <div className="font-medium">{search.name}</div>
              <div className="text-xs text-muted-foreground">{search.query}</div>
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(search.id)}
              className="h-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
