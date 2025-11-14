import { auth } from "@/auth"

/**
 * Middleware for Next.js App Router with NextAuth.js
 * This runs on every request and protects routes based on authentication status
 */
export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup"]
  const isPublicRoute = publicRoutes.some((route) =>
    nextUrl.pathname === route || nextUrl.pathname.startsWith("/api/auth")
  )

  // API routes for authentication are always accessible
  if (nextUrl.pathname.startsWith("/api/auth")) {
    return
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup")) {
    return Response.redirect(new URL("/dashboard", nextUrl))
  }

  // Protect dashboard routes
  if (!isPublicRoute && !isLoggedIn) {
    const callbackUrl = nextUrl.pathname + nextUrl.search
    return Response.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
    )
  }

  return
})

/**
 * Matcher configuration
 * Specifies which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*|public).*)",
  ],
}
