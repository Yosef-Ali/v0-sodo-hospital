import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import {
  authUsers,
  authAccounts,
  authSessions,
  authVerificationTokens,
  authAuthenticators,
} from "@/lib/db/auth-schema"
import authConfig from "./auth.config"

/**
 * Main NextAuth configuration with database adapter
 * This file includes the DrizzleAdapter for database persistence
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: authUsers,
    accountsTable: authAccounts,
    sessionsTable: authSessions,
    verificationTokensTable: authVerificationTokens,
    authenticatorsTable: authAuthenticators,
  }),
  session: {
    strategy: "jwt", // Use JWT for sessions (better for serverless/edge)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      // Add user ID to the token
      if (user) {
        token.id = user.id
      }
      // Add provider info if available
      if (account) {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      // Add user ID and provider to the session
      if (token) {
        session.user.id = token.id as string
        session.user.provider = token.provider as string
      }
      return session
    },
  },
})
