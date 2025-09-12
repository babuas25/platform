import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

interface DatabaseStatus {
  connected: boolean
  collections: string[]
  userCount: number
  initialized: boolean
  error?: string
  environment?: string
  hasPermissionIssues?: boolean
  note?: string
}

export async function GET(request: NextRequest) {
  console.log('[DATABASE STATUS] Starting status check...')
  
  try {
    // Check if Firebase is properly initialized
    if (!db) {
      throw new Error('Firebase database not initialized')
    }
    
    console.log('[DATABASE STATUS] Firebase DB instance exists')
    
    // Initialize default status
    let userCount = 0
    let testCount = 0
    const existingCollections: string[] = []
    let hasPermissionIssues = false
    let permissionError = ''
    
    // Test basic connection by trying to access collections with error handling
    console.log('[DATABASE STATUS] Checking users collection...')
    
    try {
      const usersCollection = collection(db, 'users')
      const usersSnapshot = await getDocs(usersCollection)
      userCount = usersSnapshot.size
      existingCollections.push('users')
      console.log(`[DATABASE STATUS] Found ${userCount} users`)
    } catch (error) {
      console.log('[DATABASE STATUS] Cannot access users collection:', error instanceof Error ? error.message : 'Unknown error')
      if (error instanceof Error && error.message.includes('permission-denied')) {
        hasPermissionIssues = true
        permissionError = 'Cannot read users collection due to Firestore security rules'
      }
    }
    
    // Check test collection
    console.log('[DATABASE STATUS] Checking test collection...')
    try {
      const testCollection = collection(db, '_test')
      const testSnapshot = await getDocs(testCollection)
      testCount = testSnapshot.size
      if (testCount > 0) {
        existingCollections.push('_test')
      }
      console.log(`[DATABASE STATUS] Found ${testCount} test documents`)
    } catch (error) {
      console.log('[DATABASE STATUS] Cannot access test collection:', error instanceof Error ? error.message : 'Unknown error')
      if (error instanceof Error && error.message.includes('permission-denied')) {
        hasPermissionIssues = true
        if (!permissionError) {
          permissionError = 'Cannot read collections due to Firestore security rules'
        }
      }
    }
    
    // Check if database is initialized (has users)
    const initialized = userCount > 0
    
    const status: DatabaseStatus = {
      connected: true,
      collections: existingCollections,
      userCount,
      initialized,
      environment: process.env.NODE_ENV || 'unknown',
      ...(hasPermissionIssues && {
        error: permissionError,
        hasPermissionIssues: true,
        note: 'Some operations may fail due to Firestore security rules. Update security rules to allow read/write operations.'
      })
    }
    
    console.log('[DATABASE STATUS] Status check completed:', status)
    return NextResponse.json(status)
    
  } catch (error) {
    console.error('[DATABASE STATUS] Error occurred:', error)
    console.error('[DATABASE STATUS] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    let errorMessage = 'Unknown error'
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Check for common Firebase errors
      if (error.message.includes('permission-denied')) {
        errorMessage = 'Firebase permissions denied. Update Firestore security rules to allow read operations.'
      } else if (error.message.includes('unauthenticated')) {
        errorMessage = 'Firebase authentication required. Check your API keys.'
      } else if (error.message.includes('not-found')) {
        errorMessage = 'Firebase project not found. Check your project configuration.'
      }
    }
    
    const status: DatabaseStatus = {
      connected: false,
      collections: [],
      userCount: 0,
      initialized: false,
      error: errorMessage,
      environment: process.env.NODE_ENV || 'unknown'
    }
    
    console.log('[DATABASE STATUS] Returning error status:', status)
    return NextResponse.json(status, { status: 200 }) // Return 200 to avoid client-side error handling issues
  }
}