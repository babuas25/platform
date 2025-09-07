"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Download,
  ArrowUpDown
} from "lucide-react"
import { useState } from "react"
import { UserProvider, useUserContext } from "@/components/providers/user-provider"
import { UserFilters } from "@/lib/types/user"
import { MainLayout } from "@/components/layout/main-layout"
import { RoleManager } from "@/components/user-management/role-manager"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// import { CreateUserDialog } from "@/components/user-management/create-user-dialog"
import { Skeleton } from "@/components/ui/skeleton"

function AllUsersContent() {
  const { data: session, status } = useSession()
  const { users, usersLoading, usersError, setActive, setInactive, suspendFor, refetchUsers } = useUserContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortKey, setSortKey] = useState<"name" | "role" | "category" | "status" | "lastLogin" | "createdAt">("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800"
    case "Inactive":
      return "bg-red-100 text-red-800"
    case "Pending":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "SuperAdmin":
      return "bg-red-100 text-red-800"
    case "Admin":
      return "bg-orange-100 text-orange-800"
    case "Support":
    case "Key Manager":
    case "Research":
    case "Media":
    case "Sales":
      return "bg-blue-100 text-blue-800"
    case "Supplier":
    case "Service Provider":
      return "bg-purple-100 text-purple-800"
    case "Distributor":
    case "Franchise":
    case "B2B":
      return "bg-green-100 text-green-800"
    case "User":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

  if (status === "loading" || usersLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-80" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 sm:w-48 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-56" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="divide-y">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="grid grid-cols-7 gap-4 p-4">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-32" />
                      <div className="flex gap-1">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }
  
  if (!session) {
    redirect("/auth")
  }

  const userRole = (session?.user as any)?.role || 'User'
  
  // Check if user has permission to view all users
  if (!['SuperAdmin', 'Admin'].includes(userRole)) {
    redirect("/user-management")
  }

  // Filter users based on search term, role filter, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    const matchesStatus = filterStatus === "all" || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  // Sort users according to selected key and direction
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1
    switch (sortKey) {
      case "name":
        return a.name.localeCompare(b.name) * dir
      case "role":
        return a.role.localeCompare(b.role) * dir
      case "category":
        return a.category.localeCompare(b.category) * dir
      case "status":
        return a.status.localeCompare(b.status) * dir
      case "lastLogin": {
        // Handle potentially undefined lastLogin values
        const aDate = a.lastLogin ? new Date(a.lastLogin).getTime() : 0
        const bDate = b.lastLogin ? new Date(b.lastLogin).getTime() : 0
        return (aDate - bDate) * dir
      }
      case "createdAt": {
        // Handle potentially undefined createdAt values (defensive coding)
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return (aDate - bDate) * dir
      }
      default:
        return 0
    }
  })

  const uniqueRoles = Array.from(new Set(users.map(user => user.role)))

  if (usersError) {
    return <div>Error: {usersError}</div>
  }

  return (
    <MainLayout>
      <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            All Users
          </h1>
          <p className="text-muted-foreground">
            Showing all users across all categories ({filteredUsers.length} users)
          </p>
        </div>
        {/* Header actions removed: Export & Add User */}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="sm:w-40">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as any)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="role">Sort by Role</option>
                <option value="status">Sort by Status</option>
                <option value="lastLogin">Sort by Last Login</option>
                <option value="createdAt">Sort by Created</option>
              </select>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSortDir(prev => prev === "asc" ? "desc" : "asc")}>{sortDir === "asc" ? "Asc" : "Desc"}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>
            Manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button className="inline-flex items-center" onClick={() => toggleSort("name")}>User <ArrowUpDown className="ml-1 h-3 w-3" /></button>
                  </TableHead>
                  <TableHead>
                    <button className="inline-flex items-center" onClick={() => toggleSort("role")}>Role <ArrowUpDown className="ml-1 h-3 w-3" /></button>
                  </TableHead>
                  <TableHead>
                    <button className="inline-flex items-center" onClick={() => toggleSort("category")}>Category <ArrowUpDown className="ml-1 h-3 w-3" /></button>
                  </TableHead>
                  <TableHead>
                    <button className="inline-flex items-center" onClick={() => toggleSort("status")}>Status <ArrowUpDown className="ml-1 h-3 w-3" /></button>
                  </TableHead>
                  <TableHead>
                    <button className="inline-flex items-center" onClick={() => toggleSort("lastLogin")}>Last Login <ArrowUpDown className="ml-1 h-3 w-3" /></button>
                  </TableHead>
                  <TableHead>
                    <button className="inline-flex items-center" onClick={() => toggleSort("createdAt")}>Created <ArrowUpDown className="ml-1 h-3 w-3" /></button>
                  </TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleManager
                        userId={user.id}
                        userName={user.name}
                        currentRole={user.role}
                        onRoleChange={() => {
                          // Refresh the users list after role change
                          window.location.reload()
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.category}</div>
                        <div className="text-sm text-muted-foreground">{user.subcategory}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastLogin}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.createdAt}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={async () => { await setActive(user.id); refetchUsers(); }}>Activate</DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => { await setInactive(user.id); refetchUsers(); }}>Deactivate</DropdownMenuItem>
                            <div className="px-2 py-1 text-xs text-muted-foreground">Suspend</div>
                            {[
                              { label: '1 Day', days: 1 },
                              { label: '2 Days', days: 2 },
                              { label: '3 Days', days: 3 },
                              { label: '1 Week', days: 7 },
                              { label: '2 Weeks', days: 14 },
                              { label: '3 Weeks', days: 21 },
                              { label: '1 Month', days: 30 },
                            ].map(opt => (
                              <DropdownMenuItem key={opt.label} onClick={async () => {
                                const until = new Date();
                                until.setDate(until.getDate() + opt.days);
                                await suspendFor(user.id, until);
                                refetchUsers();
                              }}>{opt.label}</DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  )
}

export default function AllUsersPage() {
  return (
    <UserProvider>
      <AllUsersContent />
    </UserProvider>
  )
}
