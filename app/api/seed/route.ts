import { NextRequest, NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/seed-data'

export async function POST(request: NextRequest) {
  try {
    // Allow seeding in production for database initialization
    // Note: This should be secured with proper authentication in production
    
    await seedDatabase()
    
    return NextResponse.json({ 
      message: 'Database seeded successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Seeding error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}
