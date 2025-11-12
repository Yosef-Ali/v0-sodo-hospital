"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ListTodo, Upload, FileText, Edit, X } from "lucide-react"
import Link from "next/link"

interface ChecklistItem {
  id?: string
  label: string
  required: boolean
  hint?: string
  completed?: boolean
  completedBy?: string
  completedAt?: string
  fileUrls?: string[]
  notes?: string
}

interface ChecklistPanelProps {
  checklist: {
    id: string
    name: string
    version?: number
    items: ChecklistItem[]
  }
  permitId: string
  userRole: string
  canEdit?: boolean
  onItemUpdate?: (itemId: string, updates: Partial<ChecklistItem>) => Promise<void>
}

export function ChecklistPanel({
  checklist,
  permitId,
  userRole,
  canEdit = true,
  onItemUpdate,
}: ChecklistPanelProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  const handleCheckboxChange = async (item: ChecklistItem, index: number) => {
    if (!canEdit || !onItemUpdate) return

    const itemId = item.id || `temp-${index}`
    await onItemUpdate(itemId, {
      completed: !item.completed,
      completedAt: !item.completed ? new Date().toISOString() : undefined,
    })
  }

  const handleNotesUpdate = async (item: ChecklistItem, index: number, notes: string) => {
    if (!canEdit || !onItemUpdate) return

    const itemId = item.id || `temp-${index}`
    await onItemUpdate(itemId, { notes })
  }

  const canManageTemplates = userRole === "ADMIN" || userRole === "HR_MANAGER"

  const completedCount = checklist.items.filter((item) => item.completed).length
  const totalCount = checklist.items.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-green-500" />
            {checklist.name}
            {checklist.version && (
              <Badge variant="outline" className="text-xs">
                v{checklist.version}
              </Badge>
            )}
          </h3>
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
              <span>
                {completedCount} of {totalCount} completed
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {canManageTemplates && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-400">
              Manage checklist templates in Settings
            </p>
            <Link href="/settings/checklists">
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                <Edit className="w-4 h-4 mr-2" />
                Edit Templates
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {checklist.items.map((item, index) => {
          const isExpanded = expandedItems.has(index)

          return (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-colors ${
                item.completed
                  ? "bg-green-900/10 border-green-700/30"
                  : "bg-gray-900/50 border-gray-700"
              }`}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={`item-${index}`}
                  checked={item.completed || false}
                  disabled={!canEdit}
                  onCheckedChange={() => handleCheckboxChange(item, index)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor={`item-${index}`}
                    className={`text-sm cursor-pointer ${
                      item.completed ? "text-gray-400 line-through" : "text-gray-300"
                    }`}
                  >
                    {item.label}
                    {item.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {item.hint && <p className="text-xs text-gray-500 mt-1">{item.hint}</p>}

                  {item.completedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Completed {new Date(item.completedAt).toLocaleDateString()}
                    </p>
                  )}

                  {/* Files and Notes */}
                  {(item.fileUrls?.length || item.notes || canEdit) && (
                    <div className="mt-3 space-y-2">
                      {item.fileUrls && item.fileUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.fileUrls.map((url, fileIndex) => (
                            <Badge key={fileIndex} variant="outline" className="text-xs">
                              <FileText className="w-3 h-3 mr-1" />
                              File {fileIndex + 1}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {item.notes && (
                        <div className="bg-gray-800/50 p-2 rounded text-xs text-gray-400">
                          {item.notes}
                        </div>
                      )}

                      {canEdit && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(index)}
                            className="text-xs text-gray-400 hover:text-white h-7"
                          >
                            {isExpanded ? (
                              <>
                                <X className="w-3 h-3 mr-1" />
                                Cancel
                              </>
                            ) : (
                              <>
                                <Upload className="w-3 h-3 mr-1" />
                                Add Details
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {isExpanded && canEdit && (
                        <div className="mt-3 space-y-2 p-3 bg-gray-800/50 rounded border border-gray-700">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">
                              Attach Files
                            </label>
                            <Input
                              type="file"
                              multiple
                              className="text-xs bg-gray-700 border-gray-600"
                              disabled
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              File upload coming soon
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Notes</label>
                            <Textarea
                              placeholder="Add notes..."
                              defaultValue={item.notes || ""}
                              onBlur={(e) => handleNotesUpdate(item, index, e.target.value)}
                              className="text-xs bg-gray-700 border-gray-600 min-h-[60px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {checklist.items.length === 0 && (
        <div className="text-center py-8 text-gray-500">No checklist items</div>
      )}
    </Card>
  )
}
