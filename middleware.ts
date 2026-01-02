import NextAuth from "next-auth"
import authConfig from "@/auth.config"

/**
 * Middleware for authentication
 * Uses auth.config.ts which is edge-compatible (no bcrypt/db)
 */
export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*|public).*)",
  ],
}

