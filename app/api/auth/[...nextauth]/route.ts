import { handlers } from "@/auth"

/**
 * NextAuth.js API Route Handler
 * This handles all authentication routes: /api/auth/*
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback
 * - /api/auth/session
 * - etc.
 */
export const { GET, POST } = handlers
