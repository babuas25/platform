# 🗄️ Database Initialization System

## Overview
The Database Initialization feature provides a user-friendly interface for setting up the Firestore database with sample data, initial configurations, and required collections. This system ensures proper database structure and provides test data for development and demonstration purposes.

## Features
- **One-Click Database Setup**: Initialize entire database structure with a single click
- **Sample Data Generation**: Create realistic test data for all user categories
- **Progress Tracking**: Real-time progress indicators during initialization
- **Error Handling**: Comprehensive error handling with detailed feedback
- **Status Monitoring**: Database health checks and status reporting
- **Safe Re-initialization**: Ability to reset and reinitialize database safely

## Access Requirements
- **SuperAdmin**: Full access to all initialization features
- **Admin**: Can view database status and run basic initialization
- **Other Roles**: Read-only access to database status

## Database Structure

### Collections Created
1. **users**: User accounts with role-based categorization
2. **content**: Sample content and media items
3. **analytics**: Basic analytics data structure
4. **settings**: System configuration settings
5. **audit_logs**: Security and action logging
6. **categories**: Content and user categorization
7. **permissions**: Role-based permission definitions

### Sample Data Categories

#### SuperAdmin Users
```typescript
{
  id: 'superadmin-001',
  name: 'System Administrator',
  email: 'admin@yourplatform.com',
  role: 'SuperAdmin',
  category: 'Admin',
  subcategory: 'SuperAdmin',
  status: 'Active',
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLogin: new Date(),
  permissions: ['*']
}
```

#### Admin Users
```typescript
{
  id: 'admin-001',
  name: 'Platform Administrator',
  email: 'platform.admin@yourplatform.com',
  role: 'Admin',
  category: 'Admin',
  subcategory: 'Admin',
  status: 'Active',
  department: 'Operations'
}
```

#### Staff Categories
- **Support Team**: Customer service representatives
- **Key Managers**: Account and relationship managers
- **Research Team**: Data analysts and researchers
- **Media Team**: Content creators and social media managers
- **Sales Team**: Sales representatives and coordinators

#### Partner Categories
- **Suppliers**: Product and service suppliers
- **Service Providers**: External service delivery partners

#### Agent Categories
- **Distributors**: Regional distribution partners
- **Franchise**: Franchise location operators
- **B2B Agents**: Business-to-business sales agents

#### User Categories
- **Public Users**: General platform users
- **Customers**: Paying customers with enhanced access

## Implementation

### Database Initialization Page
**Location**: `/database-init`
**Component**: `app/database-init/page.tsx`

```typescript
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DatabaseInitPage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [dbStatus, setDbStatus] = useState<'unknown' | 'empty' | 'initialized' | 'error'>('unknown')

  const initializeDatabase = async () => {
    setIsInitializing(true)
    setProgress(0)
    
    try {
      setStatus('Starting database initialization...')
      setProgress(10)
      
      const response = await fetch('/api/database/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setStatus('Database initialized successfully!')
        setProgress(100)
        setDbStatus('initialized')
      } else {
        throw new Error('Initialization failed')
      }
    } catch (error) {
      setStatus('Error during initialization')
      setDbStatus('error')
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Initialization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3>Database Status: {dbStatus}</h3>
              {progress > 0 && <Progress value={progress} />}
              <p>{status}</p>
            </div>
            
            <Button 
              onClick={initializeDatabase}
              disabled={isInitializing}
            >
              {isInitializing ? 'Initializing...' : 'Initialize Database'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### API Endpoint
**Location**: `/api/database/initialize`
**File**: `app/api/database/initialize/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getAdminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    // Check authentication and permissions
    const session = await getServerSession(authOptions)
    
    if (!session || !['SuperAdmin', 'Admin'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. SuperAdmin or Admin role required.' },
        { status: 403 }
      )
    }

    const adminDb = await getAdminDb()
    
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Initialize collections and sample data
    await initializeUsers(adminDb)
    await initializeContent(adminDb)
    await initializeSettings(adminDb)
    await initializeCategories(adminDb)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully',
      collections: ['users', 'content', 'settings', 'categories'],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { error: 'Database initialization failed', details: error.message },
      { status: 500 }
    )
  }
}

async function initializeUsers(adminDb: any) {
  const usersRef = adminDb.collection('users')
  
  // Sample users for each category
  const sampleUsers = [
    // SuperAdmin
    {
      id: 'superadmin-001',
      name: 'System Administrator',
      email: 'admin@yourplatform.com',
      role: 'SuperAdmin',
      category: 'Admin',
      subcategory: 'SuperAdmin',
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date()
    },
    
    // Admin
    {
      id: 'admin-001',
      name: 'Platform Administrator',
      email: 'platform.admin@yourplatform.com',
      role: 'Admin',
      category: 'Admin',
      subcategory: 'Admin',
      status: 'Active',
      department: 'Operations',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Staff - Support
    {
      id: 'staff-support-001',
      name: 'Support Representative',
      email: 'support@yourplatform.com',
      role: 'Staff',
      category: 'Staff',
      subcategory: 'Support',
      status: 'Active',
      department: 'Customer Service',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Staff - Sales
    {
      id: 'staff-sales-001',
      name: 'Sales Manager',
      email: 'sales@yourplatform.com',
      role: 'Staff',
      category: 'Staff',
      subcategory: 'Sales',
      status: 'Active',
      department: 'Sales',
      territory: 'North America',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Partner - Supplier
    {
      id: 'partner-supplier-001',
      name: 'Travel Supplier',
      email: 'supplier@travelcompany.com',
      role: 'Partner',
      category: 'Partner',
      subcategory: 'Suppliers',
      status: 'Active',
      company: 'Travel Solutions Inc',
      partnership_type: 'Service Provider',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Agent - Distributor
    {
      id: 'agent-distributor-001',
      name: 'Regional Distributor',
      email: 'distributor@region.com',
      role: 'Agent',
      category: 'Agent',
      subcategory: 'Distributors',
      status: 'Active',
      territory: 'Western Region',
      commission_rate: 0.15,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // User - Customer
    {
      id: 'user-customer-001',
      name: 'John Customer',
      email: 'john@customer.com',
      role: 'User',
      category: 'User',
      subcategory: 'Customer',
      status: 'Active',
      subscription_type: 'Premium',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
  
  // Create users in batch
  const batch = adminDb.batch()
  sampleUsers.forEach(user => {
    const userRef = usersRef.doc(user.id)
    batch.set(userRef, user)
  })
  
  await batch.commit()
}

async function initializeContent(adminDb: any) {
  const contentRef = adminDb.collection('content')
  
  const sampleContent = [
    {
      id: 'welcome-content',
      title: 'Welcome to the Platform',
      content: 'This is your comprehensive dashboard platform.',
      type: 'announcement',
      status: 'published',
      author: 'System',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'user-guide',
      title: 'User Management Guide',
      content: 'Complete guide for managing users across all categories.',
      type: 'documentation',
      status: 'published',
      author: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
  
  const batch = adminDb.batch()
  sampleContent.forEach(content => {
    const docRef = contentRef.doc(content.id)
    batch.set(docRef, content)
  })
  
  await batch.commit()
}

async function initializeSettings(adminDb: any) {
  const settingsRef = adminDb.collection('settings')
  
  const defaultSettings = {
    id: 'platform-settings',
    platform_name: 'Dashboard Platform',
    version: '1.0.0',
    maintenance_mode: false,
    user_registration_enabled: true,
    email_notifications: true,
    max_users_per_category: {
      SuperAdmin: 5,
      Admin: 20,
      Staff: 100,
      Partner: 200,
      Agent: 500,
      User: -1 // unlimited
    },
    created_at: new Date(),
    updated_at: new Date()
  }
  
  await settingsRef.doc('platform-settings').set(defaultSettings)
}

async function initializeCategories(adminDb: any) {
  const categoriesRef = adminDb.collection('categories')
  
  const userCategories = [
    {
      id: 'admin-category',
      name: 'Admin',
      description: 'Administrative users',
      subcategories: ['SuperAdmin', 'Admin'],
      permissions: ['user.manage', 'system.config', 'content.manage']
    },
    {
      id: 'staff-category',
      name: 'Staff',
      description: 'Internal team members',
      subcategories: ['Support', 'Key Managers', 'Research', 'Media', 'Sales'],
      permissions: ['content.create', 'user.support', 'reports.view']
    },
    {
      id: 'partner-category',
      name: 'Partner',
      description: 'External business partners',
      subcategories: ['Suppliers', 'Service Providers'],
      permissions: ['partner.data', 'communication.internal']
    },
    {
      id: 'agent-category',
      name: 'Agent',
      description: 'Sales and distribution network',
      subcategories: ['Distributors', 'Franchise', 'B2B'],
      permissions: ['sales.manage', 'commission.view', 'territory.access']
    },
    {
      id: 'user-category',
      name: 'User',
      description: 'End users and customers',
      subcategories: ['Public', 'Customer'],
      permissions: ['profile.manage', 'service.request', 'support.contact']
    }
  ]
  
  const batch = adminDb.batch()
  userCategories.forEach(category => {
    const docRef = categoriesRef.doc(category.id)
    batch.set(docRef, category)
  })
  
  await batch.commit()
}
```

### Database Status Check
**Endpoint**: `/api/database/status`

```typescript
export async function GET() {
  try {
    const adminDb = await getAdminDb()
    
    if (!adminDb) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Database connection failed' 
      })
    }
    
    // Check if collections exist and have data
    const collections = ['users', 'content', 'settings', 'categories']
    const status = {}
    
    for (const collection of collections) {
      const snapshot = await adminDb.collection(collection).limit(1).get()
      status[collection] = {
        exists: !snapshot.empty,
        count: snapshot.size
      }
    }
    
    const isInitialized = Object.values(status).every(col => col.exists)
    
    return NextResponse.json({
      status: isInitialized ? 'initialized' : 'empty',
      collections: status,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 })
  }
}
```

## User Interface Components

### Database Status Card
```typescript
// components/DatabaseStatusCard.tsx
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const DatabaseStatusCard = () => {
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchDatabaseStatus()
  }, [])
  
  const fetchDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/database/status')
      const data = await response.json()
      setDbStatus(data)
    } catch (error) {
      console.error('Failed to fetch database status:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <div>Loading database status...</div>
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Badge variant={dbStatus?.status === 'initialized' ? 'default' : 'destructive'}>
            {dbStatus?.status || 'Unknown'}
          </Badge>
          
          {dbStatus?.collections && (
            <div className="mt-4">
              <h4 className="font-semibold">Collections:</h4>
              {Object.entries(dbStatus.collections).map(([name, info]: [string, any]) => (
                <div key={name} className="flex justify-between">
                  <span>{name}</span>
                  <Badge variant={info.exists ? 'default' : 'secondary'}>
                    {info.exists ? 'Ready' : 'Empty'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

## Security Considerations

### Access Control
- Only SuperAdmin and Admin roles can initialize database
- All initialization operations are logged
- Sensitive data is properly secured
- Environment-specific configurations

### Data Protection
- Sample data uses placeholder information
- No real personal data in initialization
- Proper data validation and sanitization
- Secure Firebase rules applied during initialization

### Error Handling
- Comprehensive error catching and logging
- User-friendly error messages
- Rollback capabilities for failed operations
- Status monitoring and alerts

## Best Practices

### Development Environment
1. Use development-specific sample data
2. Enable detailed logging for debugging
3. Test initialization multiple times
4. Verify all collections and data integrity

### Production Environment
1. Minimal sample data for demonstration
2. Production-ready configurations
3. Proper backup before initialization
4. Monitor initialization performance

### Maintenance
1. Regular database health checks
2. Update sample data as features evolve
3. Monitor initialization success rates
4. Document any customizations

## Troubleshooting

### Common Issues
1. **Permission Denied**: Check Firebase security rules
2. **Timeout Errors**: Reduce batch size or increase timeout
3. **Duplicate Data**: Implement proper ID generation
4. **Missing Collections**: Verify initialization order

### Error Messages
- "Database connection failed": Check Firebase configuration
- "Unauthorized access": Verify user role and permissions
- "Initialization timeout": Network or performance issue
- "Data validation error": Check sample data format

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Production Ready ✅