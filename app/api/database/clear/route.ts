import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'

export async function DELETE(request: NextRequest) {
  try {
    console.log('Starting database cleanup...')
    
    const collections = ['users', '_test'] // Add other collections as needed
    let totalDeleted = 0
    const results = []
    
    for (const collectionName of collections) {
      try {
        console.log(`Clearing collection: ${collectionName}`)
        const collectionRef = collection(db, collectionName)
        const snapshot = await getDocs(collectionRef)
        
        let deletedCount = 0
        const deletePromises: Promise<void>[] = []
        
        snapshot.forEach((document) => {
          deletePromises.push(deleteDoc(doc(db, collectionName, document.id)))
        })
        
        await Promise.all(deletePromises)
        deletedCount = snapshot.size
        totalDeleted += deletedCount
        
        results.push({
          collection: collectionName,
          deleted: deletedCount,
          success: true
        })
        
        console.log(`✓ Deleted ${deletedCount} documents from ${collectionName}`)
      } catch (error) {
        console.error(`✗ Failed to clear collection ${collectionName}:`, error)
        results.push({
          collection: collectionName,
          deleted: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    console.log(`Database cleanup completed. Total documents deleted: ${totalDeleted}`)
    
    return NextResponse.json({ 
      message: `Database cleared successfully. Deleted ${totalDeleted} documents across ${collections.length} collections.`,
      results,
      totalDeleted,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database cleanup error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to clear database',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}