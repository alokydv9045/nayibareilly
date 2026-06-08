/**
 * Command Palette Component
 * Global search with Cmd/Ctrl+K keyboard shortcut
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, User, Building2, X, Loader2, Clock, TrendingUp } from 'lucide-react'
import { useGlobalSearch, useSavedSearches } from '@/lib/search/hooks'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const { query, setQuery, results, counts, isLoading } = useGlobalSearch()
  const { searches: savedSearches } = useSavedSearches()
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen, setQuery])

  const handleSelect = useCallback((index: number) => {
    let currentIndex = 0

    // Check saved searches
    if (index < savedSearches.length) {
      const search = savedSearches[index]
      router.push(`/issues?query=${encodeURIComponent(search.query)}`)
      onClose()
      return
    }
    currentIndex += savedSearches.length

    // Check issues
    if (index < currentIndex + results.issues.length) {
      const issue = results.issues[index - currentIndex]
      router.push(`/reports/${issue.id}`)
      onClose()
      return
    }
    currentIndex += results.issues.length

    // Check users
    if (index < currentIndex + results.users.length) {
      const user = results.users[index - currentIndex]
      router.push(`/users/${user.id}`)
      onClose()
      return
    }
    currentIndex += results.users.length

    // Check departments
    if (index < currentIndex + results.departments.length) {
      const dept = results.departments[index - currentIndex]
      router.push(`/departments/${dept.id}`)
      onClose()
      return
    }
  }, [results, savedSearches, router, onClose])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const totalResults = 
        results.issues.length + 
        results.users.length + 
        results.departments.length +
        savedSearches.length

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, totalResults - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleSelect(selectedIndex)
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, results, savedSearches, onClose, handleSelect])

  const showResults = query.length >= 2 || savedSearches.length > 0
  const hasResults = 
    results.issues.length > 0 || 
    results.users.length > 0 || 
    results.departments.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogTitle className="sr-only">Search</DialogTitle>
        
        {/* Search Input */}
        <div className="flex items-center border-b px-4 py-3">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            type="text"
            placeholder="Search issues, users, departments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            autoFocus
          />
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-2" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-auto p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {!showResults && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Type to search or press Ctrl+K to open</p>
              <p className="text-xs mt-1">Search across issues, users, and departments</p>
            </div>
          )}

          {showResults && !hasResults && !isLoading && query.length >= 2 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No results found for &quot;{query}&quot;</p>
              <p className="text-xs mt-1">Try adjusting your search terms</p>
            </div>
          )}

          {showResults && (
            <>
              {/* Saved Searches */}
              {savedSearches.length > 0 && query.length < 2 && (
                <div className="mb-4">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Recent Searches
                  </div>
                  {savedSearches.map((search, index) => (
                    <button
                      key={search.id}
                      onClick={() => handleSelect(index)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent",
                        selectedIndex === index && "bg-accent"
                      )}
                    >
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{search.name}</div>
                        <div className="text-xs text-muted-foreground">{search.query}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Issues */}
              {results.issues.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Issues ({counts.issues})
                  </div>
                  {results.issues.map((issue, index) => {
                    const globalIndex = savedSearches.length + index
                    return (
                      <button
                        key={issue.id}
                        onClick={() => handleSelect(globalIndex)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent",
                          selectedIndex === globalIndex && "bg-accent"
                        )}
                      >
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{issue.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {issue.reportId} • {issue.status}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Users */}
              {results.users.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Users ({counts.users})
                  </div>
                  {results.users.map((user, index) => {
                    const globalIndex = savedSearches.length + results.issues.length + index
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleSelect(globalIndex)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent",
                          selectedIndex === globalIndex && "bg-accent"
                        )}
                      >
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.email} • {user.roles.join(', ')}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Departments */}
              {results.departments.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    Departments ({counts.departments})
                  </div>
                  {results.departments.map((dept, index) => {
                    const globalIndex = savedSearches.length + results.issues.length + results.users.length + index
                    return (
                      <button
                        key={dept.id}
                        onClick={() => handleSelect(globalIndex)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent",
                          selectedIndex === globalIndex && "bg-accent"
                        )}
                      >
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{dept.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {dept._count?.issues || 0} issues • {dept._count?.staff || 0} staff
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Command Palette Provider
 * Handles global keyboard shortcut
 */
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {children}
      <CommandPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
