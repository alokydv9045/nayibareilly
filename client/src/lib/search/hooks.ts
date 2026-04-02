/**
 * Search Hooks
 * React hooks for search functionality
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import type { GlobalSearchResults, SearchCounts, SavedSearch, SearchIssue } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'

/**
 * Global search hook
 * Searches across issues, users, and departments
 */
export function useGlobalSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<GlobalSearchResults>({ issues: [], users: [], departments: [] })
  const [counts, setCounts] = useState<SearchCounts>({ issues: 0, users: 0, departments: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const debouncedQuery = useDebounce(query, 300)
  const abortControllerRef = useRef<AbortController | null>(null)

  const search = useCallback(async (
    searchQuery: string, 
    types: string[] = ['issues', 'users', 'departments'], 
    limit = 5
  ) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults({ issues: [], users: [], departments: [] })
      setCounts({ issues: 0, users: 0, departments: 0 })
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const typesParam = types.join(',')
      
      const response = await fetch(
        `${API_BASE}/search/global?query=${encodeURIComponent(searchQuery)}&types=${typesParam}&limit=${limit}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          signal: abortControllerRef.current.signal
        }
      )

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      
      if (data.success) {
        setResults(data.data)
        setCounts(data.counts)
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message)
        console.error('Global search error:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-search when debounced query changes
  useEffect(() => {
    search(debouncedQuery)
  }, [debouncedQuery, search])

  return {
    query,
    setQuery,
    results,
    counts,
    isLoading,
    error,
    search
  }
}

/**
 * Issue search hook with advanced filtering
 */
export function useIssueSearch(initialFilters = {}) {
  const [filters, setFilters] = useState({
    query: '',
    status: [],
    category: [],
    department: [],
    priority: [],
    assignedTo: null,
    reportedBy: null,
    dateFrom: null,
    dateTo: null,
    location: null,
    hasMedia: null,
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  })

  const [results, setResults] = useState<SearchIssue[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(filters.query, 500)
  const abortControllerRef = useRef<AbortController | null>(null)

  const search = useCallback(async (searchFilters = filters) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()

      // Add all filter params
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value) && value.length > 0) {
            value.forEach(v => params.append(key, String(v)))
          } else if (!Array.isArray(value)) {
            params.append(key, String(value))
          }
        }
      })

      const response = await fetch(
        `${API_BASE}/search/issues?${params.toString()}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          signal: abortControllerRef.current?.signal
        }
      )

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()

      if (data.success) {
        setResults(data.data)
        setPagination(data.pagination)
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message)
        console.error('Issue search error:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Auto-search when debounced query or filters change
  useEffect(() => {
    search({ ...filters, query: debouncedQuery })
  }, [debouncedQuery, filters, search])

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      query: '',
      status: [],
      category: [],
      department: [],
      priority: [],
      assignedTo: null,
      reportedBy: null,
      dateFrom: null,
      dateTo: null,
      location: null,
      hasMedia: null,
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }, [])

  const goToPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }, [])

  return {
    filters,
    updateFilters,
    clearFilters,
    results,
    pagination,
    isLoading,
    error,
    search,
    goToPage
  }
}

/**
 * Search suggestions hook
 */
export function useSearchSuggestions(type = 'issues') {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const debouncedQuery = useDebounce(query, 200)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSuggestions([])
        return
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      setIsLoading(true)

      try {
        const token = localStorage.getItem('token')
        const response = await fetch(
          `${API_BASE}/search/suggestions?query=${encodeURIComponent(debouncedQuery)}&type=${type}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json'
            },
            signal: abortControllerRef.current?.signal
          }
        )

        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.data || [])
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error fetching suggestions:', err)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery, type])

  return {
    query,
    setQuery,
    suggestions,
    isLoading
  }
}

/**
 * Saved searches hook
 */
export function useSavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSavedSearches = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/search/saved`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch saved searches')
      }

      const data = await response.json()
      if (data.success) {
        setSearches(data.data)
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
        console.error('Error fetching saved searches:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveSearch = useCallback(async (name: string, query: string, filters: Record<string, unknown>) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/search/saved`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, query, filters })
      })

      if (!response.ok) {
        throw new Error('Failed to save search')
      }

      const data = await response.json()
      if (data.success) {
        await fetchSavedSearches()
        return data.data
      }
    } catch (err) {
      console.error('Error saving search:', err)
      throw err
    }
  }, [fetchSavedSearches])

  const deleteSearch = useCallback(async (searchId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/search/saved/${searchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete search')
      }

      await fetchSavedSearches()
    } catch (err) {
      console.error('Error deleting search:', err)
      throw err
    }
  }, [fetchSavedSearches])

  useEffect(() => {
    fetchSavedSearches()
  }, [fetchSavedSearches])

  return {
    searches,
    isLoading,
    error,
    saveSearch,
    deleteSearch,
    refresh: fetchSavedSearches
  }
}
