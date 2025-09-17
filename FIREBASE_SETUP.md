# Firebase Configuration Guide

## Issue: HTTP 500 Errors in User Management

The HTTP 500 errors you're seeing are caused by **missing Firebase configuration**. This guide will help you set up Firebase to resolve the issue.

## Quick Fix for Testing

If you just want to see the app working with demo data:

1. Open `.env.local` file
2. Add this line:
   ```
   USE_DEMO_DATA=true
   ```
3. Restart your development server

## Full Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Follow the setup wizard
4. Enable Firestore Database in the project

### Step 2: Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. In the "General" tab, scroll down to "Your apps"
3. Click "Add app" and select "Web" (</> icon)
4. Register your app and copy the config object

### Step 3: Get Service Account Key

1. In Firebase Console, go to Project Settings
2. Click on "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file

### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase credentials in `.env.local`:

```env
# Client Configuration (from Firebase Console > Project Settings > General)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Server Configuration (from downloaded service account JSON)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...your_entire_json_here...}

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here

# Demo mode (set to false when Firebase is configured)
USE_DEMO_DATA=false
```

### Step 5: Restart Development Server

```bash
npm run dev
```

## Firestore Security Rules

Set up basic security rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow admins to read/write all user data
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['SuperAdmin', 'Admin'];
    }
  }
}
```

## Troubleshooting

### Common Issues:

1. **"Firebase not configured" error**
   - Make sure all environment variables are set
   - Check that `.env.local` is in the root directory
   - Restart the development server

2. **"Permission denied" errors**
   - Check Firestore security rules
   - Ensure user authentication is working

3. **"Service account key invalid"**
   - Make sure the JSON is on a single line
   - Escape any quotes properly
   - Verify the service account has Firestore permissions

### Environment Variable Check

You can verify your configuration by checking the browser console. The app will log whether Firebase is properly configured.

## Demo Mode

The app includes a demo mode that provides sample user data when Firebase is not configured. This is useful for:
- Testing the UI without setting up Firebase
- Development when you don't have access to the Firebase project
- Demonstrations

Enable demo mode by setting `USE_DEMO_DATA=true` in your `.env.local` file.

## Production Deployment

For production deployment:

1. Set all environment variables in your hosting platform
2. Ensure `USE_DEMO_DATA=false` or remove it entirely
3. Set proper Firestore security rules
4. Configure authentication providers (Google, Facebook) in Firebase Console

## Support

If you continue to have issues:

1. Check the browser console for detailed error messages
2. Check the server logs (terminal where you run `npm run dev`)
3. Verify all environment variables are correctly set
4. Test with demo mode first to ensure the UI works