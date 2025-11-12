import { SettingsChecklistsPage } from "@/components/pages/settings/checklists-page"

// Force dynamic rendering and nodejs runtime to avoid build-time auth checks
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function ChecklistsSettingsRoute() {
  // Auth checks will be handled client-side in the component
  return <SettingsChecklistsPage />
}
