import { 
  Query,
  QuerySnapshot,
  DocumentData,
  SnapshotMetadata
} from 'firebase/firestore'

export interface QueryPerformanceMetrics {
  queryDuration: number
  documentsRead: number
  fromCache: boolean
  hasPendingWrites: boolean
  isFromServerTimestampBehavior?: boolean
}

export interface OptimizedQueryBuilder {
  collection: string
  filters: QueryFilter[]
  sortBy?: SortField
  limit?: number
  startAfter?: any
}

export interface QueryFilter {
  field: string
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in'
  value: any
}

export interface SortField {
  field: string
  direction: 'asc' | 'desc'
}

/**
 * Query Performance Monitor
 * Tracks and logs query performance metrics for optimization
 */
export class QueryPerformanceMonitor {
  private static instance: QueryPerformanceMonitor
  private metrics: Map<string, QueryPerformanceMetrics[]> = new Map()
  private isEnabled: boolean = process.env.NODE_ENV === 'development'

  static getInstance(): QueryPerformanceMonitor {
    if (!QueryPerformanceMonitor.instance) {
      QueryPerformanceMonitor.instance = new QueryPerformanceMonitor()
    }
    return QueryPerformanceMonitor.instance
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  /**
   * Monitor a query execution and collect performance metrics
   */
  async monitorQuery<T = DocumentData>(
    queryName: string,
    queryExecution: () => Promise<QuerySnapshot<T>>
  ): Promise<QuerySnapshot<T>> {
    if (!this.isEnabled) {
      return await queryExecution()
    }

    const startTime = performance.now()
    
    try {
      const snapshot = await queryExecution()
      const endTime = performance.now()
      
      const metrics: QueryPerformanceMetrics = {
        queryDuration: endTime - startTime,
        documentsRead: snapshot.size,
        fromCache: snapshot.metadata.fromCache,
        hasPendingWrites: snapshot.metadata.hasPendingWrites
      }

      this.recordMetrics(queryName, metrics)
      this.logPerformance(queryName, metrics)
      
      return snapshot
    } catch (error) {
      const endTime = performance.now()
      console.error(`Query "${queryName}" failed after ${endTime - startTime}ms:`, error)
      throw error
    }
  }

  /**
   * Record metrics for analysis
   */
  private recordMetrics(queryName: string, metrics: QueryPerformanceMetrics): void {
    if (!this.metrics.has(queryName)) {
      this.metrics.set(queryName, [])
    }
    
    const queryMetrics = this.metrics.get(queryName)!
    queryMetrics.push(metrics)
    
    // Keep only last 100 metrics per query
    if (queryMetrics.length > 100) {
      queryMetrics.shift()
    }
  }

  /**
   * Log performance information
   */
  private logPerformance(queryName: string, metrics: QueryPerformanceMetrics): void {
    const { queryDuration, documentsRead, fromCache } = metrics
    
    // Log slow queries (>200ms)
    if (queryDuration > 200) {
      console.warn(`🐌 Slow Query Detected: "${queryName}"`, {
        duration: `${queryDuration.toFixed(2)}ms`,
        documents: documentsRead,
        cached: fromCache
      })
    } else if (queryDuration > 100) {
      console.log(`⚠️ Moderate Query: "${queryName}"`, {
        duration: `${queryDuration.toFixed(2)}ms`,
        documents: documentsRead,
        cached: fromCache
      })
    } else {
      console.log(`✅ Fast Query: "${queryName}"`, {
        duration: `${queryDuration.toFixed(2)}ms`,
        documents: documentsRead,
        cached: fromCache
      })
    }
  }

  /**
   * Get performance statistics for a specific query
   */
  getQueryStats(queryName: string): {
    totalExecutions: number
    averageDuration: number
    minDuration: number
    maxDuration: number
    cacheHitRate: number
  } | null {
    const queryMetrics = this.metrics.get(queryName)
    if (!queryMetrics || queryMetrics.length === 0) {
      return null
    }

    const durations = queryMetrics.map(m => m.queryDuration)
    const cacheHits = queryMetrics.filter(m => m.fromCache).length

    return {
      totalExecutions: queryMetrics.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      cacheHitRate: (cacheHits / queryMetrics.length) * 100
    }
  }

  /**
   * Get all query statistics
   */
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {}
    
    this.metrics.forEach((_, queryName) => {
      stats[queryName] = this.getQueryStats(queryName)
    })
    
    return stats
  }

  /**
   * Clear all recorded metrics
   */
  clearMetrics(): void {
    this.metrics.clear()
  }
}

/**
 * Query Optimizer
 * Provides recommendations for query optimization
 */
export class QueryOptimizer {
  /**
   * Analyze query patterns and suggest optimizations
   */
  static analyzeQuery(builder: OptimizedQueryBuilder): {
    hasOptimalIndexes: boolean
    recommendations: string[]
    estimatedPerformance: 'excellent' | 'good' | 'moderate' | 'poor'
  } {
    const recommendations: string[] = []
    let hasOptimalIndexes = true
    let estimatedPerformance: 'excellent' | 'good' | 'moderate' | 'poor' = 'excellent'

    // Check for common anti-patterns
    
    // 1. Too many filters without proper indexing
    if (builder.filters.length > 3) {
      recommendations.push(
        'Consider reducing the number of filters or ensure composite indexes exist for this combination'
      )
      estimatedPerformance = 'moderate'
      hasOptimalIndexes = false
    }

    // 2. Range queries with inequality operators
    const rangeFilters = builder.filters.filter(f => 
      ['<', '<=', '>', '>=', '!='].includes(f.operator)
    )
    if (rangeFilters.length > 1) {
      recommendations.push(
        'Multiple range queries detected. Consider restructuring to use equality filters where possible'
      )
      estimatedPerformance = 'poor'
      hasOptimalIndexes = false
    }

    // 3. Sort field not in filters
    if (builder.sortBy && !builder.filters.some(f => f.field === builder.sortBy!.field)) {
      recommendations.push(
        `Sort field "${builder.sortBy.field}" should be included in composite indexes`
      )
      estimatedPerformance = 'moderate'
    }

    // 4. Large limit without pagination
    if (builder.limit && builder.limit > 50) {
      recommendations.push(
        'Large result sets detected. Consider implementing pagination for better performance'
      )
      estimatedPerformance = 'moderate'
    }

    // 5. No limit specified
    if (!builder.limit) {
      recommendations.push(
        'No limit specified. Always use .limit() to prevent unexpectedly large result sets'
      )
      estimatedPerformance = 'poor'
    }

    return {
      hasOptimalIndexes,
      recommendations,
      estimatedPerformance
    }
  }

  /**
   * Generate optimal query suggestions
   */
  static suggestOptimalQuery(builder: OptimizedQueryBuilder): OptimizedQueryBuilder {
    const optimized: OptimizedQueryBuilder = { ...builder }

    // Add default limit if not specified
    if (!optimized.limit) {
      optimized.limit = 20
    }

    // Optimize filter order (equality first, then range, then sort)
    const equalityFilters = builder.filters.filter(f => f.operator === '==')
    const rangeFilters = builder.filters.filter(f => f.operator !== '==')
    
    optimized.filters = [...equalityFilters, ...rangeFilters]

    // Ensure sort field is compatible with filters
    if (optimized.sortBy && rangeFilters.length > 0) {
      const rangeField = rangeFilters[0].field
      if (optimized.sortBy.field !== rangeField) {
        console.warn(
          `Sort field "${optimized.sortBy.field}" may not be optimal with range filter on "${rangeField}"`
        )
      }
    }

    return optimized
  }
}

/**
 * Index Usage Tracker
 * Tracks which indexes are being used for query optimization
 */
export class IndexUsageTracker {
  private static indexUsage: Map<string, number> = new Map()

  /**
   * Record index usage for a query
   */
  static recordIndexUsage(indexKey: string): void {
    const currentUsage = this.indexUsage.get(indexKey) || 0
    this.indexUsage.set(indexKey, currentUsage + 1)
  }

  /**
   * Get index usage statistics
   */
  static getUsageStats(): Record<string, number> {
    return Object.fromEntries(this.indexUsage)
  }

  /**
   * Generate index key from query filters
   */
  static generateIndexKey(filters: QueryFilter[], sortField?: SortField): string {
    const filterFields = filters.map(f => f.field).sort()
    const sortFieldName = sortField ? sortField.field : 'createdAt'
    return `${filterFields.join('+')}+${sortFieldName}`
  }

  /**
   * Clear usage statistics
   */
  static clearUsageStats(): void {
    this.indexUsage.clear()
  }
}

// Export singleton instance
export const queryMonitor = QueryPerformanceMonitor.getInstance()

// Helper function to monitor user queries specifically
export const monitorUserQuery = async <T = DocumentData>(
  queryName: string,
  queryExecution: () => Promise<QuerySnapshot<T>>
): Promise<QuerySnapshot<T>> => {
  return queryMonitor.monitorQuery(`users.${queryName}`, queryExecution)
}

// Helper function for query optimization analysis
export const analyzeUserQuery = (
  filters: QueryFilter[],
  sortBy?: SortField,
  limit?: number
): any => {
  const builder: OptimizedQueryBuilder = {
    collection: 'users',
    filters,
    sortBy,
    limit
  }
  
  const analysis = QueryOptimizer.analyzeQuery(builder)
  const optimized = QueryOptimizer.suggestOptimalQuery(builder)
  
  // Record index usage
  const indexKey = IndexUsageTracker.generateIndexKey(filters, sortBy)
  IndexUsageTracker.recordIndexUsage(indexKey)
  
  return {
    analysis,
    optimized,
    indexKey
  }
}