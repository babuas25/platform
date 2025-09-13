import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/lib/rbac'
import CacheMonitor from '@/lib/cache-monitor'
import { CacheWarmup } from '@/lib/cache-warmup'
import { CacheManager } from '@/lib/cache-manager'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserRole = (session.user as any)?.role as UserRole
    
    // Only SuperAdmin and Admin can view cache statistics
    if (!['SuperAdmin', 'Admin'].includes(currentUserRole)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Only SuperAdmin and Admin can access cache statistics.' 
      }, { status: 403 })
    }

    const cacheStats = CacheMonitor.getCacheStatsForAPI()
    
    return NextResponse.json(cacheStats, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error fetching cache statistics:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch cache statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserRole = (session.user as any)?.role as UserRole
    
    // Only SuperAdmin and Admin can trigger cache operations
    if (!['SuperAdmin', 'Admin'].includes(currentUserRole)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Only SuperAdmin and Admin can perform cache operations.' 
      }, { status: 403 })
    }

    const { action, cacheName } = await request.json()

    switch (action) {
      case 'warmup':
        await CacheWarmup.warmupAll()
        return NextResponse.json({
          message: 'Cache warmup completed successfully',
          timestamp: new Date().toISOString()
        })

      case 'clear':
        if (cacheName) {
          CacheManager.clear(cacheName)
          return NextResponse.json({
            message: `Cache '${cacheName}' cleared successfully`,
            timestamp: new Date().toISOString()
          })
        } else {
          CacheManager.clearAll()
          return NextResponse.json({
            message: 'All caches cleared successfully',
            timestamp: new Date().toISOString()
          })
        }

      case 'stats':
        const stats = CacheMonitor.getCacheStatsForAPI()
        return NextResponse.json(stats)

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: warmup, clear, stats' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error performing cache operation:', error)
    return NextResponse.json(
      { 
        error: 'Failed to perform cache operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}