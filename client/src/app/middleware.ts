import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get both tokens
  const sellerToken = request.cookies.get('authToken')?.value;
  const adminToken = request.cookies.get('admin_token')?.value;
  
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  // Define route categories
  const adminRoutes = [
    '/admin',
    '/admin/home',
    '/admin/dashboard',
    '/admin/users',
    '/admin/settings',
    '/admin/sellers',
    '/admin/products',
    '/admin/analytics'
  ];

  const sellerProtectedRoutes = [
    '/seller/home',
    '/seller/dashboard', 
    '/seller/viewproducts',
    '/seller/products/add',
    '/seller/contect',
    '/seller/analytics',
    '/seller/profile'
  ];
  
  const sellerAuthRoutes = [
    '/seller/auth/login',
    '/seller/auth/register/step1',
    '/seller/auth/register/step2', 
    '/seller/auth/register/step3',
    '/seller/auth/register/step4'
  ];

  const waitRoute = '/seller/auth/login/wait';
  const adminLoginRoute = '/admin/login';

  // Helper function to verify tokens
  const verifyToken = (token: string) => {
    try {
      return jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return null;
    }
  };

  // Get user role and status
  let userRole = null;
  let userStatus = null;
  let isAuthenticated = false;

  if (adminToken) {
    const adminDecoded = verifyToken(adminToken);
    if (adminDecoded && adminDecoded.role === 'admin') {
      userRole = 'admin';
      isAuthenticated = true;
    }
  } else if (sellerToken) {
    const sellerDecoded = verifyToken(sellerToken);
    if (sellerDecoded) {
      userRole = sellerDecoded.role || 'seller';
      userStatus = sellerDecoded.status;
      isAuthenticated = true;
    }
  }

  console.log(`🔍 Route: ${pathname}, Role: ${userRole}, Status: ${userStatus}, Auth: ${isAuthenticated}`);

  // ✅ 1. ADMIN ROUTE PROTECTION
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    console.log(`🔐 Admin route accessed: ${pathname}`);
    
    if (!adminToken) {
      console.log('❌ No admin token, redirecting to admin login');
      return NextResponse.redirect(new URL(adminLoginRoute, request.url));
    }

    const adminDecoded = verifyToken(adminToken);
    
    if (!adminDecoded || adminDecoded.role !== 'admin') {
      console.log('❌ Invalid admin token or wrong role');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    console.log('✅ Admin access granted to:', adminDecoded.email);
    return NextResponse.next();
  }

  // ✅ 2. SELLER ROUTE PROTECTION (Your existing logic)
  if (sellerProtectedRoutes.some(route => pathname.startsWith(route)) || pathname === waitRoute) {
    console.log(`🔐 Seller route accessed: ${pathname}`);
    
    if (!sellerToken) {
      console.log(`🔒 No seller token, redirecting to login: ${pathname}`);
      const loginUrl = new URL('/seller/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const sellerDecoded = verifyToken(sellerToken);
    
    if (!sellerDecoded) {
      console.log('❌ Invalid seller token');
      return NextResponse.redirect(new URL('/seller/auth/login', request.url));
    }

    // Block admin trying to access seller routes
    if (sellerDecoded.role === 'admin') {
      console.log('❌ Admin trying to access seller routes');
      return NextResponse.redirect(new URL('/admin/home', request.url));
    }

    const sellerStatus = sellerDecoded.status;
    console.log(`👤 Seller status: ${sellerStatus}, accessing: ${pathname}`);

    // ✅ 3. CRITICAL: Pending users can ONLY access wait page
    if (sellerStatus === 'pending') {
      if (pathname !== waitRoute) {
        console.log(`⚠️ Pending seller redirected to wait page`);
        return NextResponse.redirect(new URL(waitRoute, request.url));
      }
    }

    // ✅ 4. CRITICAL: Non-pending users CANNOT access wait page
    if (sellerStatus !== 'pending' && pathname === waitRoute) {
      console.log(`✅ Approved seller redirected to home`);
      return NextResponse.redirect(new URL('/seller/home', request.url));
    }

    // ✅ 5. Success/approved users can access protected routes
    if (['success', 'approved', 'active'].includes(sellerStatus)) {
      if (sellerProtectedRoutes.some(route => pathname.startsWith(route))) {
        console.log(`✅ Approved seller accessing: ${pathname}`);
        return NextResponse.next();
      }
    }

    // Block unverified sellers
    console.log(`❌ Seller with status ${sellerStatus} blocked`);
    return NextResponse.redirect(new URL('/seller/auth/login', request.url));
  }

  // ✅ 6. PREVENT CROSS-ROLE ACCESS TO AUTH PAGES

  // Prevent authenticated ADMIN from accessing seller auth or admin login
  if (isAuthenticated && userRole === 'admin') {
    const blockedPaths = [
      adminLoginRoute,
      ...sellerAuthRoutes,
      waitRoute,
      '/auth'
    ];

    if (blockedPaths.some(path => pathname.startsWith(path)) || pathname === waitRoute) {
      console.log('🔄 Admin redirected from auth pages to admin home');
      return NextResponse.redirect(new URL('/admin/home', request.url));
    }
  }

  // Prevent authenticated SELLER from accessing admin login
  if (isAuthenticated && userRole === 'seller' && pathname === adminLoginRoute) {
    console.log('❌ Seller blocked from admin login');
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // ✅ 7. REDIRECT AUTHENTICATED USERS FROM AUTH PAGES (Your existing logic)
  if (sellerAuthRoutes.some(route => pathname.startsWith(route))) {
    if (sellerToken) {
      const sellerDecoded = verifyToken(sellerToken);
      if (sellerDecoded && sellerDecoded.role !== 'admin') {
        const destination = sellerDecoded.status === 'pending' ? waitRoute : '/seller/home';
        console.log(`🏠 Authenticated seller redirected to: ${destination}`);
        return NextResponse.redirect(new URL(destination, request.url));
      }
    }
  }

  // Redirect authenticated admin from admin login
  if (pathname === adminLoginRoute && adminToken) {
    const adminDecoded = verifyToken(adminToken);
    if (adminDecoded && adminDecoded.role === 'admin') {
      console.log('🏠 Authenticated admin redirected to home');
      return NextResponse.redirect(new URL('/admin/home', request.url));
    }
  }

  console.log(`✅ Route allowed: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',
    
    // Seller protected routes
    '/seller/home/:path*',
    '/seller/dashboard/:path*',
    '/seller/products/:path*', 
    '/seller/orders/:path*',
    '/seller/analytics/:path*',
    '/seller/profile/:path*',
    
    // Seller auth routes
    '/seller/auth/login',
    '/seller/auth/register/:path*',
    '/seller/auth/login/wait',
    
    // Auth routes (general)
    '/auth/:path*',
    
    // Prevent cross-access
    '/unauthorized'
  ]
};
