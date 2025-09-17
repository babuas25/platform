import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getAdminDb } from '@/lib/firebase-admin'
import { UserRole } from '@/lib/rbac'
import { CacheManager, CacheKeyGenerator, CacheConfigs } from '@/lib/cache-manager'

export async function GET(request: NextRequest) {
  try {
    // Check if Firebase is configured
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    const isDevelopment = process.env.NODE_ENV === 'development'
    const useDemoData = process.env.USE_DEMO_DATA === 'true'
    
    if (!projectId) {
      console.error('❌ Firebase not configured: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing')
      return NextResponse.json({
        error: 'Firebase not configured',
        message: 'Please configure Firebase environment variables in .env.local',
        details: 'Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID'
      }, { status: 500 })
    }
    
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserRole = (session.user as any)?.role as UserRole
    
    // If demo data is enabled and Firebase is not fully configured, return demo stats
    if (useDemoData || (!serviceAccountKey && isDevelopment)) {
      console.log('🎭 Using demo stats mode')
      return getDemoStatsResponse()
    }

    // Try to get from cache first
    const cacheKey = CacheKeyGenerator.userStats()
    const cachedStats = CacheManager.get('userStats', cacheKey, CacheConfigs.userStats)
    if (cachedStats) {
      console.log('[CACHE HIT] User stats from cache')
      return NextResponse.json(cachedStats, {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
          'X-Cache': 'HIT'
        }
      })
    }

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
    
    // Cache the result
    CacheManager.set('userStats', cacheKey, stats, CacheConfigs.userStats)

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        'X-Cache': 'MISS'
      }
    })

  } catch (error) {
    console.error('Error fetching user stats:', error)
    
    // If Firebase is not configured, provide a helpful message
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    if (!projectId) {
      return NextResponse.json({
        error: 'Firebase not configured',
        message: 'Please configure Firebase environment variables',
        instructions: [
          '1. Copy .env.example to .env.local',
          '2. Set up a Firebase project at https://console.firebase.google.com',
          '3. Fill in your Firebase configuration in .env.local',
          '4. Restart the development server'
        ]
      }, { status: 500 })
    }
    
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
        details: error instanceof Error ? error.message : 'Unknown error',
        message: 'Please check your Firebase configuration'
      },
      { status: 500 }
    )
  }
}

// Demo stats function for when Firebase is not configured
function getDemoStatsResponse() {
  const demoStats = {
    total: 5,
    active: 4,
    inactive: 0,
    pending: 1,
    suspended: 0,
    recentUsers: 5,
    roleStats: {
      'SuperAdmin': 1,
      'Admin': 1,
      'Support': 1,
      'User': 1,
      'Distributor': 1
    },
    categoryStats: {
      'Admin': 2,
      'Staff': 1,
      'Users': 1,
      'Agent': 1
    },
    lastUpdated: new Date().toISOString(),
    _meta: {
      mode: 'demo',
      message: 'Using demo data - Firebase not configured'
    }
  }
  
  return NextResponse.json(demoStats, {
    headers: {
      'Cache-Control': 'no-cache',
      'X-Demo-Mode': 'true',
      'X-Demo-Message': 'Using demo stats - Firebase not configured'
    }
  })
}