import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getAdminDb } from '@/lib/firebase-admin'
import { UserRole } from '@/lib/rbac'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserRole = (session.user as any)?.role as UserRole

    // Get all users
    let users: any[] = []
    
    try {
      const db = await getAdminDb()
      const usersRef = db.collection('users')
      const snapshot = await usersRef.get()
      users = snapshot.docs.map((doc: any) => doc.data())
    } catch (error) {
      // Fallback to client SDK methods if Admin SDK not available
      const { collection, getDocs } = await import('firebase/firestore')
      const db = await getAdminDb()
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      users = snapshot.docs.map((doc: any) => doc.data())
    }
    
    // Calculate statistics
    const total = users.length
    const activeUsers = users.filter(user => user.status === 'Active').length
    const inactiveUsers = users.filter(user => user.status === 'Inactive').length
    const pendingUsers = users.filter(user => user.status === 'Pending').length
    const suspendedUsers = users.filter(user => user.status === 'Suspended').length
    
    // Role statistics
    const roleStats = users.reduce((acc: Record<string, number>, user) => {
      const role = user.role || 'Unknown'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {})
    
    // Category statistics
    const categoryStats = users.reduce((acc: Record<string, number>, user) => {
      const category = user.category || 'Unknown'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})
    
    // Recent activity (users created in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentUsers = users.filter(user => {
      if (!user.createdAt) return false
      const createdDate = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt)
      return createdDate >= thirtyDaysAgo
    }).length

    const stats = {
      total,
      active: activeUsers,
      inactive: inactiveUsers,
      pending: pendingUsers,
      suspended: suspendedUsers,
      recentUsers,
      roleStats,
      categoryStats,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching user stats:', error)
    
    // If Firebase is not available, return sample stats
    if (error instanceof Error && error.message.includes('Firebase Admin SDK')) {
      console.log('Returning sample stats due to Firebase unavailability')
      
      const sampleStats = {
        total: 1,
        active: 1,
        inactive: 0,
        pending: 0,
        suspended: 0,
        recentUsers: 1,
        roleStats: {
          'SuperAdmin': 1
        },
        categoryStats: {
          'Admin': 1
        },
        lastUpdated: new Date().toISOString(),
        message: 'Using sample data - Firebase not configured'
      }
      
      return NextResponse.json(sampleStats)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch user statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}