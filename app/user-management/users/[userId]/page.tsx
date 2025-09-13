"use client"

import { useSession } from "next-auth/react"
import { redirect, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  ArrowLeft,
  Edit
} from "lucide-react"
import { useEffect, useState } from "react"
import { UserProvider, useUserContext } from "@/components/providers/user-provider"
import { MainLayout } from "@/components/layout/main-layout"
import Link from "next/link"

// Format date helper function
const formatDate = (dateValue: any) => {
  if (!dateValue) return 'Never'
    
  // Handle Firestore timestamp objects
  if (dateValue && typeof dateValue === 'object' && dateValue._seconds) {
    const date = new Date(dateValue._seconds * 1000)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  }
    
  // Handle regular date strings or Date objects
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  } catch {
    return 'Invalid Date'
  }
}

function UserDetailContent() {
  const { data: session, status } = useSession()
  const params = useParams()
  const userId = params.userId as string
  const { users, usersLoading, usersError } = useUserContext()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (users && userId) {
      const foundUser = users.find(u => u.id === userId)
      setUser(foundUser)
    }
  }, [users, userId])

  if (status === "loading" || usersLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }
  
  if (!session) {
    redirect("/auth")
  }

  const userRole = (session?.user as any)?.role || 'User'
  
  // Check if user has permission to view user details
  if (!['SuperAdmin', 'Admin'].includes(userRole)) {
    redirect("/user-management")
  }

  if (usersError) {
    return (
      <MainLayout>
        <div className="container mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="text-muted-foreground">{usersError}</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">User Not Found</h1>
            <p className="text-muted-foreground">The user with ID {userId} could not be found.</p>
            <Link href="/user-management/all">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Users
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
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

  return (
    <MainLayout>
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/user-management/all">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Users
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <User className="h-8 w-8" />
                User Details
              </h1>
              <p className="text-muted-foreground">
                Viewing details for {user.name}
              </p>
            </div>
          </div>
          <Link href={`/user-management/users/${userId}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </Button>
          </Link>
        </div>

        {/* User Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-lg font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Role & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <div className="mt-1">
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <p>{user.category}</p>
              </div>
              {user.subcategory && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subcategory</label>
                  <p>{user.subcategory}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activity Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p>{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                <p>{formatDate(user.lastLogin)}</p>
              </div>
              {user.suspendedUntil && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Suspended Until</label>
                  <p className="text-red-600">{user.suspendedUntil}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.phone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p>{user.phone}</p>
                </div>
              )}
              {user.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p>{user.address}</p>
                </div>
              )}
              {user.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="whitespace-pre-wrap">{user.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

export default function UserDetailPage() {
  return (
    <UserProvider>
      <UserDetailContent />
    </UserProvider>
  )
}