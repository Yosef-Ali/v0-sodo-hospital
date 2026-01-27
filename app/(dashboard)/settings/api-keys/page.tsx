"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Key, Eye, EyeOff, Trash2, Check, X, Loader2, 
  ExternalLink, Shield, Sparkles, Bot, FileText 
} from "lucide-react"
import { toast } from "sonner"
import { getApiKeys, setApiKey, deleteApiKey, testApiKey, type ApiKeyType } from "@/lib/actions/api-keys"

interface ApiKeyConfig {
  key: string
  label: string
  description: string
  placeholder: string
  helpUrl: string
  isConfigured: boolean
  maskedValue: string | null
  updatedAt: Date | null
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [newValue, setNewValue] = useState("")
  const [showValue, setShowValue] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)

  useEffect(() => {
    loadKeys()
  }, [])

  async function loadKeys() {
    setLoading(true)
    const result = await getApiKeys()
    if (result.success && result.data) {
      setKeys(result.data)
    } else {
      toast.error(result.error || "Failed to load API keys")
    }
    setLoading(false)
  }

  async function handleSave(keyType: string) {
    if (!newValue.trim()) {
      toast.error("Please enter an API key")
      return
    }

    setSaving(true)
    const result = await setApiKey(keyType as ApiKeyType, newValue)
    setSaving(false)

    if (result.success) {
      toast.success(result.message)
      setEditingKey(null)
      setNewValue("")
      loadKeys()
    } else {
      toast.error(result.error || "Failed to save API key")
    }
  }

  async function handleDelete(keyType: string) {
    if (!confirm("Are you sure you want to delete this API key?")) return

    const result = await deleteApiKey(keyType as ApiKeyType)
    if (result.success) {
      toast.success(result.message)
      loadKeys()
    } else {
      toast.error(result.error || "Failed to delete API key")
    }
  }

  async function handleTest(keyType: string) {
    setTesting(keyType)
    const result = await testApiKey(keyType as ApiKeyType, editingKey === keyType ? newValue : undefined)
    setTesting(null)

    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.error || "Test failed")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Key className="h-5 w-5 text-green-500" />
            API Keys
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Configure API keys for AI services used in chatbot, document analysis, and reports
          </p>
        </div>
        <Badge variant="outline" className="border-green-500/50 text-green-400">
          <Shield className="h-3 w-3 mr-1" />
          Encrypted Storage
        </Badge>
      </div>

      {/* Feature Info */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gray-700/30 border-gray-600">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Bot className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">AI Chatbot</p>
                <p className="text-xs text-gray-400">Permit inquiries & support</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-700/30 border-gray-600">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Document OCR</p>
                <p className="text-xs text-gray-400">Auto-extract from uploads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-700/30 border-gray-600">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FileText className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">AI Reports</p>
                <p className="text-xs text-gray-400">Generate analysis reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {keys.map((config) => (
          <Card key={config.key} className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.isConfigured ? 'bg-green-500/20' : 'bg-gray-700'}`}>
                    <Key className={`h-5 w-5 ${config.isConfigured ? 'text-green-400' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base text-white">{config.label}</CardTitle>
                    <CardDescription className="text-gray-400">{config.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {config.isConfigured ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <Check className="h-3 w-3 mr-1" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-600 text-gray-400">
                      Not configured
                    </Badge>
                  )}
                  <a
                    href={config.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingKey === config.key ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showValue ? "text" : "password"}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder={config.placeholder}
                        className="bg-gray-700 border-gray-600 text-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowValue(!showValue)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSave(config.key)}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleTest(config.key)}
                      disabled={testing === config.key || !newValue}
                      className="border-gray-600"
                    >
                      {testing === config.key ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Test Connection
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => { setEditingKey(null); setNewValue(""); setShowValue(false) }}
                      className="text-gray-400"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {config.isConfigured && config.maskedValue && (
                      <code className="px-3 py-1.5 bg-gray-700 rounded text-sm text-gray-300 font-mono">
                        {config.maskedValue}
                      </code>
                    )}
                    {config.updatedAt && (
                      <span className="text-xs text-gray-500">
                        Updated {new Date(config.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {config.isConfigured && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTest(config.key)}
                          disabled={testing === config.key}
                          className="border-gray-600 text-gray-300"
                        >
                          {testing === config.key ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(config.key)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingKey(config.key)}
                      className="border-green-600/50 text-green-400 hover:bg-green-600/10"
                    >
                      {config.isConfigured ? "Update" : "Configure"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Text */}
      <Card className="bg-blue-900/20 border-blue-500/30">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">Security Note</p>
              <p className="text-blue-300/80">
                API keys are encrypted before storage and never exposed in full. 
                Only administrators can manage API keys. Keys stored here override environment variables.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
