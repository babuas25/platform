"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  Crown, 
  Settings,
  ArrowRight,
  Users,
  UserPlus
} from "lucide-react"
import Link from "next/link"

const adminSubcategories = [
  {
    title: "SuperAdmin",
    description: "System administrators with full access",
    icon: Crown,
    href: "/user-management/admin/superadmin",
    count: "3",
    color: "bg-red-500",
    allowedRoles: ['SuperAdmin']
  },
  {
    title: "Admin",
    description: "Administrative users with limited system access",
    icon: Settings,
    href: "/user-management/admin/admin",
    count: "9",
    color: "bg-orange-500",
    allowedRoles: ['SuperAdmin', 'Admin']
  }
]

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  
  if (status === "loading") {
    return <div>Loading...</div>
  }
  
  if (!session) {
    redirect("/auth")
  }

  const userRole = (session?.user as any)?.role || 'User'
  
  // Check if user has permission to view admin users
  if (!['SuperAdmin', 'Admin'].includes(userRole)) {
    redirect("/user-management")
  }

  // Filter subcategories based on user role
  const accessibleSubcategories = adminSubcategories.filter(sub => 
    sub.allowedRoles.includes(userRole)
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Users
          </h1>
          <p className="text-muted-foreground">
            Manage administrative users and system access
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            View All
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accessibleSubcategories.map((subcategory) => (
          <Card key={subcategory.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${subcategory.color} text-white`}>
                  <subcategory.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{subcategory.title}</CardTitle>
                  <CardDescription>{subcategory.description}</CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {subcategory.count}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={subcategory.href}>
                  Manage {subcategory.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Statistics</CardTitle>
          <CardDescription>Overview of administrative users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">3</div>
              <div className="text-sm text-muted-foreground">SuperAdmins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">9</div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">12</div>
              <div className="text-sm text-muted-foreground">Total Admin Users</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
