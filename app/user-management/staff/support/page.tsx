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
  Headphones, 
  Search, 
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Download,
  Phone,
  MessageSquare,
  Clock
} from "lucide-react"
import { useState } from "react"

// Mock data for Support staff
const mockSupportStaff = [
  {
    id: 1,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    status: "Active",
    lastLogin: "2024-01-15 14:30",
    createdAt: "2023-08-10",
    ticketsResolved: 156,
    avgResponseTime: "2.5 hours",
    department: "Tier 1 Support"
  },
  {
    id: 2,
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    status: "Active",
    lastLogin: "2024-01-15 09:15",
    createdAt: "2023-09-05",
    ticketsResolved: 203,
    avgResponseTime: "1.8 hours",
    department: "Tier 2 Support"
  },
  {
    id: 3,
    name: "David Brown",
    email: "david.brown@example.com",
    status: "Active",
    lastLogin: "2024-01-14 16:45",
    createdAt: "2023-10-12",
    ticketsResolved: 89,
    avgResponseTime: "3.2 hours",
    department: "Tier 1 Support"
  },
  {
    id: 4,
    name: "Lisa Davis",
    email: "lisa.davis@example.com",
    status: "Inactive",
    lastLogin: "2024-01-10 11:20",
    createdAt: "2023-11-18",
    ticketsResolved: 134,
    avgResponseTime: "2.1 hours",
    department: "Tier 2 Support"
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

const getDepartmentColor = (department: string) => {
  switch (department) {
    case "Tier 1 Support":
      return "bg-blue-100 text-blue-800"
    case "Tier 2 Support":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function SupportStaffPage() {
  const { data: session, status } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  
  if (status === "loading") {
    return <div>Loading...</div>
  }
  
  if (!session) {
    redirect("/auth")
  }

  const userRole = (session?.user as any)?.role || 'User'
  
  // Check if user has permission to view support staff
  if (!['SuperAdmin', 'Admin', 'Staff'].includes(userRole)) {
    redirect("/user-management")
  }

  // Filter users based on search term
  const filteredUsers = mockSupportStaff.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Headphones className="h-8 w-8 text-blue-500" />
            Support Staff
          </h1>
          <p className="text-muted-foreground">
            Manage customer support and help desk staff ({filteredUsers.length} users)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Support Staff
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Support Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search support staff by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Support Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Support Staff List
          </CardTitle>
          <CardDescription>
            Customer support team members and their performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tickets Resolved</TableHead>
                  <TableHead>Avg Response Time</TableHead>
                  <TableHead>Last Login</TableHead>
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
                          <Headphones className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDepartmentColor(user.department)}>
                        {user.department}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {user.ticketsResolved}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {user.avgResponseTime}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastLogin}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
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

      {/* Support Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets Resolved</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">582</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground">
              -0.3h from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Support Staff</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Out of 4 total staff
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
