import type React from "react"
import { StackProvider, StackTheme } from "@stackframe/stack"
import { stackServerApp } from "@/lib/stack"

export default function StackAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <StackProvider
      app={stackServerApp}
      theme={StackTheme.Dark}
      urls={{
        signIn: "/login",
        afterSignIn: "/dashboard",
        signUp: "/signup",
        afterSignUp: "/dashboard",
        afterSignOut: "/",
      }}
    >
      {children}
    </StackProvider>
  )
}
