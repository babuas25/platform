"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserRole, canManageRole, getManageableRoles } from "@/lib/rbac"
import { useSession } from "next-auth/react"
import { Loader2, Shield, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface RoleManagerProps {
  userId: string
  userName: string
  currentRole: UserRole
  onRoleChange?: (newRole: UserRole) => void
}

export function RoleManager({ userId, userName, currentRole, onRoleChange }: RoleManagerProps) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentUserRole = (session?.user as any)?.role as UserRole
  const manageableRoles = getManageableRoles(currentUserRole)
  const canManage = canManageRole(currentUserRole, currentRole)

  const handleRoleChange = async () => {
    if (selectedRole === currentRole) {
      setOpen(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role')
      }

      toast.success(`Role updated from ${currentRole} to ${selectedRole}`)
      onRoleChange?.(selectedRole)
      setOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'SuperAdmin':
        return 'bg-red-100 text-red-800'
      case 'Admin':
        return 'bg-orange-100 text-orange-800'
      case 'Support':
      case 'Key Manager':
      case 'Research':
      case 'Media':
      case 'Sales':
        return 'bg-blue-100 text-blue-800'
      case 'Supplier':
      case 'Service Provider':
        return 'bg-purple-100 text-purple-800'
      case 'Distributor':
      case 'Franchise':
      case 'B2B':
        return 'bg-green-100 text-green-800'
      case 'User':
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!canManage) {
    return (
      <Badge className={getRoleColor(currentRole)}>
        {currentRole}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-6">
          <Badge className={getRoleColor(currentRole)}>
            {currentRole}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Change User Role
          </DialogTitle>
          <DialogDescription>
            Change the role for <strong>{userName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Role</label>
            <Badge className={getRoleColor(currentRole)}>
              {currentRole}
            </Badge>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Role</label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {manageableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(role)}>
                        {role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRole !== currentRole && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will change the user's role from <strong>{currentRole}</strong> to <strong>{selectedRole}</strong>.
                The user will immediately have access to their new role's permissions.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRoleChange} 
            disabled={loading || selectedRole === currentRole}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Role'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
