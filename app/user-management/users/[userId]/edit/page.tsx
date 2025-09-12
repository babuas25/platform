"use client"

import { useSession } from "next-auth/react"
import { redirect, useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  ArrowLeft,
  Save,
  X
} from "lucide-react"
import { useEffect, useState } from "react"
import { UserProvider, useUserContext } from "@/components/providers/user-provider"
import { MainLayout } from "@/components/layout/main-layout"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

function UserEditContent() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string
  const { users, usersLoading, usersError } = useUserContext()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: '',
    category: '',
    subcategory: '',
    phone: '',
    address: '',
    notes: ''
  })

  useEffect(() => {
    if (users && userId) {
      const foundUser = users.find(u => u.id === userId)
      if (foundUser) {
        setUser(foundUser)
        setFormData({
          name: foundUser.name || '',
          email: foundUser.email || '',
          role: foundUser.role || '',
          status: foundUser.status || '',
          category: foundUser.category || '',
          subcategory: foundUser.subcategory || '',
          phone: foundUser.phone || '',
          address: foundUser.address || '',
          notes: foundUser.notes || ''
        })
      }
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
  
  // Check if user has permission to edit users
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Here you would typically make an API call to update the user
      // For now, we'll just show a success message and redirect
      
      toast({
        title: "User Updated",
        description: `Successfully updated ${formData.name}'s information.`,
      })
      
      // Redirect back to user detail page after successful update
      router.push(`/user-management/users/${userId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user information. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const roles = ['User', 'Admin', 'SuperAdmin', 'Support', 'Key Manager', 'Research', 'Media', 'Sales', 'Supplier', 'Service Provider', 'Distributor', 'Franchise', 'B2B']
  const statuses = ['Active', 'Inactive', 'Pending']
  const categories = ['Users', 'Agent', 'Partner', 'Staff']

  return (
    <MainLayout>
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/user-management/users/${userId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to User Details
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <User className="h-8 w-8" />
                Edit User
              </h1>
              <p className="text-muted-foreground">
                Editing {user.name}'s information
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
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
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                    required
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                    required
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    placeholder="Add any additional notes about this user..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Link href={`/user-management/users/${userId}`}>
              <Button type="button" variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default function UserEditPage() {
  return (
    <UserProvider>
      <UserEditContent />
    </UserProvider>
  )
}