# User Management System - Real Data Setup

## Overview
The user management system has been updated to use real data from Firebase Firestore instead of mock data. This document provides instructions on how to set up and use the system.

## Prerequisites
1. Firebase project set up with Firestore enabled
2. Environment variables configured
3. Firebase authentication configured

## Environment Variables
Make sure you have the following environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Database Structure

### Firestore Collection: `users`
Each user document contains:
- `id`: Document ID (auto-generated)
- `name`: User's full name
- `email`: User's email address
- `role`: User role (SuperAdmin, Admin, Support, etc.)
- `category`: User category (Admin, Staff, Partner, Agent, Users)
- `subcategory`: User subcategory (SuperAdmin, Admin, Support, etc.)
- `status`: User status (Active, Inactive, Pending, Suspended)
- `lastLogin`: Last login timestamp
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `avatar`: Optional avatar URL
- `phone`: Optional phone number
- `location`: Optional location
- `department`: Optional department
- `permissions`: Array of permissions
- `securityLevel`: Security level (Maximum, High, Medium, Low)
- `subscription`: Subscription type (Free, Basic, Premium, Enterprise)
- `ticketsResolved`: Number of tickets resolved (for support staff)
- `avgResponseTime`: Average response time (for support staff)
- `performance`: Performance metrics object

## Seeding the Database

### Option 1: Using the API Route (Recommended)
1. Start your development server: `npm run dev`
2. Make a POST request to `/api/seed`:
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

### Option 2: Using the Node.js Script
1. Install dependencies: `npm install firebase`
2. Run the seeding script:
   ```bash
   node scripts/seed-database.js
   ```

## Features

### Real Data Integration
- All user data is now stored in Firebase Firestore
- Real-time data updates
- Proper error handling and loading states
- Type-safe data operations

### User Management Operations
- **Create**: Add new users with proper validation
- **Read**: Fetch users with filtering and search
- **Update**: Modify user information
- **Delete**: Remove users from the system

### Data Filtering and Search
- Search by name or email
- Filter by role, category, status, subscription
- Real-time filtering without page reloads

### Statistics and Analytics
- Real-time user counts by category
- Active/inactive user statistics
- Growth rate calculations
- Performance metrics

## Usage

### Basic Usage
```typescript
import { useUsers } from '@/hooks/use-users'

function MyComponent() {
  const { users, loading, error, refetch } = useUsers()
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### With Filters
```typescript
import { useUsers } from '@/hooks/use-users'
import { UserFilters } from '@/lib/types/user'

function MyComponent() {
  const filters: UserFilters = {
    role: 'Support',
    status: 'Active',
    search: 'john'
  }
  
  const { users, loading, error } = useUsers(filters)
  
  // ... rest of component
}
```

### User Actions
```typescript
import { useUserActions } from '@/hooks/use-users'

function MyComponent() {
  const { createUser, updateUser, deleteUser, loading, error } = useUserActions()
  
  const handleCreateUser = async () => {
    try {
      const userId = await createUser({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'User',
        category: 'Users',
        subcategory: 'publicuser'
      })
      console.log('User created:', userId)
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }
  
  // ... rest of component
}
```

## Data Types

All user-related types are defined in `lib/types/user.ts`:
- `User`: Main user interface
- `UserRole`: Available user roles
- `UserCategory`: User categories
- `UserSubcategory`: User subcategories
- `UserStatus`: User status options
- `UserFilters`: Filtering options
- `UserStats`: Statistics interface
- `CreateUserData`: Data for creating users
- `UpdateUserData`: Data for updating users

## Error Handling

The system includes comprehensive error handling:
- Network errors
- Authentication errors
- Permission errors
- Validation errors
- Database errors

All errors are properly typed and can be handled in your components.

## Performance Considerations

- Data is cached in React context
- Efficient Firestore queries with proper indexing
- Pagination support for large datasets
- Optimistic updates for better UX

## Security

- Role-based access control
- Firestore security rules (configure in Firebase Console)
- Input validation and sanitization
- Proper error handling without data leakage

## Troubleshooting

### Common Issues

1. **Firebase not initialized**: Check your environment variables
2. **Permission denied**: Verify Firestore security rules
3. **Data not loading**: Check network connection and Firebase project status
4. **Type errors**: Ensure all types are properly imported

### Debug Mode

Enable debug logging by setting:
```typescript
console.log('Debug mode enabled')
```

## Next Steps

1. Configure Firestore security rules
2. Set up user authentication
3. Implement user creation/editing forms
4. Add bulk operations
5. Set up real-time notifications
6. Implement audit logging

## Support

For issues or questions:
1. Check the console for error messages
2. Verify Firebase configuration
3. Check Firestore security rules
4. Review the type definitions in `lib/types/user.ts`
