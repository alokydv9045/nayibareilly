'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { 
  Zap, Plus, Trash2, Shield, Settings, Play, ArrowLeft, RefreshCw, AlertTriangle, Check
} from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api/client'

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  createdAt: string
}

export default function WebhookManagerPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [eventCreated, setEventCreated] = useState(true)
  const [eventStatusChanged, setEventStatusChanged] = useState(true)

  const fetchWebhooks = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/techadmin/webhooks')
      setWebhooks(res.data?.data || res.data || [])
    } catch (err) {
      toast.error('Failed to load webhooks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !url) {
      toast.error('Name and URL are required')
      return
    }

    const events = []
    if (eventCreated) events.push('issue.created')
    if (eventStatusChanged) events.push('issue.status_changed')

    setIsSubmitting(true)
    try {
      await api.post('/admin/techadmin/webhooks', { name, url, events })
      toast.success('Webhook created successfully')
      setName('')
      setUrl('')
      fetchWebhooks()
    } catch (err) {
      toast.error('Failed to create webhook')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (webhook: Webhook) => {
    try {
      await api.put(`/admin/techadmin/webhooks/${webhook.id}`, {
        isActive: !webhook.isActive
      })
      toast.success(`Webhook ${webhook.isActive ? 'deactivated' : 'activated'}`)
      fetchWebhooks()
    } catch (err) {
      toast.error('Failed to toggle webhook state')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook integration?')) return

    try {
      await api.delete(`/admin/techadmin/webhooks/${id}`)
      toast.success('Webhook deleted')
      fetchWebhooks()
    } catch (err) {
      toast.error('Failed to delete webhook')
    }
  }

  const handleTest = async (id: string) => {
    setTestingId(id)
    try {
      const res = await api.post(`/admin/techadmin/webhooks/${id}/test`)
      if (res.data?.success) {
        toast.success(`Test webhook delivered: status ${res.data.status}`)
      } else {
        toast.error(`Test failed: status ${res.data?.status || 'unknown'}`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to trigger test webhook')
    } finally {
      setTestingId(null)
    }
  }

  useEffect(() => {
    fetchWebhooks()
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
          <div className="p-2 bg-indigo-50 rounded-lg hidden sm:block">
            <Zap className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              Webhook & Integrations
              <Badge variant="outline" className="text-xs bg-gray-50 hidden sm:flex">TechAdmin</Badge>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Connect real-time ticket alerts to external systems</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button onClick={fetchWebhooks} variant="outline" className="bg-white border-gray-200 w-full sm:w-auto" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Webhook Config */}
        <Card className="bg-white border border-gray-200 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
              <Plus className="h-5 w-5 text-indigo-600" /> Add New Webhook
            </CardTitle>
            <CardDescription className="text-gray-600">Configure a destination endpoint to receive JSON payloads.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-900">Integration Name</label>
                <Input 
                  placeholder="e.g. Municipal Slack Alert" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-900">Destination URL</label>
                <Input 
                  placeholder="https://hooks.slack.com/services/..." 
                  value={url} 
                  onChange={e => setUrl(e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>
              
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-gray-900 block">Trigger Events</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={eventCreated} 
                      onChange={e => setEventCreated(e.target.checked)}
                      className="rounded text-indigo-600 border-amber-300 focus:ring-indigo-500"
                    />
                    <span>Ticket Created (`issue.created`)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={eventStatusChanged} 
                      onChange={e => setEventStatusChanged(e.target.checked)}
                      className="rounded text-indigo-600 border-amber-300 focus:ring-indigo-500"
                    />
                    <span>Status Changed (`issue.status_changed`)</span>
                  </label>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-gray-900 hover:bg-indigo-700 font-semibold mt-4">
                {isSubmitting ? 'Adding...' : 'Create Integration'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Webhook Integrations List */}
        <Card className="bg-white border border-gray-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
              <Settings className="h-5 w-5 text-indigo-600" /> Active Integrations
            </CardTitle>
            <CardDescription className="text-gray-600">Manage active API connections and push notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-gray-600">Loading webhooks...</div>
            ) : webhooks.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-40 text-amber-700" />
                <p className="text-sm">No webhook integrations configured yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:bg-gray-50 transition-all flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{webhook.name}</span>
                        <Badge className={webhook.isActive ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-200' : 'bg-slate-200 text-slate-600'}>
                          {webhook.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 font-mono truncate">{webhook.url}</p>
                      <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                        {webhook.events.map(event => (
                          <Badge key={event} variant="outline" className="border-indigo-100 text-indigo-600 text-xs px-2 py-0.5">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleToggle(webhook)}
                        className="text-gray-600 border border-gray-200 bg-white"
                      >
                        {webhook.isActive ? 'Pause' : 'Activate'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleTest(webhook.id)}
                        disabled={testingId === webhook.id}
                        className="text-indigo-600 border border-indigo-200 bg-indigo-50/35"
                      >
                        <Play className="h-3.5 w-3.5 mr-1" />
                        {testingId === webhook.id ? 'Testing...' : 'Test'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDelete(webhook.id)}
                        className="text-red-600 hover:text-red-700 border border-red-200 bg-red-50/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
}

