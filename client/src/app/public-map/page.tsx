'use client'
import AnimatedHeading from '@/components/ui/AnimatedHeading'

import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MapPin, 
  Search, 
  Filter,
  Home,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  RotateCcw,
  Info,
  Navigation
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Dynamic import for the map component
const LeafletMap = dynamic(() => import('@/components/features/citizen/LeafletMap'), { ssr: false })

interface PublicIssue {
  id: string
  title: string
  category: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'
  location: {
    latitude: number
    longitude: number
    address: string
    ward: string
  }
  createdAt: string
  description: string
  upvotes: number
  viewCount: number
}

interface MarkerData {
  id: string
  name: string
  position: [number, number]
  priority: string
  category: string
  status: string
}

interface MapFilters {
  category: string
  priority: string
  status: string
  ward: string
  timeRange: string
}

interface CityInfo {
  name: string
  population: number
  area: number
  wards: number
  mayorName: string
  establishedYear: number
}

export default function PublicMapPage() {
  const [issues, setIssues] = useState<PublicIssue[]>([])
  const [cityInfo, setCityInfo] = useState<CityInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [center, setCenter] = useState<[number, number]>([28.6139, 77.209])
  const [filters, setFilters] = useState<MapFilters>({
    category: 'all',
    priority: 'all',
    status: 'all',
    ward: 'all',
    timeRange: 'all'
  })
  const [searchLocation, setSearchLocation] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    const loadPublicMapData = async () => {
      try {
        // Load public issues data
        const issuesResponse = await fetch('/api/public/issues/map')
        if (issuesResponse.ok) {
          const issuesData = await issuesResponse.json()
          setIssues(issuesData.issues || [])
        }

        // Load city information
        const cityResponse = await fetch('/api/public/city-info')
        if (cityResponse.ok) {
          const cityData = await cityResponse.json()
          setCityInfo(cityData.city)
        }
      } catch (error) {
        console.error('Error loading public map data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load map data',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadPublicMapData()
  }, [toast])

  // Get current location
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude])
        },
        (_error) => {
          console.log('Location access denied or failed')
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    }
  }, [])

  // Filter issues based on current filters
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesCategory = filters.category === 'all' || issue.category === filters.category
      const matchesPriority = filters.priority === 'all' || issue.priority === filters.priority
      const matchesStatus = filters.status === 'all' || issue.status === filters.status
      const matchesWard = filters.ward === 'all' || issue.location.ward === filters.ward
      
      let matchesTimeRange = true
      if (filters.timeRange !== 'all') {
        const issueDate = new Date(issue.createdAt)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (filters.timeRange) {
          case 'week':
            matchesTimeRange = daysDiff <= 7
            break
          case 'month':
            matchesTimeRange = daysDiff <= 30
            break
          case 'quarter':
            matchesTimeRange = daysDiff <= 90
            break
        }
      }

      const matchesSearch = searchLocation === '' || 
        issue.location.address.toLowerCase().includes(searchLocation.toLowerCase()) ||
        issue.title.toLowerCase().includes(searchLocation.toLowerCase())

      return matchesCategory && matchesPriority && matchesStatus && matchesWard && matchesTimeRange && matchesSearch
    })
  }, [issues, filters, searchLocation])

  // Convert issues to markers for the map
  const markers: MarkerData[] = useMemo(() => {
    return filteredIssues.map(issue => ({
      id: issue.id,
      name: issue.title,
      position: [issue.location.latitude, issue.location.longitude],
      priority: issue.priority.toLowerCase(),
      category: issue.category,
      status: issue.status
    }))
  }, [filteredIssues])

  // Get unique values for filters
  const categories = useMemo(() => [...new Set(issues.map(issue => issue.category))], [issues])
  const wards = useMemo(() => [...new Set(issues.map(issue => issue.location.ward))], [issues])

  // Statistics
  const stats = useMemo(() => {
    const total = filteredIssues.length
    const completed = filteredIssues.filter(i => i.status === 'COMPLETED').length
    const inProgress = filteredIssues.filter(i => i.status === 'IN_PROGRESS').length
    const pending = filteredIssues.filter(i => i.status === 'PENDING').length
    
    return { total, completed, inProgress, pending }
  }, [filteredIssues])

  const handleFilterChange = (key: keyof MapFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      priority: 'all',
      status: 'all',
      ward: 'all',
      timeRange: 'all'
    })
    setSearchLocation('')
  }

  const centerOnMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude])
          toast({
            title: 'Location Found',
            description: 'Map centered on your location'
          })
        },
        () => {
          toast({
            title: 'Location Error',
            description: 'Could not access your location',
            variant: 'destructive'
          })
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900">Loading Public Map...</h2>
          <p className="text-slate-600">Please wait while we load the city data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-emerald-600" />
              <div>
                <AnimatedHeading as="h1" className="text-2xl font-bold text-slate-900">
                  {cityInfo?.name || 'Nayibareilly'} Public Map
                </AnimatedHeading>
                <p className="text-sm text-slate-600">
                  View civic issues and city information - No login required
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">
                {stats.total} Issues
              </Badge>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button size="sm" onClick={() => window.location.href = '/report'}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* City Info */}
            {cityInfo && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    City Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Population:</span>
                    <span className="font-semibold">{cityInfo.population.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Area:</span>
                    <span className="font-semibold">{cityInfo.area} km²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wards:</span>
                    <span className="font-semibold">{cityInfo.wards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mayor:</span>
                    <span className="font-semibold">{cityInfo.mayorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Established:</span>
                    <span className="font-semibold">{cityInfo.establishedYear}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Issue Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-emerald-50 rounded">
                    <div className="text-lg font-bold text-emerald-600">{stats.total}</div>
                    <div className="text-xs text-blue-800">Total</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                    <div className="text-xs text-green-800">Completed</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="text-lg font-bold text-yellow-600">{stats.inProgress}</div>
                    <div className="text-xs text-yellow-800">In Progress</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-lg font-bold text-red-600">{stats.pending}</div>
                    <div className="text-xs text-red-800">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search and Location */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search location or issue..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={centerOnMyLocation} className="w-full" variant="outline">
                  <Navigation className="h-4 w-4 mr-2" />
                  Center on My Location
                </Button>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="HIGH">High Priority</SelectItem>
                    <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                    <SelectItem value="LOW">Low Priority</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.ward} onValueChange={(value) => handleFilterChange('ward', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Wards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Wards</SelectItem>
                    {wards.map(ward => (
                      <SelectItem key={ward} value={ward}>Ward {ward}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.timeRange} onValueChange={(value) => handleFilterChange('timeRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={clearAllFilters} variant="outline" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Map Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>High Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Medium Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Low Priority</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-orange-600" />
                    <span>Pending</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-emerald-500 to-slate-800 text-white">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold mb-2">See an Issue?</h3>
                <p className="text-sm mb-3 opacity-90">
                  Help make your city better by reporting issues you notice.
                </p>
                <Button 
                  onClick={() => window.location.href = '/report'} 
                  className="bg-white text-emerald-600 hover:bg-slate-100 w-full"
                >
                  Report an Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div className="w-full h-full">
            <LeafletMap 
              center={center} 
              markers={markers} 
              cluster 
              zoom={12} 
            />
          </div>
          
          {/* Map Overlay Info */}
          <div className="absolute top-4 right-4 space-y-2">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Eye className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">{stats.total} issues visible</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="text-center text-sm">
                  <p className="font-medium text-slate-900 mb-1">Public City Map</p>
                  <p className="text-slate-600">
                    Click on markers to view issue details • Use filters to narrow results • 
                    <span className="text-emerald-600 cursor-pointer hover:underline ml-1"
                          onClick={() => window.location.href = '/login'}>
                      Login for full features
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}