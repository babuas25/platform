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
  Settings, 
  Search, 
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Download,
  Shield
} from "lucide-react"
import { useState } from "react"

// Mock data for Admin users
const mockAdmins = [
  {
    id: 1,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "Active",
    lastLogin: "2024-01-15 11:20",
    createdAt: "2023-07-20",
    permissions: ["User Management", "Content Management", "Reports"],
    securityLevel: "High"
  },
  {
    id: 2,
    name: "David Wilson",
    email: "david.wilson@example.com",
    status: "Active",
    lastLogin: "2024-01-14 15:30",
    createdAt: "2023-09-10",
    permissions: ["User Management", "Content Management", "Reports"],
    securityLevel: "High"
  },
  {
    id: 3,
    name: "Lisa Brown",
    email: "lisa.brown@example.com",
    status: "Active",
    lastLogin: "2024-01-15 08:45",
    createdAt: "2023-10-15",
    permissions: ["User Management", "Content Management", "Reports"],
    securityLevel: "High"
  },
  {
    id: 4,
    name: "Robert Davis",
    email: "robert.davis@example.com",
    status: "Inactive",
    lastLogin: "2024-01-08 16:20",
    createdAt: "2023-11-05",
    permissions: ["User Management", "Content Management", "Reports"],
    securityLevel: "High"
  },
  {
    id: 5,
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    status: "Active",
    lastLogin: "2024-01-15 13:10",
    createdAt: "2023-12-01",
    permissions: ["User Management", "Content Management", "Reports"],
    securityLevel: "High"
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800"
    case "Inactive":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  
  if (status === "loading") {
    return <div>Loading...</div>
  }
  
  if (!session) {
    redirect("/auth")
  }

  const userRole = (session?.user as any)?.role || 'User'
  
  // Check if user has permission to view Admin users
  if (!['SuperAdmin', 'Admin'].includes(userRole)) {
    redirect("/user-management")
  }

  // Filter users based on search term
  const filteredUsers = mockAdmins.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-orange-500" />
            Admin Users
          </h1>
          <p className="text-muted-foreground">
            Manage administrative users with limited system access ({filteredUsers.length} users)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Admins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search Admin users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admin Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Users List
          </CardTitle>
          <CardDescription>
            Users with administrative privileges and system access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Security Level</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {user.name}
                          <Settings className="h-4 w-4 text-orange-500" />
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {user.securityLevel}
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
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Admin Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">User Management</h4>
              <p className="text-sm text-muted-foreground">
                Create, edit, and manage user accounts and roles
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Content Management</h4>
              <p className="text-sm text-muted-foreground">
                Manage system content, settings, and configurations
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Reports</h4>
              <p className="text-sm text-muted-foreground">
                Access and generate system reports and analytics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
