import { redirect } from "next/navigation"
import { getCurrentUser, canManageChecklistTemplates } from "@/lib/auth/permissions"
import { SettingsChecklistsPage } from "@/components/pages/settings/checklists-page"

export default async function ChecklistsSettingsRoute() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (!canManageChecklistTemplates(user.role)) {
    // Return 403 Forbidden
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-red-400">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to manage checklist templates.</p>
          <p className="text-sm text-gray-500">This page is restricted to administrators only.</p>
        </div>
      </div>
    )
  }

  return <SettingsChecklistsPage />
}
