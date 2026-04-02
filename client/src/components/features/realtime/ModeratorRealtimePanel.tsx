"use client"

import { useEffect, useState } from 'react'
import socketService from '@/lib/services/socket-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, AlertTriangle, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'

interface RealtimeNotification {
  id: string
  type: 'new_issue' | 'escalation' | 'update' | 'assignment'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  read: boolean
}

interface LiveStats {
  pendingReview: number
  reviewedToday: number
  avgReviewTime: number
  accuracyRate: number
}

interface SocketEventData {
  title?: string
  priority?: string
  status?: string
  reason?: string
  moderatorStats?: Partial<LiveStats>
}

export function ModeratorRealtimePanel() {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [liveStats, setLiveStats] = useState<LiveStats>({
    pendingReview: 0,
    reviewedToday: 0,
    avgReviewTime: 0,
    accuracyRate: 0
  })
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Socket connection status
    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    socketService.on('connect', handleConnect)
    socketService.on('disconnect', handleDisconnect)

    // Real-time issue notifications
    const handleNewIssue = (data: SocketEventData) => {
      const notification: RealtimeNotification = {
        id: `new-${Date.now()}`,
        type: 'new_issue',
        title: 'New Issue Reported',
        message: data.title || 'New citizen report requires review',
        priority: (data.priority?.toLowerCase() || 'medium') as 'low' | 'medium' | 'high' | 'critical',
        timestamp: new Date().toISOString(),
        read: false
      }
      setNotifications(prev => [notification, ...prev].slice(0, 20))
      setLiveStats(prev => ({ ...prev, pendingReview: prev.pendingReview + 1 }))
      
      // Play notification sound for high priority
      if (data.priority === 'HIGH' || data.priority === 'CRITICAL') {
        playNotificationSound()
      }
    }

    const handleIssueUpdate = (data: SocketEventData) => {
      if (data.status === 'TRIAGED' || data.status === 'APPROVED') {
        setLiveStats(prev => ({
          ...prev,
          pendingReview: Math.max(0, prev.pendingReview - 1),
          reviewedToday: prev.reviewedToday + 1
        }))
      }
    }

    const handleEscalation = (data: SocketEventData) => {
      const notification: RealtimeNotification = {
        id: `escalation-${Date.now()}`,
        type: 'escalation',
        title: 'Issue Escalated',
        message: data.reason || 'An issue has been escalated for review',
        priority: 'high',
        timestamp: new Date().toISOString(),
        read: false
      }
      setNotifications(prev => [notification, ...prev].slice(0, 20))
      playNotificationSound()
    }

    const handleStatsUpdate = (data: SocketEventData) => {
      if (data.moderatorStats) {
        setLiveStats(prev => ({
          ...prev,
          ...data.moderatorStats
        }))
      }
    }

    // Register socket listeners
    socketService.on('issue:new', handleNewIssue)
    socketService.on('issue:update', handleIssueUpdate)
    socketService.on('issue:status', handleIssueUpdate)
    socketService.on('issue:escalated', handleEscalation)
    socketService.on('moderator:stats', handleStatsUpdate)

    // Cleanup
    return () => {
      socketService.off('connect', handleConnect)
      socketService.off('disconnect', handleDisconnect)
      socketService.off('issue:new', handleNewIssue as (data: unknown) => void)
      socketService.off('issue:update', handleIssueUpdate as (data: unknown) => void)
      socketService.off('issue:status', handleIssueUpdate as (data: unknown) => void)
      socketService.off('issue:escalated', handleEscalation as (data: unknown) => void)
      socketService.off('moderator:stats', handleStatsUpdate as (data: unknown) => void)
    }
  }, [])

  const playNotificationSound = () => {
    if (typeof window === 'undefined') return
    try {
      const AudioCtx = (window as Window & { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext || 
                       (window as Window & { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      
      const ctx = new AudioCtx()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.type = 'sine'
      oscillator.frequency.value = 800
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      
      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.5)
    } catch (error) {
      console.error('Failed to play notification sound:', error)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600'
      case 'high': return 'bg-orange-600'
      case 'medium': return 'bg-yellow-600'
      default: return 'bg-blue-600'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_issue': return <Bell className="h-4 w-4" />
      case 'escalation': return <AlertTriangle className="h-4 w-4" />
      case 'assignment': return <CheckCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
          )} />
          <span className="text-sm text-white/80">
            {isConnected ? 'Live Updates Active' : 'Disconnected'}
          </span>
        </div>
        {notifications.filter(n => !n.read).length > 0 && (
          <Badge className="bg-red-600">
            {notifications.filter(n => !n.read).length} unread
          </Badge>
        )}
      </div>

      {/* Live Stats Mini Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-200">Pending</p>
                <p className="text-xl font-bold text-white">{liveStats.pendingReview}</p>
              </div>
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-200">Today</p>
                <p className="text-xl font-bold text-white">{liveStats.reviewedToday}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-200">Avg Time</p>
                <p className="text-xl font-bold text-white">{liveStats.avgReviewTime}m</p>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-200">Accuracy</p>
                <p className="text-xl font-bold text-white">{liveStats.accuracyRate}%</p>
              </div>
              <Activity className="h-5 w-5 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-64 overflow-y-auto space-y-2">
          {notifications.length === 0 ? (
            <p className="text-center text-orange-200/60 text-sm py-8">
              No recent activity
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all hover:border-white/30",
                  notification.read
                    ? "bg-white/5 border-white/10"
                    : "bg-orange-500/10 border-orange-500/30"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 flex-1">
                    <div className={cn("p-1.5 rounded", getPriorityColor(notification.priority))}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      <p className="text-orange-200/80 text-xs mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-orange-200/60 text-xs mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}