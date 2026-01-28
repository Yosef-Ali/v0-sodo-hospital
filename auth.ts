import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import authConfig from "./auth.config"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

/**
 * Main NextAuth configuration
 * Uses JWT sessions for edge-compatibility
 * Credentials provider added here (not in auth.config) to avoid Edge Runtime issues
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        if (!user || !user.password) {
          return null
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValidPassword) {
          return null
        }

        if (user.active === false) {
          console.log("LOGIN FAILED: User account is inactive:", { email: user.email })
          return null
        }

        console.log("LOGIN SUCCESS: User found:", { email: user.email, role: user.role })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Include role in the return
        }
      },
    }),
  ],
  session: {
    strategy: "jwt", // Use JWT for sessions (edge-compatible)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      // Add user ID and role to the token
      if (user) {
        console.log("JWT CALLBACK: Initial sign in for user:", { id: user.id, role: (user as any).role })
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
        token.role = (user as { role?: string }).role || "USER" // Add role to token
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
        session.user.role = token.role as string // Add role to session
      }
      return session
    },
  },
})

