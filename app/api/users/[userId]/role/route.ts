import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/firebase'
import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore'
import { canManageRole, getManageableRoles, UserRole } from '@/lib/rbac'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserRole = (session.user as any).role as UserRole
    const { userId } = params
    const { role: newRole } = await request.json()

    // Validate the new role
    const validRoles: UserRole[] = ['SuperAdmin', 'Admin', 'Staff', 'Partner', 'Agent', 'User']
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if current user can manage this role
    if (!canManageRole(currentUserRole, newRole)) {
      return NextResponse.json({ 
        error: `You don't have permission to assign ${newRole} role` 
      }, { status: 403 })
    }

    // Get the target user
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data()
    const currentRole = userData.role as UserRole

    // Check if current user can manage the target user's current role
    if (!canManageRole(currentUserRole, currentRole)) {
      return NextResponse.json({ 
        error: `You don't have permission to modify ${currentRole} users` 
      }, { status: 403 })
    }

    // Special check: SuperAdmin emails cannot be demoted
    const superAdminEmails = ['babuas25@gmail.com', 'md.ashifbabu@gmail.com']
    if (superAdminEmails.includes(userData.email) && newRole !== 'SuperAdmin') {
      return NextResponse.json({ 
        error: 'This user cannot be demoted from SuperAdmin' 
      }, { status: 403 })
    }

    // Helper functions to get category and subcategory
    const getCategoryFromRole = (role: string): string => {
      switch (role) {
        case 'SuperAdmin':
        case 'Admin':
          return 'Admin'
        case 'Support':
        case 'Key Manager':
        case 'Research':
        case 'Media':
        case 'Sales':
          return 'Staff'
        case 'Supplier':
        case 'Service Provider':
          return 'Partner'
        case 'Distributor':
        case 'Franchise':
        case 'B2B':
          return 'Agent'
        case 'User':
        default:
          return 'Users'
      }
    }

    const getSubcategoryFromRole = (role: string): string => {
      switch (role) {
        case 'SuperAdmin':
          return 'SuperAdmin'
        case 'Admin':
          return 'Admin'
        case 'Support':
          return 'Support'
        case 'Key Manager':
          return 'Key Manager'
        case 'Research':
          return 'Research'
        case 'Media':
          return 'Media'
        case 'Sales':
          return 'Sales'
        case 'Supplier':
          return 'Supplier'
        case 'Service Provider':
          return 'Service Provider'
        case 'Distributor':
          return 'Distributor'
        case 'Franchise':
          return 'Franchise'
        case 'B2B':
          return 'B2B'
        case 'User':
        default:
          return 'publicuser'
      }
    }

    // Update the user's role
    await updateDoc(userRef, {
      role: newRole,
      category: getCategoryFromRole(newRole),
      subcategory: getSubcategoryFromRole(newRole),
      updatedAt: Timestamp.now(),
      updatedBy: session.user.email,
      roleChangeHistory: [
        ...(userData.roleChangeHistory || []),
        {
          from: currentRole,
          to: newRole,
          changedBy: session.user.email,
          changedAt: Timestamp.now(),
          reason: 'Role updated via user management'
        }
      ]
    })

    return NextResponse.json({ 
      message: `User role updated from ${currentRole} to ${newRole}`,
      previousRole: currentRole,
      newRole: newRole,
      updatedBy: session.user.email
    })

  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserRole = (session.user as any).role as UserRole
    const { userId } = params

    // Get the target user
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data()
    const manageableRoles = getManageableRoles(currentUserRole)

    return NextResponse.json({
      user: {
        id: userId,
        name: userData.name,
        email: userData.email,
        currentRole: userData.role,
        category: userData.category,
        subcategory: userData.subcategory,
        status: userData.status,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        roleChangeHistory: userData.roleChangeHistory || []
      },
      manageableRoles,
      canManage: canManageRole(currentUserRole, userData.role as UserRole)
    })

  } catch (error) {
    console.error('Error getting user role info:', error)
    return NextResponse.json(
      { error: 'Failed to get user role info' },
      { status: 500 }
    )
  }
}
