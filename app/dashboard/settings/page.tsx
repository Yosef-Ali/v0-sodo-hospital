import { Suspense } from "react"
import { SettingsPage } from "@/components/pages/settings-page"
import { getSettings, initializeDefaultSettings } from "@/lib/actions/settings"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function Settings() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Initialize default settings if needed
  await initializeDefaultSettings()

  // Fetch all settings
  const result = await getSettings()
  const settings = result.success ? result.data : []

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
    </div>}>
      <SettingsPage initialSettings={settings || []} />
    </Suspense>
  )
}
