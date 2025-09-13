# 🔧 Environment Variables Setup Guide

Complete guide for configuring all environment variables for production deployment.

## 📋 Required Variables

### 🔐 NextAuth Configuration

```bash
# Required - Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-random-secret-32-chars-long

# Required - Your deployed application URL
NEXTAUTH_URL=https://your-domain.vercel.app
```

### 🔥 Firebase Client Configuration

```bash
# Required - Get from Firebase Console → Project Settings → Web App Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### 🔐 OAuth Providers (Optional)

```bash
# Google OAuth - Get from Google Cloud Console
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789

# Facebook OAuth - Get from Facebook Developers
FACEBOOK_CLIENT_ID=123456789012345
FACEBOOK_CLIENT_SECRET=abc123def456ghi789jkl012mno345
```

### 🛡️ Firebase Admin SDK (Optional)

```bash
# Service Account Key - For full database functionality
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project",...}
```

## 🔧 How to Get Each Variable

### 🔥 Firebase Configuration

1. **Go to** [Firebase Console](https://console.firebase.google.com)
2. **Create new project** or select existing
3. **Add web app** (if not done)
4. **Go to** Project Settings → General → Your apps
5. **Copy** the config object values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",           // → NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "project.firebaseapp.com", // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "your-project-id",   // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "project.appspot.com", // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789", // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc123"       // → NEXT_PUBLIC_FIREBASE_APP_ID
};
```

### 🔐 Google OAuth Setup

1. **Go to** [Google Cloud Console](https://console.cloud.google.com)
2. **Create project** or select existing
3. **Enable** Google+ API
4. **Go to** Credentials → Create Credentials → OAuth 2.0 Client ID
5. **Set application type**: Web application
6. **Add authorized redirect URIs**:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```
7. **Copy** Client ID and Client Secret

### 📘 Facebook OAuth Setup

1. **Go to** [Facebook Developers](https://developers.facebook.com)
2. **Create app** → Consumer → Next
3. **Add Facebook Login** product
4. **Go to** Facebook Login → Settings
5. **Add Valid OAuth Redirect URIs**:
   ```
   https://your-domain.vercel.app/api/auth/callback/facebook
   http://localhost:3000/api/auth/callback/facebook
   ```
6. **Go to** Settings → Basic
7. **Copy** App ID and App Secret

### 🛡️ Firebase Admin SDK (Advanced)

1. **Go to** Firebase Console → Project Settings
2. **Go to** Service accounts tab
3. **Click** "Generate new private key"
4. **Download** the JSON file
5. **Convert to single line**:
   ```bash
   # Remove newlines and escape quotes
   {"type":"service_account","project_id":"..."}
   ```

## 🔧 Environment File Templates

### `.env.local` (Development)

```bash
# NextAuth
NEXTAUTH_SECRET=your-dev-secret-here
NEXTAUTH_URL=http://localhost:3000

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Firebase Admin SDK (Optional)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### Vercel Environment Variables

In your Vercel dashboard, add the same variables:

1. **Go to** Project Settings → Environment Variables
2. **Add each variable** one by one
3. **Set environment**: Production (and Preview if needed)
4. **Save** and redeploy

## ✅ Validation Checklist

### Required Variables Check:
- [ ] `NEXTAUTH_SECRET` - 32+ character random string
- [ ] `NEXTAUTH_URL` - Your production URL
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase sender ID
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID

### Optional Variables Check:
- [ ] `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth
- [ ] `FACEBOOK_CLIENT_ID` & `FACEBOOK_CLIENT_SECRET` - Facebook OAuth
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` - Admin SDK functionality

## 🔧 Quick Generators

### Generate NextAuth Secret:
```bash
# Method 1: OpenSSL
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Online
# Visit: https://generate-secret.vercel.app/32
```

### Format Service Account Key:
```bash
# Remove all newlines and spaces
cat service-account.json | tr -d '\n' | tr -d ' '
```

## 🚨 Security Notes

1. **Never commit** `.env.local` to repository
2. **Use different secrets** for development and production
3. **Rotate secrets** regularly
4. **Limit OAuth redirect URIs** to your domains only
5. **Monitor Firebase usage** for unusual activity

## 🔍 Troubleshooting

### Issue: "Invalid OAuth Redirect"
**Fix**: Ensure redirect URIs are correctly set in OAuth provider

### Issue: "Firebase Permission Denied"
**Fix**: Check Firebase project ID and security rules

### Issue: "NextAuth Configuration Error"
**Fix**: Verify NEXTAUTH_URL matches your deployment URL

### Issue: "Environment Variable Not Found"
**Fix**: Ensure variable names match exactly (case-sensitive)

---

📚 **Next Steps**: [Vercel Deployment Guide](vercel-deployment.md)