"use client"

import { useState, useEffect, useCallback } from 'react'
import { User, UserFilters, UserStats, CreateUserData, UpdateUserData } from '@/lib/types/user'

// API-based user data fetching functions
const apiGetUsers = async (filters?: UserFilters): Promise<User[]> => {
  const params = new URLSearchParams()
  if (filters?.role) params.append('role', filters.role)
  if (filters?.category) params.append('category', filters.category)
  if (filters?.subcategory) params.append('subcategory', filters.subcategory)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.subscription) params.append('subscription', filters.subscription)
  if (filters?.department) params.append('department', filters.department)
  if (filters?.search) params.append('search', filters.search)
  
  const url = `/api/users${params.toString() ? '?' + params.toString() : ''}`
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const data = await response.json()
  return data.users || []
}

const apiGetUserById = async (id: string): Promise<User | null> => {
  const response = await fetch(`/api/users/${id}`)
  
  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

const apiCreateUser = async (userData: CreateUserData): Promise<string> => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }
  
  const data = await response.json()
  return data.id
}

const apiUpdateUser = async (id: string, userData: UpdateUserData): Promise<void> => {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }
}

const apiDeleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }
}

const apiGetUserStats = async (): Promise<UserStats> => {
  const response = await fetch('/api/users/stats')
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

export const useUsers = (filters?: UserFilters) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiGetUsers(filters)
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const refetch = useCallback(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    loading,
    error,
    refetch
  }
}

export const useUser = (id: string) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    if (!id) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await apiGetUserById(id)
      setUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return {
    user,
    loading,
    error,
    refetch: fetchUser
  }
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiGetUserStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user statistics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}

export const useUserActions = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createUserAction = useCallback(async (userData: CreateUserData) => {
    try {
      setLoading(true)
      setError(null)
      const userId = await apiCreateUser(userData)
      return userId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUserAction = useCallback(async (id: string, userData: UpdateUserData) => {
    try {
      setLoading(true)
      setError(null)
      await apiUpdateUser(id, userData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const setActive = useCallback(async (id: string) => {
    await updateUserAction(id, { status: 'Active', suspendedUntil: null })
  }, [updateUserAction])

  const setInactive = useCallback(async (id: string) => {
    await updateUserAction(id, { status: 'Inactive', suspendedUntil: null })
  }, [updateUserAction])

  const suspendFor = useCallback(async (id: string, until: Date) => {
    await updateUserAction(id, { status: 'Suspended', suspendedUntil: until.toISOString() })
  }, [updateUserAction])

  const deleteUserAction = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await apiDeleteUser(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createUser: createUserAction,
    updateUser: updateUserAction,
    deleteUser: deleteUserAction,
    setActive,
    setInactive,
    suspendFor,
    loading,
    error
  }
}
