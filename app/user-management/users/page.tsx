"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  ArrowRight,
  Users,
  UserPlus
} from "lucide-react"
import Link from "next/link"

const userSubcategories = [
  {
    title: "Public Users",
    description: "General public users and customers",
    icon: User,
    href: "/user-management/users/public",
    count: "743",
    color: "bg-cyan-500",
    allowedRoles: ['SuperAdmin', 'Admin']
  }
]

export default function PublicUsersPage() {
  const { data: session, status } = useSession()
  
  if (status === "loading") {
    return <div>Loading...</div>
  }
  
  if (!session) {
    redirect("/auth")
  }

  const userRole = (session?.user as any)?.role || 'User'
  
  // Check if user has permission to view public users
  if (!['SuperAdmin', 'Admin'].includes(userRole)) {
    redirect("/user-management")
  }

  // Filter subcategories based on user role
  const accessibleSubcategories = userSubcategories.filter(sub => 
    sub.allowedRoles.includes(userRole)
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8" />
            Public Users
          </h1>
          <p className="text-muted-foreground">
            Manage public users and customers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            View All
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
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

      {/* Public Users Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Public Users Statistics</CardTitle>
          <CardDescription>Overview of public users and customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-500">743</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">689</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">54</div>
              <div className="text-sm text-muted-foreground">Inactive Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">127</div>
              <div className="text-sm text-muted-foreground">New This Month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
