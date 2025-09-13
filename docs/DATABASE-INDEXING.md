# Firestore Database Indexing Strategy

## Overview

This document outlines the comprehensive indexing strategy implemented for the user management system to ensure optimal query performance and scalability.

## Index Categories

### 1. Single Field Indexes

These are automatically created by Firestore for basic equality queries:

- **Email**: Used for user lookups and authentication
- **Role**: Critical for role-based filtering and permissions
- **Status**: Essential for filtering active/inactive users
- **Category**: Used for user categorization
- **Department**: Required for department-based filtering
- **Subscription**: Used for subscription tier filtering

### 2. Composite Indexes

Complex queries require custom composite indexes for optimal performance:

#### **Primary Query Patterns**

1. **Role + CreatedAt (Descending)**
   - Query: `users.where('role', '==', role).orderBy('createdAt', 'desc')`
   - Use Case: Role-specific user lists sorted by creation date
   - Index: `[role ASC, createdAt DESC]`

2. **Status + CreatedAt (Descending)**
   - Query: `users.where('status', '==', status).orderBy('createdAt', 'desc')`
   - Use Case: Active/inactive user lists
   - Index: `[status ASC, createdAt DESC]`

3. **Category + CreatedAt (Descending)**
   - Query: `users.where('category', '==', category).orderBy('createdAt', 'desc')`
   - Use Case: Category-based user management
   - Index: `[category ASC, createdAt DESC]`

#### **Multi-Filter Query Patterns**

4. **Role + Status + CreatedAt**
   - Query: `users.where('role', '==', role).where('status', '==', status).orderBy('createdAt', 'desc')`
   - Use Case: Filter active users by role
   - Index: `[role ASC, status ASC, createdAt DESC]`

5. **Category + Status + CreatedAt**
   - Query: `users.where('category', '==', category).where('status', '==', status).orderBy('createdAt', 'desc')`
   - Use Case: Filter users by category and status
   - Index: `[category ASC, status ASC, createdAt DESC]`

6. **Role + Category + CreatedAt**
   - Query: `users.where('role', '==', role).where('category', '==', category).orderBy('createdAt', 'desc')`
   - Use Case: Detailed role and category filtering
   - Index: `[role ASC, category ASC, createdAt DESC]`

#### **Specialized Query Patterns**

7. **Department-Based Queries**
   - **Department + CreatedAt**: `[department ASC, createdAt DESC]`
   - **Department + Status + CreatedAt**: `[department ASC, status ASC, createdAt DESC]`
   - **Role + Department + CreatedAt**: `[role ASC, department ASC, createdAt DESC]`

8. **Subscription-Based Queries**
   - **Subscription + CreatedAt**: `[subscription ASC, createdAt DESC]`
   - **Subscription + Status + CreatedAt**: `[subscription ASC, status ASC, createdAt DESC]`

9. **User Activity Queries**
   - **Status + LastLogin**: `[status ASC, lastLogin DESC]`
   - Use Case: Find recently active users
   
10. **Suspension Management**
    - **Status + SuspendedUntil**: `[status ASC, suspendedUntil ASC]`
    - Use Case: Automatically reactivate expired suspensions

## Query Optimization Strategies

### 1. Pagination Optimization

- **Primary Sort**: Always use `createdAt DESC` for consistent pagination
- **Cursor-Based Pagination**: Recommended for large datasets (>1000 records)
- **Offset Limitations**: Avoid offset-based pagination beyond 1000 documents

### 2. Filter Combinations

The indexing strategy supports these efficient filter combinations:

```typescript
// Optimized query patterns
const queries = [
  // Single filters with sorting
  users.where('role', '==', 'Admin').orderBy('createdAt', 'desc'),
  users.where('status', '==', 'Active').orderBy('createdAt', 'desc'),
  
  // Double filters with sorting
  users.where('role', '==', 'Admin')
       .where('status', '==', 'Active')
       .orderBy('createdAt', 'desc'),
       
  // Department-specific queries
  users.where('department', '==', 'Sales')
       .where('status', '==', 'Active')
       .orderBy('createdAt', 'desc'),
]
```

### 3. Search Optimization

For text search, the system implements:

- **Client-side filtering** for name and email search (post-query filtering)
- **Case-insensitive search** using toLowerCase() transformation
- **Multiple field search** across name, email, phone, and location

## Performance Considerations

### 1. Index Limits

- **Maximum composite index fields**: 100 fields per index
- **Maximum indexes per collection**: 200 indexes
- **Current usage**: 13 composite indexes (well within limits)

### 2. Query Costs

- **Single field queries**: 1 read per document
- **Composite queries**: 1 read per document + index overhead
- **Text search**: Additional client-side processing cost

### 3. Write Performance

Each indexed field adds write overhead:
- **Single field index**: Minimal overhead
- **Composite indexes**: Linear overhead per index
- **Current impact**: ~13 additional writes per user creation/update

## Implementation Guide

### 1. Deploy Indexes

```bash
# Deploy the indexes to Firestore
firebase deploy --only firestore:indexes

# Verify index creation
firebase firestore:indexes
```

### 2. Monitor Index Usage

```typescript
// Enable query performance monitoring
import { enableNetwork, connectFirestoreEmulator } from 'firebase/firestore'

// In development, monitor query performance
if (process.env.NODE_ENV === 'development') {
  console.log('Query executed:', querySnapshot.metadata)
}
```

### 3. Query Best Practices

```typescript
// ✅ GOOD: Use indexed fields for filtering
const query = users
  .where('role', '==', 'Admin')
  .where('status', '==', 'Active')
  .orderBy('createdAt', 'desc')
  .limit(10)

// ❌ AVOID: Unindexed complex queries
const badQuery = users
  .where('name', '>=', 'A')
  .where('email', '>=', 'a')  // Requires additional index
  .orderBy('lastLogin', 'desc') // Different sort field
```

## Maintenance Procedures

### 1. Index Health Monitoring

- **Monitor query performance** in Firebase Console
- **Check index usage statistics** monthly
- **Identify unused indexes** for cleanup

### 2. Index Updates

When adding new query patterns:

1. **Analyze new queries** for index requirements
2. **Update firestore.indexes.json** with new composite indexes
3. **Test in development** environment first
4. **Deploy to production** with `firebase deploy --only firestore:indexes`

### 3. Cleanup Procedures

- **Remove unused indexes** to reduce write overhead
- **Consolidate similar indexes** where possible
- **Monitor index performance** after changes

## Index File Location

The complete index configuration is stored in:
- **File**: `firestore.indexes.json`
- **Format**: Firebase CLI index format
- **Deployment**: `firebase deploy --only firestore:indexes`

## Query Performance Expectations

With proper indexing, expect:

- **Single user lookup**: <50ms
- **Filtered user list (10 items)**: <100ms
- **Paginated queries**: <150ms
- **Complex multi-filter queries**: <200ms

## Troubleshooting

### Common Issues

1. **Missing Index Error**: Add required composite index to `firestore.indexes.json`
2. **Slow Queries**: Check if query uses indexed fields in correct order
3. **Index Build Failures**: Verify JSON syntax and field names

### Performance Debugging

```typescript
// Add query performance logging
const startTime = Date.now()
const snapshot = await query.get()
console.log(`Query took ${Date.now() - startTime}ms`)
console.log(`Documents returned: ${snapshot.size}`)
```

## Future Enhancements

Planned indexing improvements:

1. **Full-text search indexes** for advanced search capabilities
2. **Geographic indexes** for location-based queries
3. **Array-contains indexes** for permission-based filtering
4. **TTL indexes** for automatic data cleanup

---

*Last Updated: December 2024*
*Version: 2.0*