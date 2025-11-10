import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"
import { MainLayout } from "@/components/layout/main-layout"

export const metadata: Metadata = {
  title: "Sodo Hospital - Administrative Dashboard",
  description: "Track document processing and administrative tasks",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}
