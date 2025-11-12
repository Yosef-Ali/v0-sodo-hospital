"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export function SettingsOrganizationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Organization Settings</h3>
        <p className="text-sm text-gray-400">Manage your hospital organization settings and preferences</p>
      </div>

      <Separator className="bg-gray-700" />

      <div className="space-y-6">
        {/* Organization Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Organization Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                defaultValue="SODO Hospital"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-email">Contact Email</Label>
              <Input
                id="org-email"
                type="email"
                defaultValue="info@sodohospital.com"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-phone">Phone Number</Label>
              <Input
                id="org-phone"
                defaultValue="+251-11-XXX-XXXX"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-timezone">Timezone</Label>
              <select
                id="org-timezone"
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm"
              >
                <option>Africa/Addis_Ababa (EAT)</option>
                <option>UTC</option>
                <option>America/New_York (EST)</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-address">Address</Label>
            <textarea
              id="org-address"
              rows={3}
              className="w-full rounded-md bg-gray-700 border border-gray-600 p-3 text-sm"
              defaultValue="Addis Ababa, Ethiopia"
            />
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Calendar Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Calendar Preferences</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Use Ethiopian Calendar</p>
              <p className="text-xs text-gray-400">Display dates in Ethiopian calendar format</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Dual Calendar Display</p>
              <p className="text-xs text-gray-400">Show both Gregorian and Ethiopian dates</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Notification Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-300">System Notifications</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Permit Expiry Alerts</p>
              <p className="text-xs text-gray-400">Notify users when permits are about to expire</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alert-days">Alert Before (days)</Label>
            <Input
              id="alert-days"
              type="number"
              defaultValue="30"
              className="bg-gray-700 border-gray-600 w-32"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button>Save Changes</Button>
      </div>
    </div>
  )
}
