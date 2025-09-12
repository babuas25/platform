import { db, auth } from '@/lib/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export interface DatabaseTestResult {
  connected: boolean
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  message: string
  error?: string
  isAuthenticated: boolean
  authProvider?: string
  details: {
    userCount?: number
    testDocId?: string
    timestamp: string
    firebaseUser?: string
  }
}

export async function testDatabaseConnection(): Promise<DatabaseTestResult> {
  const result: DatabaseTestResult = {
    connected: false,
    canRead: false,
    canWrite: false,
    canDelete: false,
    message: 'Database test starting...',
    isAuthenticated: false,
    details: {
      timestamp: new Date().toISOString()
    }
  }

  try {
    console.log('[CLIENT DB TEST] Starting database test...')
    console.log('[CLIENT DB TEST] Current Firebase user:', auth.currentUser)

    // Check Firebase authentication status
    result.isAuthenticated = !!auth.currentUser
    if (auth.currentUser) {
      result.authProvider = auth.currentUser.providerData[0]?.providerId || 'unknown'
      result.details.firebaseUser = auth.currentUser.email || auth.currentUser.uid
      console.log('[CLIENT DB TEST] Firebase user authenticated:', result.details.firebaseUser)
    } else {
      console.log('[CLIENT DB TEST] No Firebase user authenticated')
      result.message = 'Firebase authentication required - user not signed in to Firebase'
      result.error = 'No authenticated Firebase user found. The user may be authenticated with NextAuth but not with Firebase client SDK.'
      return result
    }

    // Test 1: Read test - check if we can read from users collection
    try {
      console.log('[CLIENT DB TEST] Testing read access...')
      const usersCollection = collection(db, 'users')
      const usersSnapshot = await getDocs(usersCollection)
      result.canRead = true
      result.details.userCount = usersSnapshot.size
      console.log('[CLIENT DB TEST] Read test passed, found', usersSnapshot.size, 'users')
    } catch (readError) {
      console.log('[CLIENT DB TEST] Read test failed:', readError)
      result.canRead = false
      if (!result.error) {
        result.error = `Read test failed: ${readError instanceof Error ? readError.message : 'Unknown error'}`
      }
    }

    // Test 2: Write test - try to create a test document
    let testDocId: string | undefined
    try {
      console.log('[CLIENT DB TEST] Testing write access...')
      const testCollection = collection(db, '_database_test')
      const testDoc = await addDoc(testCollection, {
        test: true,
        timestamp: new Date(),
        message: 'Database test document',
        userId: auth.currentUser?.uid
      })
      testDocId = testDoc.id
      result.canWrite = true
      result.details.testDocId = testDocId
      console.log('[CLIENT DB TEST] Write test passed, created doc:', testDocId)
    } catch (writeError) {
      console.log('[CLIENT DB TEST] Write test failed:', writeError)
      result.canWrite = false
      if (!result.error) {
        result.error = `Write test failed: ${writeError instanceof Error ? writeError.message : 'Unknown error'}`
      }
    }

    // Test 3: Delete test - clean up the test document
    if (testDocId) {
      try {
        console.log('[CLIENT DB TEST] Testing delete access...')
        await deleteDoc(doc(db, '_database_test', testDocId))
        result.canDelete = true
        console.log('[CLIENT DB TEST] Delete test passed')
      } catch (deleteError) {
        console.log('[CLIENT DB TEST] Delete test failed:', deleteError)
        result.canDelete = false
        if (!result.error) {
          result.error = `Delete test failed: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`
        }
      }
    }

    // Determine overall connection status
    result.connected = result.canRead || result.canWrite
    
    if (result.connected) {
      if (result.canRead && result.canWrite && result.canDelete) {
        result.message = 'Database connection successful with full access'
      } else if (result.canRead && result.canWrite) {
        result.message = 'Database connection successful with read/write access'
      } else if (result.canRead) {
        result.message = 'Database connection successful with read-only access'
      } else {
        result.message = 'Database connection established but limited access'
      }
    } else {
      result.message = 'Database connection failed - check Firestore security rules'
    }

    console.log('[CLIENT DB TEST] Test completed:', result)
    return result

  } catch (error) {
    console.error('[CLIENT DB TEST] Database test failed:', error)
    result.connected = false
    result.message = 'Database test failed'
    result.error = error instanceof Error ? error.message : 'Unknown error'
    return result
  }
}

// Helper function to wait for Firebase auth state
export function waitForFirebaseAuth(): Promise<boolean> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(!!user)
    })
  })
}