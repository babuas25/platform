# Production Setup Guide

## Prerequisites for Production Deployment

### 1. Environment Variables
Create a `.env.local` file (or configure in your hosting platform) with the following required variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://yourdomain.com

# OAuth Providers (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# Production Settings
NODE_ENV=production
```

### 2. Firebase Firestore Security Rules
Update your Firestore security rules to allow database operations for authenticated SuperAdmin users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - allow read/write for authenticated users
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow SuperAdmin to perform database initialization
    match /{document=**} {
      allow read, write: if request.auth != null 
        && resource.data.role == 'SuperAdmin';
    }
  }
}
```

### 3. Firebase Authentication Configuration
1. Go to Firebase Console → Authentication → Settings
2. Add your production domain to Authorized domains
3. Configure OAuth redirect URIs:
   - Google: `https://yourdomain.com/api/auth/callback/google`
   - Facebook: `https://yourdomain.com/api/auth/callback/facebook`

### 4. Database Initialization Security

#### SuperAdmin Access Control
- Database initialization is restricted to SuperAdmin role only
- Requires user authentication and role verification
- All operations are logged for audit trails

#### Production Considerations
- The database initialization feature is designed for initial setup of new environments
- Should be used only when setting up a new Firebase project
- Consider disabling after initial setup for maximum security

### 5. Deployment Steps

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Test production build locally:**
   ```bash
   npm run start
   ```

3. **Deploy to your hosting platform** (Vercel, Netlify, etc.)

4. **Configure environment variables** in your hosting platform

5. **Update Firebase settings** with production domain

6. **Test database initialization:**
   - Login as SuperAdmin
   - Navigate to Database Initialization
   - Run configuration check
   - Perform database seeding

### 6. Security Checklist

- [ ] All environment variables configured
- [ ] Firebase security rules updated
- [ ] OAuth redirect URIs configured
- [ ] Production domain added to Firebase authorized domains
- [ ] SuperAdmin user created and tested
- [ ] Database initialization tested
- [ ] All API endpoints secured with authentication

### 7. Post-Deployment

1. **Create SuperAdmin User:**
   - Use Firebase console to manually create the first SuperAdmin user
   - Or use the registration API with SuperAdmin role

2. **Initialize Database:**
   - Login as SuperAdmin
   - Use Database Initialization feature to seed initial data

3. **Verify All Features:**
   - Test authentication flows
   - Verify role-based access control
   - Test database operations

### 8. Monitoring and Maintenance

- Monitor Firebase usage and quotas
- Regular security rule reviews
- Database backup strategies
- User management workflows

## Important Security Notes

⚠️ **Database initialization should only be used for initial setup of new environments**

⚠️ **Consider implementing additional IP restrictions for production database operations**

⚠️ **Always backup your database before running initialization operations**

⚠️ **Monitor Firebase Firestore usage to avoid unexpected costs**