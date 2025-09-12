"use client"

import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
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
  ArrowUpDown,
  User,
  Shield,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronRight
} from "lucide-react"
import { useState } from "react"
import React from "react"
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
  const router = useRouter()
  const { users, usersLoading, usersError, setActive, setInactive, suspendFor, refetchUsers } = useUserContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortKey, setSortKey] = useState<"name" | "role" | "category" | "status" | "lastLogin" | "createdAt">("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [filtersExpanded, setFiltersExpanded] = useState(false)

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
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Users className="h-4 w-4 md:h-6 md:w-6" />
            All Users {users.length}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Showing all users across all categories
          </p>
        </div>
        {/* Header actions removed: Export & Add User */}
      </div>

      {/* Filters & Sorts - Responsive Behavior */}
      <Card>
        {/* Mobile: Collapsible Header */}
        <CardHeader 
          className="md:hidden py-3 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" 
          onClick={() => setFiltersExpanded(!filtersExpanded)}
        >
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter & Sorts
            </div>
            {filtersExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </CardTitle>
        </CardHeader>

        {/* Desktop: Always Visible Header */}
        <CardHeader className="hidden md:block pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter & Sorts
          </CardTitle>
        </CardHeader>

        {/* Mobile: Conditional Content | Desktop: Always Visible Content */}
        <CardContent className={`px-4 pb-4 pt-0 ${!filtersExpanded ? 'md:block hidden' : 'block md:block'}`}>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search Input - Takes more space */}
            <div className="flex-1 min-w-[280px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
            
            {/* Role Filter */}
            <div className="min-w-[140px]">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full h-9 px-3 py-1 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div className="min-w-[120px]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-9 px-3 py-1 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            
            {/* Sort By */}
            <div className="min-w-[160px]">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as any)}
                className="w-full h-9 px-3 py-1 border border-input bg-background rounded-md text-sm"
              >
                <option value="name">Sort by</option>
                <option value="name">Name</option>
                <option value="role">Role</option>
                <option value="status">Status</option>
                <option value="lastLogin">Last Login</option>
                <option value="createdAt">Created</option>
              </select>
            </div>
            
            {/* Sort Direction */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSortDir(prev => prev === "asc" ? "desc" : "asc")}
              className="h-9 px-2 min-w-[40px] flex items-center justify-center"
              title={`Sort ${sortDir === "asc" ? "Ascending" : "Descending"}`}
            >
              {sortDir === "asc" ? (
                <ArrowUpDown className="h-4 w-4 rotate-0" />
              ) : (
                <ArrowUpDown className="h-4 w-4 rotate-180" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table - Responsive Design */}
      <Card>
        <CardHeader className="py-2 space-y-0">
          <CardTitle className="text-lg mb-1">Users</CardTitle>
          <CardDescription className="mt-0">
            Manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border">
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
                  <React.Fragment key={user.id}>
                    <TableRow>
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setExpandedUserId(expandedUserId === user.id ? null : user.id)
                          }}
                          title={expandedUserId === user.id ? "Hide user details" : "View user details"}
                        >
                          {expandedUserId === user.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            router.push(`/user-management/users/${user.id}/edit`)
                          }}
                          title="Edit user"
                        >
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
                  {/* Desktop Expandable Details */}
                  {expandedUserId === user.id && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <div className="bg-gray-50 dark:bg-gray-900 border-t">
                          <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">User Details</h3>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setExpandedUserId(null)}
                              >
                                ✕
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Basic Information */}
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Basic Information
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                                    <p className="font-medium">{user.name}</p>
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                                    <p className="break-all">{user.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground">User ID</label>
                                    <p className="font-mono text-xs">{user.id}</p>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Role & Status */}
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Role & Status
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground">Role</label>
                                    <div className="mt-1">
                                      <Badge className={getRoleColor(user.role)} variant="secondary">
                                        {user.role}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                                    <div className="mt-1">
                                      <Badge className={getStatusColor(user.status)} variant="secondary">
                                        {user.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground">Category</label>
                                    <p>{user.category}</p>
                                    {user.subcategory && (
                                      <p className="text-xs text-muted-foreground">{user.subcategory}</p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Activity Information */}
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Activity
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground">Created At</label>
                                    <p>{user.createdAt || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground">Last Login</label>
                                    <p>{user.lastLogin || 'Never logged in'}</p>
                                  </div>
                                  {user.suspendedUntil && (
                                    <div>
                                      <label className="text-xs font-medium text-muted-foreground">Suspended Until</label>
                                      <p className="text-red-600 text-xs">{user.suspendedUntil}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 pt-4 border-t">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  router.push(`/user-management/users/${user.id}/edit`)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {sortedUsers.map((user) => (
              <Card key={user.id} className="relative">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header Row - User Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setExpandedUserId(expandedUserId === user.id ? null : user.id)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          {expandedUserId === user.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => router.push(`/user-management/users/${user.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => { await setActive(user.id); refetchUsers(); }}>Activate</DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => { await setInactive(user.id); refetchUsers(); }}>Deactivate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Role:</span>
                        <div className="mt-1">
                          <Badge className={`${getRoleColor(user.role)} text-xs px-2 py-1`} variant="secondary">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="mt-1">
                          <Badge className={`${getStatusColor(user.status)} text-xs px-2 py-1`} variant="secondary">
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <div className="font-medium text-xs mt-1">{user.category}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Login:</span>
                        <div className="text-xs mt-1">{user.lastLogin || 'Never'}</div>
                      </div>
                    </div>

                    {/* Expanded Details for Mobile */}
                    {expandedUserId === user.id && (
                      <div className="border-t pt-3 mt-3 space-y-3">
                        <div className="grid grid-cols-1 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">User ID:</span>
                            <div className="font-mono text-xs mt-1 break-all">{user.id}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Subcategory:</span>
                            <div className="text-xs mt-1">{user.subcategory || 'N/A'}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Created:</span>
                            <div className="text-xs mt-1">{user.createdAt || 'N/A'}</div>
                          </div>
                          {user.suspendedUntil && (
                            <div>
                              <span className="text-muted-foreground">Suspended Until:</span>
                              <div className="text-xs mt-1 text-red-600">{user.suspendedUntil}</div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/user-management/users/${user.id}/edit`)}
                            className="flex-1 text-xs h-8"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
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
