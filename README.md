# Modern Dashboard Application

A responsive, modern dashboard application built with Next.js 15.5.2, featuring a clean UI design inspired by auth.thecityflyers.com.

## 🚀 Features

- **Modern Tech Stack**: Built with Next.js 15.5.2, React 18, and TypeScript
- **Responsive Design**: Fully responsive layout with collapsible sidebar
- **Theme Support**: Dark/Light mode with system preference detection
- **Multi-language Support**: Language selector with 12 languages
- **Typography**: Geist Sans font for modern, clean aesthetics
- **Component Library**: Comprehensive UI components using Radix UI
- **Accessible**: Built with accessibility-first principles
- **Performance Optimized**: Server-side rendering and optimized loading

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5.2.2
- **Styling**: Tailwind CSS 3.3.3
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Font**: Geist Sans
- **Theme**: next-themes for dark/light mode
- **Build Tools**: PostCSS, Autoprefixer

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/babuas25/farmwork.git
   cd farmwork
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── blog/              # Blog page
│   ├── news/              # News page
│   ├── services/          # Services page
│   ├── travel-advisory/   # Travel Advisory page
│   ├── promotions/        # Promotions page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   │   ├── header.tsx    # Main header
│   │   ├── sidebar.tsx   # Collapsible sidebar
│   │   └── main-layout.tsx
│   ├── providers/        # Context providers
│   └── ui/              # UI component library
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── public/             # Static assets
```

## 🎨 Design Features

### Header (56px height)
- Fixed positioning for consistent navigation
- Search functionality
- Language selector with 12 languages
- Dark/Light theme toggle
- Responsive design with mobile menu

### Sidebar (80px collapsed, 256px expanded)
- Smooth collapse/expand animations
- Navigation with icons and labels
- Submenu support for Services
- Chevron indicators (right when collapsed, left when expanded)
- Matches auth.thecityflyers.com design specifications

### Layout
- Responsive grid system
- Smooth transitions and animations
- Optimized for both desktop and mobile devices
- Progressive enhancement for better performance

## 🌟 Key Components

### Navigation Items
- **Home**: Dashboard overview
- **Services**: Expandable menu with submenu options
- **Travel Advisory**: Travel information and updates
- **News**: Latest news and updates
- **Blog**: Blog posts and articles
- **Promotions**: Special offers and promotions

### Theme System
- System preference detection
- Manual light/dark mode toggle
- Smooth theme transitions
- Persistent theme selection

### Language Support
- 12 language options with flag indicators
- Persistent language selection
- Browser language detection
- Ready for i18n integration

## 📱 Responsive Design

- **Desktop**: Full sidebar and header layout
- **Tablet**: Collapsible sidebar with overlay
- **Mobile**: Drawer-style navigation menu
- **Touch-friendly**: Optimized for touch interactions

## 🚀 Performance Features

- **Server-Side Rendering**: Fast initial page loads
- **Code Splitting**: Automatic route-based code splitting
- **Font Optimization**: Optimized Geist Sans loading
- **Image Optimization**: Next.js Image component ready
- **Progressive Enhancement**: Stable hydration without layout shifts

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Development Guidelines

1. **Components**: Use the existing UI component library
2. **Styling**: Utilize Tailwind CSS classes
3. **TypeScript**: Maintain strict type safety
4. **Accessibility**: Follow WCAG guidelines
5. **Performance**: Optimize for Core Web Vitals

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and modern web technologies**




What you need to do now

Install NextAuth dependency
Approve running: npm i next-auth
Note: TypeScript lints about “Cannot find module 'next-auth'” will disappear after install.
Add environment variables (both in .env.local and on Vercel → Project → Settings → Environment Variables)
NEXTAUTH_URL
Local: http://localhost:3000
Production: https://platform-gilt-tau.vercel.app
NEXTAUTH_SECRET
Generate a random string (Node): node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
FACEBOOK_CLIENT_ID / FACEBOOK_CLIENT_SECRET
NEXT_PUBLIC_FIREBASE_API_KEY (or FIREBASE_API_KEY)
Keep your existing value; used by the Credentials provider (Firebase REST)
Configure OAuth redirect URIs
Google Cloud Console → Credentials → OAuth client → Authorized redirect URIs
http://localhost:3000/api/auth/callback/google
https://platform-gilt-tau.vercel.app/api/auth/callback/google
Facebook Developers → Products → Facebook Login → Settings → Valid OAuth Redirect URIs
http://localhost:3000/api/auth/callback/facebook
https://platform-gilt-tau.vercel.app/api/auth/callback/facebook
Deploy to Vercel
After setting env vars in Vercel, trigger a redeploy.
On production, test:
Email/password sign-in and registration
Google sign-in
Facebook sign-in
Notes

Your UI/design on 
app/auth/page.tsx
 is unchanged.
Previous Firebase client auth code is removed where not needed. We still use Firebase securely via REST for email/password sign-in and registration, so no custom database is required.
The protected dashboard now uses a server-side session guard for reliability on Vercel.


Here’s a ready-to-copy example for your .env.local and what to set on Vercel.
Example .env.local (development)
env

# NextAuth
NEXTAUTH_URL=http://localhost:3000
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXTAUTH_SECRET=your_local_random_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# Firebase (used by Credentials provider and register API)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:abcdef1234567890
# Optional
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX


Vercel (production) environment variables

NEXTAUTH_URL=https://platform-gilt-tau.vercel.app
NEXTAUTH_SECRET=the_same_or_new_random_secret
GOOGLE_CLIENT_ID=…
GOOGLE_CLIENT_SECRET=…
FACEBOOK_CLIENT_ID=…
FACEBOOK_CLIENT_SECRET=…
NEXT_PUBLIC_FIREBASE_API_KEY=…
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=…
NEXT_PUBLIC_FIREBASE_APP_ID=…
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX (optional)
Don’t forget the OAuth redirect URIs

Google:
http://localhost:3000/api/auth/callback/google
https://platform-gilt-tau.vercel.app/api/auth/callback/google
Facebook:
http://localhost:3000/api/auth/callback/facebook
https://platform-gilt-tau.vercel.app/api/auth/callback/facebook
After setting env vars

Local: restart dev server so changes take effect.
Vercel: add env vars → redeploy.