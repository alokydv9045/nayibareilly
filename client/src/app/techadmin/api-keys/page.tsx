'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { 
  Shield, Key, Plus, Trash2, ArrowLeft, RefreshCw, AlertTriangle, Copy, Check, Info
} from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api/client'

interface ApiKeyRecord {
  id: string
  name: string
  ownerOrg: string
  key: string
  isActive: boolean
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string | null
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // New Key Modal / Display State
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [ownerOrg, setOwnerOrg] = useState('')
  const [expiresDays, setExpiresDays] = useState('365')
  const [neverExpires, setNeverExpires] = useState(true)

  const fetchKeys = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/techadmin/keys')
      setKeys(res.data?.data || res.data || [])
    } catch (err) {
      toast.error('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !ownerOrg) {
      toast.error('Name and Owner Organization are required')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await api.post('/admin/techadmin/keys', {
        name,
        ownerOrg,
        expiresDays: neverExpires ? undefined : parseInt(expiresDays, 10)
      })
      
      setGeneratedKey(res.data?.data?.key || res.data.key)
      setName('')
      setOwnerOrg('')
      toast.success('API Key generated')
      fetchKeys()
    } catch (err) {
      toast.error('Failed to generate API key')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Warning: Revoking this API Key will immediately block all external apps using it. Proceed?')) return

    try {
      await api.delete(`/admin/techadmin/keys/${id}`)
      toast.success('API Key revoked')
      fetchKeys()
    } catch (err) {
      toast.error('Failed to revoke API key')
    }
  }

  const copyToClipboard = () => {
    if (!generatedKey) return
    navigator.clipboard.writeText(generatedKey)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    fetchKeys()
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
            <Shield className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              API Keys & Developer Portal
              <Badge variant="outline" className="text-xs bg-gray-50 hidden sm:flex">TechAdmin</Badge>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage secure access keys for civic developers</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button onClick={fetchKeys} variant="outline" className="bg-white border-gray-200 w-full sm:w-auto" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Security alert */}
      <div className="bg-indigo-50 border border-indigo-200/60 rounded-2xl p-4 flex gap-3 text-sm text-indigo-950">
        <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Developer Access Notice:</span> Exposing API keys allows external services to query city infrastructure issues (open public tickets) to build custom mobile dashboards, research maps, or academic visualizations. This fostering of transparency conforms to Open Government Data guidelines.
        </div>
      </div>

      {/* Modal for new generated Key */}
      {generatedKey && (
        <Card className="bg-indigo-950 text-indigo-50 border-2 border-indigo-500 shadow-2xl p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-indigo-300">
              <Key className="h-5 w-5" /> API Key Generated Successfully
            </CardTitle>
            <CardDescription className="text-indigo-200 text-xs">
              Make sure to copy the key below now. It will not be shown again for security reasons.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4 pt-2">
            <div className="flex gap-2">
              <Input 
                readOnly
                value={generatedKey}
                className="bg-black/40 border-indigo-800 text-indigo-300 font-mono text-center font-bold text-sm tracking-wide py-5 select-all"
              />
              <Button onClick={copyToClipboard} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex justify-between items-center text-xs text-indigo-300">
              <span>Header: `x-api-key: nb_...`</span>
              <Button variant="ghost" size="sm" onClick={() => setGeneratedKey(null)} className="text-indigo-200 hover:text-white">
                I have copied it, close this
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create API Key Form */}
        <Card className="bg-white border border-gray-200 lg:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
              <Plus className="h-5 w-5 text-indigo-600" /> Issue Developer Key
            </CardTitle>
            <CardDescription className="text-gray-600">Register an application to generate a query credential.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-900">Developer/App Name</label>
                <Input 
                  placeholder="e.g. Bareilly Traffic App" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-900">Organization / University</label>
                <Input 
                  placeholder="e.g. Rohilkhand University Research" 
                  value={ownerOrg} 
                  onChange={e => setOwnerOrg(e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-gray-900 block">Key Expiration</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={neverExpires} 
                      onChange={e => setNeverExpires(e.target.checked)}
                      className="rounded text-indigo-600 border-amber-300 focus:ring-indigo-500"
                    />
                    <span>Never expire (production key)</span>
                  </label>
                  
                  {!neverExpires && (
                    <div className="flex gap-2 pl-6 items-center">
                      <Input 
                        type="number"
                        min="1"
                        value={expiresDays}
                        onChange={e => setExpiresDays(e.target.value)}
                        className="bg-white border-gray-200 text-sm w-24"
                      />
                      <span className="text-xs text-gray-600">days limit</span>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-gray-900 hover:bg-indigo-700 font-semibold mt-4">
                {isSubmitting ? 'Generating...' : 'Generate API Key'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* API Keys List */}
        <Card className="bg-white border border-gray-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
              <Key className="h-5 w-5 text-indigo-600" /> Issued Access Credentials
            </CardTitle>
            <CardDescription className="text-gray-600">Active developer keys and access history statistics.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-gray-600">Loading developer keys...</div>
            ) : keys.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-40 text-amber-700" />
                <p className="text-sm">No API keys generated yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {keys.map((apiKey) => (
                  <div key={apiKey.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:bg-gray-50 transition-all flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{apiKey.name}</span>
                        <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 text-xs">
                          {apiKey.ownerOrg}
                        </Badge>
                      </div>
                      <p className="text-xs font-mono text-gray-600/85">Key mask: nb_{apiKey.key.slice(3, 8)}****************</p>
                      
                      <div className="grid grid-cols-2 gap-4 pt-1.5 text-xs text-gray-600">
                        <div>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</div>
                        <div>Last used: {apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt).toLocaleString() : 'Never'}</div>
                        {apiKey.expiresAt && (
                          <div className="col-span-2 text-orange-600 font-medium">
                            Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDelete(apiKey.id)}
                        className="text-red-600 hover:text-red-700 border border-red-200 bg-red-50/30 font-semibold"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Revoke Key
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

