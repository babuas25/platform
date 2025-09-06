// Role types
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
  | 'User';

// Role hierarchy (each role can manage roles below it in the hierarchy)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'SuperAdmin': 5,
  'Admin': 4,
  'Support': 3,
  'Key Manager': 3,
  'Research': 3,
  'Media': 3,
  'Sales': 3,
  'Supplier': 2,
  'Service Provider': 2,
  'Distributor': 1,
  'Franchise': 1,
  'B2B': 1,
  'User': 0
};

// Special emails that should always be SuperAdmin
const SUPER_ADMIN_EMAILS = ['babuas25@gmail.com', 'md.ashifbabu@gmail.com'];

// Check if a user can manage another role
export const canManageRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  // SuperAdmins can manage all roles including other SuperAdmins
  if (userRole === 'SuperAdmin') return true;
  
  // Admins can manage all roles except SuperAdmin and other Admins
  if (userRole === 'Admin' && !['SuperAdmin', 'Admin'].includes(targetRole)) {
    return true;
  }
  
  // Staff, Partners, and Agents cannot manage any roles
  return false;
};

// Check if a user can access a route
export const canAccessRoute = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

// Get the default role for a new user
export const getDefaultRole = (email: string): UserRole => {
  if (SUPER_ADMIN_EMAILS.includes(email)) {
    return 'SuperAdmin';
  }
  return 'User';
};

// Get all roles that a user can manage
export const getManageableRoles = (userRole: UserRole): UserRole[] => {
  switch (userRole) {
    case 'SuperAdmin':
      return ['SuperAdmin', 'Admin', 'Support', 'Key Manager', 'Research', 'Media', 'Sales', 'Supplier', 'Service Provider', 'Distributor', 'Franchise', 'B2B', 'User'];
    case 'Admin':
      return ['Support', 'Key Manager', 'Research', 'Media', 'Sales', 'Supplier', 'Service Provider', 'Distributor', 'Franchise', 'B2B', 'User'];
    default:
      return [];
  }
};

// Get dashboard route based on role
export const getDashboardRoute = (role: UserRole): string => {
  switch (role) {
    case 'SuperAdmin':
      return '/superadmin/admin';
    case 'Admin':
      return '/users/admin';
    case 'Support':
    case 'Key Manager':
    case 'Research':
    case 'Media':
    case 'Sales':
      return '/users/staff';
    case 'Supplier':
    case 'Service Provider':
      return '/users/partner';
    case 'Distributor':
    case 'Franchise':
    case 'B2B':
      return '/users/agent';
    case 'User':
    default:
      return '/users/publicuser';
  }
};
