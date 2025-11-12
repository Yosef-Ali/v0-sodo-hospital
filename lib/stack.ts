import { StackServerApp } from "@stackframe/stack";

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
