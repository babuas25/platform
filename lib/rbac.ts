// Role types
export type UserRole = 'SuperAdmin' | 'Admin' | 'Staff' | 'Partner' | 'Agent' | 'User';

// Role hierarchy (each role can manage roles below it in the hierarchy)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'SuperAdmin': 5,
  'Admin': 4,
  'Staff': 3,
  'Partner': 2,
  'Agent': 1,
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
      return ['SuperAdmin', 'Admin', 'Staff', 'Partner', 'Agent', 'User'];
    case 'Admin':
      return ['Staff', 'Partner', 'Agent', 'User'];
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
    case 'Staff':
      return '/users/staff';
    case 'Partner':
      return '/users/partner';
    case 'Agent':
      return '/users/agent';
    case 'User':
    default:
      return '/users/publicuser';
  }
};
