import './globals.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/providers/theme-provider';

const nordiquePro = localFont({
  src: '../public/fonts/nordiquepro-semibold.ttf',
  variable: '--font-nordique-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AppDashboard',
  description: 'Modern dashboard application built with Next.js and Shadcn UI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${nordiquePro.variable}`}>
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