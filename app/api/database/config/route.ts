import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check which environment variables are configured
    const firebaseConfig = {
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }
    
    const configValues = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT_SET',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'NOT_SET',
      nodeEnv: process.env.NODE_ENV || 'unknown',
      emulatorEnabled: process.env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR || 'false'
    }
    
    const allConfigured = Object.values(firebaseConfig).every(Boolean)
    
    const status = {
      environment: process.env.NODE_ENV || 'unknown',
      firebaseConfigured: allConfigured,
      missingVars: Object.entries(firebaseConfig)
        .filter(([_, configured]) => !configured)
        .map(([key, _]) => key),
      configValues,
      timestamp: new Date().toISOString()
    }
    
    console.log('[CONFIG CHECK] Firebase configuration status:', status)
    
    return NextResponse.json(status)
  } catch (error) {
    console.error('[CONFIG CHECK] Error checking configuration:', error)
    
    return NextResponse.json({
      error: 'Failed to check configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}