import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname

  // Browser caching strategies based on file types and routes
  if (pathname.startsWith('/_next/static/') || pathname.startsWith('/static/')) {
    // Static assets: long-term caching (1 year)
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
    response.headers.set('Expires', new Date(Date.now() + 31536000 * 1000).toUTCString())
  } else if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
    // Images: medium-term caching (1 week)
    response.headers.set(
      'Cache-Control',
      'public, max-age=604800, stale-while-revalidate=86400'
    )
    response.headers.set('Expires', new Date(Date.now() + 604800 * 1000).toUTCString())
  } else if (pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/)) {
    // CSS, JS, and font files: medium-term caching (1 day)
    response.headers.set(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=3600'
    )
    response.headers.set('Expires', new Date(Date.now() + 86400 * 1000).toUTCString())
  } else if (pathname.startsWith('/api/')) {
    // API routes: No caching for security, individual routes can override if needed
    response.headers.set(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate'
    )
    response.headers.set('Expires', '0')
    response.headers.set('Pragma', 'no-cache')
  } else if (pathname === '/' || pathname.startsWith('/admin') || pathname.startsWith('/user-management') || pathname.startsWith('/dashboard')) {
    // Dynamic pages with potential authentication: No public caching for security
    response.headers.set(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate'
    )
    response.headers.set('Expires', '0')
    response.headers.set('Pragma', 'no-cache')
  } else {
    // Default caching for other pages (public content only)
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=600'
    )
  }

  // Apply comprehensive security headers to all routes
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Performance and security headers
  response.headers.set('X-Powered-By', '') // Remove X-Powered-By header
  response.headers.set('Server', '') // Remove Server header
  
  // Remove dangerous Content-Encoding headers - these should be handled by the server/CDN automatically
  // Setting Content-Encoding manually can corrupt responses and break the application

  // CDN optimization headers
  response.headers.set('Vary', 'Accept-Encoding, Accept-Language')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
    // Also apply to static assets for CDN optimization
    {
      source: '/_next/static/:path*'
    },
    {
      source: '/static/:path*'
    }
  ],
}