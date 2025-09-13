import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { db } from './firebase' // Fallback to client SDK

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

// Initialize Firebase Admin with fallback
let adminApp: any = null
let adminDb: any = null

try {
  adminApp = initializeFirebaseAdmin()
  adminDb = getFirestore(adminApp)
  console.log('✅ Firebase Admin SDK initialized successfully')
} catch (error) {
  console.warn('⚠️ Firebase Admin SDK failed to initialize, falling back to client SDK:', error)
  // In development, we can fall back to client SDK for testing
  if (process.env.NODE_ENV === 'development') {
    adminDb = db // Use client SDK as fallback
    console.log('🔄 Using client SDK as fallback in development')
  } else {
    throw error
  }
}

export { adminApp, adminDb }