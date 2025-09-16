import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Firebase Admin SDK configuration for server-side operations
const initializeFirebaseAdmin = () => {
  // Check if Firebase Admin is already initialized
  if (getApps().length > 0) {
    return getApp()
  }

  // Initialize with service account credentials
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  if (!projectId) {
    throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is required')
  }

  // For production, use service account key
  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey)
      return initializeApp({
        credential: cert(serviceAccount),
        projectId
      })
    } catch (error) {
      console.error('Failed to parse service account key:', error)
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format')
    }
  }

  // For development, use application default credentials or emulator
  if (process.env.NODE_ENV === 'development') {
    return initializeApp({
      projectId
    })
  }

  throw new Error('Firebase Admin SDK requires service account credentials in production')
}

// Lazy initialization - only initialize when needed
let adminApp: any = null
let adminDbInstance: any = null
let initializationError: Error | null = null

// Function to get admin database with lazy initialization
const getAdminDb = async () => {
  // Return cached instance if available
  if (adminDbInstance && !initializationError) {
    return adminDbInstance
  }

  // Try to initialize if not already attempted
  if (!adminApp && !initializationError) {
    try {
      adminApp = initializeFirebaseAdmin()
      adminDbInstance = getFirestore(adminApp)
      console.log('✅ Firebase Admin SDK initialized successfully')
      return adminDbInstance
    } catch (error) {
      initializationError = error as Error
      console.warn('⚠️ Firebase Admin SDK failed to initialize:', error)
      
      // In production, if Admin SDK fails, we need to return an error
      // Don't try to fallback to client SDK as it won't work server-side
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Firebase Admin SDK is required for server-side operations in production')
      }
      
      // In development, try client SDK fallback
      if (process.env.NODE_ENV === 'development') {
        try {
          // Dynamic import to avoid build-time issues
          const { db } = await import('./firebase')
          adminDbInstance = db
          console.log('🔄 Using client SDK as fallback in development')
          return adminDbInstance
        } catch (clientError) {
          console.error('❌ Both Admin and Client SDK failed:', clientError)
          throw new Error('Firebase initialization failed completely')
        }
      }
      
      throw error
    }
  }

  // If we have an initialization error and we're in production, throw it
  if (initializationError) {
    if (process.env.NODE_ENV === 'production') {
      throw initializationError
    }
    
    // In development, try client SDK fallback
    try {
      const { db } = await import('./firebase')
      return db
    } catch (clientError) {
      console.error('❌ Client SDK fallback failed:', clientError)
      throw initializationError
    }
  }

  return adminDbInstance
}

// Export the lazy getter function and a direct reference for compatibility
export { adminApp }
export { getAdminDb }

// For backward compatibility, provide adminDb that initializes lazily
export const adminDb = new Proxy({}, {
  get: function(target, prop) {
    // Return a promise-based method for async operations
    if (typeof prop === 'string' && ['collection', 'doc', 'runTransaction', 'batch'].includes(prop)) {
      return function(...args: any[]) {
        return getAdminDb().then(db => {
          const method = (db as any)[prop]
          if (typeof method === 'function') {
            return method.apply(db, args)
          }
          return (db as any)[prop]
        })
      }
    }
    
    // For other properties, return a promise
    return getAdminDb().then(db => (db as any)[prop])
  }
})