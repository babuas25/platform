import { useState, useEffect, useCallback } from 'react'
import { PaginatedResponse } from '@/lib/pagination'

interface UserFilters {
  role?: string
  category?: string
  status?: string
  search?: string
  department?: string
  subscription?: string
}

interface UsePaginatedUsersOptions {
  initialPage?: number
  initialLimit?: number
  initialFilters?: UserFilters
}

interface UsePaginatedUsersReturn {
  users: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: UserFilters
  loading: boolean
  error: string | null
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setFilters: (filters: UserFilters) => void
  refreshUsers: () => void
}

export const usePaginatedUsers = (options: UsePaginatedUsersOptions = {}): UsePaginatedUsersReturn => {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialFilters = {}
  } = options

  const [users, setUsers] = useState<any[]>([])
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [filters, setFiltersState] = useState<UserFilters>(initialFilters)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      // Add filters to search params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          searchParams.set(key, value)
        }
      })

      const response = await fetch(`/api/users?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: PaginatedResponse<any> = await response.json()
      
      setUsers(data.data || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
        hasNext: data.pagination.hasNext,
        hasPrev: data.pagination.hasPrev
      }))

    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters])

  // Fetch users when dependencies change
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 })) // Reset to page 1 when changing limit
  }, [])

  const setFilters = useCallback((newFilters: UserFilters) => {
    setFiltersState(newFilters)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to page 1 when filtering
  }, [])

  const refreshUsers = useCallback(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    pagination,
    filters,
    loading,
    error,
    setPage,
    setLimit,
    setFilters,
    refreshUsers
  }
}