'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Search, 
  Download,
  RefreshCw,
  Activity,
  AlertTriangle,
  CheckCircle,
  FileText,
  Eye,
  Database,
  Lock,
  Key,
  UserCheck,
  Settings
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userEmail: string
  userRole: string
  action: string
  resource: string
  resourceId?: string
  details: string
  ipAddress: string
  userAgent: string
  outcome: 'SUCCESS' | 'FAILURE' | 'WARNING'
  metadata?: Record<string, string | number | boolean>
  cityContext?: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

interface SecurityEvent {
  id: string
  type: 'LOGIN_ATTEMPT' | 'PASSWORD_CHANGE' | 'PERMISSION_ESCALATION' | 'DATA_ACCESS' | 'SYSTEM_BREACH' | 'SUSPICIOUS_ACTIVITY'
  timestamp: string
  userId?: string
  userEmail?: string
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING'
  ipAddress: string
  location?: string
  resolved?: boolean
  resolvedBy?: string
  resolvedAt?: string
}

interface SystemActivity {
  id: string
  timestamp: string
  component: string
  operation: string
  status: 'SUCCESS' | 'ERROR' | 'WARNING'
  duration: number
  details: string
  affectedRecords?: number
  errorCode?: string
  stackTrace?: string
}

interface ComplianceReport {
  dataRetention: {
    compliant: boolean
    daysRetained: number
    requiredDays: number
    lastCleanup: string
  }
  accessControl: {
    compliant: boolean
    weakPasswords: number
    unusedAccounts: number
    excessivePermissions: number
  }
  encryption: {
    compliant: boolean
    unencryptedData: number
    certificateExpiry: string
  }
  backup: {
    compliant: boolean
    lastBackup: string
    backupSize: string
    recoveryTested: boolean
  }
}

export default function SuperAdminAuditPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [systemActivity, setSystemActivity] = useState<SystemActivity[]>([])
  const [compliance, setCompliance] = useState<ComplianceReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [timeRange, setTimeRange] = useState('week')
  const [activeTab, setActiveTab] = useState('audit')
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [auditRes, securityRes, systemRes, complianceRes] = await Promise.all([
          fetch(`/api/superadmin/audit/logs?range=${timeRange}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          fetch(`/api/superadmin/audit/security?range=${timeRange}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          fetch(`/api/superadmin/audit/system?range=${timeRange}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          fetch('/api/superadmin/audit/compliance', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
        ])

        if (auditRes.ok) {
          const auditData = await auditRes.json()
          setAuditLogs(auditData.logs)
        }

        if (securityRes.ok) {
          const securityData = await securityRes.json()
          setSecurityEvents(securityData.events)
        }

        if (systemRes.ok) {
          const systemData = await systemRes.json()
          setSystemActivity(systemData.activities)
        }

        if (complianceRes.ok) {
          const complianceData = await complianceRes.json()
          setCompliance(complianceData.report)
        }
      } catch (error) {
        console.error('Error fetching audit data:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch audit data',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }
    loadData()
  }, [timeRange, toast])

  const refreshData = async () => {
    setRefreshing(true)
    window.location.reload()
  }

  const exportAuditReport = async () => {
    try {
      const response = await fetch(`/api/superadmin/audit/export?range=${timeRange}&tab=${activeTab}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-report-${activeTab}-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast({
          title: 'Success',
          description: 'Audit report exported successfully'
        })
      }
    } catch (error) {
      console.error('Error exporting audit report:', error)
      toast({
        title: 'Error',
        description: 'Failed to export audit report',
        variant: 'destructive'
      })
    }
  }

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter)
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter
    return matchesSearch && matchesAction && matchesSeverity
  })

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'SUCCESS': return 'bg-green-100 text-green-800'
      case 'FAILURE': return 'bg-red-100 text-red-800'
      case 'WARNING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600 text-white'
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return <Key className="h-4 w-4" />
    if (action.includes('CREATE') || action.includes('ADD')) return <CheckCircle className="h-4 w-4" />
    if (action.includes('DELETE') || action.includes('REMOVE')) return <AlertTriangle className="h-4 w-4" />
    if (action.includes('UPDATE') || action.includes('EDIT')) return <Settings className="h-4 w-4" />
    if (action.includes('VIEW') || action.includes('READ')) return <Eye className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getComplianceIcon = (compliant: boolean) => {
    return compliant ? <CheckCircle className="h-5 w-5 text-green-600" /> : <AlertTriangle className="h-5 w-5 text-red-600" />
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">System Audit & Security</h1>
          <Badge variant="outline" className="text-lg px-3 py-1">
            SuperAdmin
          </Badge>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAuditReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="system">System Activity</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search audit logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="LOGIN">Login Actions</SelectItem>
                    <SelectItem value="CREATE">Create Actions</SelectItem>
                    <SelectItem value="UPDATE">Update Actions</SelectItem>
                    <SelectItem value="DELETE">Delete Actions</SelectItem>
                    <SelectItem value="VIEW">View Actions</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setActionFilter('all')
                    setSeverityFilter('all')
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs List */}
          <div className="space-y-3">
            {filteredAuditLogs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Audit Logs Found</h3>
                  <p className="text-gray-600">No audit logs match your current filters.</p>
                </CardContent>
              </Card>
            ) : (
              filteredAuditLogs.map((log) => (
                <Card key={log.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{log.action}</span>
                            <Badge className={getOutcomeColor(log.outcome)}>
                              {log.outcome}
                            </Badge>
                            <Badge className={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">{log.userEmail}</span> ({log.userRole})
                            {log.cityContext && <span> • {log.cityContext}</span>}
                          </div>
                          <div className="text-sm mb-2">
                            <span className="font-medium">Resource:</span> {log.resource}
                            {log.resourceId && <span> (ID: {log.resourceId})</span>}
                          </div>
                          <p className="text-sm text-gray-700">{log.details}</p>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs text-blue-600 cursor-pointer">View Metadata</summary>
                              <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500 ml-4">
                        <div>{new Date(log.timestamp).toLocaleString()}</div>
                        <div className="mt-1">IP: {log.ipAddress}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="space-y-4">
            {securityEvents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Security Events</h3>
                  <p className="text-gray-600">No security events found for the selected time range.</p>
                </CardContent>
              </Card>
            ) : (
              securityEvents.map((event) => (
                <Card key={event.id} className={`border-l-4 ${
                  event.severity === 'CRITICAL' ? 'border-red-500' :
                  event.severity === 'HIGH' ? 'border-orange-500' :
                  event.severity === 'MEDIUM' ? 'border-yellow-500' : 'border-green-500'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{event.type.replace('_', ' ')}</span>
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <Badge variant={event.status === 'RESOLVED' ? 'default' : event.status === 'INVESTIGATING' ? 'secondary' : 'destructive'}>
                            {event.status}
                          </Badge>
                        </div>
                        {event.userEmail && (
                          <div className="text-sm text-gray-600 mb-2">
                            User: {event.userEmail}
                          </div>
                        )}
                        <p className="text-sm mb-2">{event.description}</p>
                        <div className="text-xs text-gray-500">
                          IP: {event.ipAddress}
                          {event.location && <span> • Location: {event.location}</span>}
                        </div>
                        {event.resolved && event.resolvedBy && (
                          <div className="text-xs text-green-600 mt-2">
                            Resolved by {event.resolvedBy} on {new Date(event.resolvedAt!).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <div className="space-y-3">
            {systemActivity.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No System Activity</h3>
                  <p className="text-gray-600">No system activity found for the selected time range.</p>
                </CardContent>
              </Card>
            ) : (
              systemActivity.map((activity) => (
                <Card key={activity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{activity.component}</span>
                          <Badge className={getOutcomeColor(activity.status)}>
                            {activity.status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {activity.duration}ms
                          </span>
                        </div>
                        <div className="text-sm mb-2">
                          <span className="font-medium">Operation:</span> {activity.operation}
                        </div>
                        <p className="text-sm text-gray-700">{activity.details}</p>
                        {activity.affectedRecords && (
                          <div className="text-sm text-gray-600 mt-1">
                            Affected records: {activity.affectedRecords}
                          </div>
                        )}
                        {activity.errorCode && (
                          <div className="text-sm text-red-600 mt-1">
                            Error Code: {activity.errorCode}
                          </div>
                        )}
                        {activity.stackTrace && (
                          <details className="mt-2">
                            <summary className="text-xs text-red-600 cursor-pointer">View Stack Trace</summary>
                            <pre className="text-xs bg-red-50 p-2 rounded mt-1 overflow-x-auto">
                              {activity.stackTrace}
                            </pre>
                          </details>
                        )}
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          {compliance ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getComplianceIcon(compliance.dataRetention.compliant)}
                    Data Retention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Status</span>
                      <Badge className={compliance.dataRetention.compliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {compliance.dataRetention.compliant ? 'Compliant' : 'Non-Compliant'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Days Retained</span>
                      <span>{compliance.dataRetention.daysRetained}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Required Days</span>
                      <span>{compliance.dataRetention.requiredDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Cleanup</span>
                      <span>{new Date(compliance.dataRetention.lastCleanup).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getComplianceIcon(compliance.accessControl.compliant)}
                    Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Status</span>
                      <Badge className={compliance.accessControl.compliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {compliance.accessControl.compliant ? 'Compliant' : 'Non-Compliant'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Weak Passwords</span>
                      <span className={compliance.accessControl.weakPasswords > 0 ? 'text-red-600' : 'text-green-600'}>
                        {compliance.accessControl.weakPasswords}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unused Accounts</span>
                      <span className={compliance.accessControl.unusedAccounts > 0 ? 'text-yellow-600' : 'text-green-600'}>
                        {compliance.accessControl.unusedAccounts}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Excessive Permissions</span>
                      <span className={compliance.accessControl.excessivePermissions > 0 ? 'text-red-600' : 'text-green-600'}>
                        {compliance.accessControl.excessivePermissions}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getComplianceIcon(compliance.encryption.compliant)}
                    Data Encryption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Status</span>
                      <Badge className={compliance.encryption.compliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {compliance.encryption.compliant ? 'Compliant' : 'Non-Compliant'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Unencrypted Data</span>
                      <span className={compliance.encryption.unencryptedData > 0 ? 'text-red-600' : 'text-green-600'}>
                        {compliance.encryption.unencryptedData} records
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Certificate Expiry</span>
                      <span>{new Date(compliance.encryption.certificateExpiry).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getComplianceIcon(compliance.backup.compliant)}
                    Backup & Recovery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Status</span>
                      <Badge className={compliance.backup.compliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {compliance.backup.compliant ? 'Compliant' : 'Non-Compliant'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Backup</span>
                      <span>{new Date(compliance.backup.lastBackup).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Backup Size</span>
                      <span>{compliance.backup.backupSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recovery Tested</span>
                      <span className={compliance.backup.recoveryTested ? 'text-green-600' : 'text-red-600'}>
                        {compliance.backup.recoveryTested ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Compliance Data</h3>
                <p className="text-gray-600">Unable to load compliance information.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}