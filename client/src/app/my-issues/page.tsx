"use client"
import RequireUser from '@/components/features/auth/RequireUser'
import CitizenLayout from '@/components/layout/CitizenLayout'
import IssueCard from '@/components/features/citizen/IssueCard'
import { useMyIssues } from '@/hooks/api/useIssues'
import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, FileText, Clock, CheckCircle, XCircle, 
  TrendingUp, Plus
} from 'lucide-react'

export default function MyIssuesPage() {
  const { data: items, isLoading, error } = useMyIssues({ mine: true })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  // Process and filter issues
  const processedIssues = useMemo(() => {
    if (!Array.isArray(items)) return []
    
    return items.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           issue.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory
      const matchesStatus = selectedStatus === 'all' || issue.status === selectedStatus
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [items, searchTerm, selectedCategory, selectedStatus])

  // Get unique categories
  const categories = useMemo(() => {
    if (!Array.isArray(items)) return []
    return [...new Set(items.map(issue => issue.category))]
  }, [items])

  // Get statistics
  const stats = useMemo(() => {
    if (!Array.isArray(items)) return { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 }
    
    return {
      total: items.length,
      open: items.filter(i => i.status === 'open').length,
      inProgress: items.filter(i => i.status === 'in_progress').length,
      resolved: items.filter(i => i.status === 'resolved').length,
      closed: items.filter(i => i.status === 'closed').length,
    }
  }, [items])
  
  return (
    <RequireUser>
      <CitizenLayout>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 sm:space-y-3 animate-fadeInUp">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              My Issues
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Track and manage all your reported issues in one place. Monitor progress and stay updated on resolutions.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 animate-fadeInUp animation-delay-200">
            <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-blue-100 rounded-full p-2 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Issues</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-red-100 rounded-full p-2 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.open}</p>
                <p className="text-sm text-gray-600">Open</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-yellow-100 rounded-full p-2 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-green-100 rounded-full p-2 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-gray-100 rounded-full p-2 group-hover:scale-110 transition-transform duration-300">
                    <XCircle className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
                <p className="text-sm text-gray-600">Closed</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="animate-fadeInUp animation-delay-400">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                {/* Search */}
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                  <Input
                    placeholder="Search issues by title or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 transition-all duration-300 focus:scale-105 min-h-[44px]"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="transform hover:scale-105 transition-all duration-300 min-h-[36px]"
                  >
                    All Categories
                  </Button>
                  {categories.map((category, index) => (
                    <Button
                      key={`${category}-${index}`}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="transform hover:scale-105 transition-all duration-300 min-h-[36px]"
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Button
                    variant={selectedStatus === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus('all')}
                    className="transform hover:scale-105 transition-all duration-300 min-h-[36px]"
                  >
                    All Status
                  </Button>
                  {['open', 'in_progress', 'resolved', 'closed'].map(status => (
                    <Button
                      key={status}
                      variant={selectedStatus === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStatus(status)}
                      className="transform hover:scale-105 transition-all duration-300 min-h-[36px]"
                    >
                      {status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
                <div className="flex items-center gap-2 mt-4 flex-wrap animate-fadeInUp">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="group cursor-pointer hover:bg-red-100 transition-colors duration-300">
                      Search: &ldquo;{searchTerm}&rdquo;
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 group-hover:text-red-600"
                        onClick={() => setSearchTerm('')}
                      >
                        Ã—
                      </Button>
                    </Badge>
                  )}
                  {selectedCategory !== 'all' && (
                    <Badge variant="secondary" className="group cursor-pointer hover:bg-red-100 transition-colors duration-300">
                      Category: {selectedCategory}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 group-hover:text-red-600"
                        onClick={() => setSelectedCategory('all')}
                      >
                        Ã—
                      </Button>
                    </Badge>
                  )}
                  {selectedStatus !== 'all' && (
                    <Badge variant="secondary" className="group cursor-pointer hover:bg-red-100 transition-colors duration-300">
                      Status: {selectedStatus.replace('_', ' ')}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 group-hover:text-red-600"
                        onClick={() => setSelectedStatus('all')}
                      >
                        Ã—
                      </Button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Issues Grid */}
          <div className="animate-fadeInUp animation-delay-600">
            {isLoading ? (
              <div className="text-center py-10 sm:py-12">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading your issues...</span>
                </div>
              </div>
            ) : error ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 sm:p-8 text-center">
                  <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Issues</h3>
                  <p className="text-red-700">{error.message}</p>
                </CardContent>
              </Card>
            ) : processedIssues.length === 0 ? (
              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="p-10 sm:p-12 text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {Array.isArray(items) && items.length === 0 
                      ? "No Issues Found" 
                      : "No Matching Issues"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {Array.isArray(items) && items.length === 0 
                      ? "You haven't reported any issues yet. Start by reporting your first issue to help improve your community."
                      : "Try adjusting your search criteria or filters to find the issues you're looking for."}
                  </p>
                  {Array.isArray(items) && items.length === 0 && (
                    <Button className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg group">
                      <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                      Report New Issue
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {processedIssues.map((issue, index) => (
                  <div 
                    key={issue.id}
                    className="animate-fadeInUp transform hover:scale-105 transition-all duration-300"
                    style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                  >
                    <IssueCard issue={issue} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Results Summary */}
          {processedIssues.length > 0 && (
            <div className="text-center animate-fadeInUp animation-delay-800">
              <p className="text-gray-600">
                Showing {processedIssues.length} of {Array.isArray(items) ? items.length : 0} issues
              </p>
            </div>
          )}
        </div>
      </CitizenLayout>
    </RequireUser>
  )
}