"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Shield,
  Building2,
  User,
  Mail,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Save
} from 'lucide-react'
import Link from 'next/link'
import { 
  useSuperadminUsers, 
  useDeleteUser, 
  useCreateUser, 
  useUpdateUser 
} from '@/hooks/api/useSuperadminAPI'

interface UserData {
  id: string
  email: string
  name: string
  roles: string[]
  departmentId?: string
  departmentName?: string
  isActive: boolean
  isVerified: boolean
  lastLogin?: string
  createdAt: string
}

export default function UserManagementPage() {
  const { data: users = [], isLoading: loading } = useSuperadminUsers()
  const deleteUser = useDeleteUser()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.roles.includes(filterRole)
    return matchesSearch && matchesRole
  })

  const handleDeleteUser = (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    deleteUser.mutate(userId)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-500'
      case 'mayor': return 'bg-blue-500'
      case 'dept_admin': return 'bg-indigo-500'
      case 'moderator': return 'bg-orange-500'
      case 'staff': return 'bg-green-500'
      case 'citizen': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getRoleLabel = (role: string) => {
    return role.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/superadmin">
                <Button 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  aria-label="Go back to superadmin dashboard"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-white">User Management</h1>
                <p className="text-purple-200">Create, edit, and manage all user accounts</p>
              </div>
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setShowCreateModal(true)}
              aria-label="Create new user account"
            >
              <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
              Create New User
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" role="region" aria-label="User statistics">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-white" aria-label={`${users.length} total users`}>{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-300" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Active Users</p>
                  <p className="text-3xl font-bold text-white" aria-label={`${users.filter(u => u.isActive).length} active users`}>
                    {users.filter(u => u.isActive).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-300" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Verified</p>
                  <p className="text-3xl font-bold text-white" aria-label={`${users.filter(u => u.isVerified).length} verified users`}>
                    {users.filter(u => u.isVerified).length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-purple-300" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Admins</p>
                  <p className="text-3xl font-bold text-white" aria-label={`${users.filter(u => 
                      u.roles.includes('super_admin') || 
                      u.roles.includes('mayor') || 
                      u.roles.includes('dept_admin')
                    ).length} administrator users`}>
                    {users.filter(u => 
                      u.roles.includes('super_admin') || 
                      u.roles.includes('mayor') || 
                      u.roles.includes('dept_admin')
                    ).length}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-yellow-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" aria-hidden="true" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                  aria-label="Search users by name or email"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                aria-label="Filter users by role"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="mayor">Mayor</option>
                <option value="dept_admin">Department Admin</option>
                <option value="moderator">Moderator</option>
                <option value="staff">Staff</option>
                <option value="citizen">Citizen</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Loading Skeleton */}        {/* Users Table */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white">All Users ({filteredUsers.length})</CardTitle>
            <CardDescription className="text-purple-200">
              Manage user accounts, roles, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10 animate-pulse">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                          <div className="h-6 w-6 bg-blue-300/30 rounded" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-6 w-32 bg-white/20 rounded" />
                            <div className="h-5 w-20 bg-purple-500/30 rounded-full" />
                            <div className="h-5 w-16 bg-green-500/30 rounded-full" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="h-4 w-48 bg-white/10 rounded" />
                            <div className="h-4 w-36 bg-white/10 rounded" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-16 bg-blue-600/20 rounded" />
                        <div className="h-8 w-20 bg-red-600/20 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-purple-300">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div 
                    key={user.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                          <User className="h-6 w-6 text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-semibold text-lg">{user.name}</h3>
                            {user.roles.map((role, idx) => (
                              <Badge key={idx} className={getRoleBadgeColor(role)}>
                                {getRoleLabel(role)}
                              </Badge>
                            ))}
                            {user.isActive ? (
                              <Badge className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge className="bg-red-500">Inactive</Badge>
                            )}
                            {user.isVerified && (
                              <Badge className="bg-blue-500">
                                <Shield className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-purple-200">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" aria-hidden="true" />
                              <span>{user.email}</span>
                            </div>
                            {user.departmentName && (
                              <div className="flex items-center space-x-2">
                                <Building2 className="h-4 w-4" aria-hidden="true" />
                                <span>{user.departmentName}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" aria-hidden="true" />
                              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                            {user.lastLogin && (
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                                <span>Last login {new Date(user.lastLogin).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-600/20 border-blue-500 text-blue-300 hover:bg-blue-600/30"
                          onClick={() => setEditingUser(user)}
                          aria-label={`Edit user ${user.name}`}
                        >
                          <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-600/20 border-red-500 text-red-300 hover:bg-red-600/30"
                          onClick={() => handleDeleteUser(user.id)}
                          aria-label={`Delete user ${user.name}`}
                        >
                          <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit User Modal */}
        {(showCreateModal || editingUser) && (
          <UserFormModal
            user={editingUser}
            onClose={() => {
              setShowCreateModal(false)
              setEditingUser(null)
            }}
            onSave={() => {
              setShowCreateModal(false)
              setEditingUser(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

// User Form Modal Component
function UserFormModal({ 
  user, 
  onClose, 
  onSave 
}: { 
  user: UserData | null
  onClose: () => void
  onSave: () => void
}) {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    password: '',
    roles: user?.roles || ['citizen'],
    departmentId: user?.departmentId || '',
    isActive: user?.isActive ?? true,
    isVerified: user?.isVerified ?? false
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
    
    if (user) {
      updateUser.mutate(
        { id: user.id, data: formData },
        { onSuccess: onSave }
      )
    } else {
      createUser.mutate(formData, { onSuccess: onSave })
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-form-title"
    >
      <Card className="bg-white/95 backdrop-blur-lg border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle id="user-form-title" className="text-purple-900">
            {user ? 'Edit User' : 'Create New User'}
          </CardTitle>
          <CardDescription>
            {user ? 'Update user information and permissions' : 'Add a new user to the system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500" aria-label="required">*</span>
              </label>
              <Input
                id="user-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Full name"
                required
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500" aria-label="required">*</span>
              </label>
              <Input
                id="user-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="user@example.com"
                required
                aria-required="true"
              />
            </div>

            {!user && (
              <div>
                <label htmlFor="user-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500" aria-label="required">*</span>
                </label>
                <Input
                  id="user-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Password"
                  required={!user}
                  aria-required="true"
                />
              </div>
            )}

            <div>
              <label htmlFor="user-roles" className="block text-sm font-medium text-gray-700 mb-2">
                Roles <span className="text-red-500" aria-label="required">*</span>
              </label>
              <select
                id="user-roles"
                multiple
                value={formData.roles}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  setFormData({...formData, roles: selected})
                }}
                className="w-full border rounded-lg px-3 py-2"
                size={6}
                aria-required="true"
                aria-describedby="roles-hint"
              >
                <option value="citizen">Citizen</option>
                <option value="staff">Staff</option>
                <option value="moderator">Moderator</option>
                <option value="dept_admin">Department Admin</option>
                <option value="mayor">Mayor</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <p id="roles-hint" className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>

            <fieldset className="border rounded-lg p-4">
              <legend className="text-sm font-medium text-gray-700 px-2">User Status</legend>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    id="user-active"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    id="user-verified"
                    type="checkbox"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Verified</span>
                </label>
              </div>
            </fieldset>

            <div className="flex items-center space-x-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700"
                aria-label={user ? 'Update user account' : 'Create new user account'}
              >
                <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                {user ? 'Update User' : 'Create User'}
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
