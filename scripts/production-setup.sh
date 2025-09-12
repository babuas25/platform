#!/bin/bash

# Production Deployment Script for Platform Database Initialization
# This script helps set up the database initialization feature for production

echo "🚀 Platform Database Initialization - Production Setup"
echo "======================================================"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "📝 Creating .env.local template..."
    
    cat > .env.local << EOL
# Firebase Configuration (REQUIRED)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# NextAuth Configuration (REQUIRED)
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://yourdomain.com

# OAuth Providers (OPTIONAL)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# Production Settings
NODE_ENV=production
EOL

    echo "✅ .env.local template created!"
    echo "⚠️  Please update all values in .env.local before continuing"
    exit 1
fi

echo "✅ .env.local file found"

# Check if required packages are installed
echo "📦 Checking dependencies..."
if ! npm list next-auth &> /dev/null; then
    echo "❌ next-auth not found. Installing..."
    npm install next-auth
fi

if ! npm list firebase &> /dev/null; then
    echo "❌ firebase not found. Installing..."
    npm install firebase
fi

echo "✅ Dependencies checked"

# Build the application
echo "🔨 Building application for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please check your code for errors."
    exit 1
fi

echo ""
echo "🎉 Production setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update your Firebase Firestore security rules"
echo "2. Configure OAuth providers in Google/Facebook consoles"
echo "3. Deploy to your hosting platform"
echo "4. Set environment variables in your hosting platform"
echo "5. Test database initialization with SuperAdmin user"
echo ""
echo "⚠️  Important: Database initialization should only be used for initial setup!"
echo ""
echo "📖 See PRODUCTION_SETUP.md for detailed instructions"