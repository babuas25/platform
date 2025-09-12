@echo off
echo 🚀 Platform Database Initialization - Production Setup
echo ======================================================

REM Check if .env.local exists
if not exist ".env.local" (
    echo ❌ .env.local file not found!
    echo 📝 Creating .env.local template...
    
    (
        echo # Firebase Configuration ^(REQUIRED^)
        echo NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
        echo NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
        echo NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
        echo NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
        echo NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
        echo NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
        echo.
        echo # NextAuth Configuration ^(REQUIRED^)
        echo NEXTAUTH_SECRET=your_nextauth_secret_key
        echo NEXTAUTH_URL=https://yourdomain.com
        echo.
        echo # OAuth Providers ^(OPTIONAL^)
        echo GOOGLE_CLIENT_ID=your_google_client_id
        echo GOOGLE_CLIENT_SECRET=your_google_client_secret
        echo FACEBOOK_CLIENT_ID=your_facebook_client_id
        echo FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
        echo.
        echo # Production Settings
        echo NODE_ENV=production
    ) > .env.local
    
    echo ✅ .env.local template created!
    echo ⚠️  Please update all values in .env.local before continuing
    pause
    exit /b 1
)

echo ✅ .env.local file found

REM Check dependencies
echo 📦 Checking dependencies...
npm list next-auth >nul 2>&1
if errorlevel 1 (
    echo ❌ next-auth not found. Installing...
    npm install next-auth
)

npm list firebase >nul 2>&1
if errorlevel 1 (
    echo ❌ firebase not found. Installing...
    npm install firebase
)

echo ✅ Dependencies checked

REM Build the application
echo 🔨 Building application for production...
npm run build

if errorlevel 1 (
    echo ❌ Build failed! Please check your code for errors.
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.
echo 🎉 Production setup complete!
echo.
echo 📋 Next Steps:
echo 1. Update your Firebase Firestore security rules
echo 2. Configure OAuth providers in Google/Facebook consoles
echo 3. Deploy to your hosting platform
echo 4. Set environment variables in your hosting platform
echo 5. Test database initialization with SuperAdmin user
echo.
echo ⚠️  Important: Database initialization should only be used for initial setup!
echo.
echo 📖 See PRODUCTION_SETUP.md for detailed instructions
pause