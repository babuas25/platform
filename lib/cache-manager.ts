// Simple LRU Cache implementation without external dependencies
class SimpleLRUCache<K, V> {
  private cache = new Map<K, V>()
  private readonly maxSize: number
  private readonly ttlMs: number
  private timers = new Map<K, NodeJS.Timeout>()

  constructor(maxSize: number, ttlMs: number) {
    this.maxSize = maxSize
    this.ttlMs = ttlMs
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // Refresh TTL on access
      this.refreshTTL(key)
    }
    return value
  }

  set(key: K, value: V): void {
    // Remove oldest entry if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.delete(firstKey)
      }
    }

    this.cache.set(key, value)
    this.setTTL(key)
  }

  delete(key: K): boolean {
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
    return this.cache.delete(key)
  }

  clear(): void {
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }

  get max(): number {
    return this.maxSize
  }

  keys(): IterableIterator<K> {
    return this.cache.keys()
  }

  private setTTL(key: K): void {
    // Clear existing timer
    const existingTimer = this.timers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.delete(key)
    }, this.ttlMs)
    
    this.timers.set(key, timer)
  }

  private refreshTTL(key: K): void {
    if (this.cache.has(key)) {
      this.setTTL(key)
    }
  }
}

// Cache configuration interface
export interface CacheConfig {
  max: number  // Maximum number of items
  ttl: number  // Time to live in milliseconds
  updateAgeOnGet?: boolean
  allowStale?: boolean
}

// Cache entry metadata
export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
}

// Cache key generator
export class CacheKeyGenerator {
  static usersList(filters: Record<string, any>, page: number, limit: number): string {
    const filterStr = Object.keys(filters)
      .sort()
      .map(key => `${key}=${filters[key]}`)
      .join('&')
    return `users:list:${filterStr}:page=${page}:limit=${limit}`
  }

  static userById(id: string): string {
    return `user:${id}`
  }

  static userStats(): string {
    return 'users:stats'
  }

  static userRoles(userId: string): string {
    return `user:roles:${userId}`
  }

  static performanceStats(): string {
    return 'performance:stats'
  }

  static dbStatus(): string {
    return 'db:status'
  }
}

// Main cache manager
export class CacheManager {
  private static instances: Map<string, SimpleLRUCache<string, any>> = new Map()
  private static stats: Map<string, { hits: number; misses: number; sets: number }> = new Map()

  // Create or get cache instance
  static getCache(name: string, config: CacheConfig): SimpleLRUCache<string, any> {
    if (!this.instances.has(name)) {
      this.instances.set(name, new SimpleLRUCache(config.max, config.ttl))
      
      this.stats.set(name, { hits: 0, misses: 0, sets: 0 })
    }
    
    return this.instances.get(name)!
  }

  // Get from cache with statistics
  static get<T>(cacheName: string, key: string, config: CacheConfig): T | undefined {
    const cache = this.getCache(cacheName, config)
    const stats = this.stats.get(cacheName)!
    
    const value = cache.get(key)
    
    if (value !== undefined) {
      stats.hits++
      console.log(`[CACHE HIT] ${cacheName}:${key}`)
    } else {
      stats.misses++
      console.log(`[CACHE MISS] ${cacheName}:${key}`)
    }
    
    return value
  }

  // Set cache with statistics
  static set<T>(cacheName: string, key: string, value: T, config: CacheConfig): void {
    const cache = this.getCache(cacheName, config)
    const stats = this.stats.get(cacheName)!
    
    cache.set(key, value)
    stats.sets++
    
    console.log(`[CACHE SET] ${cacheName}:${key}`)
  }

  // Delete from cache
  static delete(cacheName: string, key: string): boolean {
    const cache = this.instances.get(cacheName)
    if (cache) {
      return cache.delete(key)
    }
    return false
  }

  // Clear entire cache
  static clear(cacheName: string): void {
    const cache = this.instances.get(cacheName)
    if (cache) {
      cache.clear()
      console.log(`[CACHE CLEAR] ${cacheName}`)
    }
  }

  // Clear all caches
  static clearAll(): void {
    this.instances.forEach((cache, name) => {
      cache.clear()
      console.log(`[CACHE CLEAR ALL] ${name}`)
    })
  }

  // Get cache statistics
  static getStats(cacheName?: string): any {
    if (cacheName) {
      const cache = this.instances.get(cacheName)
      const stats = this.stats.get(cacheName)
      
      if (cache && stats) {
        return {
          name: cacheName,
          size: cache.size,
          max: cache.max,
          ...stats,
          hitRate: stats.hits / (stats.hits + stats.misses) || 0
        }
      }
      return null
    }

    // Return stats for all caches
    const allStats: any = {}
    this.instances.forEach((cache, name) => {
      const stats = this.stats.get(name)!
      allStats[name] = {
        size: cache.size,
        max: cache.max,
        ...stats,
        hitRate: stats.hits / (stats.hits + stats.misses) || 0
      }
    })
    
    return allStats
  }

  // Invalidate cache by pattern
  static invalidatePattern(cacheName: string, pattern: string): number {
    const cache = this.instances.get(cacheName)
    if (!cache) return 0

    let deletedCount = 0
    const regex = new RegExp(pattern)
    
    // Convert keys to array to avoid iterator issues
    const keys = Array.from(cache.keys())
    keys.forEach(key => {
      if (regex.test(key)) {
        cache.delete(key)
        deletedCount++
      }
    })
    
    console.log(`[CACHE INVALIDATE] ${cacheName} pattern:${pattern} deleted:${deletedCount}`)
    return deletedCount
  }
}

// Predefined cache configurations
export const CacheConfigs = {
  // User data cache - 5 minutes TTL, max 1000 entries
  users: {
    max: 1000,
    ttl: 5 * 60 * 1000, // 5 minutes
    updateAgeOnGet: true,
    allowStale: false
  } as CacheConfig,

  // User list cache - 1 minute TTL, max 100 entries (frequently changing)
  usersList: {
    max: 100,
    ttl: 1 * 60 * 1000, // 1 minute
    updateAgeOnGet: true,
    allowStale: true
  } as CacheConfig,

  // User stats cache - 10 minutes TTL, max 10 entries
  userStats: {
    max: 10,
    ttl: 10 * 60 * 1000, // 10 minutes
    updateAgeOnGet: true,
    allowStale: true
  } as CacheConfig,

  // Performance data cache - 30 seconds TTL, max 50 entries
  performance: {
    max: 50,
    ttl: 30 * 1000, // 30 seconds
    updateAgeOnGet: false,
    allowStale: false
  } as CacheConfig,

  // Database status cache - 2 minutes TTL, max 5 entries
  dbStatus: {
    max: 5,
    ttl: 2 * 60 * 1000, // 2 minutes
    updateAgeOnGet: true,
    allowStale: true
  } as CacheConfig,

  // Session cache - 30 minutes TTL, max 500 entries
  session: {
    max: 500,
    ttl: 30 * 60 * 1000, // 30 minutes
    updateAgeOnGet: true,
    allowStale: false
  } as CacheConfig
}

// Cache wrapper for async functions
export const withCache = <T extends any[], R>(
  cacheName: string,
  keyGenerator: (...args: T) => string,
  config: CacheConfig,
  asyncFn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args)
    
    // Try to get from cache first
    const cached = CacheManager.get<R>(cacheName, key, config)
    if (cached !== undefined) {
      return cached
    }
    
    // Execute function and cache result
    try {
      const result = await asyncFn(...args)
      CacheManager.set(cacheName, key, result, config)
      return result
    } catch (error) {
      // Don't cache errors
      throw error
    }
  }
}

// Cache invalidation utilities
export class CacheInvalidator {
  // Invalidate user-related caches when user data changes
  static invalidateUser(userId: string): void {
    CacheManager.delete('users', CacheKeyGenerator.userById(userId))
    CacheManager.delete('users', CacheKeyGenerator.userRoles(userId))
    CacheManager.invalidatePattern('usersList', '.*') // Invalidate all user lists
    CacheManager.delete('userStats', CacheKeyGenerator.userStats())
  }

  // Invalidate user lists when filters might be affected
  static invalidateUserLists(affectedFilters?: string[]): void {
    if (affectedFilters) {
      affectedFilters.forEach(filter => {
        CacheManager.invalidatePattern('usersList', `.*${filter}=.*`)
      })
    } else {
      CacheManager.clear('usersList')
    }
    CacheManager.delete('userStats', CacheKeyGenerator.userStats())
  }

  // Invalidate all user-related caches
  static invalidateAllUsers(): void {
    CacheManager.clear('users')
    CacheManager.clear('usersList')
    CacheManager.clear('userStats')
  }

  // Invalidate performance stats
  static invalidatePerformance(): void {
    CacheManager.clear('performance')
  }

  // Invalidate database status
  static invalidateDbStatus(): void {
    CacheManager.clear('dbStatus')
  }
}

// Export default instance
export default CacheManager