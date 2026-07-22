import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of public routes that don't require authentication
const publicRoutes = ["/", "/signin", "/signup", "/forgot-password"];

// Auth-only routes that should redirect to dashboard if not signed in
const authRoutes = ["/signin", "/signup", "/forgot-password"];

function hasSessionCookie(request: NextRequest) {
  return Boolean(
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = publicRoutes.some(route =>
    route === pathname || pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some(route =>
    route === pathname || pathname.startsWith(route)
  );
  const isSignedIn = hasSessionCookie(request);

  const hasError = request.nextUrl.searchParams.has("error") || request.nextUrl.searchParams.has("session_expired");

  if (isSignedIn && isAuthRoute && !hasError) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (!isSignedIn && !isPublicRoute) {
    const signInUrl = new URL("/signin", request.url);
    return NextResponse.redirect(signInUrl);
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