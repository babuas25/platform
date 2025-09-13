import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getAdminDb } from '@/lib/firebase-admin'
import { canManageRole, getManageableRoles, UserRole } from '@/lib/rbac'
import { validatePaginationParams, calculatePagination, PaginatedResponse } from '@/lib/pagination'
import { CacheManager, CacheKeyGenerator, CacheConfigs, CacheInvalidator } from '@/lib/cache-manager'
import { CacheInvalidationUtils } from '@/lib/cache-invalidation'

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
      
      // Invalidate user-related caches after successful creation
      CacheInvalidationUtils.invalidateUser(email, 'create')
      
    } catch (error) {
      // Fallback to client SDK methods if Admin SDK not available
      const { doc, setDoc } = await import('firebase/firestore')
      const db = await getAdminDb()
      const userRef = doc(db, 'users', email)
      await setDoc(userRef, userData)
      
      // Invalidate user-related caches after successful creation
      CacheInvalidationUtils.invalidateUser(email, 'create')
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

    // Get pagination parameters
    const paginationParams = validatePaginationParams({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      cursor: searchParams.get('cursor')
    })
    
    // Get filter parameters
    const filters = {
      role: searchParams.get('role'),
      category: searchParams.get('category'),
      subcategory: searchParams.get('subcategory'),
      status: searchParams.get('status'),
      subscription: searchParams.get('subscription'),
      department: searchParams.get('department'),
      search: searchParams.get('search')
    }

    // Generate cache key for this request
    const cacheKey = CacheKeyGenerator.usersList(filters, paginationParams.page, paginationParams.limit)
    
    // Try to get from cache first
    const cachedResult = CacheManager.get('usersList', cacheKey, CacheConfigs.usersList)
    if (cachedResult) {
      console.log('[CACHE HIT] Users list from cache')
      return NextResponse.json(cachedResult, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          'X-Cache': 'HIT'
        }
      })
    }

    // Otherwise, return list of users with filters and pagination
    let users: any[] = []
    let total = 0
    
    try {
      const db = await getAdminDb()
      const usersRef = db.collection('users')
      
      // Build base query with filters
      let baseQuery: any = usersRef
      
      if (filters.role) baseQuery = baseQuery.where('role', '==', filters.role)
      if (filters.category) baseQuery = baseQuery.where('category', '==', filters.category)
      if (filters.subcategory) baseQuery = baseQuery.where('subcategory', '==', filters.subcategory)
      if (filters.status) baseQuery = baseQuery.where('status', '==', filters.status)
      if (filters.subscription) baseQuery = baseQuery.where('subscription', '==', filters.subscription)
      if (filters.department) baseQuery = baseQuery.where('department', '==', filters.department)
      
      // Get total count for pagination (this will be expensive for large datasets)
      // In production, consider caching this or using approximate counts
      const countSnapshot = await baseQuery.get()
      let totalUsers = countSnapshot.size
      
      // Apply text search filter to count if provided (note: this is client-side filtering)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const allUsers = countSnapshot.docs.map((doc: any) => {
          const data = doc.data()
          return {
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            location: data.location || ''
          }
        })
        
        const filteredUsers = allUsers.filter((user: any) => 
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.phone.toLowerCase().includes(searchTerm) ||
          user.location.toLowerCase().includes(searchTerm)
        )
        totalUsers = filteredUsers.length
      }
      
      total = totalUsers
      
      // Build paginated query
      let paginatedQuery = baseQuery.orderBy('createdAt', 'desc')
      
      // Apply pagination
      if (paginationParams.page > 1) {
        const offset = (paginationParams.page - 1) * paginationParams.limit
        paginatedQuery = paginatedQuery.offset(offset)
      }
      
      paginatedQuery = paginatedQuery.limit(paginationParams.limit)
      
      const snapshot = await paginatedQuery.get()
      
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
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        users = users.filter((user: any) => 
          user.name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.phone?.toLowerCase().includes(searchTerm) ||
          user.location?.toLowerCase().includes(searchTerm)
        )
      }
    } catch (error) {
      // Fallback to client SDK methods if Admin SDK not available
      const { collection, getDocs, query, where, orderBy, limit } = await import('firebase/firestore')
      
      const db = await getAdminDb()
      const usersRef = collection(db, 'users')
      let constraints: any[] = []
      
      if (filters.role) constraints.push(where('role', '==', filters.role))
      if (filters.category) constraints.push(where('category', '==', filters.category))
      if (filters.subcategory) constraints.push(where('subcategory', '==', filters.subcategory))
      if (filters.status) constraints.push(where('status', '==', filters.status))
      if (filters.subscription) constraints.push(where('subscription', '==', filters.subscription))
      if (filters.department) constraints.push(where('department', '==', filters.department))
      
      // Add ordering
      constraints.push(orderBy('createdAt', 'desc'))
      
      // Get total count first (for client SDK, we need to get all to count)
      const countQuery = constraints.length > 0 
        ? query(usersRef, ...constraints.slice(0, -1)) // Remove orderBy for count
        : usersRef
      
      const countSnapshot = await getDocs(countQuery)
      let totalUsers = countSnapshot.size
      
      // Apply text search filter to count if provided
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const allUsers = countSnapshot.docs.map((doc: any) => {
          const data = doc.data()
          return {
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            location: data.location || ''
          }
        })
        
        const filteredUsers = allUsers.filter((user: any) => 
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.phone.toLowerCase().includes(searchTerm) ||
          user.location.toLowerCase().includes(searchTerm)
        )
        totalUsers = filteredUsers.length
      }
      
      total = totalUsers
      
      // Build paginated query
      let paginatedConstraints = [...constraints]
      
      // Apply pagination using limit and offset simulation
      if (paginationParams.page > 1) {
        // For client SDK, we'll use startAfter with a document snapshot approach
        // This is a simplified version - for production, implement proper cursor pagination
        const offset = (paginationParams.page - 1) * paginationParams.limit
        // Note: Firestore client SDK doesn't have offset, so we'll limit the results and skip in memory
        // This is not ideal for large datasets - consider using cursor-based pagination
      }
      
      const paginatedQuery = query(usersRef, ...paginatedConstraints, limit(paginationParams.limit * paginationParams.page))
      const snapshot = await getDocs(paginatedQuery)
      
      let allUsers = snapshot.docs.map((doc: any) => {
        const data = doc.data() as any
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          lastLogin: data.lastLogin?.toDate?.()?.toISOString() || data.lastLogin
        }
      })
      
      // Apply text search filter if provided
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        allUsers = allUsers.filter((user: any) => 
          user.name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.phone?.toLowerCase().includes(searchTerm) ||
          user.location?.toLowerCase().includes(searchTerm)
        )
      }
      
      // Apply pagination (simulate offset)
      const startIndex = (paginationParams.page - 1) * paginationParams.limit
      const endIndex = startIndex + paginationParams.limit
      users = allUsers.slice(startIndex, endIndex)
    }

    // Calculate pagination info
    const pagination = calculatePagination(
      paginationParams.page,
      paginationParams.limit,
      total,
      false, // hasMore - will be calculated based on total
      users.length > 0 ? users[users.length - 1].id : undefined, // nextCursor
      users.length > 0 ? users[0].id : undefined // prevCursor
    )
    
    // Create paginated response
    const response: PaginatedResponse<any> = {
      data: users,
      pagination,
      filters: {
        role: filters.role || undefined,
        category: filters.category || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined,
        department: filters.department || undefined,
        subscription: filters.subscription || undefined
      }
    }
    
    // Cache the result
    CacheManager.set('usersList', cacheKey, response, CacheConfigs.usersList)
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Cache': 'MISS'
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    
    // If Firebase is not available, return sample data for SuperAdmin
    if (error instanceof Error && error.message.includes('Firebase Admin SDK')) {
      console.log('Returning sample data due to Firebase unavailability')
      
      // Return sample user data when Firebase is not available
      const sampleUsers = [
        {
          id: 'sample-superadmin',
          name: 'SuperAdmin User',
          email: 'admin@example.com',
          role: 'SuperAdmin',
          category: 'Admin',
          subcategory: 'SuperAdmin',
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
      ]
      
      return NextResponse.json({ 
        users: sampleUsers,
        message: 'Using sample data - Firebase not configured' 
      })
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
