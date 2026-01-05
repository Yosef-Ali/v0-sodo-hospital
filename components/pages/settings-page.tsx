"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, Key, Bot, Building2, Shield, Save, Eye, EyeOff, 
  CheckCircle, XCircle, Loader2, RefreshCw, Trash2, Plus
} from "lucide-react"
import { saveSetting, deleteSetting, testGoogleApiKey } from "@/lib/actions/settings"
import { toast } from "sonner"

interface Setting {
  id: string
  key: string
  value: string | null
  description: string | null
  category: string
  isSecret: boolean
  hasValue: boolean
  updatedAt: Date
}

interface SettingsPageProps {
  initialSettings: Setting[]
}

export function SettingsPage({ initialSettings }: SettingsPageProps) {
  const [settings, setSettings] = useState<Setting[]>(initialSettings)
  const [loading, setLoading] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [testingKey, setTestingKey] = useState(false)

  // Group settings by category
  const aiSettings = settings.filter(s => s.category === "ai")
  const generalSettings = settings.filter(s => s.category === "general")
  const storageSettings = settings.filter(s => s.category === "storage")

  const handleSave = async (key: string, isSecret: boolean, category: string, description?: string) => {
    const value = editValues[key]
    if (!value) {
      toast.error("Please enter a value")
      return
    }

    setLoading(key)
    try {
      const result = await saveSetting({ key, value, isSecret, category, description })
      if (result.success) {
        toast.success(`${key} saved successfully`)
        // Update local state
        setSettings(prev => prev.map(s => 
          s.key === key ? { ...s, hasValue: true, value: isSecret ? "••••••••" : value } : s
        ))
        setEditValues(prev => ({ ...prev, [key]: "" }))
      } else {
        toast.error(result.error || "Failed to save")
      }
    } catch (error) {
      toast.error("Failed to save setting")
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (key: string) => {
    if (!confirm(`Are you sure you want to delete ${key}?`)) return

    setLoading(key)
    try {
      const result = await deleteSetting(key)
      if (result.success) {
        toast.success(`${key} deleted`)
        setSettings(prev => prev.map(s => 
          s.key === key ? { ...s, hasValue: false, value: null } : s
        ))
      } else {
        toast.error(result.error || "Failed to delete")
      }
    } catch (error) {
      toast.error("Failed to delete setting")
    } finally {
      setLoading(null)
    }
  }

  const handleTestGoogleKey = async () => {
    const apiKey = editValues["GOOGLE_API_KEY"]
    if (!apiKey) {
      toast.error("Please enter an API key first")
      return
    }

    setTestingKey(true)
    try {
      const result = await testGoogleApiKey(apiKey)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error || "API key test failed")
      }
    } catch (error) {
      toast.error("Failed to test API key")
    } finally {
      setTestingKey(false)
    }
  }

  const renderSettingCard = (setting: Setting) => {
    const isLoading = loading === setting.key
    const showSecret = showSecrets[setting.key]
    const editValue = editValues[setting.key] || ""

    return (
      <Card key={setting.key} className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {setting.isSecret ? (
                <Key className="h-4 w-4 text-amber-500" />
              ) : (
                <Settings className="h-4 w-4 text-gray-400" />
              )}
              <CardTitle className="text-sm font-medium text-white">{setting.key}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {setting.hasValue ? (
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                  <CheckCircle className="h-3 w-3 mr-1" /> Configured
                </Badge>
              ) : (
                <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30">
                  <XCircle className="h-3 w-3 mr-1" /> Not Set
                </Badge>
              )}
            </div>
          </div>
          {setting.description && (
            <CardDescription className="text-gray-400 text-xs mt-1">
              {setting.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {setting.hasValue && setting.isSecret && (
            <div className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg">
              <span className="text-gray-400 text-sm font-mono flex-1">
                {showSecret ? setting.value : "••••••••••••••••"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSecrets(prev => ({ ...prev, [setting.key]: !showSecret }))}
                className="h-7 text-gray-400"
              >
                {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
          )}

          {setting.hasValue && !setting.isSecret && (
            <div className="p-2 bg-gray-900/50 rounded-lg">
              <span className="text-gray-300 text-sm">{setting.value}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              type={setting.isSecret ? "password" : "text"}
              placeholder={setting.hasValue ? "Enter new value..." : "Enter value..."}
              value={editValue}
              onChange={(e) => setEditValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white flex-1"
            />
            
            {setting.key === "GOOGLE_API_KEY" && editValue && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestGoogleKey}
                disabled={testingKey}
                className="border-blue-600/50 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400"
              >
                {testingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-1 hidden sm:inline">Test</span>
              </Button>
            )}
            
            <Button
              onClick={() => handleSave(setting.key, setting.isSecret, setting.category, setting.description || undefined)}
              disabled={isLoading || !editValue}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span className="ml-1 hidden sm:inline">Save</span>
            </Button>

            {setting.hasValue && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(setting.key)}
                disabled={isLoading}
                className="border-red-600/50 bg-red-600/10 hover:bg-red-600/20 text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="h-6 w-6 text-green-500" />
              System Settings
            </h1>
            <p className="text-gray-400 mt-1">
              Manage API keys and system configuration
            </p>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="ai" className="data-[state=active]:bg-green-600">
              <Bot className="h-4 w-4 mr-2" /> AI Services
            </TabsTrigger>
            <TabsTrigger value="general" className="data-[state=active]:bg-green-600">
              <Building2 className="h-4 w-4 mr-2" /> General
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-green-600">
              <Shield className="h-4 w-4 mr-2" /> Security
            </TabsTrigger>
          </TabsList>

          {/* AI Services Tab */}
          <TabsContent value="ai" className="space-y-4 mt-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="h-5 w-5 text-green-500" />
                  AI Configuration
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure AI services for OCR, chatbot, and report generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Google API Key Info */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                  <h4 className="text-blue-400 font-medium mb-2">Getting a Google API Key</h4>
                  <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" className="text-blue-400 hover:underline">Google AI Studio</a></li>
                    <li>Sign in with your Google account</li>
                    <li>Click "Create API Key"</li>
                    <li>Copy the key and paste it below</li>
                  </ol>
                </div>

                {aiSettings.map(renderSettingCard)}

                {aiSettings.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No AI settings found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-500" />
                  General Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure general application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generalSettings.map(renderSettingCard)}

                {generalSettings.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No general settings found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Security Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage security and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                  <Shield className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    Security settings are managed via environment variables for enhanced security.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
