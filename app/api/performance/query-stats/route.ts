import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { queryMonitor, IndexUsageTracker } from '@/lib/query-optimization'
import { UserRole } from '@/lib/rbac'
import { CacheManager, CacheKeyGenerator, CacheConfigs } from '@/lib/cache-manager'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserRole = (session.user as any)?.role as UserRole
    
    // Only SuperAdmin and Admin can view performance stats
    if (!['SuperAdmin', 'Admin'].includes(currentUserRole)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Only SuperAdmin and Admin can access performance statistics.' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const queryName = searchParams.get('query')

    if (queryName) {
      // Get stats for specific query
      const stats = queryMonitor.getQueryStats(queryName)
      if (!stats) {
        return NextResponse.json({ error: 'Query not found' }, { status: 404 })
      }
      
      return NextResponse.json({
        query: queryName,
        statistics: stats,
        timestamp: new Date().toISOString()
      })
    } else {
      // Try to get from cache first
      const cacheKey = CacheKeyGenerator.performanceStats()
      const cachedStats = CacheManager.get('performance', cacheKey, CacheConfigs.performance)
      if (cachedStats) {
        console.log('[CACHE HIT] Performance stats from cache')
        return NextResponse.json(cachedStats, {
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
            'X-Cache': 'HIT'
          }
        })
      }
      
      // Get all query statistics
      const allStats = queryMonitor.getAllStats()
      const indexUsage = IndexUsageTracker.getUsageStats()
      
      const performanceData = {
        queryStatistics: allStats,
        indexUsage: indexUsage,
        totalQueries: Object.keys(allStats).length,
        totalIndexPatterns: Object.keys(indexUsage).length,
        timestamp: new Date().toISOString(),
        performance: {
          environment: process.env.NODE_ENV,
          monitoring: 'enabled'
        }
      }
      
      // Cache the result
      CacheManager.set('performance', cacheKey, performanceData, CacheConfigs.performance)
      
      return NextResponse.json(performanceData, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          'X-Cache': 'MISS'
        }
      })
    }

  } catch (error) {
    console.error('Error fetching query statistics:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch query statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserRole = (session.user as any)?.role as UserRole
    
    // Only SuperAdmin can clear performance stats
    if (currentUserRole !== 'SuperAdmin') {
      return NextResponse.json({ 
        error: 'Only SuperAdmin can clear performance statistics.' 
      }, { status: 403 })
    }

    // Clear all performance metrics
    queryMonitor.clearMetrics()
    IndexUsageTracker.clearUsageStats()
    
    // Invalidate performance cache
    CacheManager.clear('performance')
    
    return NextResponse.json({
      message: 'Performance statistics cleared successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error clearing query statistics:', error)
    return NextResponse.json(
      { 
        error: 'Failed to clear query statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}