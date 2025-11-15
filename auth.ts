import NextAuth from "next-auth"
import authConfig from "./auth.config"

/**
 * Main NextAuth configuration
 * Uses JWT sessions for edge-compatibility
 * Database adapter is lazy-loaded only when needed (not in middleware)
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt", // Use JWT for sessions (edge-compatible)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      // Add user ID to the token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
      }
      // Add provider info if available
      if (account) {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      // Add user data to the session from token
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string
        session.user.provider = token.provider as string
      }
      return session
    },
  },
})
