// Cache warm-up utilities for frequently accessed data
import { CacheManager, CacheKeyGenerator, CacheConfigs } from '../../../../lib/cache-manager'
import { getAdminDb } from '../../../../lib/firebase-admin'

interface UserData {
  id?: string
  name?: string
  email?: string
  role?: string
  category?: string
  status?: string
  createdAt?: any
  updatedAt?: any
  lastLogin?: any
  [key: string]: any
}

export class CacheWarmup {
  // Warm up user statistics cache
  static async warmupUserStats(): Promise<void> {
    try {
      console.log('[CACHE WARMUP] Starting user stats warmup...')
      
      const db = await getAdminDb()
      const usersRef = db.collection('users')
      const snapshot = await usersRef.get()
      const users: UserData[] = snapshot.docs.map((doc: any) => doc.data())
      
      // Calculate statistics
      const total = users.length
      const activeUsers = users.filter((user: UserData) => user.status === 'Active').length
      const inactiveUsers = users.filter((user: UserData) => user.status === 'Inactive').length
      const pendingUsers = users.filter((user: UserData) => user.status === 'Pending').length
      const suspendedUsers = users.filter((user: UserData) => user.status === 'Suspended').length
      
      // Role statistics
      const roleStats = users.reduce((acc: Record<string, number>, user: UserData) => {
        const role = user.role || 'Unknown'
        acc[role] = (acc[role] || 0) + 1
        return acc
      }, {})
      
      // Category statistics
      const categoryStats = users.reduce((acc: Record<string, number>, user: UserData) => {
        const category = user.category || 'Unknown'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})
      
      // Recent activity (users created in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const recentUsers = users.filter((user: UserData) => {
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
      
      // Cache the stats
      const cacheKey = CacheKeyGenerator.userStats()
      CacheManager.set('userStats', cacheKey, stats, CacheConfigs.userStats)
      
      console.log('[CACHE WARMUP] User stats warmed up successfully')
    } catch (error) {
      console.error('[CACHE WARMUP] Failed to warm up user stats:', error)
    }
  }

  // Warm up frequently accessed users
  static async warmupFrequentUsers(): Promise<void> {
    try {
      console.log('[CACHE WARMUP] Starting frequent users warmup...')
      
      const db = await getAdminDb()
      const usersRef = db.collection('users')
      
      // Get SuperAdmin and Admin users (frequently accessed)
      const adminSnapshot = await usersRef.where('role', 'in', ['SuperAdmin', 'Admin']).get()
      const adminUsers = adminSnapshot.docs.map((doc: any) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt,
          updatedAt: data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt,
          lastLogin: data.lastLogin instanceof Date ? data.lastLogin.toISOString() : data.lastLogin
        }
      })
      
      // Cache each admin user
      adminUsers.forEach((user: UserData) => {
        const cacheKey = CacheKeyGenerator.userById(user.id!)
        CacheManager.set('users', cacheKey, user, CacheConfigs.users)
      })
      
      console.log(`[CACHE WARMUP] ${adminUsers.length} frequent users warmed up successfully`)
    } catch (error) {
      console.error('[CACHE WARMUP] Failed to warm up frequent users:', error)
    }
  }

  // Warm up default user lists
  static async warmupDefaultUserLists(): Promise<void> {
    try {
      console.log('[CACHE WARMUP] Starting default user lists warmup...')
      
      const commonFilters = [
        { role: 'SuperAdmin' },
        { role: 'Admin' },
        { status: 'Active' },
        { status: 'Pending' },
        { category: 'Admin' },
        { category: 'Staff' }
      ]
      
      const db = await getAdminDb()
      const usersRef = db.collection('users')
      
      for (const filters of commonFilters) {
        try {
          let query: any = usersRef
          
          // Apply filters
          Object.entries(filters).forEach(([key, value]) => {
            query = query.where(key, '==', value)
          })
          
          // Get first page with default pagination
          const snapshot = await query.orderBy('createdAt', 'desc').limit(10).get()
          const users = snapshot.docs.map((doc: any) => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt,
              updatedAt: data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt,
              lastLogin: data.lastLogin instanceof Date ? data.lastLogin.toISOString() : data.lastLogin
            }
          })
          
          // Create mock pagination response
          const response = {
            data: users,
            pagination: {
              page: 1,
              limit: 10,
              total: users.length,
              totalPages: 1,
              hasMore: false,
              hasPrev: false
            },
            filters
          }
          
          // Cache the result
          const cacheKey = CacheKeyGenerator.usersList(filters, 1, 10)
          CacheManager.set('usersList', cacheKey, response, CacheConfigs.usersList)
          
        } catch (filterError) {
          console.error(`[CACHE WARMUP] Failed to warm up list for filters ${JSON.stringify(filters)}:`, filterError)
        }
      }
      
      console.log('[CACHE WARMUP] Default user lists warmed up successfully')
    } catch (error) {
      console.error('[CACHE WARMUP] Failed to warm up default user lists:', error)
    }
  }

  // Run all warmup processes
  static async warmupAll(): Promise<void> {
    console.log('[CACHE WARMUP] Starting comprehensive cache warmup...')
    const startTime = Date.now()
    
    try {
      await Promise.allSettled([
        this.warmupUserStats(),
        this.warmupFrequentUsers(),
        this.warmupDefaultUserLists()
      ])
      
      const duration = Date.now() - startTime
      console.log(`[CACHE WARMUP] Comprehensive warmup completed in ${duration}ms`)
      
      // Log cache statistics
      const cacheStats = CacheManager.getStats()
      console.log('[CACHE WARMUP] Cache statistics:', cacheStats)
      
    } catch (error) {
      console.error('[CACHE WARMUP] Comprehensive warmup failed:', error)
    }
  }

  // Schedule periodic warmup
  static schedulePeriodicWarmup(intervalMinutes: number = 30): void {
    const intervalMs = intervalMinutes * 60 * 1000
    
    console.log(`[CACHE WARMUP] Scheduling periodic warmup every ${intervalMinutes} minutes`)
    
    setInterval(async () => {
      console.log('[CACHE WARMUP] Running scheduled warmup...')
      await this.warmupAll()
    }, intervalMs)
  }
}

// Cache preloader for critical data
export class CachePreloader {
  // Preload data based on user patterns
  static async preloadForUser(userRole: string): Promise<void> {
    try {
      console.log(`[CACHE PRELOAD] Preloading for user role: ${userRole}`)
      
      if (['SuperAdmin', 'Admin'].includes(userRole)) {
        // Preload admin-specific data
        await Promise.allSettled([
          CacheWarmup.warmupUserStats(),
          CacheWarmup.warmupDefaultUserLists()
        ])
      }
      
      console.log(`[CACHE PRELOAD] Preloading completed for ${userRole}`)
    } catch (error) {
      console.error('[CACHE PRELOAD] Preloading failed:', error)
    }
  }

  // Preload based on time of day
  static async preloadForTimeOfDay(): Promise<void> {
    const hour = new Date().getHours()
    
    // Peak hours (9 AM - 5 PM): preload more aggressively
    if (hour >= 9 && hour <= 17) {
      console.log('[CACHE PRELOAD] Peak hours detected, running full warmup')
      await CacheWarmup.warmupAll()
    } else {
      // Off-peak hours: preload essential data only
      console.log('[CACHE PRELOAD] Off-peak hours, running essential warmup')
      await CacheWarmup.warmupUserStats()
    }
  }
}

// Export default instance
export default CacheWarmup