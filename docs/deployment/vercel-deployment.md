# 🚀 Vercel Deployment Guide

## Overview
This guide covers deploying your Next.js Dashboard Platform to Vercel with automatic deployments, environment variables, and custom domains.

## Prerequisites
- Vercel account (free tier available)
- GitHub repository (optional but recommended)
- Firebase project configured
- Environment variables ready

## Deployment Methods

### Method 1: Vercel CLI (Recommended)

#### 1. Install Vercel CLI
```bash
npm i -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Deploy from Project Directory
```bash
# First time deployment
vercel

# Production deployment
vercel --prod
```

#### 4. Configure Environment Variables
```bash
# Add environment variables via CLI
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GOOGLE_CLIENT_ID
# ... add all required variables
```

### Method 2: GitHub Integration

#### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

#### 2. Import in Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure build settings (auto-detected)

#### 3. Environment Variables Setup
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.example`
3. Ensure production values are set

## Build Configuration

### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Next.js Configuration
Your `next.config.js` is already optimized:
```javascript
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin']
  },
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

## Environment Variables on Vercel

### Required Variables
Add these in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth (optional)
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin (Production)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### Setting Environment Variables
1. **Via Dashboard**: Project Settings → Environment Variables
2. **Via CLI**: `vercel env add VARIABLE_NAME`
3. **Bulk Import**: Use `.env` file format

## Domain Configuration

### Custom Domain Setup
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records:
   ```
   Type: CNAME
   Name: your-subdomain (or @)
   Value: cname.vercel-dns.com
   ```

### SSL/HTTPS
- Automatic SSL certificates provided
- Force HTTPS enabled by default
- Custom certificates supported

## Build Optimization

### Performance Settings
```javascript
// next.config.js optimizations
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  }
}
```

### Bundle Analysis
```bash
# Analyze bundle size
npm install -g @next/bundle-analyzer
npm run build && npm run analyze
```

## Deployment Verification

### Post-Deployment Checklist
- [ ] Application loads successfully
- [ ] Authentication works (Google/Facebook login)
- [ ] Database connections established
- [ ] User management functions work
- [ ] API endpoints respond correctly
- [ ] Environment variables configured
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)

### Health Check Endpoints
```bash
# Test deployment health
curl https://your-domain.vercel.app/api/health
curl https://your-domain.vercel.app/api/users
```

## Monitoring & Analytics

### Vercel Analytics
```javascript
// Add to layout.tsx
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

### Performance Monitoring
- Function logs: Vercel Dashboard → Functions
- Real-time analytics available
- Error tracking integrated

## Continuous Deployment

### Automatic Deployments
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches
- **Development**: Feature branches

### Branch Protection
```bash
# Set up branch protection on GitHub
# Require pull request reviews
# Require status checks to pass
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs
vercel logs your-deployment-url

# Local build test
npm run build
npm start
```

#### Environment Variable Issues
```bash
# Verify variables are set
vercel env ls

# Test locally
vercel dev
```

#### Function Timeouts
- Default: 10s (Hobby), 60s (Pro)
- Configure in `vercel.json`
- Optimize long-running operations

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

## Security Considerations

### Production Security
- Environment variables are encrypted
- Automatic HTTPS enforcement
- DDoS protection included
- Edge network security

### Additional Security
```bash
# Security headers in next.config.js
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
  }
]
```

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Deployment Status**: Production Ready ✅