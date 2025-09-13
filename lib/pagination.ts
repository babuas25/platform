export interface PaginationParams {
  page: number
  limit: number
  cursor?: string
}

export interface PaginationInput {
  page?: string | number | null
  limit?: string | number | null
  cursor?: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
    nextCursor?: string
    prevCursor?: string
  }
  filters?: {
    role?: string
    category?: string
    status?: string
    search?: string
    department?: string
    subscription?: string
  }
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  nextCursor?: string
  prevCursor?: string
}

// Helper function to validate pagination parameters
export const validatePaginationParams = (params: PaginationInput): PaginationParams => {
  const page = Math.max(1, parseInt(String(params.page || 1)))
  const limit = Math.min(50, Math.max(5, parseInt(String(params.limit || 10)))) // Max 50, min 5
  
  return {
    page,
    limit,
    cursor: params.cursor || undefined
  }
}

// Helper function to calculate pagination info
export const calculatePagination = (
  page: number,
  limit: number,
  total: number,
  hasMore: boolean = false,
  nextCursor?: string,
  prevCursor?: string
): PaginationInfo => {
  const totalPages = Math.ceil(total / limit)
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: hasMore || page < totalPages,
    hasPrev: page > 1,
    nextCursor,
    prevCursor
  }
}

// Firebase Firestore pagination helper
export const createFirestorePaginationQuery = (
  baseQuery: any,
  params: PaginationParams,
  orderByField: string = 'createdAt',
  orderDirection: 'asc' | 'desc' = 'desc'
) => {
  let paginatedQuery = baseQuery.orderBy(orderByField, orderDirection)
  
  // Apply cursor-based pagination if cursor is provided
  if (params.cursor) {
    // Note: In real implementation, you'd need to get the document snapshot
    // This is a simplified version - actual implementation would need document reference
    paginatedQuery = paginatedQuery.startAfter(params.cursor)
  } else if (params.page > 1) {
    // Offset-based pagination for non-cursor requests
    const offset = (params.page - 1) * params.limit
    paginatedQuery = paginatedQuery.offset(offset)
  }
  
  // Apply limit
  return paginatedQuery.limit(params.limit)
}

// URL search params helper for pagination
export const createPaginationSearchParams = (
  params: PaginationParams,
  filters?: Record<string, string | undefined>
): URLSearchParams => {
  const searchParams = new URLSearchParams()
  
  searchParams.set('page', params.page.toString())
  searchParams.set('limit', params.limit.toString())
  
  if (params.cursor) {
    searchParams.set('cursor', params.cursor)
  }
  
  // Add filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        searchParams.set(key, value)
      }
    })
  }
  
  return searchParams
}