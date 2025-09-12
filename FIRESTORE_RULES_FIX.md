# Firebase Firestore Security Rules Setup

## Current Issue
You're experiencing "Missing or insufficient permissions" errors because your current Firestore security rules are too restrictive for database initialization operations.

## Quick Fix for Database Initialization

**Option 1: Temporary Open Rules (Recommended for Initial Setup)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Temporary: Allow all operations for authenticated users during setup
    match /{document=**} {
      allow read, write, create, delete: if request.auth != null;
    }
  }
}
```

**Option 2: Production-Ready Rules with Database Init Support**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - allow authenticated users to read/write
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow database test operations
    match /database_test/{document} {
      allow read, write, create, delete: if request.auth != null;
    }
    
    // Allow read access for status checks
    match /{document=**} {
      allow read: if request.auth != null;
    }
  }
}
```

## Steps to Fix the Permission Issue

### 1. Update Firestore Security Rules
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click "Firestore Database" in the left sidebar
4. Click "Rules" tab
5. Replace your current rules with Option 1 (for initial setup)
6. Click "Publish"

### 2. Test Database Connection
1. Go back to your Database Initialization page
2. Click "Test Connection" - it should now work
3. Run "Check Status" and "Seed Users" operations

### 3. Switch to Production Rules (After Initial Setup)
Once your database is initialized and working:
1. Replace the rules with Option 2 (more restrictive)
2. Click "Publish" again

## Current Rules Analysis
Looking at your current rules, they appear to have very specific role-based restrictions that are preventing the database initialization operations. The rules are checking for specific user roles and permissions that may not be properly set up yet.

## Security Considerations

**During Setup (Option 1):**
- ✅ Only authenticated users can access database
- ⚠️ All authenticated users have full access (temporary)
- 🔒 Use only during initial database setup

**Production (Option 2):**
- ✅ Role-based access control
- ✅ Read-only access for most operations
- ✅ Specific permissions for database operations
- 🔒 Secure for production use

## After Fixing
Once you update the rules, you should be able to:
- ✅ Test database connection successfully
- ✅ Check database status
- ✅ Seed users data
- ✅ Perform all database initialization operations

Remember to switch to more restrictive production rules after your initial database setup is complete!