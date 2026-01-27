import { DefaultSession } from "next-auth"

/**
 * Module augmentation for NextAuth.js types
 * Extends the built-in session types to include custom fields
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: string
      provider?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
    provider?: string
  }
}
