# ⚙️ Production Deployment Checklist

## Pre-Deployment Checklist

### 🔧 Environment Configuration
- [ ] **Environment Variables Set**
  - [ ] `NEXTAUTH_SECRET` (generated secure key)
  - [ ] `NEXTAUTH_URL` (production domain)
  - [ ] All Firebase configuration variables
  - [ ] OAuth provider credentials (production)
  - [ ] Firebase service account key (single-line format)

- [ ] **Firebase Project Setup**
  - [ ] Production Firebase project created
  - [ ] Firestore database enabled
  - [ ] Authentication providers configured
  - [ ] Security rules deployed
  - [ ] Service account key generated

- [ ] **OAuth Providers Configuration**
  - [ ] Google OAuth redirect URIs updated
  - [ ] Facebook OAuth redirect URIs updated
  - [ ] Production domains whitelisted

### 🏗️ Build Verification
- [ ] **Local Build Success**
  ```bash
  npm run build
  npm start
  ```
- [ ] **TypeScript Compilation**
  ```bash
  npx tsc --noEmit
  ```
- [ ] **Linting Passed**
  ```bash
  npm run lint
  ```
- [ ] **Environment Variables Validated**
  ```bash
  # Check all required variables are present
  node scripts/validate-env.js
  ```

### 🔒 Security Checklist
- [ ] **Firestore Security Rules**
  - [ ] Production security rules deployed
  - [ ] Role-based access control tested
  - [ ] No unauthorized read/write access
  - [ ] Audit logging enabled

- [ ] **Authentication Security**
  - [ ] NextAuth secret is secure and unique
  - [ ] OAuth providers use production credentials
  - [ ] Session configuration is secure
  - [ ] HTTPS enforced

- [ ] **API Security**
  - [ ] All endpoints have proper authentication
  - [ ] Role-based permissions implemented
  - [ ] Input validation in place
  - [ ] Rate limiting configured

### 📊 Performance Checklist
- [ ] **Bundle Optimization**
  - [ ] Bundle size within acceptable limits
  - [ ] Tree shaking enabled
  - [ ] Code splitting implemented
  - [ ] Dynamic imports for heavy components

- [ ] **Image Optimization**
  - [ ] Next.js Image component used
  - [ ] Proper sizing and formats
  - [ ] WebP/AVIF support enabled

- [ ] **Database Optimization**
  - [ ] Firestore indexes created
  - [ ] Query patterns optimized
  - [ ] Pagination implemented
  - [ ] Connection pooling configured

## Deployment Process

### 1. Final Code Preparation
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Run full test suite
npm test

# Final build verification
npm run build
npm start
```

### 2. Environment Variables Setup
Create production environment file:
```bash
# .env.production
NEXTAUTH_SECRET=your-super-secure-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app

# Google OAuth (Production)
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret

# Facebook OAuth (Production)
FACEBOOK_CLIENT_ID=your-production-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-production-facebook-client-secret

# Firebase Configuration (Production)
NEXT_PUBLIC_FIREBASE_API_KEY=your-production-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-production-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-production-app-id

# Firebase Admin SDK (Production)
FIREBASE_PROJECT_ID=your-production-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRODUCTION_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### 3. Vercel Deployment

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
# ... add all other variables
```

#### Option B: GitHub Integration
```bash
# Push to main branch
git add .
git commit -m "Production deployment ready"
git push origin main

# Vercel will automatically deploy
```

### 4. Post-Deployment Verification

#### Health Checks
```bash
# Check application health
curl https://your-domain.vercel.app/api/health

# Verify authentication
curl https://your-domain.vercel.app/api/auth/session

# Test database connectivity
curl https://your-domain.vercel.app/api/database/status
```

#### Functional Testing
- [ ] **Authentication Flow**
  - [ ] Google OAuth login works
  - [ ] Facebook OAuth login works
  - [ ] Session management functional
  - [ ] Logout process works

- [ ] **User Management**
  - [ ] User list displays correctly
  - [ ] User creation works
  - [ ] User editing functional
  - [ ] Role-based access control active

- [ ] **Database Operations**
  - [ ] Data reads successfully
  - [ ] Data writes successfully
  - [ ] Real-time updates work
  - [ ] Error handling functional

## Domain Configuration

### Custom Domain Setup
1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records

2. **DNS Configuration**
   ```
   Type: CNAME
   Name: @ (or your subdomain)
   Value: cname.vercel-dns.com
   TTL: Auto
   ```

3. **SSL Certificate**
   - Automatic SSL provisioning
   - HTTPS redirect enabled
   - HTTP/2 support active

### Domain Verification
```bash
# Check DNS propagation
nslookup your-domain.com

# Test SSL certificate
curl -I https://your-domain.com

# Verify redirect
curl -I http://your-domain.com
```

## Monitoring Setup

### Application Monitoring
- [ ] **Vercel Analytics Enabled**
  ```typescript
  // Add to app/layout.tsx
  import { Analytics } from '@vercel/analytics/react'
  
  export default function RootLayout({ children }) {
    return (
      <html>
        <body>
          {children}
          <Analytics />
        </body>
      </html>
    )
  }
  ```

- [ ] **Performance Monitoring**
  - Core Web Vitals tracking
  - Function performance metrics
  - Error rate monitoring
  - User session tracking

### Database Monitoring
- [ ] **Firebase Monitoring**
  - Firestore usage metrics
  - Authentication metrics
  - Performance monitoring
  - Error tracking

### Alert Configuration
```typescript
// Example monitoring configuration
const monitoringConfig = {
  uptime: {
    interval: '5 minutes',
    timeout: '30 seconds',
    locations: ['us-east-1', 'eu-west-1', 'ap-southeast-1']
  },
  
  performance: {
    responseTime: '< 2 seconds',
    availability: '> 99.9%',
    errorRate: '< 1%'
  },
  
  alerts: {
    email: 'admin@yourcompany.com',
    slack: 'your-slack-webhook',
    thresholds: {
      responseTime: 5000,
      errorRate: 0.05,
      downtime: 300
    }
  }
}
```

## Backup Strategy

### Database Backup
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_${DATE}"

# Export Firestore data
gcloud firestore export gs://your-backup-bucket/$BACKUP_NAME \
  --project=your-project-id

echo "Backup completed: $BACKUP_NAME"
```

### Code Backup
- [ ] **Version Control**
  - Main branch protected
  - All changes via pull requests
  - Tagged releases for major versions

- [ ] **Environment Backup**
  - Environment variables documented
  - Configuration files version controlled
  - Deployment scripts maintained

## Rollback Plan

### Emergency Rollback
```bash
# Quick rollback via Vercel CLI
vercel rollback

# Or rollback to specific deployment
vercel rollback <deployment-url>
```

### Database Rollback
```bash
# Restore from backup
gcloud firestore import gs://your-backup-bucket/backup_YYYYMMDD_HHMMSS \
  --project=your-project-id
```

### Communication Plan
- [ ] **Incident Response**
  - Stakeholder notification list
  - Status page updates
  - User communication templates
  - Technical team escalation

## Security Hardening

### Additional Security Measures
- [ ] **Security Headers**
  ```typescript
  // next.config.js
  const securityHeaders = [
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'Referrer-Policy',
      value: 'origin-when-cross-origin',
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains; preload',
    }
  ]
  ```

- [ ] **Content Security Policy**
  ```typescript
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
  ```

### Regular Security Tasks
- [ ] **Weekly Tasks**
  - Review access logs
  - Check for failed login attempts
  - Monitor unusual activity patterns

- [ ] **Monthly Tasks**
  - Update dependencies
  - Review user permissions
  - Audit security configurations
  - Test backup and restore procedures

- [ ] **Quarterly Tasks**
  - Security penetration testing
  - Access control review
  - Compliance assessment
  - Disaster recovery testing

## Maintenance Schedule

### Regular Updates
- [ ] **Weekly**
  - Monitor application performance
  - Review error logs
  - Check database health

- [ ] **Monthly**
  - Update dependencies
  - Review and optimize performance
  - Backup verification

- [ ] **Quarterly**
  - Security audit
  - Performance optimization review
  - Feature usage analysis
  - User feedback review

## Support and Documentation

### Documentation Updates
- [ ] **API Documentation**
  - All endpoints documented
  - Example requests/responses included
  - Error codes documented

- [ ] **User Guides**
  - Admin user guide
  - End user documentation
  - Troubleshooting guides

### Support Setup
- [ ] **Support Channels**
  - Help desk system configured
  - Support email setup
  - Knowledge base created
  - FAQ section populated

---

**Deployment Date**: ___________
**Deployed By**: ___________
**Version**: ___________
**Status**: [ ] Success [ ] Issues [ ] Rollback Required

**Last Updated**: January 2025
**Version**: 1.0.0
**Checklist Status**: Production Ready ✅