"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  UserCheck, 
  Truck,
  Wrench,
  ArrowRight,
  Users,
  UserPlus
} from "lucide-react"
import Link from "next/link"

const partnerSubcategories = [
  {
    title: "Supplier",
    description: "Product and service suppliers",
    icon: Truck,
    href: "/user-management/partner/supplier",
    count: "34",
    color: "bg-blue-500",
    allowedRoles: ['SuperAdmin', 'Admin', 'Partner']
  },
  {
    title: "Service Provider",
    description: "External service providers and contractors",
    icon: Wrench,
    href: "/user-management/partner/service-provider",
    count: "55",
    color: "bg-green-500",
    allowedRoles: ['SuperAdmin', 'Admin', 'Partner']
  }
]

export default function PartnerUsersPage() {
  const { data: session, status } = useSession()
  
  if (status === "loading") {
    return <div>Loading...</div>
  }
  
  if (!session) {
    redirect("/auth")
  }

  const userRole = (session?.user as any)?.role || 'User'
  
  // Check if user has permission to view partner users
  if (!['SuperAdmin', 'Admin', 'Partner'].includes(userRole)) {
    redirect("/user-management")
  }

  // Filter subcategories based on user role
  const accessibleSubcategories = partnerSubcategories.filter(sub => 
    sub.allowedRoles.includes(userRole)
  )

  const totalPartners = partnerSubcategories.reduce((sum, sub) => sum + parseInt(sub.count), 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCheck className="h-8 w-8" />
            Partner Users
          </h1>
          <p className="text-muted-foreground">
            Manage business partners and collaborators
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            View All
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Partner
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

      {/* Partner Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Statistics</CardTitle>
          <CardDescription>Overview of business partners by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partnerSubcategories.map((subcategory) => (
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
              <div className="text-3xl font-bold text-blue-600">{totalPartners}</div>
              <div className="text-sm text-muted-foreground">Total Partners</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
