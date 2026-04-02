'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Monitor, Smartphone, Tablet, Globe, Shield, AlertTriangle } from 'lucide-react'
import apiClient from '@/lib/api/endpoints'

// Simple toast replacement
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  console.log(`${type.toUpperCase()}: ${message}`)
  alert(`${type.toUpperCase()}: ${message}`)
}

interface Session {
  id: number
  createdAt: string
  expiresAt: string
  lastUsed: string | null
  userAgent: string | null
  ipAddress: string | null
  isCurrent: boolean
}

interface SessionStats {
  activeSessions: number
  revokedSessions: number
  totalSessions: number
}

export function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<SessionStats>({ activeSessions: 0, revokedSessions: 0, totalSessions: 0 })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadSessions = async () => {
    try {
      setLoading(true)
      const [sessionsResponse, statsResponse] = await Promise.all([
        apiClient.get('/api/v1/sessions'),
        apiClient.get('/api/v1/sessions/stats')
      ])
      
      if (sessionsResponse.success) {
        setSessions(sessionsResponse.data.sessions || [])
      }
      
      if (statsResponse.success) {
        setStats(statsResponse.data.stats || { activeSessions: 0, revokedSessions: 0, totalSessions: 0 })
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
      showToast('Failed to load session information', 'error')
    } finally {
      setLoading(false)
    }
  }

  const revokeSession = async (sessionId: number) => {
    try {
      setActionLoading(`revoke-${sessionId}`)
      const response = await apiClient.delete(`/api/v1/sessions/${sessionId}`)
      
      if (response.success) {
        showToast('Session revoked successfully')
        await loadSessions()
      }
    } catch (error) {
      console.error('Failed to revoke session:', error)
      showToast('Failed to revoke session', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const revokeAllOtherSessions = async () => {
    try {
      setActionLoading('revoke-others')
      const response = await apiClient.post('/api/v1/sessions/revoke-others')
      
      if (response.success) {
        showToast(`${response.data.revokedCount} other sessions revoked`)
        await loadSessions()
      }
    } catch (error) {
      console.error('Failed to revoke other sessions:', error)
      showToast('Failed to revoke other sessions', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const forceLogoutAllDevices = async () => {
    try {
      setActionLoading('force-logout')
      const response = await apiClient.post('/api/v1/sessions/revoke-all')
      
      if (response.success) {
        showToast(`Force logout successful. ${response.data.revokedCount} sessions revoked.`)
        
        // Redirect to login as user is now logged out
        window.location.href = '/login?reason=force_logout'
      }
    } catch (error) {
      console.error('Failed to force logout:', error)
      showToast('Failed to force logout from all devices', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Globe className="h-4 w-4" />
    
    const ua = userAgent.toLowerCase()
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-4 w-4" />
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  const getDeviceDescription = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown Device'
    
    const ua = userAgent.toLowerCase()
    if (ua.includes('chrome')) return 'Chrome Browser'
    if (ua.includes('firefox')) return 'Firefox Browser'
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari Browser'
    if (ua.includes('edge')) return 'Edge Browser'
    return 'Unknown Browser'
  }

  useEffect(() => {
    loadSessions()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Session Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.activeSessions}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalSessions}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revoked Sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">
              {stats.revokedSessions}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Actions
          </CardTitle>
          <CardDescription>
            Manage your active sessions and enhance account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            onClick={revokeAllOtherSessions}
            disabled={!!actionLoading || stats.activeSessions <= 1}
            className="w-full sm:w-auto"
          >
            {actionLoading === 'revoke-others' ? 'Revoking...' : 'Revoke Other Sessions'}
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={forceLogoutAllDevices}
            disabled={!!actionLoading}
            className="w-full sm:w-auto ml-0 sm:ml-2"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {actionLoading === 'force-logout' ? 'Logging Out...' : 'Force Logout All Devices'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Your currently active login sessions across different devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active sessions found
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getDeviceIcon(session.userAgent)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {getDeviceDescription(session.userAgent)}
                        </span>
                        {session.isCurrent && (
                          <Badge variant="default" className="text-xs">
                            Current Session
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>IP Address: {session.ipAddress || 'Unknown'}</div>
                        <div>
                          Created: {format(new Date(session.createdAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                        {session.lastUsed && (
                          <div>
                            Last Used: {format(new Date(session.lastUsed), 'MMM dd, yyyy HH:mm')}
                          </div>
                        )}
                        <div>
                          Expires: {format(new Date(session.expiresAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!session.isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revokeSession(session.id)}
                      disabled={actionLoading === `revoke-${session.id}`}
                    >
                      {actionLoading === `revoke-${session.id}` ? 'Revoking...' : 'Revoke'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}