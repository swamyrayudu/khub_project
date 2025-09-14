import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('authToken')?.value;

  // Define route categories
  const protectedRoutes = [
    '/seller/home',
    '/seller/dashboard', 
    '/seller/products',
    '/seller/orders',
    '/seller/analytics',
    '/seller/profile'
  ];
  
  const authRoutes = [
    '/seller/auth/login',
    '/seller/auth/register/step1',
    '/seller/auth/register/step2', 
    '/seller/auth/register/step3',
    '/seller/auth/register/step4'
  ];

  const waitRoute = '/seller/auth/login/wait';

  // ✅ 1. Redirect unauthenticated users to login
  if (protectedRoutes.some(route => pathname.startsWith(route)) || pathname === waitRoute) {
    if (!token) {
      console.log(`🔒 No token, redirecting to login: ${pathname}`);
      const loginUrl = new URL('/seller/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ✅ 2. Decode token to get user status
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // You can also get status from a separate API call or cookie
      // For now, assuming status is in the token payload
      const userStatus = decoded.status;

      console.log(`👤 User status: ${userStatus}, accessing: ${pathname}`);

      // ✅ 3. CRITICAL: Pending users can ONLY access wait page
      if (userStatus === 'pending') {
        if (pathname !== waitRoute) {
          console.log(`⚠️ Pending user trying to access: ${pathname}, redirecting to wait`);
          return NextResponse.redirect(new URL(waitRoute, request.url));
        }
      }

      // ✅ 4. CRITICAL: Non-pending users CANNOT access wait page
      if (userStatus !== 'pending' && pathname === waitRoute) {
        console.log(`✅ Non-pending user trying to access wait page, redirecting to home`);
        return NextResponse.redirect(new URL('/seller/home', request.url));
      }

      // ✅ 5. Success/approved users can access protected routes
      if (['success', 'approved', 'active'].includes(userStatus)) {
        if (protectedRoutes.some(route => pathname.startsWith(route))) {
          console.log(`✅ Approved user accessing: ${pathname}`);
          return NextResponse.next();
        }
      }

    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.redirect(new URL('/seller/auth/login', request.url));
    }
  }

  // ✅ 6. Redirect authenticated users away from auth pages
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        const destination = decoded.status === 'pending' ? waitRoute : '/seller/home';
        console.log(`🏠 Authenticated user accessing auth page, redirecting to: ${destination}`);
        return NextResponse.redirect(new URL(destination, request.url));
      } catch (error) {
        // Invalid token, allow access to auth pages
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/seller/home/:path*',
    '/seller/dashboard/:path*',
    '/seller/products/:path*', 
    '/seller/orders/:path*',
    '/seller/analytics/:path*',
    '/seller/profile/:path*',
    '/seller/auth/login',
    '/seller/auth/register/:path*',
    '/seller/auth/login/wait'
  ]
};
