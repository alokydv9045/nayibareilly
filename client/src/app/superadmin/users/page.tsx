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
      case 'super_admin': return 'bg-slate-900 text-white border-transparent'
      case 'mayor': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'dept_admin': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'moderator': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'staff': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'citizen': return 'bg-slate-100 text-slate-700 border-slate-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getRoleLabel = (role: string) => {
    return role.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
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
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
              <p className="text-slate-500 font-medium mt-1">Create, edit, and manage all user accounts</p>
            </div>
          </div>
          <Button 
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm px-6 h-11"
            onClick={() => setShowCreateModal(true)}
            aria-label="Create new user account"
          >
            <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
            Create New User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" role="region" aria-label="User statistics">
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">Total Users</p>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900" aria-label={`${users.length} total users`}>{users.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Active Users</p>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <CheckCircle className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900" aria-label={`${users.filter(u => u.isActive).length} active users`}>
                {users.filter(u => u.isActive).length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-purple-600 transition-colors">Verified</p>
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Shield className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900" aria-label={`${users.filter(u => u.isVerified).length} verified users`}>
                {users.filter(u => u.isVerified).length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-orange-600 transition-colors">Admins</p>
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900" aria-label={`${users.filter(u => 
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
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11"
                  aria-label="Search users by name or email"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 h-11 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
        {/* Users Table */}
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
            <CardTitle className="text-slate-900 text-lg">All Users ({filteredUsers.length})</CardTitle>
            <CardDescription className="text-slate-500 font-medium text-xs mt-1">
              Manage user accounts, roles, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-100 animate-pulse">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-slate-200 rounded-lg h-12 w-12" />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-6 w-32 bg-slate-200 rounded" />
                            <div className="h-5 w-20 bg-slate-200 rounded-full" />
                            <div className="h-5 w-16 bg-slate-200 rounded-full" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="h-4 w-48 bg-slate-200 rounded" />
                            <div className="h-4 w-36 bg-slate-200 rounded" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-16 bg-slate-200 rounded" />
                        <div className="h-8 w-20 bg-slate-200 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-20 text-slate-900" />
                <p className="font-medium text-sm">No users found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div 
                    key={user.id}
                    className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-slate-300 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-colors">
                          <User className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-slate-900 font-bold text-base">{user.name}</h3>
                            {user.roles.map((role, idx) => (
                              <Badge key={idx} className={`border ${getRoleBadgeColor(role)} font-bold text-[10px] uppercase tracking-wider px-2 py-0.5`}>
                                {getRoleLabel(role)}
                              </Badge>
                            ))}
                            {user.isActive ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 hover:bg-emerald-100">Active</Badge>
                            ) : (
                              <Badge className="bg-rose-100 text-rose-800 border border-rose-200 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 hover:bg-rose-100">Inactive</Badge>
                            )}
                            {user.isVerified && (
                              <Badge className="bg-blue-100 text-blue-800 border border-blue-200 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 hover:bg-blue-100">
                                <Shield className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500 mt-3">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
                              <span>{user.email}</span>
                            </div>
                            {user.departmentName && (
                              <div className="flex items-center space-x-2">
                                <Building2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                <span>{user.departmentName}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-slate-400" aria-hidden="true" />
                              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                            {user.lastLogin && (
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                                <span>Last login {new Date(user.lastLogin).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 font-bold text-xs"
                          onClick={() => setEditingUser(user)}
                          aria-label={`Edit user ${user.name}`}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 font-bold text-xs"
                          onClick={() => handleDeleteUser(user.id)}
                          aria-label={`Delete user ${user.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
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
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-form-title"
    >
      <Card className="bg-white border-slate-200 shadow-2xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
          <CardTitle id="user-form-title" className="text-slate-900 text-xl font-bold">
            {user ? 'Edit User' : 'Create New User'}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium mt-1">
            {user ? 'Update user information and permissions' : 'Add a new user to the system'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="user-name" className="block text-sm font-bold text-slate-700 mb-2">
                Name <span className="text-rose-500" aria-label="required">*</span>
              </label>
              <Input
                id="user-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Full name"
                required
                aria-required="true"
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label htmlFor="user-email" className="block text-sm font-bold text-slate-700 mb-2">
                Email <span className="text-rose-500" aria-label="required">*</span>
              </label>
              <Input
                id="user-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="user@example.com"
                required
                aria-required="true"
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>

            {!user && (
              <div>
                <label htmlFor="user-password" className="block text-sm font-bold text-slate-700 mb-2">
                  Password <span className="text-rose-500" aria-label="required">*</span>
                </label>
                <Input
                  id="user-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Password"
                  required={!user}
                  aria-required="true"
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
            )}

            <div>
              <label htmlFor="user-roles" className="block text-sm font-bold text-slate-700 mb-2">
                Roles <span className="text-rose-500" aria-label="required">*</span>
              </label>
              <select
                id="user-roles"
                multiple
                value={formData.roles}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  setFormData({...formData, roles: selected})
                }}
                className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-3 py-2 h-40 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors"
                size={6}
                aria-required="true"
                aria-describedby="roles-hint"
              >
                <option value="citizen" className="py-1 px-2 hover:bg-slate-100 rounded">Citizen</option>
                <option value="staff" className="py-1 px-2 hover:bg-slate-100 rounded">Staff</option>
                <option value="moderator" className="py-1 px-2 hover:bg-slate-100 rounded">Moderator</option>
                <option value="dept_admin" className="py-1 px-2 hover:bg-slate-100 rounded">Department Admin</option>
                <option value="mayor" className="py-1 px-2 hover:bg-slate-100 rounded">Mayor</option>
                <option value="super_admin" className="py-1 px-2 hover:bg-slate-100 rounded">Super Admin</option>
              </select>
              <p id="roles-hint" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-2">Hold Ctrl/Cmd to select multiple</p>
            </div>

            <fieldset className="border border-slate-200 rounded-xl p-5 bg-slate-50">
              <legend className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2">User Status</legend>
              <div className="flex items-center space-x-6 mt-1">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      id="user-active"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-emerald-500 checked:border-emerald-500 transition-colors"
                    />
                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Active</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      id="user-verified"
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-colors"
                    />
                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Verified</span>
                </label>
              </div>
            </fieldset>

            <div className="flex items-center space-x-4 pt-6 border-t border-slate-100">
              <Button 
                type="submit" 
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 shadow-sm font-bold"
                aria-label={user ? 'Update user account' : 'Create new user account'}
              >
                <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                {user ? 'Update User' : 'Create User'}
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
