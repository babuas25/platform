import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole, getDashboardRoute } from './lib/rbac';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/auth/signin', '/auth/register', '/api/auth'];

// Define role-based route prefixes and their minimum required roles
const protectedRoutes: { prefix: string; roles: UserRole[] }[] = [
  { prefix: '/superadmin', roles: ['SuperAdmin'] },
  { prefix: '/users/admin', roles: ['Admin', 'SuperAdmin'] },
  { prefix: '/users/staff', roles: ['Staff', 'Admin', 'SuperAdmin'] },
  { prefix: '/users/partner', roles: ['Partner', 'Admin', 'SuperAdmin'] },
  { prefix: '/users/agent', roles: ['Agent', 'Admin', 'SuperAdmin'] },
  { prefix: '/users/publicuser', roles: ['User', 'Staff', 'Partner', 'Agent', 'Admin', 'SuperAdmin'] },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get the JWT token from the request cookies
  const token = await getToken({ req: request });
  
  // If no token, redirect to signin
  if (!token) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Get user role from token
  const userRole = token.role as UserRole || 'User';

  // Check if the requested path is protected
  const routeConfig = protectedRoutes.find(route => pathname.startsWith(route.prefix));
  
  // If route is protected and user doesn't have required role, redirect to their dashboard
  if (routeConfig && !routeConfig.roles.includes(userRole)) {
    const dashboardRoute = getDashboardRoute(userRole);
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  // If user is trying to access /dashboard, redirect to their role-specific dashboard
  if (pathname === '/dashboard') {
    const dashboardRoute = getDashboardRoute(userRole);
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
