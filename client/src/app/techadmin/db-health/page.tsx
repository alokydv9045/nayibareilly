'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { 
  Database, ShieldAlert, ArrowLeft, RefreshCw, Archive, Settings2, Trash, HardDrive, AlertTriangle, Layers
} from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api/client'

interface DbStats {
  dbSize: string
  policyYears: number
  counts: {
    issues: number
    archivedIssues: number
    users: number
    activityLogs: number
    webhooks: number
    apiKeys: number
  }
  archiveCandidates: number
}

export default function DbHealthPage() {
  const [stats, setStats] = useState<DbStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isArchiving, setIsArchiving] = useState(false)
  const [policyYearsInput, setPolicyYearsInput] = useState('2')

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/techadmin/db-health')
      const data = res.data?.data || res.data
      setStats(data)
      setPolicyYearsInput(String(data.policyYears || '2'))
    } catch (err) {
      toast.error('Failed to load database health statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async () => {
    const years = parseInt(policyYearsInput, 10)
    if (isNaN(years) || years < 1) {
      toast.error('Please enter a valid retention period (minimum 1 year)')
      return
    }

    if (!confirm(`Warning: You are about to move all resolved/closed tickets older than ${years} years to cold storage. This deletes them from the active database. Proceed?`)) return

    setIsArchiving(true)
    try {
      const res = await api.post('/admin/techadmin/db-health/archive', { years })
      toast.success(res.data?.message || 'Database archiving completed')
      fetchStats()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Archiving failed')
    } finally {
      setIsArchiving(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Topbar */}
      <header className="sticky top-16 lg:top-0 z-40 bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/techadmin">
            <Button variant="outline" className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shrink-0 h-9 w-9 p-0 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="p-2 bg-orange-50 rounded-lg hidden sm:block">
            <Database className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              Database Health & Archiving
              <Badge variant="outline" className="text-xs bg-gray-50 hidden sm:flex">TechAdmin</Badge>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Monitor database metrics and configure data retention</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button onClick={fetchStats} variant="outline" className="bg-white border-gray-200 w-full sm:w-auto" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">

      {loading && !stats ? (
        <div className="text-center py-20 text-gray-600">Loading database statistics...</div>
      ) : !stats ? (
        <div className="text-center py-20 text-gray-600">No stats available</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DB Health Summary Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-900 flex items-center text-sm font-medium gap-2">
                    <HardDrive className="h-4 w-4 text-orange-600" /> Database size
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">{stats.dbSize}</p>
                  <p className="text-xs text-emerald-600 mt-1">Supabase DB Tier</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-900 flex items-center text-sm font-medium gap-2">
                    <Layers className="h-4 w-4 text-indigo-600" /> Production Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">{stats.counts.issues}</p>
                  <p className="text-xs text-gray-600 mt-1">Active ticket records</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-900 flex items-center text-sm font-medium gap-2">
                    <Archive className="h-4 w-4 text-emerald-600" /> Cold Storage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">{stats.counts.archivedIssues}</p>
                  <p className="text-xs text-emerald-600 mt-1">Archived ticket records</p>
                </CardContent>
              </Card>
            </div>

            {/* Table Details */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 text-base">Active Table Statistics</CardTitle>
                <CardDescription className="text-gray-600">Physical row counts in the Nagarseu database schemas.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-amber-100/60">
                  {[
                    { name: 'users', label: 'User Profiles', count: stats.counts.users },
                    { name: 'issues', label: 'Citizens Issues/Reports', count: stats.counts.issues },
                    { name: 'archived_issues', label: 'Cold Storage Archive', count: stats.counts.archivedIssues },
                    { name: 'activity_logs', label: 'Audit Log & Activity Trails', count: stats.counts.activityLogs },
                    { name: 'webhook_configs', label: 'Webhooks Configs', count: stats.counts.webhooks },
                    { name: 'api_keys', label: 'Civic Portal API Keys', count: stats.counts.apiKeys },
                  ].map((table) => (
                    <div key={table.name} className="py-3 flex justify-between items-center text-sm">
                      <div className="font-mono text-amber-900 font-medium">{table.name}</div>
                      <div className="text-slate-500">{table.label}</div>
                      <div className="font-bold text-gray-900">{table.count.toLocaleString()} rows</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Retention Policy settings */}
          <Card className="bg-white border border-gray-200 lg:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
                <Settings2 className="h-5 w-5 text-indigo-600" /> Retention & Cleanup
              </CardTitle>
              <CardDescription className="text-gray-600">Configure auto-archiving policies for closed issues.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-900 block">Archive closed tickets older than (years):</label>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    min="1"
                    value={policyYearsInput}
                    onChange={e => setPolicyYearsInput(e.target.value)}
                    className="bg-white border-gray-200 text-gray-900 font-bold"
                  />
                  <span className="self-center text-sm font-medium">Years</span>
                </div>
                <p className="text-[11px] text-gray-600 pt-1">
                  Moving older resolved tickets to a cold storage DB keeps the main table lightweight, ensuring fast listings and queries.
                </p>
              </div>

              <div className="bg-amber-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-900">Candidate Tickets:</span>
                  <Badge className="bg-amber-500/20 text-amber-600 border border-gray-200 text-xs font-bold">
                    {stats.archiveCandidates} tickets
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">
                  These tickets are resolved, closed, or spam, and are older than the configured threshold.
                </p>
              </div>

              <Button 
                onClick={handleArchive} 
                disabled={isArchiving || stats.archiveCandidates === 0}
                className="w-full bg-orange-600 text-gray-900 hover:bg-orange-700 font-semibold flex justify-center gap-2"
              >
                <Archive className="h-4 w-4" />
                {isArchiving ? 'Archiving Database...' : 'Run Archiving Now'}
              </Button>

              {stats.archiveCandidates === 0 && (
                <div className="text-center text-xs text-emerald-600 font-medium">
                  ✓ Database is lightweight and fully optimized.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  )
}

