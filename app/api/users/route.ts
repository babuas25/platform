import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getAdminDb } from '@/lib/firebase-admin'
import { canManageRole, getManageableRoles, UserRole } from '@/lib/rbac'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserRole = (session.user as any)?.role as UserRole
    const { name, email, role, phone, location } = await request.json()

    // Validate the role
    const validRoles: UserRole[] = ['SuperAdmin', 'Admin', 'Support', 'Key Manager', 'Research', 'Media', 'Sales', 'Supplier', 'Service Provider', 'Distributor', 'Franchise', 'B2B', 'User']
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
    try {
      const db = await getAdminDb()
      const userRef = db.collection('users').doc(email) // Using email as document ID
      const existingUser = await userRef.get()
      
      if (existingUser.exists) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 })
      }
    } catch (error) {
      // Fallback to client SDK methods if Admin SDK not available
      const { doc, getDoc } = await import('firebase/firestore')
      const db = await getAdminDb()
      const userRef = doc(db, 'users', email)
      const existingUser = await getDoc(userRef)
      
      if (existingUser.exists()) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 })
      }
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

    const now = new Date()
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
    try {
      const db = await getAdminDb()
      const userRef = db.collection('users').doc(email)
      await userRef.set(userData)
    } catch (error) {
      // Fallback to client SDK methods if Admin SDK not available
      const { doc, setDoc } = await import('firebase/firestore')
      const db = await getAdminDb()
      const userRef = doc(db, 'users', email)
      await setDoc(userRef, userData)
    }

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
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserRole = (session.user as any)?.role as UserRole
    const { searchParams } = new URL(request.url)
    
    // Check if this is a request for manageable roles (legacy endpoint)
    if (searchParams.has('roles')) {
      const manageableRoles = getManageableRoles(currentUserRole)
      return NextResponse.json({
        manageableRoles,
        currentUserRole
      })
    }

    // Otherwise, return list of users with filters
    let users: any[] = []
    
    try {
      const db = await getAdminDb()
      const usersRef = db.collection('users')
      let query: any = usersRef
      
      // Apply filters from query parameters
      const role = searchParams.get('role')
      const category = searchParams.get('category')
      const subcategory = searchParams.get('subcategory')
      const status = searchParams.get('status')
      const subscription = searchParams.get('subscription')
      const department = searchParams.get('department')
      const searchTerm = searchParams.get('search')
      
      if (role) query = query.where('role', '==', role)
      if (category) query = query.where('category', '==', category)
      if (subcategory) query = query.where('subcategory', '==', subcategory)
      if (status) query = query.where('status', '==', status)
      if (subscription) query = query.where('subscription', '==', subscription)
      if (department) query = query.where('department', '==', department)
      
      // Add ordering
      query = query.orderBy('createdAt', 'desc')
      
      const snapshot = await query.get()
      
      users = snapshot.docs.map((doc: any) => {
        const data = doc.data() as any
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt,
          updatedAt: data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt,
          lastLogin: data.lastLogin instanceof Date ? data.lastLogin.toISOString() : data.lastLogin
        }
      })
      
      // Apply text search filter if provided (client-side filtering)
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        users = users.filter((user: any) => 
          user.name?.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search) ||
          user.phone?.toLowerCase().includes(search) ||
          user.location?.toLowerCase().includes(search)
        )
      }
    } catch (error) {
      // Fallback to client SDK methods if Admin SDK not available
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore')
      
      const db = await getAdminDb()
      const usersRef = collection(db, 'users')
      let constraints: any[] = []
      
      // Apply filters from query parameters
      const role = searchParams.get('role')
      const category = searchParams.get('category')
      const subcategory = searchParams.get('subcategory')
      const status = searchParams.get('status')
      const subscription = searchParams.get('subscription')
      const department = searchParams.get('department')
      const searchTerm = searchParams.get('search')
      
      if (role) constraints.push(where('role', '==', role))
      if (category) constraints.push(where('category', '==', category))
      if (subcategory) constraints.push(where('subcategory', '==', subcategory))
      if (status) constraints.push(where('status', '==', status))
      if (subscription) constraints.push(where('subscription', '==', subscription))
      if (department) constraints.push(where('department', '==', department))
      
      // Add ordering
      constraints.push(orderBy('createdAt', 'desc'))
      
      // Build query
      const usersQuery = constraints.length > 0 
        ? query(usersRef, ...constraints)
        : usersRef
      
      const snapshot = await getDocs(usersQuery)
      users = snapshot.docs.map((doc: any) => {
        const data = doc.data() as any
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          lastLogin: data.lastLogin?.toDate?.()?.toISOString() || data.lastLogin
        }
      })
      
      // Apply text search filter if provided (client-side filtering)
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        users = users.filter((user: any) => 
          user.name?.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search) ||
          user.phone?.toLowerCase().includes(search) ||
          user.location?.toLowerCase().includes(search)
        )
      }
    }

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
