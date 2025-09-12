"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  UserCog, 
  Headphones,
  Key,
  Search,
  Camera,
  TrendingUp,
  ArrowRight,
  Users,
  UserPlus
} from "lucide-react"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"

const staffSubcategories = [
  {
    title: "Support",
    description: "Customer support and help desk staff",
    icon: Headphones,
    href: "/user-management/staff/support",
    count: "45",
    color: "bg-blue-500",
    allowedRoles: ['SuperAdmin', 'Admin', 'Staff']
  },
  {
    title: "Key Manager",
    description: "Key account managers and relationship managers",
    icon: Key,
    href: "/user-management/staff/key-manager",
    count: "12",
    color: "bg-purple-500",
    allowedRoles: ['SuperAdmin', 'Admin', 'Staff']
  },
  {
    title: "Research",
    description: "Research and development team members",
    icon: Search,
    href: "/user-management/staff/research",
    count: "28",
    color: "bg-green-500",
    allowedRoles: ['SuperAdmin', 'Admin', 'Staff']
  },
  {
    title: "Media",
    description: "Media and content creation staff",
    icon: Camera,
    href: "/user-management/staff/media",
    count: "18",
    color: "bg-pink-500",
    allowedRoles: ['SuperAdmin', 'Admin', 'Staff']
  },
  {
    title: "Sales",
    description: "Sales team and business development staff",
    icon: TrendingUp,
    href: "/user-management/staff/sales",
    count: "53",
    color: "bg-orange-500",
    allowedRoles: ['SuperAdmin', 'Admin', 'Staff']
  }
]

export default function StaffUsersPage() {
  const { data: session, status } = useSession()
  
  if (status === "loading") {
    return <div>Loading...</div>
  }
  
  if (!session) {
    redirect("/auth")
  }

  const userRole = (session?.user as any)?.role || 'User'
  
  // Check if user has permission to view staff users
  if (!['SuperAdmin', 'Admin', 'Staff'].includes(userRole)) {
    redirect("/user-management")
  }

  // Filter subcategories based on user role
  const accessibleSubcategories = staffSubcategories.filter(sub => 
    sub.allowedRoles.includes(userRole)
  )

  const totalStaff = staffSubcategories.reduce((sum, sub) => sum + parseInt(sub.count), 0)

  return (
    <MainLayout>
      <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCog className="h-8 w-8" />
            Staff Users
          </h1>
          <p className="text-muted-foreground">
            Manage internal staff members and employees
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            View All
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Staff Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Statistics</CardTitle>
          <CardDescription>Overview of staff members by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {staffSubcategories.map((subcategory) => (
              <div key={subcategory.title} className="text-center">
                <div className={`text-2xl font-bold ${subcategory.color.replace('bg-', 'text-')}`}>
                  {subcategory.count}
                </div>
                <div className="text-sm text-muted-foreground">{subcategory.title}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalStaff}</div>
              <div className="text-sm text-muted-foreground">Total Staff Members</div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  )
}
