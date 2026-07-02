"use client"
import AnimatedHeading from '@/components/ui/AnimatedHeading'

import { useState, useMemo, useEffect } from 'react'
import { DataTable, createSelectColumn } from '@/components/features/admin/DataTable'
import { useAdminUsers, type AdminUser } from '@/lib/api/admin-users'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { Plus, Shield, Users, AlertCircle } from 'lucide-react'
import { me as apiMe } from '@/lib/api/auth'
import type { AdminRole } from '@/lib/constants/role-map'
import OfficialLayout from '@/components/layout/OfficialLayout'

interface UserRow {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  isActive?: boolean
}

export default function UsersPage() {
  const [roleFilter] = useState<string | undefined>() // future: role filter UI
  const [search] = useState<string>('')
  const [page] = useState(1)
  const [currentUserRole, setCurrentUserRole] = useState<AdminRole | 'MODERATOR' | null>(null)

  const { data, isLoading, isRefetching } = useAdminUsers({
    page,
    search: search || undefined,
    role: roleFilter,
  })

  // Get current user info for role-based access
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await apiMe()
        if (user) {
          const roles = (user.roles as string[]).map(r => r.toUpperCase())
          // Determine role priority: SUPER_ADMIN > DEPT_ADMIN > MODERATOR > STAFF
          let role: AdminRole | 'MODERATOR' | null = null
          if (roles.includes('SUPER_ADMIN')) role = 'SUPER_ADMIN'
          else if (roles.includes('DEPT_ADMIN')) role = 'DEPT_ADMIN'
          else if (roles.includes('MODERATOR')) role = 'MODERATOR'
          else if (roles.includes('STAFF')) role = 'STAFF'
          setCurrentUserRole(role)
        }
      } catch {
        toast.error('Failed to load user information')
      }
    }
    fetchUserInfo()
  }, [])

  const users: UserRow[] = useMemo(() => {
    return (data?.items || []).map((u: AdminUser) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      isActive: u.isActive,
    }))
  }, [data])

  // Role-based access control for actions (SUPER_ADMIN is Mayor role)
  const canCreateUsers = currentUserRole === 'SUPER_ADMIN'
  const canEditUsers = currentUserRole === 'SUPER_ADMIN'
  const canViewAllUsers = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'DEPT_ADMIN'

  const columns = [
    createSelectColumn<UserRow>(),
    { accessorKey: 'name', header: 'Name', cell: ({ row }: { row: { original: UserRow } }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: 'email', header: 'Email', cell: ({ row }: { row: { original: UserRow } }) => <span>{row.original.email}</span> },
    { accessorKey: 'role', header: 'Role', cell: ({ row }: { row: { original: UserRow } }) => (
      <Badge variant="outline" className="uppercase text-xs">
        <Shield className="h-3 w-3 mr-1" />
        {row.original.role}
      </Badge>
    )},
    { accessorKey: 'createdAt', header: 'Joined', cell: ({ row }: { row: { original: UserRow } }) => { const d = new Date(row.original.createdAt); return <span>{d.toLocaleDateString()}</span> } },
    { accessorKey: 'isActive', header: 'Active', cell: ({ row }: { row: { original: UserRow } }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? 'Active' : 'Inactive'}
      </Badge>
    )},
    ...(canEditUsers ? [{
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: UserRow } }) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="outline">
            {row.original.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      )
    }] : [])
  ]

  // Access denied for roles without permission
  if (!canViewAllUsers) {
    return (
      <OfficialLayout>
        <main className="py-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Access Denied
                </CardTitle>
                <CardDescription>
                  You do not have permission to view user management. Only Mayors and Super Admins can manage users.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Current role: <Badge variant="outline">{currentUserRole}</Badge>
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Contact your system administrator if you believe you should have access.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </OfficialLayout>
    )
  }

  return (
    <OfficialLayout>
      <main className="py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Role-based header */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <AnimatedHeading as="h1" className="text-2xl font-bold text-slate-900">User Management</AnimatedHeading>
                <p className="text-sm text-slate-600">
                  {currentUserRole === 'SUPER_ADMIN' && 'Full system control - Mayor level access to all users and administrators'}
                  {currentUserRole === 'DEPT_ADMIN' && 'Department view - Read-only access to staff in your department'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {canCreateUsers && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New User
                  </Button>
                )}
              </div>
            </div>

            {/* Access level indicator */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium">Access Level: {currentUserRole}</p>
                      <p className="text-xs text-slate-500">
                        {currentUserRole === 'SUPER_ADMIN' && 'Full CRUD access to all users (Mayor level)'}
                        {currentUserRole === 'DEPT_ADMIN' && 'Read-only access to department staff'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={canEditUsers ? "default" : "secondary"}>
                    {canEditUsers ? "Full Access" : "Read Only"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Users</CardTitle>
              <CardDescription>Manage administrator and staff accounts.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={users}
                loading={isLoading || isRefetching}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </OfficialLayout>
  )
}
