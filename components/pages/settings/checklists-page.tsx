"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Copy, Trash2, CheckCircle2 } from "lucide-react"
import { getChecklists, type Checklist } from "@/lib/actions/v2/checklists"

export function SettingsChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChecklists()
  }, [])

  async function loadChecklists() {
    setLoading(true)
    const result = await getChecklists({ search: searchQuery })
    if (result.success && result.data) {
      setChecklists(result.data)
    }
    setLoading(false)
  }

  const filteredChecklists = checklists.filter(
    (checklist) =>
      searchQuery === "" || checklist.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Checklist Templates</h3>
          <p className="text-sm text-gray-400">
            Manage checklist templates for permits. Creating a new version will not affect existing permits.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-gray-700 border-gray-600"
        />
      </div>

      {/* Checklists List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading templates...</div>
        ) : filteredChecklists.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchQuery ? "No templates found matching your search" : "No templates yet. Create your first one!"}
          </div>
        ) : (
          filteredChecklists.map((checklist) => (
            <div
              key={checklist.id}
              className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white">{checklist.name}</h4>
                    <Badge variant={checklist.active ? "default" : "secondary"} className="text-xs">
                      v{checklist.version}
                    </Badge>
                    {checklist.active && (
                      <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                    {checklist.category && (
                      <Badge variant="outline" className="text-xs">
                        {checklist.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    {checklist.items.length} items • Created{" "}
                    {new Date(checklist.createdAt).toLocaleDateString()}
                  </p>
                  {checklist.updatedAt && new Date(checklist.updatedAt) > new Date(checklist.createdAt) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last updated {new Date(checklist.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Show checklist items */}
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {checklist.items.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="mt-0.5">
                        <div className="w-4 h-4 rounded border border-gray-500" />
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-300">
                          {item.label}
                          {item.required && <span className="text-red-400 ml-1">*</span>}
                        </span>
                        {item.hint && <p className="text-xs text-gray-500 mt-0.5">{item.hint}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                {checklist.items.length > 4 && (
                  <p className="text-xs text-gray-500 mt-2">
                    +{checklist.items.length - 4} more items
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-400 mb-1">Versioning Information</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• New permits automatically use the latest active template version</li>
          <li>• Updating a template creates a new version - existing permits keep their snapshot</li>
          <li>• Only one version can be active at a time</li>
        </ul>
      </div>
    </div>
  )
}
