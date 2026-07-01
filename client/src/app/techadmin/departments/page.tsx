"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowLeft,
  Save,
  Phone,
  Mail,
  User
} from 'lucide-react'
import Link from 'next/link'
import { 
  useTechadminDepartments, 
  useDeleteDepartment, 
  useCreateDepartment, 
  useUpdateDepartment 
} from '@/hooks/api/useTechadminAPI'

interface DepartmentData {
  id: string
  name: string
  description: string
  headId?: string
  headName?: string
  headEmail?: string
  contactPhone?: string
  contactEmail?: string
  isActive: boolean
  staffCount: number
  activeIssues: number
  resolvedIssues: number
  avgResolutionTime: number
  slaCompliance: number
  createdAt: string
}

export default function DepartmentManagementPage() {
  const { data: departments = [], isLoading: loading } = useTechadminDepartments()
  const deleteDepartment = useDeleteDepartment()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<DepartmentData | null>(null)

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteDepartment = (deptId: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return
    deleteDepartment.mutate(deptId)
  }

  return (
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-[1440px] mx-auto px-10 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/superadmin">
              <Button 
                variant="outline" 
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl shadow-sm"
                aria-label="Go back to superadmin dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Department Management</h1>
              <p className="text-slate-500 font-medium mt-1">Create, edit, and manage all departments</p>
            </div>
=======
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
            <Building2 className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              Department Management
              <Badge variant="outline" className="text-xs bg-gray-50 hidden sm:flex">TechAdmin</Badge>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Create, edit, and manage all departments</p>
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
          </div>
          <Button 
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm px-6 h-11"
            onClick={() => setShowCreateModal(true)}
            aria-label="Create new department"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Create New Department
          </Button>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            onClick={() => setShowCreateModal(true)}
            aria-label="Create new department"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Create New Department
          </Button>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">

        {/* Stats */}
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" role="region" aria-label="Department statistics">
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Total Departments</p>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </div>
=======
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" role="region" aria-label="Department statistics">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Departments</p>
                  <p className="text-3xl font-bold text-gray-900" aria-label={`${departments.length} total departments`}>{departments.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" aria-hidden="true" />
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
              </div>
              <p className="text-3xl font-bold text-slate-900" aria-label={`${departments.length} total departments`}>{departments.length}</p>
            </CardContent>
          </Card>

<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">Active Departments</p>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <CheckCircle className="h-5 w-5" aria-hidden="true" />
                </div>
=======
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Departments</p>
                  <p className="text-3xl font-bold text-gray-900" aria-label={`${departments.filter(d => d.isActive).length} active departments`}>
                    {departments.filter(d => d.isActive).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" aria-hidden="true" />
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
              </div>
              <p className="text-3xl font-bold text-slate-900" aria-label={`${departments.filter(d => d.isActive).length} active departments`}>
                {departments.filter(d => d.isActive).length}
              </p>
            </CardContent>
          </Card>

<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-purple-600 transition-colors">Total Staff</p>
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
=======
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Staff</p>
                  <p className="text-3xl font-bold text-gray-900" aria-label={`${departments.reduce((sum, d) => sum + (d.staffCount || 0), 0)} total staff members`}>
                    {departments.reduce((sum, d) => sum + (d.staffCount || 0), 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" aria-hidden="true" />
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
              </div>
              <p className="text-3xl font-bold text-slate-900" aria-label={`${departments.reduce((sum, d) => sum + d.staffCount, 0)} total staff members`}>
                {departments.reduce((sum, d) => sum + d.staffCount, 0)}
              </p>
            </CardContent>
          </Card>

<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-orange-600 transition-colors">Avg SLA Compliance</p>
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <TrendingUp className="h-5 w-5" />
                </div>
=======
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Avg SLA Compliance</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(departments.reduce((sum, d) => sum + (d.slaCompliance || 0), 0) / (departments.length || 1)) || 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {Math.round(departments.reduce((sum, d) => sum + d.slaCompliance, 0) / (departments.length || 1))}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
=======
        <Card className="bg-white border-gray-200 mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" aria-hidden="true" />
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
                className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11"
=======
                className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
                aria-label="Search departments by name or description"
              />
            </div>
          </CardContent>
        </Card>

        {/* Departments Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
              <Card key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
=======
              <Card key={i} className="bg-white border-gray-200 animate-pulse">
                <CardHeader>
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="p-3 bg-slate-200 rounded-xl">
                        <div className="h-6 w-6 bg-slate-300 rounded" />
                      </div>
                      <div className="flex-1 space-y-2">
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
                        <div className="h-6 w-40 bg-slate-200 rounded" />
                        <div className="h-4 w-64 bg-slate-100 rounded" />
=======
                        <div className="h-6 w-40 bg-amber-200/50 rounded" />
                        <div className="h-4 w-64 bg-purple-200/20 rounded" />
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
                      </div>
                    </div>
                    <div className="h-5 w-16 bg-slate-200 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="space-y-2">
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
                        <div className="h-3 w-20 bg-slate-100 rounded" />
                        <div className="h-5 w-12 bg-slate-200 rounded" />
                      </div>
                    ))}
                  </div>
=======
                        <div className="h-3 w-20 bg-purple-200/20 rounded" />
                        <div className="h-5 w-12 bg-amber-200/50 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="h-4 w-32 bg-purple-200/20 rounded" />
                    <div className="flex space-x-2">
                      <div className="h-8 w-16 bg-blue-600/20 rounded" />
                      <div className="h-8 w-20 bg-red-600/20 rounded" />
                    </div>
                  </div>
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDepartments.length === 0 ? (
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
          <div className="text-center py-12 text-slate-500">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-20 text-slate-900" />
            <p className="font-medium text-sm">No departments found</p>
=======
          <div className="text-center py-12 text-blue-600">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No departments found</p>
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDepartments.map((dept) => (
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
              <Card key={dept.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors group overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-colors">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-slate-900 text-lg font-bold">{dept.name}</CardTitle>
                        <CardDescription className="text-slate-500 font-medium text-xs mt-1">
=======
              <Card key={dept.id} className="bg-white border-gray-200 hover:bg-white/15 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900 text-xl">{dept.name}</CardTitle>
                        <CardDescription className="text-gray-500 text-sm mt-1">
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
                          {dept.description}
                        </CardDescription>
                      </div>
                    </div>
                    {dept.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">Active</Badge>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">Inactive</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-5">
                    {/* Department Head */}
                    {dept.headName && (
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">Department Head</p>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-slate-900 font-medium text-sm">
                            <User className="h-4 w-4 text-slate-400" />
                            <span>{dept.headName}</span>
                          </div>
                          {dept.headEmail && (
                            <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium">
                              <Mail className="h-4 w-4 text-slate-400" />
=======
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-gray-500 text-xs mb-2">Department Head</p>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-gray-900 text-sm">
                            <User className="h-4 w-4" />
                            <span>{dept.headName}</span>
                          </div>
                          {dept.headEmail && (
                            <div className="flex items-center space-x-2 text-gray-500 text-sm">
                              <Mail className="h-4 w-4" />
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
                              <span>{dept.headEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                      {dept.contactPhone && (
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
                        <div className="flex items-center space-x-2 text-slate-600 font-medium text-sm">
                          <Phone className="h-4 w-4 text-slate-400" />
=======
                        <div className="flex items-center space-x-2 text-gray-500 text-sm">
                          <Phone className="h-4 w-4" />
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
                          <span>{dept.contactPhone}</span>
                        </div>
                      )}
                      {dept.contactEmail && (
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
                        <div className="flex items-center space-x-2 text-slate-600 font-medium text-sm">
                          <Mail className="h-4 w-4 text-slate-400" />
=======
                        <div className="flex items-center space-x-2 text-gray-500 text-sm">
                          <Mail className="h-4 w-4" />
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
                          <span>{dept.contactEmail}</span>
                        </div>
                      )}
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                        <div className="flex items-center space-x-2 mb-1">
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
                          <Users className="h-4 w-4 text-emerald-600" />
                          <span className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider">Staff Members</span>
                        </div>
                        <p className="text-emerald-900 font-bold text-xl">{dept.staffCount}</p>
=======
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-200 text-xs">Staff Members</span>
                        </div>
                        <p className="text-gray-900 font-bold text-lg">{dept.staffCount || 0}</p>
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
                      </div>

                      <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="h-4 w-4 text-orange-600" />
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
                          <span className="text-orange-700 text-[11px] font-bold uppercase tracking-wider">Active Issues</span>
                        </div>
                        <p className="text-orange-900 font-bold text-xl">{dept.activeIssues}</p>
=======
                          <span className="text-orange-200 text-xs">Active Issues</span>
                        </div>
                        <p className="text-gray-900 font-bold text-lg">{dept.activeIssues || 0}</p>
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
                      </div>

                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center space-x-2 mb-1">
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-700 text-[11px] font-bold uppercase tracking-wider">Resolved</span>
                        </div>
                        <p className="text-blue-900 font-bold text-xl">{dept.resolvedIssues}</p>
=======
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-200 text-xs">Resolved</span>
                        </div>
                        <p className="text-gray-900 font-bold text-lg">{dept.resolvedIssues || 0}</p>
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
                      </div>

                      <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                        <div className="flex items-center space-x-2 mb-1">
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <span className="text-purple-700 text-[11px] font-bold uppercase tracking-wider">SLA Compliance</span>
                        </div>
                        <p className="text-purple-900 font-bold text-xl">{dept.slaCompliance}%</p>
=======
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-500 text-xs">SLA Compliance</span>
                        </div>
                        <p className="text-gray-900 font-bold text-lg">{dept.slaCompliance || 0}%</p>
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
                      </div>
                    </div>

                    {/* Avg Resolution Time */}
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                      <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Avg Resolution Time</p>
                      <p className="text-slate-900 font-bold">{dept.avgResolutionTime} hours</p>
=======
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-gray-500 text-xs mb-1">Avg Resolution Time</p>
                      <p className="text-gray-900 font-semibold">{dept.avgResolutionTime || 0} hours</p>
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
                        className="flex-1 bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 font-bold text-xs"
=======
                        className="flex-1 bg-blue-600/20 border-blue-500 text-blue-600 hover:bg-blue-600/30"
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
                        onClick={() => setEditingDepartment(dept)}
                        aria-label={`Edit ${dept.name} department`}
                      >
                        <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
                        className="flex-1 bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 font-bold text-xs"
=======
                        className="flex-1 bg-red-600/20 border-red-500 text-red-600 hover:bg-red-600/30"
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
                        onClick={() => handleDeleteDepartment(dept.id)}
                        aria-label={`Delete ${dept.name} department`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Department Modal */}
        {(showCreateModal || editingDepartment) && (
          <DepartmentFormModal
            department={editingDepartment}
            onClose={() => {
              setShowCreateModal(false)
              setEditingDepartment(null)
            }}
            onSave={() => {
              setShowCreateModal(false)
              setEditingDepartment(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Department Form Modal Component
function DepartmentFormModal({ 
  department, 
  onClose, 
  onSave 
}: { 
  department: DepartmentData | null
  onClose: () => void
  onSave: () => void
}) {
  const createDepartment = useCreateDepartment()
  const updateDepartment = useUpdateDepartment()
  
  const [formData, setFormData] = useState({
    name: department?.name || '',
    description: department?.description || '',
    headId: department?.headId || '',
    contactPhone: department?.contactPhone || '',
    contactEmail: department?.contactEmail || '',
    isActive: department?.isActive ?? true
  })

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (department) {
      updateDepartment.mutate(
        { id: department.id, data: formData },
        { onSuccess: onSave }
      )
    } else {
      createDepartment.mutate(formData, { onSuccess: onSave })
    }
  }

  return (
    <div 
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
=======
      className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4"
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
      role="dialog"
      aria-modal="true"
      aria-labelledby="department-form-title"
    >
<<<<<<< HEAD:client/src/app/superadmin/departments/page.tsx
      <Card className="bg-white border-slate-200 shadow-2xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
          <CardTitle id="department-form-title" className="text-slate-900 text-xl font-bold">
=======
      <Card className="bg-white/95  border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle id="department-form-title" className="text-purple-900">
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9:client/src/app/techadmin/departments/page.tsx
            {department ? 'Edit Department' : 'Create New Department'}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium mt-1">
            {department ? 'Update department information' : 'Add a new department to the system'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="dept-name" className="block text-sm font-bold text-slate-700 mb-2">
                Department Name <span className="text-rose-500" aria-label="required">*</span>
              </label>
              <Input
                id="dept-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Health Department"
                required
                aria-required="true"
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label htmlFor="dept-description" className="block text-sm font-bold text-slate-700 mb-2">
                Description <span className="text-rose-500" aria-label="required">*</span>
              </label>
              <textarea
                id="dept-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of department responsibilities"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors rounded-xl px-4 py-3 resize-none"
                rows={3}
                required
                aria-required="true"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="dept-phone" className="block text-sm font-bold text-slate-700 mb-2">Contact Phone</label>
                <Input
                  id="dept-phone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  placeholder="+91 1234567890"
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="dept-email" className="block text-sm font-bold text-slate-700 mb-2">Contact Email</label>
                <Input
                  id="dept-email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  placeholder="department@nayi-bareilly.com"
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <fieldset className="border border-slate-200 rounded-xl p-5 bg-slate-50">
              <legend className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2">Status</legend>
              <div className="flex items-center space-x-6 mt-1">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      id="dept-active"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-emerald-500 checked:border-emerald-500 transition-colors"
                    />
                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Active</span>
                </label>
              </div>
            </fieldset>

            <div className="flex items-center space-x-4 pt-6 border-t border-slate-100">
              <Button 
                type="submit" 
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 shadow-sm font-bold"
                aria-label={department ? 'Update department' : 'Create new department'}
              >
                <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                {department ? 'Update Department' : 'Create Department'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl h-12 font-bold"
                aria-label="Cancel and close form"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

