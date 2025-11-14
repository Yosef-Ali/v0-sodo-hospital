import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"
import { AuthSessionProvider } from "@/components/providers/session-provider"

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
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  )
}
