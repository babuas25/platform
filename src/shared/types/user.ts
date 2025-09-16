export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  category: UserCategory
  subcategory: UserSubcategory
  status: UserStatus
  suspendedUntil?: string
  lastLogin?: string
  createdAt: string
  updatedAt: string
  avatar?: string
  phone?: string
  location?: string
  department?: string
  permissions?: string[]
  securityLevel?: SecurityLevel
  subscription?: SubscriptionType
  notes?: string
  address?: string
  // Additional fields based on user type
  ticketsResolved?: number
  avgResponseTime?: string
  performance?: UserPerformance
}

export type UserRole = 
  | 'SuperAdmin' 
  | 'Admin' 
  | 'Support' 
  | 'Key Manager' 
  | 'Research' 
  | 'Media' 
  | 'Sales' 
  | 'Supplier' 
  | 'Service Provider' 
  | 'Distributor' 
  | 'Franchise' 
  | 'B2B' 
  | 'User'

export type UserCategory = 
  | 'Admin' 
  | 'Staff' 
  | 'Partner' 
  | 'Agent' 
  | 'Users'

export type UserSubcategory = 
  | 'SuperAdmin' 
  | 'Admin' 
  | 'Support' 
  | 'Key Manager' 
  | 'Research' 
  | 'Media' 
  | 'Sales' 
  | 'Supplier' 
  | 'Service Provider' 
  | 'Distributor' 
  | 'Franchise' 
  | 'B2B' 
  | 'publicuser'

export type UserStatus = 'Active' | 'Inactive' | 'Pending' | 'Suspended'

export type SecurityLevel = 'Maximum' | 'High' | 'Medium' | 'Low'

export type SubscriptionType = 'Free' | 'Basic' | 'Premium' | 'Enterprise'

export interface UserPerformance {
  ticketsResolved?: number
  avgResponseTime?: string
  salesTarget?: number
  salesAchieved?: number
  customerRating?: number
  lastActivity?: string
}

export interface UserFilters {
  search?: string
  role?: UserRole
  category?: UserCategory
  subcategory?: UserSubcategory
  status?: UserStatus
  subscription?: SubscriptionType
  department?: string
  dateFrom?: string
  dateTo?: string
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  byCategory: Record<UserCategory, number>
  byRole: Record<UserRole, number>
  byStatus: Record<UserStatus, number>
  newThisMonth: number
  growthRate: number
}

export interface CreateUserData {
  name: string
  email: string
  role: UserRole
  category: UserCategory
  subcategory: UserSubcategory
  phone?: string
  location?: string
  department?: string
  permissions?: string[]
  subscription?: SubscriptionType
  notes?: string
  address?: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: UserRole
  category?: UserCategory
  subcategory?: UserSubcategory
  status?: UserStatus
  suspendedUntil?: string | null
  phone?: string
  location?: string
  department?: string
  permissions?: string[]
  subscription?: SubscriptionType
  securityLevel?: SecurityLevel
  notes?: string
  address?: string
}
