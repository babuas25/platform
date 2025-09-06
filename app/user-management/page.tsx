"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Shield, 
  UserCog, 
  UserCheck, 
  UserPlus,
  ArrowRight,
  Crown,
  Settings,
  Headphones,
  Key,
  Search,
  Camera,
  TrendingUp,
  Truck,
  Wrench,
  Store,
  Building,
  User,
  Globe
} from "lucide-react"
import Link from "next/link"
import { UserProvider, useUserContext } from "@/components/providers/user-provider"
import { MainLayout } from "@/components/layout/main-layout"

const userCategories = [
  {
    title: "All Users",
    description: "View and manage all users across all categories",
    icon: Users,
    href: "/user-management/all",
    color: "bg-blue-500",
    allowedRoles: ['SuperAdmin', 'Admin']
  },
  {
    title: "Admin",
    description: "Administrative users with system access",
    icon: Shield,
    href: "/user-management/admin",
    color: "bg-red-500",
    allowedRoles: ['SuperAdmin', 'Admin'],
    subcategories: [
      { name: "SuperAdmin", icon: Crown, href: "/user-management/admin/superadmin" },
      { name: "Admin", icon: Settings, href: "/user-management/admin/admin" }
    ]
  },
  {
    title: "Staff",
    description: "Internal staff members and employees",
    icon: UserCog,
    href: "/user-management/staff",
    color: "bg-green-500",
    allowedRoles: ['SuperAdmin', 'Admin', 'Staff'],
    subcategories: [
      { name: "Support", icon: Headphones, href: "/user-management/staff/support" },
      { name: "Key Manager", icon: Key, href: "/user-management/staff/key-manager" },
      { name: "Research", icon: Search, href: "/user-management/staff/research" },
      { name: "Media", icon: Camera, href: "/user-management/staff/media" },
      { name: "Sales", icon: TrendingUp, href: "/user-management/staff/sales" }
    ]
  },
  {
    title: "Partner",
    description: "Business partners and collaborators",
    icon: UserCheck,
    href: "/user-management/partner",
    color: "bg-purple-500",
    allowedRoles: ['SuperAdmin', 'Admin', 'Partner'],
    subcategories: [
      { name: "Supplier", icon: Truck, href: "/user-management/partner/supplier" },
      { name: "Service Provider", icon: Wrench, href: "/user-management/partner/service-provider" }
    ]
  },
  {
    title: "Agent",
    description: "Sales agents and distributors",
    icon: UserPlus,
    href: "/user-management/agent",
    color: "bg-orange-500",
    allowedRoles: ['SuperAdmin', 'Admin', 'Agent'],
    subcategories: [
      { name: "Distributor", icon: Store, href: "/user-management/agent/distributor" },
      { name: "Franchise", icon: Building, href: "/user-management/agent/franchise" },
      { name: "B2B", icon: Globe, href: "/user-management/agent/b2b" }
    ]
  },
  {
    title: "Users",
    description: "Public users and customers",
    icon: User,
    href: "/user-management/users",
    color: "bg-cyan-500",
    allowedRoles: ['SuperAdmin', 'Admin'],
    subcategories: [
      { name: "Public Users", icon: User, href: "/user-management/users/public" }
    ]
  }
]

function UserManagementContent() {
  const { data: session, status } = useSession()
  const { stats, statsLoading } = useUserContext()
  
  if (status === "loading" || statsLoading) {
    return <div>Loading...</div>
  }
  
  if (!session) {
    redirect("/auth")
  }

  const userRole = (session?.user as any)?.role || 'User'
  
  // Filter categories based on user role
  const accessibleCategories = userCategories.filter(category => 
    category.allowedRoles.includes(userRole)
  )

  // Get counts from real data
  const getCategoryCount = (category: string) => {
    if (!stats) return "0"
    switch (category) {
      case "All Users":
        return stats.total.toString()
      case "Admin":
        return stats.byCategory.Admin.toString()
      case "Staff":
        return stats.byCategory.Staff.toString()
      case "Partner":
        return stats.byCategory.Partner.toString()
      case "Agent":
        return stats.byCategory.Agent.toString()
      case "Users":
        return stats.byCategory.Users.toString()
      default:
        return "0"
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users across all categories and roles
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {userRole}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accessibleCategories.map((category) => (
          <Card key={category.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${category.color} text-white`}>
                  <category.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {getCategoryCount(category.title)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Subcategories:</h4>
                <div className="grid grid-cols-1 gap-1">
                  {category.subcategories?.map((sub) => (
                    <div key={sub.name} className="flex items-center space-x-2 text-sm">
                      <sub.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{sub.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href={category.href}>
                  Manage {category.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Statistics</CardTitle>
          <CardDescription>Overview of user distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {accessibleCategories.map((category) => (
              <div key={category.title} className="text-center">
                <div className={`text-2xl font-bold ${category.color.replace('bg-', 'text-')}`}>
                  {getCategoryCount(category.title)}
                </div>
                <div className="text-sm text-muted-foreground">{category.title}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  )
}

export default function UserManagementPage() {
  return (
    <UserProvider>
      <UserManagementContent />
    </UserProvider>
  )
}
