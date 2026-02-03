"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Building2, Upload, X, Loader2, Check, Camera } from "lucide-react"
import { toast } from "sonner"
import {
  getOrganizationSettings,
  updateOrganizationSettings,
  updateOrganizationLogo,
  type OrganizationSettings
} from "@/lib/actions/v2/settings"

export function SettingsOrganizationPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [settings, setSettings] = useState<OrganizationSettings>({
    name: "",
    email: "",
    phone: "",
    address: "",
    timezone: "Africa/Addis_Ababa",
    logoUrl: null,
    useEthiopianCalendar: true,
    dualCalendarDisplay: true,
    permitExpiryAlerts: true,
    alertDaysBefore: 30,
  })

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      const result = await getOrganizationSettings()
      if (result.success && result.data) {
        setSettings(result.data)
      }
      setIsLoading(false)
    }
    loadSettings()
  }, [])

  // Handle form field changes
  const handleChange = (field: keyof OrganizationSettings, value: string | boolean | number) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (max 2MB for logo)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be less than 2MB")
      return
    }

    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "logos")

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()

      // Update logo URL in settings
      const updateResult = await updateOrganizationLogo(result.url)
      if (updateResult.success) {
        setSettings((prev) => ({ ...prev, logoUrl: result.url }))
        toast.success("Logo uploaded successfully")
      } else {
        throw new Error(updateResult.error)
      }
    } catch (error) {
      console.error("Logo upload error:", error)
      toast.error("Failed to upload logo")
    } finally {
      setIsUploadingLogo(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle logo removal
  const handleRemoveLogo = async () => {
    setIsUploadingLogo(true)
    try {
      const result = await updateOrganizationLogo(null)
      if (result.success) {
        setSettings((prev) => ({ ...prev, logoUrl: null }))
        toast.success("Logo removed")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error("Failed to remove logo")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  // Handle save
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateOrganizationSettings(settings)
      if (result.success) {
        toast.success("Settings saved successfully")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Organization Settings</h3>
        <p className="text-sm text-gray-400">Manage your organization profile and preferences</p>
      </div>

      <Separator className="bg-gray-700" />

      {/* Company Logo */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-300">Company Logo</h4>
        <div className="flex items-start gap-6">
          {/* Logo Preview */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-600 bg-gray-800 flex items-center justify-center overflow-hidden">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Company Logo"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <Building2 className="h-10 w-10 mb-2" />
                  <span className="text-xs">No logo</span>
                </div>
              )}
            </div>

            {/* Hover overlay for existing logo */}
            {settings.logoUrl && (
              <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 w-8 p-0"
                  onClick={handleRemoveLogo}
                  disabled={isUploadingLogo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Loading overlay */}
            {isUploadingLogo && (
              <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>

          {/* Upload instructions */}
          <div className="flex-1 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />

            {!settings.logoUrl && (
              <Button
                variant="outline"
                className="border-gray-600 hover:bg-gray-700"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingLogo}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
            )}

            <div className="text-xs text-gray-500 space-y-1">
              <p>Recommended: Square image, at least 256x256 pixels</p>
              <p>Supported formats: PNG, JPG, SVG, WebP</p>
              <p>Maximum file size: 2MB</p>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Organization Info */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-300">Organization Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={settings.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="bg-gray-700 border-gray-600"
              placeholder="Enter organization name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-email">Contact Email</Label>
            <Input
              id="org-email"
              type="email"
              value={settings.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="bg-gray-700 border-gray-600"
              placeholder="info@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-phone">Phone Number</Label>
            <Input
              id="org-phone"
              value={settings.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="bg-gray-700 border-gray-600"
              placeholder="+251-XX-XXX-XXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-timezone">Timezone</Label>
            <select
              id="org-timezone"
              value={settings.timezone}
              onChange={(e) => handleChange("timezone", e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm"
            >
              <option value="Africa/Addis_Ababa">Africa/Addis_Ababa (EAT)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="org-address">Address</Label>
          <textarea
            id="org-address"
            rows={3}
            value={settings.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full rounded-md bg-gray-700 border border-gray-600 p-3 text-sm resize-none"
            placeholder="Enter full address"
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
          <Switch
            checked={settings.useEthiopianCalendar}
            onCheckedChange={(checked) => handleChange("useEthiopianCalendar", checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Dual Calendar Display</p>
            <p className="text-xs text-gray-400">Show both Gregorian and Ethiopian dates</p>
          </div>
          <Switch
            checked={settings.dualCalendarDisplay}
            onCheckedChange={(checked) => handleChange("dualCalendarDisplay", checked)}
          />
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Notification Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-300">System Notifications</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Document Expiry Alerts</p>
            <p className="text-xs text-gray-400">Notify users when documents are about to expire</p>
          </div>
          <Switch
            checked={settings.permitExpiryAlerts}
            onCheckedChange={(checked) => handleChange("permitExpiryAlerts", checked)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="alert-days">Alert Before (days)</Label>
          <Input
            id="alert-days"
            type="number"
            min={1}
            max={365}
            value={settings.alertDaysBefore}
            onChange={(e) => handleChange("alertDaysBefore", parseInt(e.target.value) || 30)}
            className="bg-gray-700 border-gray-600 w-32"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-700">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-500"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
