// Cache monitoring and analytics component
import { CacheManager } from './cache-manager'
import { CacheWarmup } from './cache-warmup'

interface CacheStats {
  size: number
  max: number
  hits: number
  misses: number
  sets: number
  hitRate: number
}

export interface CacheMetrics {
  name: string
  size: number
  max: number
  hits: number
  misses: number
  sets: number
  hitRate: number
  memoryUsage: number
  lastAccessed: string
}

export interface CacheMonitoringData {
  caches: CacheMetrics[]
  totalMemoryUsage: number
  overallHitRate: number
  totalRequests: number
  uptime: number
  lastWarmup: string | null
  recommendations: string[]
}

export class CacheMonitor {
  private static startTime = Date.now()
  private static lastWarmupTime: Date | null = null

  // Get comprehensive cache monitoring data
  static getMonitoringData(): CacheMonitoringData {
    const allStats = CacheManager.getStats()
    const caches: CacheMetrics[] = []
    let totalHits = 0
    let totalMisses = 0
    let totalSets = 0
    let totalMemoryUsage = 0

    // Process cache statistics
    Object.entries(allStats).forEach(([name, stats]) => {
      const cacheStats = stats as CacheStats
      const memoryEstimate = this.estimateMemoryUsage(cacheStats.size)
      totalMemoryUsage += memoryEstimate
      totalHits += cacheStats.hits
      totalMisses += cacheStats.misses
      totalSets += cacheStats.sets

      caches.push({
        name,
        size: cacheStats.size,
        max: cacheStats.max,
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        sets: cacheStats.sets,
        hitRate: cacheStats.hitRate,
        memoryUsage: memoryEstimate,
        lastAccessed: new Date().toISOString()
      })
    })

    const totalRequests = totalHits + totalMisses
    const overallHitRate = totalRequests > 0 ? totalHits / totalRequests : 0
    const uptime = Date.now() - this.startTime

    return {
      caches,
      totalMemoryUsage,
      overallHitRate,
      totalRequests,
      uptime,
      lastWarmup: this.lastWarmupTime?.toISOString() || null,
      recommendations: this.generateRecommendations(caches, overallHitRate)
    }
  }

  // Estimate memory usage for a cache
  private static estimateMemoryUsage(size: number): number {
    // Rough estimate: 1KB per cached item on average
    return size * 1024
  }

  // Generate cache optimization recommendations
  private static generateRecommendations(caches: CacheMetrics[], overallHitRate: number): string[] {
    const recommendations: string[] = []

    // Overall hit rate recommendations
    if (overallHitRate < 0.5) {
      recommendations.push('Overall hit rate is low. Consider warming up more frequently accessed data.')
    } else if (overallHitRate > 0.9) {
      recommendations.push('Excellent hit rate! Consider increasing cache sizes for better performance.')
    }

    // Individual cache recommendations
    caches.forEach(cache => {
      if (cache.hitRate < 0.3) {
        recommendations.push(`${cache.name} cache has low hit rate (${(cache.hitRate * 100).toFixed(1)}%). Review caching strategy.`)
      }

      if (cache.size / cache.max > 0.9) {
        recommendations.push(`${cache.name} cache is near capacity (${cache.size}/${cache.max}). Consider increasing max size.`)
      }

      if (cache.sets > 0 && cache.hits === 0) {
        recommendations.push(`${cache.name} cache has no hits. Check if cached data is being accessed correctly.`)
      }
    })

    // Memory usage recommendations
    const totalMemoryMB = caches.reduce((sum, cache) => sum + cache.memoryUsage, 0) / (1024 * 1024)
    if (totalMemoryMB > 100) {
      recommendations.push(`High memory usage detected (${totalMemoryMB.toFixed(1)}MB). Consider reducing cache sizes or TTL values.`)
    }

    return recommendations
  }

  // Performance health check
  static getHealthStatus(): { status: 'healthy' | 'warning' | 'critical', message: string } {
    const data = this.getMonitoringData()
    
    if (data.overallHitRate < 0.2) {
      return {
        status: 'critical',
        message: `Critical: Very low hit rate (${(data.overallHitRate * 100).toFixed(1)}%)`
      }
    }
    
    if (data.overallHitRate < 0.5) {
      return {
        status: 'warning',
        message: `Warning: Low hit rate (${(data.overallHitRate * 100).toFixed(1)}%)`
      }
    }

    const problematicCaches = data.caches.filter(cache => cache.hitRate < 0.3).length
    if (problematicCaches > 0) {
      return {
        status: 'warning',
        message: `Warning: ${problematicCaches} cache(s) have low hit rates`
      }
    }

    return {
      status: 'healthy',
      message: `Healthy: Hit rate ${(data.overallHitRate * 100).toFixed(1)}%`
    }
  }

  // Log cache performance summary
  static logPerformanceSummary(): void {
    const data = this.getMonitoringData()
    const health = this.getHealthStatus()
    
    console.log('\n=== CACHE PERFORMANCE SUMMARY ===')
    console.log(`Status: ${health.status.toUpperCase()} - ${health.message}`)
    console.log(`Overall Hit Rate: ${(data.overallHitRate * 100).toFixed(1)}%`)
    console.log(`Total Requests: ${data.totalRequests}`)
    console.log(`Memory Usage: ${(data.totalMemoryUsage / (1024 * 1024)).toFixed(1)}MB`)
    console.log(`Uptime: ${Math.floor(data.uptime / 1000)}s`)
    
    console.log('\nCache Details:')
    data.caches.forEach(cache => {
      console.log(`  ${cache.name}: ${cache.size}/${cache.max} items, ${(cache.hitRate * 100).toFixed(1)}% hit rate`)
    })

    if (data.recommendations.length > 0) {
      console.log('\nRecommendations:')
      data.recommendations.forEach(rec => console.log(`  • ${rec}`))
    }
    
    console.log('================================\n')
  }

  // Run warmup and update tracking
  static async runWarmup(): Promise<void> {
    this.lastWarmupTime = new Date()
    await CacheWarmup.warmupAll()
  }

  // Start periodic monitoring
  static startPeriodicMonitoring(intervalMinutes: number = 15): void {
    console.log(`[CACHE MONITOR] Starting periodic monitoring every ${intervalMinutes} minutes`)
    
    // Initial log
    setTimeout(() => this.logPerformanceSummary(), 5000)
    
    // Periodic logging
    setInterval(() => {
      this.logPerformanceSummary()
    }, intervalMinutes * 60 * 1000)
  }

  // Get cache stats for API endpoint
  static getCacheStatsForAPI() {
    const data = this.getMonitoringData()
    const health = this.getHealthStatus()

    return {
      health: health.status,
      message: health.message,
      metrics: {
        overallHitRate: data.overallHitRate,
        totalRequests: data.totalRequests,
        totalMemoryUsage: data.totalMemoryUsage,
        uptime: data.uptime,
        lastWarmup: data.lastWarmup
      },
      caches: data.caches.map(cache => ({
        name: cache.name,
        hitRate: cache.hitRate,
        size: cache.size,
        max: cache.max,
        memoryUsage: cache.memoryUsage
      })),
      recommendations: data.recommendations.slice(0, 5) // Limit to top 5 recommendations
    }
  }
}

export default CacheMonitor