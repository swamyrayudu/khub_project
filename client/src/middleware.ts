// export { auth as middleware } from '@/lib/userauth';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const adminToken = request.cookies.get("admin_token");  // Changed from admin-token to admin_token
  const path = request.nextUrl.pathname;

  // Admin auth protection
  if (adminToken) {
    // If admin is logged in, redirect from auth pages to admin home
    if (
      path === "/admin/login" ||
      path === "/seller/auth/login" ||
      path === "/auth" ||
      path === "/seller/auth/login/wait"
    ) {
      return NextResponse.redirect(new URL("/admin/home", request.url));
    }

    // If admin is logged in and accessing admin routes, allow access
    if (
      path === "/admin/home" ||
      path === "/admin/sellers" ||
      path === "/admin/dashboard"
    ) {
      return NextResponse.next();
    }
  } else {
    // If admin is not logged in, they can't access protected routes
    if (
      path === "/admin/home" ||
      path === "/admin/sellers" ||
      path === "/admin/dashboard"
    ) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}




export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
