import NextAuth from "next-auth"
import authConfig from "./auth.config"

/**
 * Middleware for Next.js App Router with NextAuth.js
 * Uses edge-compatible auth config (no database imports)
 */
const { auth } = NextAuth(authConfig)

export default auth

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
