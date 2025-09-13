// Advanced cache invalidation mechanisms and event-driven cache management
import { CacheManager, CacheInvalidator } from './cache-manager'
import { ApiResponseCache } from './api-response-cache'
import { CacheMonitor } from './cache-monitor'

export interface CacheInvalidationEvent {
  type: 'user' | 'data' | 'api' | 'global'
  action: 'create' | 'update' | 'delete' | 'bulk_update'
  entityId?: string
  affectedFields?: string[]
  timestamp: Date
  source: string
  metadata?: Record<string, any>
}

export interface CacheInvalidationRule {
  eventType: string
  cachePatterns: string[]
  cachesToClear: string[]
  delay?: number // Delay in milliseconds before invalidation
  condition?: (event: CacheInvalidationEvent) => boolean
}

export class AdvancedCacheInvalidator {
  private static rules: CacheInvalidationRule[] = []
  private static eventQueue: CacheInvalidationEvent[] = []
  private static isProcessing = false

  // Initialize default invalidation rules
  static initializeRules(): void {
    this.rules = [
      // User data changes
      {
        eventType: 'user:create',
        cachePatterns: ['users:list:.*', 'users:stats.*'],
        cachesToClear: ['usersList', 'userStats']
      },
      {
        eventType: 'user:update',
        cachePatterns: ['users:.*', 'users:list:.*', 'users:stats.*'],
        cachesToClear: ['users', 'usersList', 'userStats']
      },
      {
        eventType: 'user:delete',
        cachePatterns: ['users:.*', 'users:list:.*', 'users:stats.*'],
        cachesToClear: ['users', 'usersList', 'userStats']
      },
      {
        eventType: 'user:bulk_update',
        cachePatterns: ['users:list:.*', 'users:stats.*'],
        cachesToClear: ['usersList', 'userStats'],
        delay: 1000 // Delay to allow for bulk operations to complete
      },

      // Performance data changes
      {
        eventType: 'performance:update',
        cachePatterns: ['performance:.*'],
        cachesToClear: ['performance']
      },

      // API response changes
      {
        eventType: 'api:response_change',
        cachePatterns: ['api:.*'],
        cachesToClear: ['apiResponses']
      },

      // Global cache clearing
      {
        eventType: 'global:deployment',
        cachePatterns: ['.*'],
        cachesToClear: ['users', 'usersList', 'userStats', 'performance', 'apiResponses']
      }
    ]

    console.log('[CACHE INVALIDATION] Rules initialized:', this.rules.length)
  }

  // Add custom invalidation rule
  static addRule(rule: CacheInvalidationRule): void {
    this.rules.push(rule)
    console.log(`[CACHE INVALIDATION] Rule added: ${rule.eventType}`)
  }

  // Queue invalidation event
  static queueInvalidation(event: CacheInvalidationEvent): void {
    event.timestamp = new Date()
    this.eventQueue.push(event)
    
    console.log(`[CACHE INVALIDATION] Event queued: ${event.type}:${event.action}`)
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue()
    }
  }

  // Process invalidation queue
  private static async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return
    }

    this.isProcessing = true
    
    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!
        await this.processEvent(event)
      }
    } catch (error) {
      console.error('[CACHE INVALIDATION] Error processing queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  // Process individual invalidation event
  private static async processEvent(event: CacheInvalidationEvent): Promise<void> {
    const eventKey = `${event.type}:${event.action}`
    const matchingRules = this.rules.filter(rule => 
      rule.eventType === eventKey || rule.eventType === `${event.type}:*`
    )

    for (const rule of matchingRules) {
      // Check condition if specified
      if (rule.condition && !rule.condition(event)) {
        continue
      }

      // Apply delay if specified
      if (rule.delay) {
        await new Promise(resolve => setTimeout(resolve, rule.delay))
      }

      // Invalidate by patterns
      let totalInvalidated = 0
      for (const pattern of rule.cachePatterns) {
        for (const cacheName of rule.cachesToClear) {
          const count = CacheManager.invalidatePattern(cacheName, pattern)
          totalInvalidated += count
        }
      }

      // Invalidate API responses if applicable
      if (rule.cachesToClear.includes('apiResponses')) {
        for (const pattern of rule.cachePatterns) {
          totalInvalidated += ApiResponseCache.invalidateByPattern(pattern)
        }
      }

      console.log(`[CACHE INVALIDATION] Rule ${rule.eventType} processed: ${totalInvalidated} items invalidated`)
    }

    // Log event processing
    this.logInvalidationEvent(event, matchingRules.length)
  }

  // Log invalidation events for monitoring
  private static logInvalidationEvent(event: CacheInvalidationEvent, rulesProcessed: number): void {
    const logEntry = {
      timestamp: event.timestamp.toISOString(),
      eventType: `${event.type}:${event.action}`,
      entityId: event.entityId,
      affectedFields: event.affectedFields,
      rulesProcessed,
      source: event.source,
      metadata: event.metadata
    }

    console.log('[CACHE INVALIDATION] Event processed:', logEntry)
    
    // Store in monitoring system (could be extended to use external logging)
    CacheInvalidationMonitor.recordEvent(logEntry)
  }

  // Immediate invalidation (bypass queue)
  static async invalidateImmediate(event: CacheInvalidationEvent): Promise<void> {
    event.timestamp = new Date()
    await this.processEvent(event)
  }

  // Get queue status
  static getQueueStatus(): { queueLength: number; isProcessing: boolean; rulesCount: number } {
    return {
      queueLength: this.eventQueue.length,
      isProcessing: this.isProcessing,
      rulesCount: this.rules.length
    }
  }

  // Clear queue (for testing or emergency)
  static clearQueue(): void {
    this.eventQueue = []
    console.log('[CACHE INVALIDATION] Queue cleared')
  }
}

// Cache invalidation monitoring and analytics
export class CacheInvalidationMonitor {
  private static events: any[] = []
  private static maxEvents = 1000 // Keep last 1000 events

  // Record invalidation event
  static recordEvent(event: any): void {
    this.events.unshift(event)
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents)
    }
  }

  // Get invalidation statistics
  static getStatistics(hours: number = 24): any {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)
    const recentEvents = this.events.filter(event => 
      new Date(event.timestamp) > cutoffTime
    )

    const stats = {
      totalEvents: recentEvents.length,
      eventsByType: {} as Record<string, number>,
      eventsBySource: {} as Record<string, number>,
      rulesProcessed: recentEvents.reduce((sum, event) => sum + event.rulesProcessed, 0),
      averageRulesPerEvent: 0,
      timeRange: `${hours} hours`,
      oldestEvent: recentEvents.length > 0 ? recentEvents[recentEvents.length - 1].timestamp : null,
      newestEvent: recentEvents.length > 0 ? recentEvents[0].timestamp : null
    }

    // Calculate event type distribution
    recentEvents.forEach(event => {
      stats.eventsByType[event.eventType] = (stats.eventsByType[event.eventType] || 0) + 1
      stats.eventsBySource[event.source] = (stats.eventsBySource[event.source] || 0) + 1
    })

    // Calculate average rules per event
    stats.averageRulesPerEvent = recentEvents.length > 0 
      ? stats.rulesProcessed / recentEvents.length 
      : 0

    return stats
  }

  // Get recent events
  static getRecentEvents(limit: number = 50): any[] {
    return this.events.slice(0, limit)
  }

  // Clear event history
  static clearHistory(): void {
    this.events = []
    console.log('[CACHE INVALIDATION MONITOR] Event history cleared')
  }
}

// Utility functions for common invalidation scenarios
export class CacheInvalidationUtils {
  // Invalidate user-related caches
  static invalidateUser(userId: string, action: 'create' | 'update' | 'delete' = 'update'): void {
    AdvancedCacheInvalidator.queueInvalidation({
      type: 'user',
      action,
      entityId: userId,
      timestamp: new Date(),
      source: 'api'
    })
  }

  // Invalidate user list caches with specific filters
  static invalidateUserList(filters: string[] = []): void {
    AdvancedCacheInvalidator.queueInvalidation({
      type: 'user',
      action: 'bulk_update',
      affectedFields: filters,
      timestamp: new Date(),
      source: 'api'
    })
  }

  // Invalidate performance caches
  static invalidatePerformance(): void {
    AdvancedCacheInvalidator.queueInvalidation({
      type: 'data',
      action: 'update',
      timestamp: new Date(),
      source: 'performance_monitor'
    })
  }

  // Invalidate all caches (for deployments)
  static invalidateAll(source: string = 'deployment'): void {
    AdvancedCacheInvalidator.queueInvalidation({
      type: 'global',
      action: 'update',
      timestamp: new Date(),
      source
    })
  }

  // Schedule periodic cache clearing
  static schedulePeriodicInvalidation(intervalMinutes: number = 60): void {
    console.log(`[CACHE INVALIDATION] Scheduling periodic invalidation every ${intervalMinutes} minutes`)
    
    setInterval(() => {
      // Clear stale API response caches
      AdvancedCacheInvalidator.queueInvalidation({
        type: 'api',
        action: 'update',
        timestamp: new Date(),
        source: 'scheduled_cleanup'
      })
    }, intervalMinutes * 60 * 1000)
  }
}

// Initialize the invalidation system
AdvancedCacheInvalidator.initializeRules()

export default AdvancedCacheInvalidator