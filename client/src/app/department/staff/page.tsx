"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Users, UserCheck, Clock, AlertCircle, Search, Phone, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useDepartmentStaff } from '@/hooks/api/useDepartments'
import { userStorage } from '@/lib/auth/auth-utils'

export default function DepartmentStaffPage() {
  const [user, setUser] = useState<{ departmentId?: string; name?: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const userData = userStorage.get()
    if (userData?.departmentId) {
      setUser({ 
        departmentId: userData.departmentId,
        name: userData.name 
      })
    }
  }, [])

  const departmentId = user?.departmentId || 'placeholder-dept-id'
  const { data: staff = [], isLoading, error } = useDepartmentStaff(departmentId)

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { color: 'bg-green-500', text: 'Available' },
      light: { color: 'bg-emerald-500', text: 'Light Load' },
      moderate: { color: 'bg-yellow-500', text: 'Moderate Load' },
      heavy: { color: 'bg-red-500', text: 'Heavy Load' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading staff members...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-red-400 text-lg">Error loading staff members</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/department">
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="p-3 bg-green-600 rounded-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Department Staff Management</h1>
                <p className="text-emerald-200">Manage and monitor your department staff members</p>
                {user?.name && (
                  <p className="text-sm text-emerald-300">Department Admin: {user.name}</p>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="bg-orange-600 text-white px-4 py-2">
              Department Admin
            </Badge>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-200 text-sm">Total Staff</p>
                  <p className="text-2xl font-bold text-white">{staff.length}</p>
                  <p className="text-xs text-blue-400">Department Members</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-200 text-sm">Available Staff</p>
                  <p className="text-2xl font-bold text-white">
                    {staff.filter(s => s.workloadStatus === 'available').length}
                  </p>
                  <p className="text-xs text-green-400">Ready for assignments</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-200 text-sm">Busy Staff</p>
                  <p className="text-2xl font-bold text-white">
                    {staff.filter(s => s.workloadStatus === 'heavy').length}
                  </p>
                  <p className="text-xs text-yellow-400">High workload</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-200 text-sm">Active Issues</p>
                  <p className="text-2xl font-bold text-white">
                    {staff.reduce((total, s) => total + s.activeIssues, 0)}
                  </p>
                  <p className="text-xs text-orange-400">Total assigned</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-emerald-300" />
                <Input
                  placeholder="Search staff members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-emerald-300"
                />
              </div>
              <Button className="bg-green-600 hover:bg-green-700" disabled>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Staff List */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Department Staff Members</CardTitle>
            <CardDescription className="text-emerald-200">
              Monitor workload and manage assignments for your department staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStaff.length === 0 ? (
              <div className="text-center py-12 text-white">
                <Users className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg mb-2">No Staff Members Found</p>
                <p className="text-emerald-200">
                  {searchTerm ? 'Try adjusting your search terms' : 'No staff members assigned to this department yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStaff.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-slate-700 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-white text-lg">
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{member.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-emerald-200">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="bg-teal-600 text-white">
                            Staff Member
                          </Badge>
                          {getStatusBadge(member.workloadStatus)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{member.activeIssues} Active Issues</p>
                        <p className="text-xs text-emerald-200">Workload: {member.workloadStatus}</p>
                        <p className="text-xs text-slate-400">ID: {member.id}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-white/30 text-white hover:bg-white/10" 
                        disabled
                      >
                        Manage
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
  )
}