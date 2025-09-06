"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { User, UserFilters, UserStats, CreateUserData, UpdateUserData } from '@/lib/types/user'
import { useUsers, useUserStats, useUserActions } from '@/hooks/use-users'
import { FirebaseSetupNotice } from '@/components/ui/firebase-setup-notice'

interface UserContextType {
  // Users data
  users: User[]
  usersLoading: boolean
  usersError: string | null
  refetchUsers: () => void
  
  // User stats
  stats: UserStats | null
  statsLoading: boolean
  statsError: string | null
  refetchStats: () => void
  
  // User actions
  createUser: (userData: CreateUserData) => Promise<string>
  updateUser: (id: string, userData: UpdateUserData) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  actionsLoading: boolean
  actionsError: string | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
  filters?: UserFilters
}

export const UserProvider: React.FC<UserProviderProps> = ({ children, filters }) => {
  const {
    users,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useUsers(filters)

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useUserStats()

  const {
    createUser,
    updateUser,
    deleteUser,
    loading: actionsLoading,
    error: actionsError
  } = useUserActions()

  // Check if Firebase is properly configured
  const isFirebaseConfigured = () => {
    return !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    )
  }

  const value: UserContextType = {
    users,
    usersLoading,
    usersError,
    refetchUsers,
    stats,
    statsLoading,
    statsError,
    refetchStats,
    createUser,
    updateUser,
    deleteUser,
    actionsLoading,
    actionsError
  }

  // Show setup notice if Firebase is not configured
  if (!isFirebaseConfigured()) {
    return <FirebaseSetupNotice />
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}
