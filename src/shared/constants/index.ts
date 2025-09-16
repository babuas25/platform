// Application-wide constants
export const APP_NAME = 'AppDashboard';
export const APP_VERSION = '1.0.0';

// User roles and permissions
export const USER_ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin', 
  STAFF: 'Staff',
  PARTNER: 'Partner',
  AGENT: 'Agent',
  USER: 'User'
} as const;

// API endpoints
export const API_ROUTES = {
  V1: '/api/v1',
  USERS: '/api/v1/users',
  AUTH: '/api/v1/auth',
  DATABASE: '/api/v1/database',
  HEALTH: '/api/v1/health'
} as const;
