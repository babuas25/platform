# 🔐 Authentication System Documentation

Complete documentation for the multi-provider authentication system using NextAuth.js with Firebase integration.

## 🎯 Overview

The authentication system provides secure, scalable user authentication with multiple providers, session management, and role-based access control.

## 🔧 Authentication Providers

### 🟡 Google OAuth
- **Provider**: Google OAuth 2.0
- **Features**: One-click Google account login
- **Configuration**: Google Cloud Console
- **Permissions**: Email, Profile

### 🔵 Facebook OAuth  
- **Provider**: Facebook OAuth 2.0
- **Features**: One-click Facebook account login
- **Configuration**: Facebook Developers
- **Permissions**: Email, Public Profile

### 🔥 Firebase Authentication
- **Provider**: Firebase Auth
- **Features**: Email/password, phone authentication
- **Integration**: Server-side validation
- **Security**: Firebase security rules

## 🏗️ Architecture

### NextAuth.js Core
```typescript
// app/api/auth/[...nextauth]/route.ts
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!
    })
  ],
  // Custom configuration...
}
```

### Session Management
```typescript
// Session structure
interface Session {
  user: {
    id: string
    name: string
    email: string
    image: string
    role: UserRole
  }
  expires: string
}
```

## 🔐 Security Features

### JWT Token Security
- **Signed Tokens**: Cryptographically signed JWT tokens
- **Secure Cookies**: HttpOnly, Secure, SameSite cookies
- **Token Rotation**: Automatic token refresh
- **Expiration**: Configurable session timeouts

### Role-Based Access
- **Dynamic Roles**: Roles assigned based on email or manual assignment
- **Route Protection**: Middleware-based route protection
- **Component Security**: Client-side access control
- **API Security**: Server-side endpoint protection

### Security Headers
```typescript
// Security configuration
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}
```

## 🎯 Authentication Flow

### OAuth Flow (Google/Facebook)
1. **User clicks** OAuth provider button
2. **Redirect** to provider authorization page
3. **User authorizes** application access
4. **Provider redirects** back with authorization code
5. **NextAuth exchanges** code for access token
6. **Create session** with user information
7. **Redirect** to dashboard or intended page

### Registration Flow
1. **User registers** via OAuth or email
2. **Profile creation** in database
3. **Role assignment** (auto or manual)
4. **Session establishment**
5. **Redirect** to onboarding or dashboard

## 🔧 Configuration

### Environment Variables
```bash
# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

### Provider Configuration
```typescript
// Google Cloud Console
const googleConfig = {
  clientId: "123-abc.apps.googleusercontent.com",
  clientSecret: "GOCSPX-abc123def456",
  redirectUris: [
    "https://your-domain.com/api/auth/callback/google",
    "http://localhost:3000/api/auth/callback/google"
  ]
}

// Facebook Developers
const facebookConfig = {
  appId: "123456789",
  appSecret: "abc123def456",
  validOAuthRedirectURIs: [
    "https://your-domain.com/api/auth/callback/facebook",
    "http://localhost:3000/api/auth/callback/facebook"
  ]
}
```

## 🛡️ Route Protection

### Middleware Protection
```typescript
// middleware.ts
export default withAuth(
  function middleware(req) {
    // Route-specific logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Authorization logic
        return !!token
      }
    }
  }
)
```

### Page-Level Protection
```typescript
// Protected page component
export default function ProtectedPage() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <Loading />
  if (!session) redirect('/auth')
  
  return <PageContent />
}
```

### API Route Protection
```typescript
// Protected API route
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // API logic
}
```

## 👤 User Roles & Permissions

### Default Role Assignment
```typescript
// Auto-assign SuperAdmin role
const autoSuperAdminEmails = [
  'babuas25@gmail.com',
  // Add more emails as needed
]

// Role assignment logic
if (autoSuperAdminEmails.includes(user.email)) {
  user.role = 'SuperAdmin'
} else {
  user.role = 'User' // Default role
}
```

### Role Hierarchy
```typescript
const roleHierarchy = {
  SuperAdmin: 10,
  Admin: 8,
  Staff: 6,
  Partner: 4,
  Agent: 2,
  User: 1
}
```

## 🎨 User Interface

### Authentication Pages
- **Login Page**: `/auth` - Multi-provider login options
- **Registration**: Integrated with OAuth providers
- **Profile Setup**: Post-registration profile completion

### Session Indicators
- **User Avatar**: Current user profile picture
- **Role Badge**: Visual role indicator
- **Session Timer**: Active session duration
- **Status Indicator**: Online/offline status

### Navigation Security
- **Conditional Menus**: Role-based navigation
- **Protected Routes**: Hidden unauthorized links
- **Access Messages**: Clear permission messages

## 📱 Responsive Authentication

### Desktop Experience
- **Full OAuth Buttons**: Complete provider branding
- **Side-by-Side Options**: Multiple authentication methods
- **Rich Animations**: Smooth transitions

### Mobile Experience
- **Touch-Optimized**: Large, touch-friendly buttons
- **Single Column**: Streamlined layout
- **Quick Access**: Minimal steps to authenticate

## 🔍 Session Management

### Session Storage
- **Secure Cookies**: HTTP-only, secure cookies
- **Database Sessions**: Optional database session storage
- **Client Storage**: Minimal client-side data

### Session Validation
- **Server Validation**: Every API request validated
- **Client Validation**: Real-time session checks
- **Automatic Refresh**: Silent token refresh

### Logout Handling
- **Complete Cleanup**: Clear all session data
- **Provider Logout**: Optional provider session cleanup
- **Redirect Handling**: Post-logout navigation

## 🚨 Security Best Practices

### Implementation Security
- **Environment Variables**: Secure credential storage
- **HTTPS Only**: Force secure connections
- **CSRF Protection**: Cross-site request forgery protection
- **XSS Prevention**: Content security policies

### OAuth Security
- **State Parameter**: CSRF protection for OAuth
- **Nonce Validation**: Replay attack prevention
- **Scope Limitation**: Minimal required permissions
- **Token Validation**: Verify all OAuth tokens

## 📊 Authentication Analytics

### Available Metrics
- **Login Frequency**: User login patterns
- **Provider Usage**: OAuth provider popularity
- **Failed Attempts**: Security monitoring
- **Session Duration**: User engagement metrics

### Security Monitoring
- **Failed Logins**: Brute force detection
- **Unusual Activity**: Anomaly detection
- **Geographic Analysis**: Location-based alerts
- **Device Tracking**: Multiple device usage

## 🔧 Customization

### Custom Login Flow
```typescript
// Custom sign-in page
export default function CustomSignIn() {
  return (
    <div>
      <button onClick={() => signIn('google')}>
        Sign in with Google
      </button>
      <button onClick={() => signIn('facebook')}>
        Sign in with Facebook
      </button>
    </div>
  )
}
```

### Custom Callbacks
```typescript
// Custom authentication callbacks
const authOptions = {
  callbacks: {
    async signIn({ user, account }) {
      // Custom sign-in logic
      return true
    },
    async session({ session, token }) {
      // Custom session enhancement
      session.user.role = token.role
      return session
    }
  }
}
```

## 🚀 Advanced Features

### Multi-Factor Authentication
- **TOTP Support**: Time-based one-time passwords
- **SMS Verification**: Phone number verification
- **Email Verification**: Email-based verification

### Social Authentication
- **Profile Syncing**: Automatic profile updates
- **Friend Networks**: Social connection features
- **Activity Sharing**: Optional activity sharing

## 🔍 Troubleshooting

### Common Issues

#### "OAuth Redirect Mismatch"
**Cause**: Incorrect redirect URI configuration
**Solution**: Verify redirect URIs in OAuth provider settings

#### "Session Not Found"
**Cause**: Cookie or session storage issues
**Solution**: Check cookie settings and clear browser data

#### "Role Not Assigned"
**Cause**: Role assignment logic not triggered
**Solution**: Verify email matches auto-assignment rules

#### "Provider Configuration Error"
**Cause**: Missing or incorrect environment variables
**Solution**: Double-check all OAuth credentials

### Debug Mode
```typescript
// Enable NextAuth debugging
export const authOptions = {
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error(code, metadata)
    },
    warn(code) {
      console.warn(code)
    }
  }
}
```

---

📚 **Related Documentation**:
- [Role-Based Access Control](role-based-access.md)
- [User Management](user-management.md)
- [API Security](../technical/api-endpoints.md)
- [Environment Setup](../deployment/environment-setup.md)