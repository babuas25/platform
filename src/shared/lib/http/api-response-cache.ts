// API response caching middleware with TTL strategies
import { NextRequest, NextResponse } from 'next/server'
import { CacheManager, CacheKeyGenerator, CacheConfigs } from './cache-manager'

export interface ApiCacheConfig {
  ttl: number // Time to live in milliseconds
  maxAge: number // Cache-Control max-age in seconds
  staleWhileRevalidate: number // Cache-Control stale-while-revalidate in seconds
  cacheKeyPattern?: string // Custom cache key pattern
  skipCache?: boolean // Skip caching for this request
  tags?: string[] // Cache tags for invalidation
}

interface CachedResponseData {
  body: any
  status: number
  headers: Record<string, string>
  timestamp: string
  tags: string[]
}

export const ApiCacheConfigs = {
  // Ultra-fast responses for static data
  static: {
    ttl: 60 * 60 * 1000, // 1 hour
    maxAge: 3600,
    staleWhileRevalidate: 7200
  } as ApiCacheConfig,

  // Fast responses for frequently accessed data
  frequent: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxAge: 300,
    staleWhileRevalidate: 600
  } as ApiCacheConfig,

  // Standard responses for regular data
  standard: {
    ttl: 2 * 60 * 1000, // 2 minutes
    maxAge: 120,
    staleWhileRevalidate: 240
  } as ApiCacheConfig,

  // Quick responses for dynamic data
  dynamic: {
    ttl: 30 * 1000, // 30 seconds
    maxAge: 30,
    staleWhileRevalidate: 60
  } as ApiCacheConfig,

  // Real-time data (minimal caching)
  realtime: {
    ttl: 5 * 1000, // 5 seconds
    maxAge: 5,
    staleWhileRevalidate: 10
  } as ApiCacheConfig
}

export class ApiResponseCache {
  // Generate cache key for API response
  static generateCacheKey(request: NextRequest, customPattern?: string): string {
    if (customPattern) {
      return customPattern
    }

    const url = new URL(request.url)
    const path = url.pathname
    const searchParams = url.searchParams

    // Sort search params for consistent keys
    const sortedParams = Array.from(searchParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    return `api:${path}${sortedParams ? `:${sortedParams}` : ''}`
  }

  // Check if response should be cached
  static shouldCache(request: NextRequest, response: Response): boolean {
    // Don't cache non-GET requests
    if (request.method !== 'GET') {
      return false
    }

    // Don't cache error responses
    if (!response.ok) {
      return false
    }

    // Don't cache responses with Set-Cookie headers
    if (response.headers.get('Set-Cookie')) {
      return false
    }

    // Don't cache responses marked as private
    const cacheControl = response.headers.get('Cache-Control')
    if (cacheControl?.includes('private') || cacheControl?.includes('no-cache')) {
      return false
    }

    return true
  }

  // Get cached response
  static async getCachedResponse(
    request: NextRequest, 
    config: ApiCacheConfig
  ): Promise<Response | null> {
    if (config.skipCache) {
      return null
    }

    const cacheKey = this.generateCacheKey(request, config.cacheKeyPattern)
    const cachedData = CacheManager.get<CachedResponseData>('apiResponses', cacheKey, {
      max: 500,
      ttl: config.ttl,
      updateAgeOnGet: true,
      allowStale: true
    })

    if (cachedData) {
      console.log(`[API CACHE HIT] ${request.url}`)
      
      // Create response from cached data
      const response = new NextResponse(JSON.stringify(cachedData.body), {
        status: cachedData.status,
        headers: {
          ...cachedData.headers,
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `public, max-age=${config.maxAge}, stale-while-revalidate=${config.staleWhileRevalidate}`
        }
      })

      return response
    }

    return null
  }

  // Cache response
  static async cacheResponse(
    request: NextRequest,
    response: Response,
    config: ApiCacheConfig
  ): Promise<void> {
    if (config.skipCache || !this.shouldCache(request, response)) {
      return
    }

    try {
      const responseBody = await response.clone().json()
      const cacheKey = this.generateCacheKey(request, config.cacheKeyPattern)

      const cacheData = {
        body: responseBody,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date().toISOString(),
        tags: config.tags || []
      }

      CacheManager.set('apiResponses', cacheKey, cacheData, {
        max: 500,
        ttl: config.ttl,
        updateAgeOnGet: true,
        allowStale: true
      })

      console.log(`[API CACHE SET] ${request.url} (TTL: ${config.ttl}ms)`)

    } catch (error) {
      console.error('[API CACHE] Failed to cache response:', error)
    }
  }

  // Invalidate cache by pattern
  static invalidateByPattern(pattern: string): number {
    return CacheManager.invalidatePattern('apiResponses', pattern)
  }

  // Invalidate cache by tags
  static invalidateByTags(tags: string[]): number {
    let deletedCount = 0
    
    tags.forEach(tag => {
      // This is a simplified implementation
      // In a production system, you'd maintain a tag-to-key mapping
      const pattern = `.*${tag}.*`
      deletedCount += CacheManager.invalidatePattern('apiResponses', pattern)
    })

    return deletedCount
  }
}

// Wrapper function for API routes with caching
export function withApiCache<T extends any[]>(
  config: ApiCacheConfig,
  handler: (request: NextRequest, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    // Try to get cached response first
    const cachedResponse = await ApiResponseCache.getCachedResponse(request, config)
    if (cachedResponse) {
      return cachedResponse
    }

    // Execute the original handler
    const response = await handler(request, ...args)

    // Cache the response if appropriate
    await ApiResponseCache.cacheResponse(request, response.clone(), config)

    // Add cache headers
    const enhancedResponse = new NextResponse(response.body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'X-Cache': 'MISS',
        'Cache-Control': `public, max-age=${config.maxAge}, stale-while-revalidate=${config.staleWhileRevalidate}`
      }
    })

    return enhancedResponse
  }
}

// Higher-order component for API route caching
export function apiCache(config: ApiCacheConfig) {
  return function decorator<T extends any[]>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(request: NextRequest, ...args: T) => Promise<Response>>
  ) {
    const originalMethod = descriptor.value!

    descriptor.value = async function(request: NextRequest, ...args: T): Promise<Response> {
      return withApiCache(config, originalMethod.bind(this))(request, ...args)
    }

    return descriptor
  }
}

// Cache configuration for specific endpoints
export const EndpointCacheConfigs: Record<string, ApiCacheConfig> = {
  '/api/users': ApiCacheConfigs.standard,
  '/api/users/stats': ApiCacheConfigs.frequent,
  '/api/performance/query-stats': ApiCacheConfigs.dynamic,
  '/api/database/status': ApiCacheConfigs.frequent,
  '/api/cache/stats': ApiCacheConfigs.realtime
}

// Get cache config for a given path
export function getCacheConfigForPath(path: string): ApiCacheConfig {
  return EndpointCacheConfigs[path] || ApiCacheConfigs.standard
}

export default ApiResponseCache