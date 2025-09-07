"use client"

import { useState, useEffect, useCallback } from 'react'
import { User, UserFilters, UserStats, CreateUserData, UpdateUserData } from '@/lib/types/user'
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  getUserStats 
} from '@/lib/firestore'

export const useUsers = (filters?: UserFilters) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUsers(filters)
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
      const data = await getUserById(id)
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
      const data = await getUserStats()
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
      const userId = await createUser(userData)
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
      await updateUser(id, userData)
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
      await deleteUser(id)
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
