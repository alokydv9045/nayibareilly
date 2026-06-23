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
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" role="region" aria-label="Department statistics">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Departments</p>
                  <p className="text-3xl font-bold text-gray-900" aria-label={`${departments.length} total departments`}>{departments.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

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
              </div>
            </CardContent>
          </Card>

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
              </div>
            </CardContent>
          </Card>

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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-white border-gray-200 mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" aria-hidden="true" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                aria-label="Search departments by name or description"
              />
            </div>
          </CardContent>
        </Card>

        {/* Departments Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white border-gray-200 animate-pulse">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <div className="h-6 w-6 bg-blue-300/30 rounded" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-6 w-40 bg-amber-200/50 rounded" />
                        <div className="h-4 w-64 bg-purple-200/20 rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-16 bg-green-500/30 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="space-y-2">
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
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="text-center py-12 text-blue-600">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No departments found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDepartments.map((dept) => (
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
                          {dept.description}
                        </CardDescription>
                      </div>
                    </div>
                    {dept.isActive ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge className="bg-red-500">Inactive</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Department Head */}
                    {dept.headName && (
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
                              <span>{dept.headEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-3">
                      {dept.contactPhone && (
                        <div className="flex items-center space-x-2 text-gray-500 text-sm">
                          <Phone className="h-4 w-4" />
                          <span>{dept.contactPhone}</span>
                        </div>
                      )}
                      {dept.contactEmail && (
                        <div className="flex items-center space-x-2 text-gray-500 text-sm">
                          <Mail className="h-4 w-4" />
                          <span>{dept.contactEmail}</span>
                        </div>
                      )}
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-500/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-200 text-xs">Staff Members</span>
                        </div>
                        <p className="text-gray-900 font-bold text-lg">{dept.staffCount || 0}</p>
                      </div>

                      <div className="bg-orange-500/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="text-orange-200 text-xs">Active Issues</span>
                        </div>
                        <p className="text-gray-900 font-bold text-lg">{dept.activeIssues || 0}</p>
                      </div>

                      <div className="bg-green-500/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-200 text-xs">Resolved</span>
                        </div>
                        <p className="text-gray-900 font-bold text-lg">{dept.resolvedIssues || 0}</p>
                      </div>

                      <div className="bg-purple-500/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-500 text-xs">SLA Compliance</span>
                        </div>
                        <p className="text-gray-900 font-bold text-lg">{dept.slaCompliance || 0}%</p>
                      </div>
                    </div>

                    {/* Avg Resolution Time */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-gray-500 text-xs mb-1">Avg Resolution Time</p>
                      <p className="text-gray-900 font-semibold">{dept.avgResolutionTime || 0} hours</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-blue-600/20 border-blue-500 text-blue-600 hover:bg-blue-600/30"
                        onClick={() => setEditingDepartment(dept)}
                        aria-label={`Edit ${dept.name} department`}
                      >
                        <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-red-600/20 border-red-500 text-red-600 hover:bg-red-600/30"
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
      className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="department-form-title"
    >
      <Card className="bg-white/95  border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle id="department-form-title" className="text-purple-900">
            {department ? 'Edit Department' : 'Create New Department'}
          </CardTitle>
          <CardDescription>
            {department ? 'Update department information' : 'Add a new department to the system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="dept-name" className="block text-sm font-medium text-gray-700 mb-2">
                Department Name <span className="text-red-500" aria-label="required">*</span>
              </label>
              <Input
                id="dept-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Health Department"
                required
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="dept-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500" aria-label="required">*</span>
              </label>
              <textarea
                id="dept-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of department responsibilities"
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
                required
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="dept-phone" className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <Input
                id="dept-phone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                placeholder="+91 1234567890"
              />
            </div>

            <div>
              <label htmlFor="dept-email" className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <Input
                id="dept-email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                placeholder="department@nayi-bareilly.com"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="dept-active"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="dept-active" className="text-sm text-gray-700 cursor-pointer">Active</label>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700"
                aria-label={department ? 'Update department' : 'Create new department'}
              >
                <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                {department ? 'Update Department' : 'Create Department'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1"
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

