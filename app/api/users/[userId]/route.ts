import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getAdminDb } from '@/lib/firebase-admin'
import { canManageRole, UserRole } from '@/lib/rbac'

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const db = await getAdminDb()
    const userRef = db.collection('users').doc(userId)
    const userSnap = await userRef.get()
    
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data()
    
    // Convert Firestore timestamps to ISO strings
    const user = {
      id: userId,
      ...userData,
      createdAt: userData?.createdAt instanceof Date ? userData.createdAt.toISOString() : userData?.createdAt,
      updatedAt: userData?.updatedAt instanceof Date ? userData.updatedAt.toISOString() : userData?.updatedAt,
      lastLogin: userData?.lastLogin instanceof Date ? userData.lastLogin.toISOString() : userData?.lastLogin
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserRole = (session.user as any)?.role as UserRole
    const { userId } = await params
    const db = await getAdminDb()
    const userRef = db.collection('users').doc(userId)
    const updateData = await request.json()

    // Get the current user data
    const userSnap = await userRef.get()
    
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentUserData = userSnap.data()
    if (!currentUserData) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 })
    }
    const targetUserRole = currentUserData.role as UserRole

    // Check if current user can manage the target user
    if (!canManageRole(currentUserRole, targetUserRole)) {
      return NextResponse.json({ 
        error: `You don't have permission to modify ${targetUserRole} users` 
      }, { status: 403 })
    }

    // Special check: SuperAdmin emails cannot be modified by others
    const superAdminEmails = ['babuas25@gmail.com', 'md.ashifbabu@gmail.com']
    if (superAdminEmails.includes(currentUserData.email) && session.user.email !== currentUserData.email) {
      return NextResponse.json({ 
        error: 'This SuperAdmin user cannot be modified' 
      }, { status: 403 })
    }

    // Validate role change if provided
    if (updateData.role && updateData.role !== targetUserRole) {
      if (!canManageRole(currentUserRole, updateData.role)) {
        return NextResponse.json({ 
          error: `You don't have permission to assign ${updateData.role} role` 
        }, { status: 403 })
      }
      
      // Prevent demotion of protected SuperAdmins
      if (superAdminEmails.includes(currentUserData.email) && updateData.role !== 'SuperAdmin') {
        return NextResponse.json({ 
          error: 'This user cannot be demoted from SuperAdmin' 
        }, { status: 403 })
      }
    }

    // Prepare update data
    const now = new Date()
    const updates = {
      ...updateData,
      updatedAt: now,
      updatedBy: session.user.email
    }

    // Update the user
    await userRef.update(updates)

    return NextResponse.json({ 
      message: 'User updated successfully',
      userId 
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserRole = (session.user as any)?.role as UserRole
    const { userId } = await params
    const db = await getAdminDb()
    const userRef = db.collection('users').doc(userId)

    // Get the current user data
    const userSnap = await userRef.get()
    
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data()
    if (!userData) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 })
    }
    const targetUserRole = userData.role as UserRole

    // Check if current user can delete the target user
    if (!canManageRole(currentUserRole, targetUserRole)) {
      return NextResponse.json({ 
        error: `You don't have permission to delete ${targetUserRole} users` 
      }, { status: 403 })
    }

    // Special check: SuperAdmin emails cannot be deleted
    const superAdminEmails = ['babuas25@gmail.com', 'md.ashifbabu@gmail.com']
    if (superAdminEmails.includes(userData.email)) {
      return NextResponse.json({ 
        error: 'SuperAdmin users cannot be deleted' 
      }, { status: 403 })
    }

    // Prevent self-deletion
    if (session.user.email === userData.email) {
      return NextResponse.json({ 
        error: 'You cannot delete your own account' 
      }, { status: 403 })
    }

    // Delete the user
    await userRef.delete()

    return NextResponse.json({ 
      message: 'User deleted successfully',
      userId 
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}