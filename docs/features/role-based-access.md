# 🛡️ Role-Based Access Control (RBAC) Implementation

## Overview
This platform implements a comprehensive role-based access control system with 6 main user categories and multiple subcategories, providing granular permissions and secure access management.

## User Categories & Roles

### 1. SuperAdmin
**Description**: Highest level system administrators with full platform access
**Capabilities**:
- Full user management (create, read, update, delete all users)
- System configuration and settings
- Database initialization and management
- Security rule modifications
- Platform analytics and monitoring
- Backup and restore operations

**Access Level**: Unrestricted access to all features and data

### 2. Admin
**Description**: Administrative users with broad management capabilities
**Capabilities**:
- User management (limited to non-SuperAdmin users)
- Content management and moderation
- Report generation and analytics
- System monitoring (read-only)
- Category and subcategory management

**Access Level**: Full access except SuperAdmin functions

### 3. Staff
**Description**: Internal team members with specialized roles
**Subcategories**:
- **Support**: Customer service and user assistance
- **Key Managers**: Account management and client relations
- **Research**: Data analysis and market research
- **Media**: Content creation and social media management
- **Sales**: Sales operations and lead management

**Capabilities**:
- User support and assistance
- Content creation and editing
- Report viewing (role-specific)
- Customer communication
- Limited user profile management

**Access Level**: Role-specific access with read/write permissions for assigned areas

### 4. Partner
**Description**: External business partners with limited platform access
**Subcategories**:
- **Suppliers**: Product and service providers
- **Service Providers**: External service delivery teams

**Capabilities**:
- View assigned projects and data
- Update partner-specific information
- Communication with internal teams
- Resource and inventory management (limited)

**Access Level**: Restricted to partner-related functions and assigned data

### 5. Agent
**Description**: Sales and distribution network members
**Subcategories**:
- **Distributors**: Regional distribution partners
- **Franchise**: Franchise location operators
- **B2B**: Business-to-business sales representatives

**Capabilities**:
- Lead management and tracking
- Customer relationship management
- Sales reporting and analytics
- Commission tracking
- Territory-specific data access

**Access Level**: Sales-focused with territory/region restrictions

### 6. User
**Description**: End users and customers
**Subcategories**:
- **Public**: General public users
- **Customer**: Paying customers with enhanced features

**Capabilities**:
- Profile management
- Service requests and bookings
- Order history and tracking
- Basic reporting
- Communication with support

**Access Level**: Limited to personal data and basic platform features

## Technical Implementation

### Role Hierarchy
```typescript
enum UserRole {
  SUPERADMIN = 'SuperAdmin',
  ADMIN = 'Admin',
  STAFF = 'Staff',
  PARTNER = 'Partner',
  AGENT = 'Agent',
  USER = 'User'
}

enum UserCategory {
  ADMIN = 'Admin',
  STAFF = 'Staff',
  PARTNER = 'Partner',
  AGENT = 'Agent',
  USER = 'User'
}
```

### Permission Matrix
```typescript
const PERMISSIONS = {
  // User Management
  'user.create': ['SuperAdmin', 'Admin'],
  'user.read.all': ['SuperAdmin', 'Admin'],
  'user.read.own': ['*'],
  'user.update.all': ['SuperAdmin'],
  'user.update.limited': ['Admin', 'Staff'],
  'user.delete': ['SuperAdmin'],
  
  // System Administration
  'system.config': ['SuperAdmin'],
  'system.monitoring': ['SuperAdmin', 'Admin'],
  'system.backup': ['SuperAdmin'],
  
  // Content Management
  'content.create': ['SuperAdmin', 'Admin', 'Staff'],
  'content.update': ['SuperAdmin', 'Admin', 'Staff'],
  'content.delete': ['SuperAdmin', 'Admin'],
  'content.publish': ['SuperAdmin', 'Admin'],
  
  // Analytics & Reporting
  'analytics.full': ['SuperAdmin', 'Admin'],
  'analytics.limited': ['Staff', 'Agent'],
  'analytics.own': ['Partner', 'User'],
  
  // Financial Data
  'finance.view': ['SuperAdmin', 'Admin'],
  'finance.manage': ['SuperAdmin'],
  
  // Partner Operations
  'partner.manage': ['SuperAdmin', 'Admin', 'Staff'],
  'partner.view': ['Partner'],
  
  // Sales Operations
  'sales.manage': ['SuperAdmin', 'Admin', 'Staff'],
  'sales.view': ['Agent'],
  'sales.territory': ['Agent']
}
```

### Role-Based Route Protection

#### Middleware Implementation
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const userRole = req.nextauth.token?.role
    
    // SuperAdmin routes
    if (pathname.startsWith('/admin/system') && userRole !== 'SuperAdmin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    
    // Admin routes
    if (pathname.startsWith('/admin') && !['SuperAdmin', 'Admin'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    
    // User management routes
    if (pathname.startsWith('/user-management') && 
        !['SuperAdmin', 'Admin', 'Staff'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)
```

#### Component-Level Protection
```typescript
// components/ProtectedComponent.tsx
interface ProtectedComponentProps {
  requiredRoles: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  requiredRoles,
  children,
  fallback = <div>Access Denied</div>
}) => {
  const { data: session } = useSession()
  const userRole = session?.user?.role
  
  if (!userRole || !requiredRoles.includes(userRole)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Usage
<ProtectedComponent requiredRoles={['SuperAdmin', 'Admin']}>
  <UserManagementPanel />
</ProtectedComponent>
```

### Database Security Rules

#### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // SuperAdmin can read/write all users
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'SuperAdmin';
      
      // Admin can read/write non-SuperAdmin users
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin' &&
        resource.data.role != 'SuperAdmin';
      
      // Staff can read users and update limited fields
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Staff';
      
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Staff' &&
        onlyUpdating(['lastLogin', 'status', 'notes']);
    }
    
    // Content collection
    match /content/{contentId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in 
        ['SuperAdmin', 'Admin', 'Staff'];
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in 
        ['SuperAdmin', 'Admin'];
    }
    
    // Analytics collection
    match /analytics/{document} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in 
        ['SuperAdmin', 'Admin', 'Staff', 'Agent'];
    }
    
    // Helper function
    function onlyUpdating(fields) {
      return request.resource.data.keys().hasOnly(fields) && 
             resource.data.keys().hasAll(fields);
    }
  }
}
```

## API-Level Security

### Route Protection
```typescript
// app/api/users/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const userRole = session.user.role
  
  // Check permissions
  if (!['SuperAdmin', 'Admin', 'Staff'].includes(userRole)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }
  
  // Implement role-based data filtering
  let users = await getUsers()
  
  if (userRole === 'Admin') {
    // Admin cannot see SuperAdmin users
    users = users.filter(user => user.role !== 'SuperAdmin')
  } else if (userRole === 'Staff') {
    // Staff can only see limited user data
    users = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    }))
  }
  
  return NextResponse.json({ users })
}
```

### Permission Checking Utility
```typescript
// lib/permissions.ts
export const hasPermission = (userRole: string, permission: string): boolean => {
  const permissions = PERMISSIONS[permission] || []
  return permissions.includes('*') || permissions.includes(userRole)
}

export const checkPermission = (userRole: string, permission: string): void => {
  if (!hasPermission(userRole, permission)) {
    throw new Error(`Insufficient permissions for ${permission}`)
  }
}

// Usage in API routes
checkPermission(userRole, 'user.create')
```

## Frontend Implementation

### Conditional Rendering
```typescript
// hooks/usePermissions.ts
import { useSession } from 'next-auth/react'

export const usePermissions = () => {
  const { data: session } = useSession()
  const userRole = session?.user?.role
  
  const hasPermission = (permission: string): boolean => {
    if (!userRole) return false
    const permissions = PERMISSIONS[permission] || []
    return permissions.includes('*') || permissions.includes(userRole)
  }
  
  const canManageUsers = hasPermission('user.create')
  const canViewAnalytics = hasPermission('analytics.full') || hasPermission('analytics.limited')
  const canDeleteContent = hasPermission('content.delete')
  
  return {
    hasPermission,
    canManageUsers,
    canViewAnalytics,
    canDeleteContent,
    userRole
  }
}
```

### Menu/Navigation Control
```typescript
// components/Navigation.tsx
export const Navigation = () => {
  const { userRole, canManageUsers, canViewAnalytics } = usePermissions()
  
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      
      {canManageUsers && (
        <Link href="/user-management">User Management</Link>
      )}
      
      {canViewAnalytics && (
        <Link href="/analytics">Analytics</Link>
      )}
      
      {userRole === 'SuperAdmin' && (
        <Link href="/admin/system">System Settings</Link>
      )}
      
      {['Staff', 'Agent'].includes(userRole) && (
        <Link href="/reports">Reports</Link>
      )}
    </nav>
  )
}
```

## Security Best Practices

### 1. Principle of Least Privilege
- Users receive minimum permissions necessary for their role
- Regular permission audits and reviews
- Time-limited elevated access when needed

### 2. Defense in Depth
- Multiple layers of security (middleware, API, database)
- Client-side AND server-side validation
- Database rules as final enforcement layer

### 3. Audit Trail
```typescript
// lib/audit.ts
export const logUserAction = async (
  userId: string,
  action: string,
  resource: string,
  details?: any
) => {
  await adminDb.collection('audit_logs').add({
    userId,
    action,
    resource,
    details,
    timestamp: new Date(),
    ip: request.ip,
    userAgent: request.headers['user-agent']
  })
}
```

### 4. Role Validation
```typescript
// Validate role assignments
export const validateRoleChange = (
  currentUserRole: string,
  targetUserRole: string,
  newRole: string
): boolean => {
  // SuperAdmin can change any role
  if (currentUserRole === 'SuperAdmin') return true
  
  // Admin cannot promote users to SuperAdmin
  if (currentUserRole === 'Admin' && newRole === 'SuperAdmin') return false
  
  // Admin cannot modify other Admins or SuperAdmins
  if (currentUserRole === 'Admin' && 
      ['Admin', 'SuperAdmin'].includes(targetUserRole)) return false
  
  // Staff cannot change roles
  if (currentUserRole === 'Staff') return false
  
  return true
}
```

## Testing RBAC

### Role-Based Test Cases
```typescript
// tests/rbac.test.ts
describe('Role-Based Access Control', () => {
  test('SuperAdmin can access all features', async () => {
    const superAdminSession = await createSession({ role: 'SuperAdmin' })
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${superAdminSession.token}`)
    
    expect(response.status).toBe(200)
    expect(response.body.users).toBeDefined()
  })
  
  test('Staff cannot delete users', async () => {
    const staffSession = await createSession({ role: 'Staff' })
    const response = await request(app)
      .delete('/api/users/123')
      .set('Authorization', `Bearer ${staffSession.token}`)
    
    expect(response.status).toBe(403)
  })
  
  test('User can only access own data', async () => {
    const userSession = await createSession({ role: 'User', id: 'user123' })
    const response = await request(app)
      .get('/api/users/user456')
      .set('Authorization', `Bearer ${userSession.token}`)
    
    expect(response.status).toBe(403)
  })
})
```

## Monitoring & Compliance

### Access Monitoring
- Log all permission checks and access attempts
- Monitor for privilege escalation attempts
- Regular access reviews and role audits
- Automated alerts for suspicious activity

### Compliance Features
- Role assignment approval workflows
- Temporary role elevations with expiration
- Detailed audit logs for compliance reporting
- Regular security assessments

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Security Level**: Enterprise-Grade ✅