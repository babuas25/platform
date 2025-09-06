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
  Crown, 
  Search, 
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Download,
  Shield
} from "lucide-react"
import { useState } from "react"

// Mock data for SuperAdmin users
const mockSuperAdmins = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    status: "Active",
    lastLogin: "2024-01-15 14:30",
    createdAt: "2023-06-15",
    permissions: ["Full System Access", "User Management", "System Settings", "Audit Logs"],
    securityLevel: "Maximum"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    status: "Active",
    lastLogin: "2024-01-15 09:15",
    createdAt: "2023-08-20",
    permissions: ["Full System Access", "User Management", "System Settings", "Audit Logs"],
    securityLevel: "Maximum"
  },
  {
    id: 3,
    name: "Michael Chen",
    email: "michael.chen@example.com",
    status: "Inactive",
    lastLogin: "2024-01-10 16:45",
    createdAt: "2023-10-05",
    permissions: ["Full System Access", "User Management", "System Settings", "Audit Logs"],
    securityLevel: "Maximum"
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

export default function SuperAdminUsersPage() {
  const { data: session, status } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  
  if (status === "loading") {
    return <div>Loading...</div>
  }
  
  if (!session) {
    redirect("/auth")
  }

  const userRole = (session?.user as any)?.role || 'User'
  
  // Check if user has permission to view SuperAdmin users
  if (userRole !== 'SuperAdmin') {
    redirect("/user-management")
  }

  // Filter users based on search term
  const filteredUsers = mockSuperAdmins.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="h-8 w-8 text-red-500" />
            SuperAdmin Users
          </h1>
          <p className="text-muted-foreground">
            Manage SuperAdmin users with full system access ({filteredUsers.length} users)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add SuperAdmin
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search SuperAdmins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search SuperAdmin users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* SuperAdmin Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            SuperAdmin Users List
          </CardTitle>
          <CardDescription>
            Users with maximum system privileges and full access
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
                          <Crown className="h-4 w-4 text-red-500" />
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
                      <Badge variant="destructive">
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

      {/* Security Notice */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 text-sm">
            SuperAdmin users have full system access and can perform any action within the system. 
            Exercise extreme caution when managing these accounts and ensure proper security measures are in place.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
