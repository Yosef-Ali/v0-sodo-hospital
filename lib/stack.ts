import { StackServerApp } from "@stackframe/stack";

if (!process.env.NEXT_PUBLIC_STACK_PROJECT_ID || !process.env.STACK_SECRET_SERVER_KEY) {
  throw new Error("Stack Auth environment variables are not set. Please check NEXT_PUBLIC_STACK_PROJECT_ID and STACK_SECRET_SERVER_KEY in .env.local");
}

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/login",
    afterSignIn: "/dashboard",
    signUp: "/signup",
    afterSignUp: "/dashboard",
    afterSignOut: "/",
  },
});
