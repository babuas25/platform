"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  UserPlus, 
  Store,
  Building,
  Globe,
  ArrowRight,
  Users,
  UserPlus as AddUser
} from "lucide-react"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"

const agentSubcategories = [
  {
    title: "Distributor",
    description: "Product distributors and resellers",
    icon: Store,
    href: "/user-management/agent/distributor",
    count: "78",
    color: "bg-blue-500",
    allowedRoles: ['SuperAdmin', 'Admin', 'Agent']
  },
  {
    title: "Franchise",
    description: "Franchise owners and operators",
    icon: Building,
    href: "/user-management/agent/franchise",
    count: "45",
    color: "bg-green-500",
    allowedRoles: ['SuperAdmin', 'Admin', 'Agent']
  },
  {
    title: "B2B",
    description: "Business-to-business sales agents",
    icon: Globe,
    href: "/user-management/agent/b2b",
    count: "111",
    color: "bg-purple-500",
    allowedRoles: ['SuperAdmin', 'Admin', 'Agent']
  }
]

export default function AgentUsersPage() {
  const { data: session, status } = useSession()
  
  if (status === "loading") {
    return <div>Loading...</div>
  }
  
  if (!session) {
    redirect("/auth")
  }

  const userRole = (session?.user as any)?.role || 'User'
  
  // Check if user has permission to view agent users
  if (!['SuperAdmin', 'Admin', 'Agent'].includes(userRole)) {
    redirect("/user-management")
  }

  // Filter subcategories based on user role
  const accessibleSubcategories = agentSubcategories.filter(sub => 
    sub.allowedRoles.includes(userRole)
  )

  const totalAgents = agentSubcategories.reduce((sum, sub) => sum + parseInt(sub.count), 0)

  return (
    <MainLayout>
      <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserPlus className="h-8 w-8" />
            Agent Users
          </h1>
          <p className="text-muted-foreground">
            Manage sales agents and distributors
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            View All
          </Button>
          <Button size="sm">
            <AddUser className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Agent Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Statistics</CardTitle>
          <CardDescription>Overview of sales agents by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agentSubcategories.map((subcategory) => (
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
              <div className="text-3xl font-bold text-blue-600">{totalAgents}</div>
              <div className="text-sm text-muted-foreground">Total Agents</div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  )
}
