"use client";

import { StackProvider, StackTheme } from "@stackframe/stack";

export default function StackAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get env vars with fallbacks for build time
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID || "";
  const publishableKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || "";

  // If env vars aren't set, just render children without provider
  if (!projectId || !publishableKey) {
    console.warn("Stack Auth environment variables not set");
    return <>{children}</>;
  }

  return (
    <StackProvider
      app={{
        projectId,
        publishableClientKey: publishableKey,
      }}
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
  );
}
