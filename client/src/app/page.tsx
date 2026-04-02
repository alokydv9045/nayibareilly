"use client"

import Link from 'next/link'
import { Wrench, Trash2, Droplets, Shield, Phone, Building2, Globe, FileText, Heart, MessageCircle, Eye, Filter, MapPin, Calendar, Users, Search, X, ChevronDown, SortDesc, BarChart3, BookmarkPlus, ExternalLink, ThumbsUp, ThumbsDown, User, TrendingUp, CheckCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useMemo } from 'react'
import { ISSUE_CATEGORIES } from '@/lib/validations/reportForm'
import { toast } from 'react-hot-toast'
import { usePublicStats, usePublicReports, usePublicCategories } from '@/hooks/api/usePublic'
import { formatDistanceToNow } from 'date-fns'
import HeroSection from '@/components/sections/HeroSection'

export default function LandingPage() {
  // Advanced filtering state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'votes'>('newest')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [_page, _setPage] = useState(1) // Pagination - to be implemented

  // Report interaction state
  const [reportLikes, setReportLikes] = useState<{ [key: string]: boolean }>({})
  const [reportBookmarks, setReportBookmarks] = useState<{ [key: string]: boolean }>({})

  // Fetch real-time data from backend
  const { data: stats, isLoading: statsLoading } = usePublicStats()
  const { data: reportsResponse, isLoading: reportsLoading } = usePublicReports({
    page: _page,
    limit: 12,
    category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
    status: 'all',
    sort: sortBy,
    search: searchTerm || undefined
  })
  const { data: categories } = usePublicCategories()

  // Extract reports from response with useMemo to prevent re-renders
  const reportsData = useMemo(() => reportsResponse?.issues || [], [reportsResponse])
  const pagination = reportsResponse?.pagination

  // Handle like toggle
  const handleReportLike = (reportId: string) => {
    const isLiked = reportLikes[reportId]
    setReportLikes(prev => ({ ...prev, [reportId]: !isLiked }))
    toast.success(isLiked ? 'Removed from favorites!' : 'Added to favorites!')
  }

  // Handle bookmark toggle
  const handleBookmark = (reportId: string) => {
    setReportBookmarks(prev => ({ ...prev, [reportId]: !prev[reportId] }))
    toast.success(reportBookmarks[reportId] ? 'Bookmark removed!' : 'Report bookmarked!')
  }

  // Since filtering/sorting is now handled by the backend API, just use the data directly
  // We only do client-side multi-category filtering if needed
  const filteredAndSortedReports = useMemo(() => {
    if (!reportsData || reportsData.length === 0) return []
    
    // If multiple categories selected, filter client-side
    if (selectedCategories.length > 1) {
      return reportsData.filter((report: { categoryName?: string }) => 
        selectedCategories.includes(report.categoryName || '')
      )
    }
    
    // Otherwise, backend handles single category filter
    return reportsData
  }, [reportsData, selectedCategories])

  // Category statistics - use API data if available, otherwise calculate from reports
  const categoryStats = useMemo(() => {
    // If we have API categories, use them
    if (categories && categories.length > 0) {
      return ISSUE_CATEGORIES.map(category => {
        const apiCategory = categories.find((c: { name: string; count: number }) => c.name === category.id)
        return {
          ...category,
          count: apiCategory?.count || 0,
          totalVotes: 0, // Not provided by API
          isPopular: (apiCategory?.count || 0) > 10
        }
      }).sort((a, b) => b.count - a.count)
    }
    
    // Fallback: calculate from current reports data
    const stats = ISSUE_CATEGORIES.map(category => {
      const categoryReports = reportsData.filter((report: { categoryName?: string }) => 
        report.categoryName === category.id || report.categoryName === category.enName
      )
      const totalVotes = categoryReports.reduce((sum: number, report: { votesCount?: number }) => sum + (report.votesCount || 0), 0)
      return {
        ...category,
        count: categoryReports.length,
        totalVotes,
        isPopular: categoryReports.length > 1
      }
    })
    return stats.sort((a, b) => b.count - a.count)
  }, [reportsData, categories])
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Government Banner */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-green-800 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Government of Uttar Pradesh</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Bareilly Municipal Corporation</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <span className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>Helpline: 1800-180-1551</span>
              </span>
              <span className="flex items-center space-x-1">
                <Globe className="h-3 w-3" />
                <span>bareilly.nic.in</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section with Mayor Banner Integrated */}
      <HeroSection />

      {/* Issue Categories */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 animate-fadeInUp">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Issue Categories</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">Choose your issue category and report instantly</p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Roads & Infrastructure */}
            <Card className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 transform hover:-translate-y-3 hover:rotate-1 animate-fadeInLeft">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 hover:shadow-2xl">
                  <Wrench className="h-8 w-8 sm:h-10 sm:w-10 text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                </div>
                <CardTitle className="text-lg sm:text-xl text-gray-900 group-hover:text-blue-600 transition-colors duration-300">Roads & Infrastructure</CardTitle>
                <CardDescription className="text-sm group-hover:text-blue-700 transition-colors duration-300">सड़क और बुनियादी ढांचा</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild variant="outline" className="w-full border-blue-200 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 group-hover:shadow-lg">
                  <Link href="/report?category=roads">
                    Report Issue
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Sanitation & Waste */}
            <Card className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 transform hover:-translate-y-3 hover:-rotate-1 animate-fadeInUp animation-delay-200">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500 hover:shadow-2xl">
                  <Trash2 className="h-8 w-8 sm:h-10 sm:w-10 text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                </div>
                <CardTitle className="text-lg sm:text-xl text-gray-900 group-hover:text-green-600 transition-colors duration-300">Sanitation & Waste</CardTitle>
                <CardDescription className="text-sm group-hover:text-green-700 transition-colors duration-300">स्वच्छता और कचरा प्रबंधन</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild variant="outline" className="w-full border-green-200 hover:bg-green-50 transform hover:scale-105 transition-all duration-300 group-hover:shadow-lg">
                  <Link href="/report?category=sanitation">
                    Report Issue
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Water & Drainage */}
            <Card className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100 transform hover:-translate-y-3 hover:rotate-1 animate-fadeInRight animation-delay-400">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 hover:shadow-2xl">
                  <Droplets className="h-8 w-8 sm:h-10 sm:w-10 text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                </div>
                <CardTitle className="text-lg sm:text-xl text-gray-900 group-hover:text-teal-600 transition-colors duration-300">Water & Drainage</CardTitle>
                <CardDescription className="text-sm group-hover:text-teal-700 transition-colors duration-300">जल और जल निकासी</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild variant="outline" className="w-full border-teal-200 hover:bg-teal-50 transform hover:scale-105 transition-all duration-300 group-hover:shadow-lg">
                  <Link href="/report?category=water">
                    Report Issue
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Community Reports & Voting */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-4">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Community Driven</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Community Reports</h2>
            <p className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
              Vote and review issues reported by citizens. Your voice matters in making our city better.
            </p>
          </div>

          {/* Advanced Filters & Stats Bar */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Search and Primary Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 gap-3">
                {/* Search Bar */}
                <div className="flex-1 lg:max-w-md relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 sm:h-11 text-sm"
                  />
                </div>

                {/* Sort and Filter Controls */}
                <div className="flex items-center gap-2">
                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'votes')}>
                    <SelectTrigger aria-label="Sort reports" className="w-[120px] sm:w-36 h-10 sm:h-11 text-xs sm:text-sm">
                      <SortDesc className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="votes">Most Voted</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Advanced Filter Toggle */}
                  <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="border-gray-300 hover:border-blue-500 hover:text-blue-600 h-10 sm:h-11 text-xs sm:text-sm px-3">
                        <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Categories</span>
                        <span className="sm:hidden">Filter</span>
                        {selectedCategories.length > 0 && (
                          <Badge variant="secondary" className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {selectedCategories.length}
                          </Badge>
                        )}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 p-0" align="end">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-900">Filter by Categories</h4>
                          {selectedCategories.length > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSelectedCategories([])}
                              className="text-xs"
                            >
                              Clear All
                            </Button>
                          )}
                        </div>
                        
                        {/* Category Filters */}
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {categoryStats.map((category) => (
                            <div key={category.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                              <Checkbox
                                id={category.id}
                                checked={selectedCategories.includes(category.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedCategories([...selectedCategories, category.id])
                                  } else {
                                    setSelectedCategories(selectedCategories.filter(id => id !== category.id))
                                  }
                                }}
                              />
                              <div className="flex-1 flex items-center space-x-2">
                                <span className="text-lg">{category.icon}</span>
                                <div className="flex-1">
                                  <label 
                                    htmlFor={category.id} 
                                    className="text-sm font-medium text-gray-900 cursor-pointer block"
                                  >
                                    {category.enName}
                                  </label>
                                  <div className="text-xs text-gray-500 mt-0.5">{category.hiName}</div>
                                  <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                                    <span>{category.count} reports</span>
                                    {category.isPopular && (
                                      <Badge variant="secondary" className="text-xs px-1.5 h-4">
                                        Popular
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Active Filters Display */}
              {(selectedCategories.length > 0 || searchTerm) && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="group cursor-pointer hover:bg-red-100 transition-colors">
                      Search: &ldquo;{searchTerm}&rdquo;
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 group-hover:text-red-600"
                        onClick={() => setSearchTerm('')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {selectedCategories.map(categoryId => {
                    const category = ISSUE_CATEGORIES.find(c => c.id === categoryId)
                    return category ? (
                      <Badge key={categoryId} variant="secondary" className="group cursor-pointer hover:bg-red-100 transition-colors flex items-center gap-1">
                        <span>{category.icon}</span>
                        <span className="font-medium">{category.enName}</span>
                        <span className="text-xs opacity-70">/ {category.hiName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1 group-hover:text-red-600"
                          onClick={() => setSelectedCategories(selectedCategories.filter(id => id !== categoryId))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ) : null
                  })}
                </div>
              )}

              {/* Quick Category Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 font-medium mr-1">Quick filters:</span>
                {categoryStats.slice(0, 4).map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (selectedCategories.includes(category.id)) {
                        setSelectedCategories(selectedCategories.filter(id => id !== category.id))
                      } else {
                        setSelectedCategories([...selectedCategories, category.id])
                      }
                    }}
                    className={`text-xs sm:text-sm h-8 px-2 sm:px-3 transition-all ${
                      selectedCategories.includes(category.id) 
                        ? 'shadow-sm' 
                        : 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                    }`}
                  >
                    <span className="mr-1.5 text-sm">{category.icon}</span>
                    <span className="hidden sm:inline font-medium">{category.enName}</span>
                    <span className="hidden lg:inline text-xs opacity-70 ml-1">/ {category.hiName}</span>
                    <Badge 
                      variant={selectedCategories.includes(category.id) ? "secondary" : "outline"} 
                      className="ml-1.5 text-[10px] sm:text-xs px-1 h-4"
                    >
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
              
              {/* Live Stats - Real-time */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 gap-3">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm">
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-600">
                      {reportsLoading ? '...' : filteredAndSortedReports.length} reports
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-600 hidden sm:inline">
                      {statsLoading ? '...' : stats?.activeUsers || 0} active users
                    </span>
                    <span className="text-gray-600 sm:hidden">
                      {statsLoading ? '...' : `${Math.round((stats?.activeUsers || 0) / 1000)}K`} users
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                    <span className="text-gray-600">
                      {reportsLoading ? '...' : reportsData.reduce((sum: number, r: { votesCount?: number }) => sum + (r.votesCount || 0), 0)} votes
                    </span>
                  </div>
                  {stats && stats.issuesToday > 0 && (
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-600">
                        {stats.issuesToday} reported today
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Results Summary */}
                <div className="text-xs sm:text-sm text-gray-500">
                  Sorted by: <span className="font-medium text-gray-700">{sortBy}</span>
                  {pagination && (
                    <span className="ml-2">
                      • Page {pagination.page} of {pagination.totalPages}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Recent Reports - Enhanced */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Reports</h3>
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 h-8 sm:h-9 text-xs sm:text-sm">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                </Button>
              </div>
              
              {reportsLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={`skeleton-${index}`} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredAndSortedReports.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                    <Button onClick={() => { setSelectedCategories([]); setSearchTerm('') }}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : filteredAndSortedReports.map((report: {
                id: string;
                reportId: string;
                title: string;
                description?: string;
                categoryName?: string;
                status: string;
                priority?: string;
                votesCount?: number;
                commentsCount?: number;
                viewsCount?: number;
                location?: { address?: string };
                createdAt: string;
                user?: { fullName?: string };
              }) => {
                const categoryInfo = ISSUE_CATEGORIES.find(c => 
                  c.id === report.categoryName || c.enName === report.categoryName
                )
                const timeAgo = formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })
                const location = report.location?.address || 'Location not specified'
                const statusLabel = report.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())
                
                return (
                <Card key={report.id} className="group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 bg-white">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="p-4 sm:p-6 pb-3 sm:pb-4">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                            {(report.votesCount || 0) > 20 && (
                              <Badge className="bg-orange-100 text-orange-700 text-[10px] sm:text-xs px-1.5 py-0.5">
                                <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                <span className="hidden sm:inline">Trending</span>
                                <span className="sm:hidden">Hot</span>
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5">
                              <span className="text-xs">{categoryInfo?.icon || '📋'}</span>
                              <span className="hidden sm:inline">{categoryInfo?.enName || report.categoryName || 'General'}</span>
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={`text-[10px] sm:text-xs px-1.5 py-0.5 ${
                                report.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                report.status === 'open' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                report.status === 'resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                              }`}
                            >
                              {statusLabel}
                            </Badge>
                          </div>
                          
                          <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5 sm:mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {report.title}
                          </h4>
                          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                            {report.description || 'No description provided'}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="truncate max-w-[120px] sm:max-w-none">{location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{timeAgo}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{report.viewsCount || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Badge 
                          variant="outline"
                          className={`text-[10px] sm:text-xs ml-2 sm:ml-4 shrink-0 ${
                            report.priority === 'high' || report.priority === 'critical' ? 'border-red-300 text-red-700 bg-red-50' :
                            report.priority === 'medium' ? 'border-orange-300 text-orange-700 bg-orange-50' :
                            'border-gray-300 text-gray-700 bg-gray-50'
                          }`}
                        >
                          <span className="hidden sm:inline">{(report.priority || 'low').charAt(0).toUpperCase() + (report.priority || 'low').slice(1)} Priority</span>
                          <span className="sm:hidden">{(report.priority || 'low').charAt(0).toUpperCase() + (report.priority || 'low').slice(1)}</span>
                        </Badge>
                      </div>
                    </div>

                    {/* Enhanced Interactive Actions */}
                    <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          {/* Enhanced Voting with Icons */}
                          <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.preventDefault()
                                toast.success('Login required to vote')
                              }}
                              className="h-8 sm:h-9 px-2 sm:px-3 rounded-none border-r border-gray-200 hover:bg-green-50 hover:text-green-600 transition-all group"
                            >
                              <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 group-hover:scale-110 transition-transform" />
                              <span className="font-medium text-xs sm:text-sm">{report.votesCount || 0}</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.preventDefault()
                                toast.success('Login required to vote')
                              }}
                              className="h-8 sm:h-9 px-2 sm:px-3 rounded-none hover:bg-red-50 hover:text-red-600 transition-all group"
                            >
                              <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 group-hover:scale-110 transition-transform" />
                              <span className="font-medium text-xs sm:text-sm">0</span>
                            </Button>
                          </div>
                          
                          {/* Comments Button */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.preventDefault()
                              toast.success('View comments in detail page')
                            }}
                            className="h-8 sm:h-9 px-2 sm:px-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all group"
                          >
                            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-xs sm:text-sm">{report.commentsCount || 0}</span>
                          </Button>
                          
                          {/* Like/Heart Button */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.preventDefault()
                              handleReportLike(report.id)
                            }}
                            className={`h-8 sm:h-9 px-2 sm:px-3 bg-white border rounded-lg shadow-sm transition-all group ${
                              reportLikes[report.id] 
                                ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' 
                                : 'border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                            }`}
                          >
                            <Heart className={`h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform ${
                              reportLikes[report.id] ? 'fill-current' : ''
                            }`} />
                          </Button>

                          {/* Bookmark Button */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.preventDefault()
                              handleBookmark(report.id)
                            }}
                            className={`h-8 sm:h-9 px-2 sm:px-3 bg-white border rounded-lg shadow-sm transition-all group ${
                              reportBookmarks[report.id] 
                                ? 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100' 
                                : 'border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                            }`}
                          >
                            <BookmarkPlus className={`h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform ${
                              reportBookmarks[report.id] ? 'fill-current' : ''
                            }`} />
                          </Button>
                        </div>
                        
                        <div className="hidden sm:flex text-xs text-gray-500 items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">{report.user?.fullName || 'Anonymous'}</span>
                        </div>
                      </div>

                      {/* View Full Report Button */}
                      <Link href={`/reports/${report.id}`}>
                        <Button variant="outline" className="w-full h-8 sm:h-9 text-xs sm:text-sm border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all group">
                          <span>View Full Report</span>
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
              })}
              
              <div className="text-center pt-4">
                <Button asChild className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all">
                  <Link href="/reports">
                    View All Community Reports
                  </Link>
                </Button>
              </div>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Live Activity Feed */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <h3 className="text-xl font-bold">Live Activity</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { action: "Road repair completed", location: "Civil Lines", time: "Just now", type: "completed" },
                      { action: "Drainage cleaning started", location: "Subhash Nagar", time: "2 min ago", type: "in-progress" },
                      { action: "New waste report filed", location: "Rampur Garden", time: "5 min ago", type: "new" },
                      { action: "Street light fixed", location: "City Center", time: "10 min ago", type: "completed" }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full animate-pulse ${
                            activity.type === 'completed' ? 'bg-green-400' :
                            activity.type === 'in-progress' ? 'bg-yellow-400' :
                            'bg-blue-400'
                          }`}></div>
                          <div>
                            <div className="text-sm font-medium">{activity.action}</div>
                            <div className="text-xs text-blue-100">{activity.location}</div>
                          </div>
                        </div>
                        <span className="text-xs text-blue-200 whitespace-nowrap">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Impact Stats */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Today&apos;s Impact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600 mb-1">156</div>
                      <div className="text-xs text-blue-700 font-medium">New Reports</div>
                      <div className="text-xs text-blue-600 mt-1">+12% from yesterday</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                      <div className="text-3xl font-bold text-green-600 mb-1">89</div>
                      <div className="text-xs text-green-700 font-medium">Resolved</div>
                      <div className="text-xs text-green-600 mt-1">+18% from yesterday</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600 mb-1">1.2K</div>
                      <div className="text-xs text-purple-700 font-medium">Total Votes</div>
                      <div className="text-xs text-purple-600 mt-1">+25% from yesterday</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                      <div className="text-3xl font-bold text-orange-600 mb-1">4.2</div>
                      <div className="text-xs text-orange-700 font-medium">Avg Rating</div>
                      <div className="text-xs text-orange-600 mt-1">↑ 0.3 this week</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Top Voted Issues */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>Most Voted Issues</span>
                  </CardTitle>
                  <CardDescription>Issues getting the most community attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { issue: "Traffic light repair", votes: 234, area: "City Center", trend: "+45" },
                      { issue: "Park maintenance", votes: 189, area: "Civil Lines", trend: "+23" },
                      { issue: "Street cleaning", votes: 167, area: "Subhash Nagar", trend: "+18" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:from-blue-50 hover:to-blue-100 hover:border-blue-200 transition-all cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{item.issue}</div>
                            <div className="text-xs text-gray-600">{item.area}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{item.votes}</div>
                          <div className="text-xs text-green-600">+{item.trend} today</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Community Engagement CTA */}
              <Card className="shadow-lg bg-gradient-to-br from-green-50 to-blue-50 border border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Join the Community</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Help make our city better by reporting issues and voting on solutions.
                  </p>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Live Updates */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-8 text-white">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Real-time Updates</h2>
                <p className="text-blue-100 mb-6">
                  Get instant notifications about your complaints and city development projects
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>SMS & Email Notifications</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>Real-time Status Tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>Community Updates</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Road repair completed</span>
                    <Badge variant="secondary" className="bg-green-200 text-green-800">Resolved</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Drainage cleaning ongoing</span>
                    <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">In Progress</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Street light installation</span>
                    <Badge variant="secondary" className="bg-blue-200 text-blue-800">New</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
