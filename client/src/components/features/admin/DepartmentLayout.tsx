'use client'

import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'

interface DepartmentLayoutProps {
  children: ReactNode
  title: string
  description: string
  icon?: ReactNode
  backHref?: string
  badge?: string
  actions?: ReactNode
}

export function DepartmentLayout({
  children,
  title,
  description,
  icon = <Building2 className="h-8 w-8 text-white" />,
  backHref,
  badge,
  actions
}: DepartmentLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {backHref && (
                <Link href={backHref}>
                  <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
              )}
              <div className="p-3 bg-blue-600 rounded-xl">
                {icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{title}</h1>
                <p className="text-blue-200">{description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {badge && (
                <Badge variant="secondary" className="bg-orange-600 text-white px-4 py-2">
                  {badge}
                </Badge>
              )}
              {actions}
            </div>
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}

interface DepartmentStatsGridProps {
  stats: Array<{
    label: string
    value: string | number
    description?: string
    icon: ReactNode
    color: string
  }>
}

export function DepartmentStatsGrid({ stats }: DepartmentStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                {stat.description && (
                  <p className={`text-xs ${stat.color}`}>{stat.description}</p>
                )}
              </div>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

interface DepartmentCardProps {
  children: ReactNode
  title?: string
  description?: string
  className?: string
}

export function DepartmentCard({ 
  children, 
  title, 
  description, 
  className = "" 
}: DepartmentCardProps) {
  return (
    <Card className={`bg-white/10 backdrop-blur-lg border-white/20 ${className}`}>
      {(title || description) && (
        <div className="p-6 pb-0">
          {title && <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>}
          {description && <p className="text-blue-200 text-sm">{description}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </Card>
  )
}