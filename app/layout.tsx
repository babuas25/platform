import './globals.css';
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/providers/theme-provider';

// Nordique Pro Semibold font for logo
const nordiquePro = localFont({
  src: '../public/fonts/nordiquepro-semibold.ttf',
  variable: '--font-nordique-pro',
  display: 'swap',
  fallback: ['serif'],
  weight: '600',
});

export const metadata: Metadata = {
  title: 'AppDashboard',
  description: 'Modern dashboard application built with Next.js and Shadcn UI',
  keywords: ['dashboard', 'admin', 'nextjs', 'react', 'typescript'],
  authors: [{ name: 'AppDashboard Team' }],
  creator: 'AppDashboard',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://appdashboard.com',
    title: 'AppDashboard',
    description: 'Modern dashboard application built with Next.js and Shadcn UI',
    siteName: 'AppDashboard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AppDashboard',
    description: 'Modern dashboard application built with Next.js and Shadcn UI',
    creator: '@appdashboard',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${nordiquePro.variable}`}>
      <head>
        {/* Preload Nordique Pro font for better performance */}
        <link
          rel="preload"
          href="/fonts/nordiquepro-semibold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${GeistSans.className} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}