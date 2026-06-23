'use client'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, FileText, TrendingUp, Activity, 
  Globe, Mail, Phone, MapPin 
} from 'lucide-react'
import { useAdminFooterRealtimeUpdates } from '@/hooks/features/useRealtimeCacheInvalidation'
import { config } from '@/lib/constants/config'
import { tokenStorage, userStorage } from '@/lib/auth/auth-utils'

interface AdminFooterProps {
  className?: string
}

interface SystemStats {
  totalUsers: number
  totalIssues: number
  resolvedIssues: number
  pendingIssues: number
  lastUpdated: string
}

const fetchSystemStats = async (): Promise<SystemStats> => {
  const token = tokenStorage.get()
  const apiRoot = config.api.fullUrl.replace(/\/$/, '')
  
  const response = await fetch(`${apiRoot}/admin/system-stats`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch system stats')
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch system stats')
  }

  return data.data
}

// Check if user has access to system stats (dept_admin, mayor, tech_admin)
const hasSystemStatsAccess = () => {
  const user = userStorage.get()
  if (!user?.roles || !Array.isArray(user.roles)) return false
  const allowedRoles = ['dept_admin', 'mayor', 'tech_admin']
  return user.roles.some(role => allowedRoles.includes(role))
}

interface AdminFooterProps {
  className?: string
}

export function AdminFooter({ className = '' }: AdminFooterProps) {
  const hasAccess = hasSystemStatsAccess()
  
  // Use React Query for real-time cache invalidation - only fetch if user has access
  const { data: stats, isLoading: _isLoading, error: _error } = useQuery({
    queryKey: ['admin', 'system-stats'],
    queryFn: fetchSystemStats,
    enabled: hasAccess, // Only run query if user has access
    refetchInterval: hasAccess ? 30000 : false, // Fallback polling every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    refetchOnWindowFocus: hasAccess
  })

  // Set up real-time cache invalidation
  useAdminFooterRealtimeUpdates()

  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    // Update timestamp when data changes
    if (stats?.lastUpdated) {
      setLastUpdated(new Date(stats.lastUpdated).toLocaleTimeString())
    }
  }, [stats?.lastUpdated])

  // Fallback stats for loading or error states
  const displayStats = stats || {
    totalUsers: 0,
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0
  }

  // Avoid server/client mismatch by computing year on client only
  const [currentYear, setCurrentYear] = useState<string>('')
  useEffect(() => {
    setCurrentYear(String(new Date().getFullYear()))
  }, [])

  return (
    <footer className={`bg-gray-50 border-t border-gray-200 mt-auto ${className}`}>
      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-none border-none">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Total Users</p>
                    <p className="text-lg font-semibold text-gray-900">{displayStats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-none">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Total Issues</p>
                    <p className="text-lg font-semibold text-gray-900">{displayStats.totalIssues}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-none">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Resolved</p>
                    <p className="text-lg font-semibold text-gray-900">{displayStats.resolvedIssues}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-none">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="text-lg font-semibold text-gray-900">{displayStats.pendingIssues}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              About NayiBareilly
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Digital platform for efficient urban governance and citizen engagement.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <span>nayibareilly.gov.in</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/users" className="text-sm text-gray-600 hover:text-blue-600">
                  User Management
                </a>
              </li>
              <li>
                <a href="/issues" className="text-sm text-gray-600 hover:text-blue-600">
                  Issue Management
                </a>
              </li>
              <li>
                <a href="/techadmin/logs" className="text-sm text-gray-600 hover:text-blue-600">
                  System Logs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Contact
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>admin@nayibareilly.gov.in</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>1800-123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Government Complex, City</span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              System Status
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">All Systems Operational</span>
              </div>
              <p className="text-xs text-gray-500" suppressHydrationWarning>
                Last updated: {lastUpdated || 'â€”'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              <span suppressHydrationWarning>{currentYear ? `Â© ${currentYear} ` : ''}</span>
              NayiBareilly. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}