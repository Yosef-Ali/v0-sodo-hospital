import { DefaultSession } from "next-auth"

/**
 * Module augmentation for NextAuth.js types
 * Extends the built-in session types to include custom fields
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      provider?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    provider?: string
  }
}
