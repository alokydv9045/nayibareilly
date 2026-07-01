'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Save, X, Upload, Shield } from 'lucide-react'

interface UserFormData {
  name: string
  email: string
  phone: string
  role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'MODERATOR' | 'STAFF' | 'CITIZEN'
  department: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  avatar?: string
}

interface UserFormProps {
  user?: UserFormData & { id: string }
  onSave: (userData: UserFormData) => void
  onCancel: () => void
  loading?: boolean
  currentUserRole?: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'MODERATOR' | 'STAFF'
}

const roleOptions = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', badge: 'bg-purple-100 text-purple-800' },
  { value: 'ORG_ADMIN', label: 'Organization Admin', badge: 'bg-emerald-100 text-blue-800' },
  { value: 'MODERATOR', label: 'Moderator', badge: 'bg-orange-100 text-orange-800' },
  { value: 'STAFF', label: 'Staff', badge: 'bg-green-100 text-green-800' },
  { value: 'CITIZEN', label: 'Citizen', badge: 'bg-slate-100 text-slate-800' },
] as const

const statusOptions = [
  { value: 'ACTIVE', label: 'Active', badge: 'bg-green-100 text-green-800' },
  { value: 'INACTIVE', label: 'Inactive', badge: 'bg-slate-100 text-slate-800' },
  { value: 'SUSPENDED', label: 'Suspended', badge: 'bg-red-100 text-red-800' },
] as const

const departmentOptions = [
  'Administration',
  'Water Management',
  'Roads & Transport',
  'Electrical Department',
  'Sanitation',
  'Public Works',
  'Health Department',
  'Education',
  'Parks & Recreation',
  'IT Department',
  'Finance',
  'Legal',
] as const

export function UserForm({ user, onSave, onCancel, loading = false, currentUserRole = 'STAFF' }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'CITIZEN',
    department: user?.department || '',
    status: user?.status || 'ACTIVE',
    avatar: user?.avatar || '',
  })

  // Filter available roles based on current user's permissions
  const getAvailableRoles = () => {
    switch (currentUserRole) {
      case 'SUPER_ADMIN':
        // Super admin can create all roles
        return roleOptions
      case 'ORG_ADMIN':
        // Org admin can create moderators, staff, and citizens
        return roleOptions.filter(role => ['MODERATOR', 'STAFF', 'CITIZEN'].includes(role.value))
      case 'MODERATOR':
        // Moderators can only create staff and citizens
        return roleOptions.filter(role => ['STAFF', 'CITIZEN'].includes(role.value))
      case 'STAFF':
        // Staff can only create citizens
        return roleOptions.filter(role => role.value === 'CITIZEN')
      default:
        return roleOptions.filter(role => role.value === 'CITIZEN')
    }
  }

  const availableRoles = getAvailableRoles()

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format'
    }

    if (!formData.role) {
      newErrors.role = 'Role is required'
    } else if (!availableRoles.some(role => role.value === formData.role)) {
      newErrors.role = 'You do not have permission to assign this role'
    }

    if (formData.role !== 'CITIZEN' && !formData.department.trim()) {
      newErrors.department = 'Department is required for admin users'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const selectedRole = roleOptions.find(opt => opt.value === formData.role)
  const selectedStatus = statusOptions.find(opt => opt.value === formData.status)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>{user ? 'Edit User' : 'Add New User'}</span>
        </CardTitle>
        <div className="text-sm text-slate-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
          <strong>Role Creation Permissions:</strong>
          <ul className="mt-1 text-xs space-y-1">
            <li>• <strong>Super Admin:</strong> Can create all user types</li>
            <li>• <strong>Org Admin:</strong> Can create Moderators, Staff, and Citizens</li>
            <li>• <strong>Moderator:</strong> Can create Staff and Citizens</li>
            <li>• <strong>Staff:</strong> Can only create Citizens</li>
          </ul>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.avatar} alt={formData.name} />
              <AvatarFallback className="text-lg">
                {formData.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label htmlFor="avatar">Profile Picture</Label>
              <div className="flex space-x-2">
                <Input
                  id="avatar"
                  type="url"
                  placeholder="Avatar URL"
                  value={formData.avatar}
                  onChange={(e) => handleChange('avatar', e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
                placeholder="+91 9876543210"
              />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => handleChange('department', value)}
              >
                <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-sm text-red-600">{errors.department}</p>}
            </div>
          </div>

          {/* Role and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleChange('role', value as UserFormData['role'])}
              >
                <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>{role.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRole && (
                <Badge className={selectedRole.badge}>
                  <Shield className="mr-1 h-3 w-3" />
                  {selectedRole.label}
                </Badge>
              )}
              {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange('status', value as UserFormData['status'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStatus && (
                <Badge className={selectedStatus.badge}>
                  {selectedStatus.label}
                </Badge>
              )}
            </div>
          </div>

          {/* Role Description */}
          {formData.role !== 'CITIZEN' && (
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h4 className="font-medium text-blue-900 mb-2">Role Permissions</h4>
              <div className="text-sm text-blue-800">
                {formData.role === 'SUPER_ADMIN' && (
                  <p>Super Admin has full system access including user management, system configuration, and all departmental functions.</p>
                )}
                {formData.role === 'ORG_ADMIN' && (
                  <p>Organization Admin can manage their department, handle departmental issues, and oversee staff operations.</p>
                )}
                {formData.role === 'MODERATOR' && (
                  <p>Moderator can review and moderate content, handle user reports, and manage community guidelines.</p>
                )}
                {formData.role === 'STAFF' && (
                  <p>Staff can handle assigned tasks, update issue status, and manage field operations within their department.</p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}