# 🛠️ Deployment Troubleshooting Guide

## Common Deployment Issues

### Build Failures

#### Issue: "Firebase Admin SDK requires service account credentials"
**Symptoms:**
```
Error: Firebase Admin SDK requires service account credentials in production
```

**Solution:**
1. Ensure all Firebase environment variables are set:
   ```bash
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   ```

2. Verify private key format (single line with `\n` for newlines):
   ```bash
   # Correct format
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwgg...\n-----END PRIVATE KEY-----\n"
   ```

3. Check service account permissions in Firebase Console

#### Issue: "Module not found" errors
**Symptoms:**
```
Module not found: Can't resolve 'fs' in ...
```

**Solution:**
Update `next.config.js`:
```javascript
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      }
    }
    return config
  }
}
```

#### Issue: TypeScript compilation errors
**Symptoms:**
```
Type error: Duplicate identifier 'NextRequest'
```

**Solution:**
1. Check for duplicate imports in files
2. Update TypeScript configuration:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "skipLibCheck": true
     }
   }
   ```

### Authentication Issues

#### Issue: "Missing or insufficient permissions"
**Symptoms:**
- Users can't access protected routes
- Database operations fail with permission errors

**Solution:**
1. Verify Firestore security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

2. Check NextAuth configuration:
   ```javascript
   // pages/api/auth/[...nextauth].ts
   export default NextAuth({
     providers: [
       GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       })
     ],
     callbacks: {
       session: async ({ session, token }) => {
         return session
       }
     }
   })
   ```

#### Issue: OAuth redirect mismatch
**Symptoms:**
```
Error 400: redirect_uri_mismatch
```

**Solution:**
1. Update OAuth redirect URIs in Google Console:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```

2. Verify NEXTAUTH_URL matches deployment URL:
   ```bash
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

### Database Issues

#### Issue: "Objects are not valid as a React child"
**Symptoms:**
```
Error: Objects are not valid as a React child (found: object with keys {_seconds, _nanoseconds})
```

**Solution:**
Use proper timestamp formatting:
```typescript
const formatDate = (dateValue: any) => {
  if (!dateValue) return 'Never'
  
  if (dateValue && typeof dateValue === 'object' && dateValue._seconds) {
    const date = new Date(dateValue._seconds * 1000)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }
  
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  } catch {
    return 'Invalid Date'
  }
}
```

#### Issue: Database initialization fails
**Symptoms:**
- Database initialization page shows errors
- Sample data not created

**Solution:**
1. Check Firebase Admin SDK initialization
2. Verify database rules allow admin operations
3. Use database initialization page: `/database-init`

### Environment Variable Issues

#### Issue: Environment variables not loading
**Symptoms:**
- `process.env.VARIABLE_NAME` returns undefined
- Features not working in production

**Solution:**
1. Verify variable names match exactly (case-sensitive)
2. Check Vercel dashboard environment variables
3. Restart deployment after adding variables
4. Use `NEXT_PUBLIC_` prefix for client-side variables

#### Issue: Multi-line environment variables
**Symptoms:**
```
Error: Unexpected token in JSON
```

**Solution:**
Format multi-line variables properly:
```bash
# Wrong
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwgg...
-----END PRIVATE KEY-----

# Correct
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwgg...\n-----END PRIVATE KEY-----\n"
```

### Performance Issues

#### Issue: Slow page loads
**Symptoms:**
- Pages take > 3 seconds to load
- API responses are slow

**Solutions:**
1. Optimize images:
   ```javascript
   // next.config.js
   const nextConfig = {
     images: {
       formats: ['image/webp', 'image/avif'],
       deviceSizes: [640, 750, 828, 1080, 1200],
     }
   }
   ```

2. Enable caching:
   ```javascript
   // API routes
   export async function GET() {
     const data = await fetchData()
     return NextResponse.json(data, {
       headers: {
         'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600'
       }
     })
   }
   ```

3. Use dynamic imports:
   ```javascript
   const DynamicComponent = dynamic(() => import('./Component'), {
     loading: () => <p>Loading...</p>,
   })
   ```

#### Issue: Function timeout errors
**Symptoms:**
```
Error: Function execution timed out
```

**Solutions:**
1. Optimize database queries
2. Use pagination for large datasets
3. Implement background processing for heavy operations
4. Configure function timeout in `vercel.json`:
   ```json
   {
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 30
       }
     }
   }
   ```

### Mobile/Responsive Issues

#### Issue: Mobile layout problems
**Symptoms:**
- Buttons too small on mobile
- Text overflow on small screens
- Navigation menu not working

**Solutions:**
1. Test responsive breakpoints:
   ```css
   /* Tailwind responsive classes */
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
   ```

2. Ensure touch targets are adequate:
   ```css
   /* Minimum 44px touch targets */
   <button className="min-h-[44px] min-w-[44px]">
   ```

3. Test on real devices or browser dev tools

## Debugging Tools

### Vercel Logs
```bash
# View function logs
vercel logs [deployment-url]

# Real-time logs
vercel logs --follow
```

### Local Development
```bash
# Run Vercel dev environment
vercel dev

# Test production build locally
npm run build
npm start
```

### Browser Developer Tools
1. **Network Tab**: Check API request/response times
2. **Console**: Look for JavaScript errors
3. **Application Tab**: Verify localStorage, cookies
4. **Lighthouse**: Performance and accessibility audits

### Database Debugging
```javascript
// Add logging to API routes
console.log('API called:', { method: req.method, url: req.url })
console.log('User data:', userData)
```

## Getting Help

### Self-Diagnosis Checklist
- [ ] Environment variables are correctly set
- [ ] Firebase project is properly configured
- [ ] OAuth providers have correct redirect URIs
- [ ] Database rules allow required operations
- [ ] All dependencies are installed
- [ ] Build completes successfully locally

### Support Resources
1. **Vercel Support**: [vercel.com/support](https://vercel.com/support)
2. **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
3. **Firebase Documentation**: [firebase.google.com/docs](https://firebase.google.com/docs)
4. **GitHub Issues**: Check repository issues tab

### Error Reporting
When reporting issues, include:
1. **Error message** (full stack trace)
2. **Steps to reproduce**
3. **Environment** (dev/production)
4. **Browser/device** information
5. **Relevant configuration** (without secrets)

## Prevention Best Practices

### Pre-Deployment Testing
```bash
# Test build locally
npm run build
npm start

# Test with production environment variables
cp .env.production .env.local
npm run dev
```

### Monitoring Setup
1. Set up error tracking (Sentry, LogRocket)
2. Configure uptime monitoring
3. Set up performance monitoring
4. Enable real user monitoring (RUM)

### Regular Maintenance
- Update dependencies monthly
- Review and rotate API keys quarterly
- Monitor performance metrics
- Back up database regularly

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Comprehensive Troubleshooting Guide ✅