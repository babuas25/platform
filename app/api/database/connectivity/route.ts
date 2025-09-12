import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'

export async function GET(request: NextRequest) {
  try {
    console.log('[SERVER CONNECTIVITY] Testing basic Firebase setup...')
    
    // Test basic Firebase configuration
    const config = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'not-set',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'not-set',
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'configured' : 'not-set',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'configured' : 'not-set'
    }
    
    // Basic connectivity test - just check if Firebase is initialized
    const dbInstance = db
    const isConfigured = !!(config.projectId !== 'not-set' && config.authDomain !== 'not-set')
    
    const status = {
      success: true,
      message: 'Server-side Firebase connectivity test passed',
      firebaseConfigured: isConfigured,
      databaseInstance: !!dbInstance,
      config: {
        projectId: config.projectId,
        authDomain: config.authDomain,
        hasApiKey: config.apiKey === 'configured',
        hasAppId: config.appId === 'configured'
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      note: 'This tests basic Firebase setup. Actual database operations are tested through the Seed Users function.'
    }
    
    console.log('[SERVER CONNECTIVITY] Test completed successfully')
    return NextResponse.json(status)
    
  } catch (error) {
    console.error('[SERVER CONNECTIVITY] Test failed:', error)
    
    const errorStatus = {
      success: false,
      message: 'Server-side Firebase connectivity test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
    }
    
    return NextResponse.json(errorStatus, { status: 500 })
  }
}