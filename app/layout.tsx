import type React from "react"
import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import "@/app/globals.css"
import { SessionProvider } from "@/components/providers/session-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" })

export const metadata: Metadata = {
  title: "Soddo Christian Hospital - Administrative Dashboard",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
