/**
 * Search Results Component
 * Displays search results with highlighting
 */

'use client'

import { FileText, MapPin, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { highlightText, extractSnippet } from '@/lib/search/highlighter'
import { cn } from '@/lib/utils'

export interface SearchResult {
  id: string;
  type: 'issue' | 'user' | 'department';
  title: string;
  description?: string;
  category?: string | { name: string };
  status?: string;
  priority?: string;
  location?: string;
  address?: string;
  reportId?: string;
  createdAt: string;
  reporter?: { name: string };
  _count?: {
    comments: number;
    votes: number;
  };
  [key: string]: unknown;
}

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  isLoading?: boolean
  onResultClick: (result: SearchResult) => void
  className?: string
}

export function SearchResults({
  results,
  query,
  isLoading,
  onResultClick,
  className
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-5 bg-muted rounded w-3/4 mb-2" />
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">No results found</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {results.map((result) => (
        <SearchResultCard
          key={result.id}
          result={result}
          query={query}
          onClick={() => onResultClick(result)}
        />
      ))}
    </div>
  )
}

interface SearchResultCardProps {
  result: SearchResult
  query: string
  onClick: () => void
}

function SearchResultCard({ result, query, onClick }: SearchResultCardProps) {
  const titleParts = highlightText(result.title, query)
  const snippet = extractSnippet(result.description || '', query, 150)
  const snippetParts = highlightText(snippet, query)

  return (
    <Card
      className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <h3 className="font-medium text-lg leading-tight mb-1">
            {titleParts.map((part, i) => (
              <span
                key={i}
                className={cn(
                  part.isHighlight && "bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded"
                )}
              >
                {part.text}
              </span>
            ))}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {result.reportId && <span className="font-mono">{result.reportId}</span>}
            {result.reportId && <span>•</span>}
            <span>{new Date(result.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {result.status && <StatusBadge status={result.status} />}
          {result.priority && <PriorityBadge priority={result.priority} />}
        </div>
      </div>

      {/* Description Snippet */}
      {snippet && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {snippetParts.map((part, i) => (
            <span
              key={i}
              className={cn(
                part.isHighlight && "bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded font-medium"
              )}
            >
              {part.text}
            </span>
          ))}
        </p>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {result.category && (
          <div className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            <span>{typeof result.category === 'string' ? result.category : result.category.name}</span>
          </div>
        )}
        {result.address && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">{result.address}</span>
          </div>
        )}
        {result.reporter && (
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>{result.reporter.name}</span>
          </div>
        )}
        {result._count && (
          <>
            {result._count.comments > 0 && (
              <span>{result._count.comments} comments</span>
            )}
            {result._count.votes > 0 && (
              <span>{result._count.votes} votes</span>
            )}
          </>
        )}
      </div>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    ASSIGNED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    IN_PROGRESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    VERIFIED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  return (
    <Badge className={cn("text-xs", variants[status] || variants.PENDING)}>
      {status.replace('_', ' ')}
    </Badge>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    URGENT: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  }

  return (
    <Badge className={cn("text-xs", variants[priority] || variants.MEDIUM)}>
      {priority}
    </Badge>
  )
}

/**
 * Highlighted Text Component
 * Reusable component for highlighting text
 */
interface HighlightedTextProps {
  text: string
  query: string
  className?: string
}

export function HighlightedText({ text, query, className }: HighlightedTextProps) {
  const parts = highlightText(text, query)

  return (
    <span className={className}>
      {parts.map((part, i) => (
        <span
          key={i}
          className={cn(
            part.isHighlight && "bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded"
          )}
        >
          {part.text}
        </span>
      ))}
    </span>
  )
}
