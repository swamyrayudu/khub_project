import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('authToken')?.value;
  
  // Protected routes that require authentication
  const protectedRoutes = [
    '/seller/home',
    '/seller/dashboard', 
    '/seller/products',
    '/seller/orders',
    '/seller/analytics',
    '/seller/profile'
  ];
  
  // Auth routes that authenticated users shouldn't access
  const authRoutes = [
    '/seller/auth/login',
    '/seller/auth/register/step1',
    '/seller/auth/register/step2', 
    '/seller/auth/register/step3',
    '/seller/auth/register/step4'
  ];

  // Special handling for wait page - only pending users should access
  if (pathname === '/seller/auth/login/wait') {
    if (!token) {
      return NextResponse.redirect(new URL('/seller/auth/login', request.url));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      // You could check user status from database here, but for now redirect active users
      // This assumes successful login means they're not pending anymore
      return NextResponse.redirect(new URL('/seller/home', request.url));
    } catch (error) {
      return NextResponse.redirect(new URL('/seller/auth/login', request.url));
    }
  }

  // Redirect to login if accessing protected routes without token
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL('/seller/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect to home if authenticated user tries to access auth pages
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL('/seller/home', request.url));
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
    '/seller/auth/login/wait'  // Include wait page in matcher
  ]
};
