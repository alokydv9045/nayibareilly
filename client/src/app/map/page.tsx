"use client"
import dynamic from 'next/dynamic'
import { useMemo, useState, useEffect } from 'react'
import CitizenLayout from '@/components/layout/CitizenLayout'
import RequireUser from '@/components/features/auth/RequireUser'
import { useIssueGeo } from '@/hooks/api/useIssueGeo'
import type { MarkerData } from '@/components/features/citizen/LeafletMap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MapPin, Search, Filter, Layers, Target, 
  Navigation, Zap, AlertTriangle, Info
} from 'lucide-react'

const LeafletMap = dynamic(() => import('@/components/features/citizen/LeafletMap'), { ssr: false })

export default function IssuesMapRootPage() {
  const { data = [], isLoading } = useIssueGeo()
  const [center, setCenter] = useState<[number, number]>([28.6139, 77.209])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setCenter([pos.coords.latitude, pos.coords.longitude]),
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      )
    }
  }, [])

  // Filter and process markers
  const filteredMarkers: MarkerData[] = useMemo(() => {
    return data
      .filter(p => p.latitude && p.longitude)
      .filter(p => {
        const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             p.category?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
        const matchesPriority = selectedPriority === 'all' || p.priority === selectedPriority
        
        return matchesSearch && matchesCategory && matchesPriority
      })
      .map(p => ({
        id: p.id,
        name: p.title,
        position: [p.latitude as number, p.longitude as number],
        priority: p.priority,
        category: p.category,
      }))
  }, [data, searchTerm, selectedCategory, selectedPriority])

  // Get unique categories and priorities
  const categories = useMemo(() => [...new Set(data.map(issue => issue.category).filter(Boolean))], [data])
  const priorities = useMemo(() => [...new Set(data.map(issue => issue.priority).filter(Boolean))], [data])

  // Statistics
  const stats = useMemo(() => {
    const total = filteredMarkers.length
    const highPriority = filteredMarkers.filter(m => m.priority === 'high').length
    const mediumPriority = filteredMarkers.filter(m => m.priority === 'medium').length
    const lowPriority = filteredMarkers.filter(m => m.priority === 'low').length
    
    return { total, highPriority, mediumPriority, lowPriority }
  }, [filteredMarkers])

  const centerOnLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setCenter([pos.coords.latitude, pos.coords.longitude]),
        () => alert('Could not get your location'),
        { enableHighAccuracy: true, timeout: 5000 }
      )
    }
  }

  return (
    <RequireUser>
      <CitizenLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4 animate-fadeInUp">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Issues Map
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore community issues on an interactive map. Find nearby problems and track resolution progress visually.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeInUp animation-delay-200">
            <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-blue-100 rounded-full p-2 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-5 w-5 text-blue-600" />
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
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
                <p className="text-sm text-gray-600">High Priority</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-yellow-100 rounded-full p-2 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{stats.mediumPriority}</p>
                <p className="text-sm text-gray-600">Medium Priority</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-green-100 rounded-full p-2 group-hover:scale-110 transition-transform duration-300">
                    <Info className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.lowPriority}</p>
                <p className="text-sm text-gray-600">Low Priority</p>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <Card className="animate-fadeInUp animation-delay-400">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Map Controls & Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors duration-300" />
                  <Input
                    placeholder="Search issues by title or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 transition-all duration-300 focus:scale-105"
                  />
                </div>

                {/* Location Button */}
                <Button
                  onClick={centerOnLocation}
                  variant="outline"
                  className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg group"
                >
                  <Navigation className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  My Location
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="transform hover:scale-105 transition-all duration-300"
                  >
                    All Categories
                  </Button>
                  {categories.map(category => category && (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="transform hover:scale-105 transition-all duration-300"
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Priority Filters */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedPriority === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPriority('all')}
                    className="transform hover:scale-105 transition-all duration-300"
                  >
                    All Priorities
                  </Button>
                  {priorities.map(priority => priority && (
                    <Button
                      key={priority}
                      variant={selectedPriority === priority ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPriority(priority)}
                      className="transform hover:scale-105 transition-all duration-300"
                    >
                      {priority}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all') && (
                <div className="flex items-center gap-2 flex-wrap animate-fadeInUp">
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
                  {selectedPriority !== 'all' && (
                    <Badge variant="secondary" className="group cursor-pointer hover:bg-red-100 transition-colors duration-300">
                      Priority: {selectedPriority}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 group-hover:text-red-600"
                        onClick={() => setSelectedPriority('all')}
                      >
                        Ã—
                      </Button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map Container */}
          <Card className="animate-fadeInUp animation-delay-600">
            <CardContent className="p-0">
              <div className="h-[600px] lg:h-[700px] relative overflow-hidden rounded-lg">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-gray-600">Loading map data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full animate-fadeIn animation-delay-700">
                    <LeafletMap 
                      center={center} 
                      markers={filteredMarkers} 
                      cluster 
                      zoom={12} 
                    />
                  </div>
                )}
                
                {/* Map Overlay Info */}
                <div className="absolute top-4 right-4 space-y-2 animate-fadeInRight animation-delay-800">
                  <Card className="bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{filteredMarkers.length} issues shown</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-3">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>High Priority</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>Medium Priority</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Low Priority</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Instructions */}
          <Card className="animate-fadeInUp animation-delay-900">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">How to Use the Map</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Click markers</p>
                      <p>View issue details and status</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Layers className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Filter issues</p>
                      <p>Use category and priority filters</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Navigation className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Find location</p>
                      <p>Center map on your position</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CitizenLayout>
    </RequireUser>
  )
}