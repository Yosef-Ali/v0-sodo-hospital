import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"
import { ourFileRouter } from "@/lib/uploadthing"
import StackAuthProvider from "./stack-provider"
import { SessionProvider } from "@/components/providers/session-provider"

export const metadata: Metadata = {
  title: "Sodo Hospital - Administrative Dashboard",
  description: "Track document processing and administrative tasks",
  generator: 'v0.dev'
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <SessionProvider>
          <StackAuthProvider>{children}</StackAuthProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
