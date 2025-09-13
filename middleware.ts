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
    // API routes: handled by individual API caching
    // Set default headers for security and performance
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
  } else if (pathname === '/' || pathname.startsWith('/admin') || pathname.startsWith('/user-management')) {
    // Dynamic pages: short-term caching with revalidation
    response.headers.set(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=300'
    )
  } else {
    // Default caching for other pages
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=600'
    )
  }

  // Performance and security headers
  response.headers.set('X-Powered-By', '') // Remove X-Powered-By header
  response.headers.set('Server', '') // Remove Server header
  
  // Compression hints for CDN
  if (request.headers.get('accept-encoding')?.includes('br')) {
    response.headers.set('Content-Encoding', 'br')
  } else if (request.headers.get('accept-encoding')?.includes('gzip')) {
    response.headers.set('Content-Encoding', 'gzip')
  }

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