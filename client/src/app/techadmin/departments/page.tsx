"use client"
import AnimatedHeading from '@/components/ui/AnimatedHeading'

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
    <div className="min-h-screen bg-transparent font-sans">
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
              <AnimatedHeading as="h1" className="text-3xl font-bold tracking-tight text-slate-900">Department Management</AnimatedHeading>
              <p className="text-slate-500 font-medium mt-1">Create, edit, and manage all departments</p>
            </div>
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
      </div>

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" role="region" aria-label="Department statistics">
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Total Departments</p>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900" aria-label={`${departments.length} total departments`}>{departments.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">Active Departments</p>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <CheckCircle className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900" aria-label={`${departments.filter(d => d.isActive).length} active departments`}>
                {departments.filter(d => d.isActive).length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-purple-600 transition-colors">Total Staff</p>
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900" aria-label={`${departments.reduce((sum, d) => sum + d.staffCount, 0)} total staff members`}>
                {departments.reduce((sum, d) => sum + d.staffCount, 0)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-orange-600 transition-colors">Avg SLA Compliance</p>
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {Math.round(departments.reduce((sum, d) => sum + d.slaCompliance, 0) / (departments.length || 1))}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11"
                aria-label="Search departments by name or description"
              />
            </div>
          </CardContent>
        </Card>

        {/* Departments Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="p-3 bg-slate-200 rounded-xl">
                        <div className="h-6 w-6 bg-slate-300 rounded" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-6 w-40 bg-slate-200 rounded" />
                        <div className="h-4 w-64 bg-slate-100 rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-16 bg-slate-200 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="space-y-2">
                        <div className="h-3 w-20 bg-slate-100 rounded" />
                        <div className="h-5 w-12 bg-slate-200 rounded" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-20 text-slate-900" />
            <p className="font-medium text-sm">No departments found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDepartments.map((dept) => (
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
                              <span>{dept.headEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                      {dept.contactPhone && (
                        <div className="flex items-center space-x-2 text-slate-600 font-medium text-sm">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span>{dept.contactPhone}</span>
                        </div>
                      )}
                      {dept.contactEmail && (
                        <div className="flex items-center space-x-2 text-slate-600 font-medium text-sm">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span>{dept.contactEmail}</span>
                        </div>
                      )}
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <Users className="h-4 w-4 text-emerald-600" />
                          <span className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider">Staff Members</span>
                        </div>
                        <p className="text-emerald-900 font-bold text-xl">{dept.staffCount}</p>
                      </div>

                      <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="text-orange-700 text-[11px] font-bold uppercase tracking-wider">Active Issues</span>
                        </div>
                        <p className="text-orange-900 font-bold text-xl">{dept.activeIssues}</p>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-700 text-[11px] font-bold uppercase tracking-wider">Resolved</span>
                        </div>
                        <p className="text-blue-900 font-bold text-xl">{dept.resolvedIssues}</p>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <span className="text-purple-700 text-[11px] font-bold uppercase tracking-wider">SLA Compliance</span>
                        </div>
                        <p className="text-purple-900 font-bold text-xl">{dept.slaCompliance}%</p>
                      </div>
                    </div>

                    {/* Avg Resolution Time */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                      <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Avg Resolution Time</p>
                      <p className="text-slate-900 font-bold">{dept.avgResolutionTime} hours</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 font-bold text-xs"
                        onClick={() => setEditingDepartment(dept)}
                        aria-label={`Edit ${dept.name} department`}
                      >
                        <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 font-bold text-xs"
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
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="department-form-title"
    >
      <Card className="bg-white border-slate-200 shadow-2xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
          <CardTitle id="department-form-title" className="text-slate-900 text-xl font-bold">
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

