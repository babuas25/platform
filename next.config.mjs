/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Suppress hydration warnings in development - these are often caused by auth state changes
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Optimize for Vercel deployment
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  
  // Handle hydration warnings gracefully
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
}

export default nextConfig