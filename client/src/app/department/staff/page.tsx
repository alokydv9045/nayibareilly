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
      light: { color: 'bg-blue-500', text: 'Light Load' },
      moderate: { color: 'bg-yellow-500', text: 'Moderate Load' },
      heavy: { color: 'bg-red-500', text: 'Heavy Load' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available
    return (
      <Badge className={`${config.color} text-amber-950`}>
        {config.text}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-amber-950 text-lg">Loading staff members...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-red-600 text-lg">Error loading staff members</div>
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
                <Button variant="outline" className="bg-amber-100/50 text-amber-950 border-amber-200/60 hover:bg-amber-200/50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="p-3 bg-green-600 rounded-xl">
                <Users className="h-8 w-8 text-amber-950" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-amber-950">Department Staff Management</h1>
                <p className="text-blue-200">Manage and monitor your department staff members</p>
                {user?.name && (
                  <p className="text-sm text-blue-600">Department Admin: {user.name}</p>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="bg-orange-600 text-amber-950 px-4 py-2">
              Department Admin
            </Badge>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-amber-100/50  border-amber-200/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Total Staff</p>
                  <p className="text-2xl font-bold text-amber-950">{staff.length}</p>
                  <p className="text-xs text-blue-600">Department Members</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-100/50  border-amber-200/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Available Staff</p>
                  <p className="text-2xl font-bold text-amber-950">
                    {staff.filter(s => s.workloadStatus === 'available').length}
                  </p>
                  <p className="text-xs text-green-600">Ready for assignments</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-100/50  border-amber-200/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Busy Staff</p>
                  <p className="text-2xl font-bold text-amber-950">
                    {staff.filter(s => s.workloadStatus === 'heavy').length}
                  </p>
                  <p className="text-xs text-yellow-600">High workload</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-100/50  border-amber-200/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Active Issues</p>
                  <p className="text-2xl font-bold text-amber-950">
                    {staff.reduce((total, s) => total + s.activeIssues, 0)}
                  </p>
                  <p className="text-xs text-orange-600">Total assigned</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="mb-6 bg-amber-100/50  border-amber-200/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                <Input
                  placeholder="Search staff members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-amber-100/50 border-amber-200/60 text-amber-950 placeholder:text-blue-600"
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
        <Card className="bg-amber-100/50  border-amber-200/60">
          <CardHeader>
            <CardTitle className="text-amber-950">Department Staff Members</CardTitle>
            <CardDescription className="text-blue-200">
              Monitor workload and manage assignments for your department staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStaff.length === 0 ? (
              <div className="text-center py-12 text-amber-950">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg mb-2">No Staff Members Found</p>
                <p className="text-blue-200">
                  {searchTerm ? 'Try adjusting your search terms' : 'No staff members assigned to this department yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStaff.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-white border border-amber-200/60 rounded-lg hover:bg-amber-100/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-amber-950 text-lg">
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-amber-950">{member.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-blue-200">
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
                          <Badge variant="secondary" className="bg-teal-600 text-amber-950">
                            Staff Member
                          </Badge>
                          {getStatusBadge(member.workloadStatus)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-amber-950">{member.activeIssues} Active Issues</p>
                        <p className="text-xs text-blue-200">Workload: {member.workloadStatus}</p>
                        <p className="text-xs text-gray-400">ID: {member.id}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-amber-200/60 text-amber-950 hover:bg-amber-100/50" 
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