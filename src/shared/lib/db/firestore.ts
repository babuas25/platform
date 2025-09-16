import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore'
import { db } from './firebase'
import { User, UserFilters, UserStats, CreateUserData, UpdateUserData } from './types/user'
const USERS_COLLECTION = 'users'

// Helper function to convert Firestore timestamp to string
const timestampToString = (timestamp: any): string => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate().toISOString()
  }
  return new Date().toISOString()
}

// Helper function to convert Firestore document to User object
const docToUser = (doc: QueryDocumentSnapshot<DocumentData>): User => {
  const data = doc.data()
  return {
    id: doc.id,
    name: data.name || '',
    email: data.email || '',
    role: data.role || 'User',
    category: data.category || 'Users',
    subcategory: data.subcategory || 'publicuser',
    status: data.status || 'Active',
    suspendedUntil: data.suspendedUntil ? timestampToString(data.suspendedUntil) : undefined,
    lastLogin: data.lastLogin ? timestampToString(data.lastLogin) : undefined,
    createdAt: data.createdAt ? timestampToString(data.createdAt) : new Date().toISOString(),
    updatedAt: data.updatedAt ? timestampToString(data.updatedAt) : new Date().toISOString(),
    avatar: data.avatar,
    phone: data.phone,
    location: data.location,
    department: data.department,
    permissions: data.permissions || [],
    securityLevel: data.securityLevel,
    subscription: data.subscription,
    ticketsResolved: data.ticketsResolved,
    avgResponseTime: data.avgResponseTime,
    performance: data.performance
  }
}

// Get all users with optional filtering
export const getUsers = async (filters?: UserFilters): Promise<User[]> => {
  try {
    let q = query(collection(db, USERS_COLLECTION))
    
    // Apply filters
    if (filters?.role) {
      q = query(q, where('role', '==', filters.role))
    }
    if (filters?.category) {
      q = query(q, where('category', '==', filters.category))
    }
    if (filters?.subcategory) {
      q = query(q, where('subcategory', '==', filters.subcategory))
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status))
    }
    if (filters?.subscription) {
      q = query(q, where('subscription', '==', filters.subscription))
    }
    if (filters?.department) {
      q = query(q, where('department', '==', filters.department))
    }
    
    // Order by creation date
    q = query(q, orderBy('createdAt', 'desc'))
    
    const querySnapshot = await getDocs(q)
    let users = querySnapshot.docs.map(docToUser)

    // Auto-activate users whose suspension expired
    const nowIso = new Date().toISOString()
    const toActivate: { id: string }[] = []
    users = users.map(u => {
      if (u.status === 'Suspended' && u.suspendedUntil && u.suspendedUntil <= nowIso) {
        toActivate.push({ id: u.id })
        return { ...u, status: 'Active', suspendedUntil: undefined }
      }
      return u
    })
    // Fire and forget updates
    toActivate.forEach(async ({ id }) => {
      try {
        await updateUser(id, { status: 'Active', suspendedUntil: null })
      } catch {}
    })
    
    // Apply search filter (client-side for text search)
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      users = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      )
    }
    
    return users
  } catch (error) {
    console.error('Error getting users:', error)
    throw new Error('Failed to fetch users')
  }
}

// Get user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, id))
    if (userDoc.exists()) {
      return docToUser(userDoc as QueryDocumentSnapshot<DocumentData>)
    }
    return null
  } catch (error) {
    console.error('Error getting user:', error)
    throw new Error('Failed to fetch user')
  }
}

// Create new user
export const createUser = async (userData: CreateUserData): Promise<string> => {
  try {
    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, USERS_COLLECTION), {
      ...userData,
      status: 'Active',
      createdAt: now,
      updatedAt: now,
      lastLogin: null
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating user:', error)
    throw new Error('Failed to create user')
  }
}

// Update user
export const updateUser = async (id: string, userData: UpdateUserData): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, id)
    await updateDoc(userRef, {
      ...userData,
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error updating user:', error)
    throw new Error('Failed to update user')
  }
}

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, id))
  } catch (error) {
    console.error('Error deleting user:', error)
    throw new Error('Failed to delete user')
  }
}

// Get user statistics
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const allUsers = await getUsers()
    
    const stats: UserStats = {
      total: allUsers.length,
      active: allUsers.filter(user => user.status === 'Active').length,
      inactive: allUsers.filter(user => user.status === 'Inactive').length,
      byCategory: {
        Admin: 0,
        Staff: 0,
        Partner: 0,
        Agent: 0,
        Users: 0
      },
      byRole: {
        SuperAdmin: 0,
        Admin: 0,
        Support: 0,
        'Key Manager': 0,
        Research: 0,
        Media: 0,
        Sales: 0,
        Supplier: 0,
        'Service Provider': 0,
        Distributor: 0,
        Franchise: 0,
        B2B: 0,
        User: 0
      },
      byStatus: {
        Active: 0,
        Inactive: 0,
        Pending: 0,
        Suspended: 0
      },
      newThisMonth: 0,
      growthRate: 0
    }
    
    // Count by category
    allUsers.forEach(user => {
      stats.byCategory[user.category]++
      stats.byRole[user.role]++
      stats.byStatus[user.status]++
      
      // Count new users this month
      const userDate = new Date(user.createdAt)
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      if (userDate >= thisMonth) {
        stats.newThisMonth++
      }
    })
    
    // Calculate growth rate (simplified)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const lastMonthUsers = allUsers.filter(user => {
      const userDate = new Date(user.createdAt)
      return userDate < lastMonth
    }).length
    
    if (lastMonthUsers > 0) {
      stats.growthRate = ((stats.newThisMonth - lastMonthUsers) / lastMonthUsers) * 100
    }
    
    return stats
  } catch (error) {
    console.error('Error getting user stats:', error)
    throw new Error('Failed to fetch user statistics')
  }
}

// Update user last login
export const updateUserLastLogin = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      lastLogin: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error updating last login:', error)
    // Don't throw error for last login update as it's not critical
  }
}
