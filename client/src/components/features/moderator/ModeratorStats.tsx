/**
 * ModeratorStats - Display real-time moderator statistics
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, Flag, TrendingUp, AlertCircle } from 'lucide-react'
import { useModeratorStats } from '@/hooks/api/useModeratorStats'
import { Skeleton } from '@/components/ui/skeleton'

export function ModeratorStats() {
  const { stats, loading } = useModeratorStats()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Pending Review',
      value: stats.pendingReviews,
      icon: AlertTriangle,
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-300',
      description: 'Awaiting moderation',
      urgent: stats.pendingReviews > 10
    },
    {
      title: 'Reviewed Today',
      value: stats.reviewedToday,
      icon: CheckCircle,
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-300',
      description: 'Completed reviews'
    },
    {
      title: 'Flagged Content',
      value: stats.flaggedContent,
      icon: Flag,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-300',
      description: 'Requires attention'
    },
    {
      title: 'Approval Rate',
      value: `${stats.approvalRate}%`,
      icon: TrendingUp,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-300',
      description: 'Quality metric'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card 
            key={index}
            className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-orange-200 text-sm font-medium mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-white mb-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-orange-300 flex items-center gap-1">
                    {stat.urgent && <AlertCircle className="h-3 w-3" />}
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 ${stat.iconBg} rounded-lg`}>
                  <Icon className={`h-8 w-8 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}