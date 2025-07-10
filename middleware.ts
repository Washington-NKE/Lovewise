import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of public routes that don't require authentication
const publicRoutes = ["/", "/signin", "/signup", "/forgot-password"];

// Auth-only routes that should redirect to dashboard if not signed in
const authRoutes = ["/signin", "/signup", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some(route =>
    route === pathname || pathname.startsWith(route)
  );

  // Check if the path is an auth route (signin, signup, etc.)
  const isAuthRoute = authRoutes.some(route =>
    route === pathname || pathname.startsWith(route)
  );

  // If user is not signed in and trying to access a protected route
  if (!session?.user && !isPublicRoute) {
    const signInUrl = new URL("/signin", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // If user is signed in and trying to access auth pages, redirect to dashboard
  // BUT exclude the home page ("/") to allow signed-in users to visit it
  if (session?.user && isAuthRoute) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, etc.
     */
    '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$).*)',
  ],
};