"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FileText } from "lucide-react"

export function SettingsTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Letter Templates</h3>
          <p className="text-sm text-gray-400">
            Manage document templates for letters and official communications
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
        <Input placeholder="Search templates..." className="pl-10 bg-gray-700 border-gray-600" />
      </div>

      {/* Templates List */}
      <div className="space-y-3">
        {[
          {
            name: "Work Permit Request Letter",
            description: "Template for requesting work permits from authorities",
            category: "Work Permit",
            lastUsed: "2 days ago",
          },
          {
            name: "Residence ID Renewal Letter",
            description: "Letter template for residence ID renewal applications",
            category: "Residence ID",
            lastUsed: "1 week ago",
          },
          {
            name: "License Application Letter",
            description: "Standard letter for professional license applications",
            category: "License",
            lastUsed: "3 days ago",
          },
        ].map((template) => (
          <div
            key={template.name}
            className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3 flex-1">
                <div className="mt-1">
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{template.name}</h4>
                  <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    <span>•</span>
                    <span>Last used {template.lastUsed}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-400">
          Templates support dynamic fields like {"{person_name}"}, {"{permit_type}"}, and {"{due_date}"}
        </p>
      </div>
    </div>
  )
}
