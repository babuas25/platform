// Environment configuration
export const config = {
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: process.env.PORT || 5000,
  
  // Database configuration
  database: {
    maxRetries: 3,
    timeout: 10000,
  },
  
  // Cache configuration  
  cache: {
    ttl: 300, // 5 minutes default
    maxSize: 1000,
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  }
} as const;
