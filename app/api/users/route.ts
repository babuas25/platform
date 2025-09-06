import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/firebase'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { canManageRole, getManageableRoles, UserRole } from '@/lib/rbac'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserRole = (session.user as any).role as UserRole
    const { name, email, role, phone, location } = await request.json()

    // Validate the role
    const validRoles: UserRole[] = ['SuperAdmin', 'Admin', 'Staff', 'Partner', 'Agent', 'User']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if current user can create this role
    if (!canManageRole(currentUserRole, role)) {
      return NextResponse.json({ 
        error: `You don't have permission to create ${role} users` 
      }, { status: 403 })
    }

    // Check if user already exists
    const userRef = doc(db, 'users', email) // Using email as document ID
    const existingUser = await getDoc(userRef)
    
    if (existingUser.exists()) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
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

    const now = Timestamp.now()
    const userData = {
      name,
      email,
      role,
      category: getCategoryFromRole(role),
      subcategory: getSubcategoryFromRole(role),
      status: 'Pending', // New users start as pending until they complete registration
      phone: phone || null,
      location: location || null,
      createdAt: now,
      updatedAt: now,
      createdBy: session.user.email,
      lastLogin: null,
      // Add role-specific fields
      ...(role === 'Support' && {
        department: 'Tier 1 Support',
        ticketsResolved: 0,
        avgResponseTime: null
      }),
      ...(role === 'Key Manager' && {
        department: 'Key Accounts'
      }),
      ...(role === 'Research' && {
        department: 'R&D'
      }),
      ...(role === 'Media' && {
        department: 'Creative'
      }),
      ...(role === 'Sales' && {
        department: 'Sales'
      })
    }

    // Create the user document
    await setDoc(userRef, userData)

    return NextResponse.json({ 
      message: 'User created successfully',
      userId: email,
      user: {
        name,
        email,
        role,
        category: userData.category,
        subcategory: userData.subcategory,
        status: userData.status
      }
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserRole = (session.user as any).role as UserRole
    const manageableRoles = getManageableRoles(currentUserRole)

    return NextResponse.json({
      manageableRoles,
      currentUserRole
    })

  } catch (error) {
    console.error('Error getting user creation info:', error)
    return NextResponse.json(
      { error: 'Failed to get user creation info' },
      { status: 500 }
    )
  }
}
