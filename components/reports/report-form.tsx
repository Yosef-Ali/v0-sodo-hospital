"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AIReportAssistant } from "@/components/reports/ai-report-assistant"
import { Sparkles, Loader2, Check, ChevronsUpDown, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface ReportFormData {
  id?: string
  title: string
  description: string
  status: string
  frequency: string
  format: string
  department: string
  category: string
}

interface ReportFormProps {
  initialData?: ReportFormData | null
  onSubmit: (data: ReportFormData) => void
  onCancel?: () => void
  isLoading?: boolean
  submitLabel?: string
}

export function ReportForm({ initialData, onSubmit, onCancel, isLoading = false, submitLabel }: ReportFormProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    title: "",
    description: "",
    status: "DRAFT",
    frequency: "MONTHLY",
    format: "PDF",
    department: "",
    category: "",
  })
  const [activeModeTab, setActiveModeTab] = useState("manual")
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || "",
        description: initialData.description || "",
        status: initialData.status || "DRAFT",
        frequency: initialData.frequency || "MONTHLY",
        format: initialData.format || "PDF",
        department: initialData.department || "",
        category: initialData.category || "",
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const departments = [
    { value: "Administration", label: "Administration" },
    { value: "Finance", label: "Finance" },
    { value: "Human Resources", label: "Human Resources" },
    { value: "Quality", label: "Quality" },
    { value: "Supply Chain", label: "Supply Chain" },
    { value: "Operations", label: "Operations" },
    { value: "Pharmacy", label: "Pharmacy" },
    { value: "Facilities", label: "Facilities" },
    { value: "Compliance", label: "Compliance" },
    { value: "IT", label: "IT" },
  ]

  const categories = [
    { value: "Patient", label: "Patient Statistics" },
    { value: "Financial", label: "Financial Performance" },
    { value: "Staff", label: "Staff & HR" },
    { value: "Quality", label: "Quality Indicators" },
    { value: "Inventory", label: "Inventory & Supply" },
    { value: "Operations", label: "Operations" },
    { value: "Compliance", label: "Compliance & Regulatory" },
    { value: "Equipment", label: "Equipment & Facilities" },
  ]

  const label = submitLabel || (initialData?.id ? "Update Report" : "Create Report")

  return (
    <Tabs value={activeModeTab} onValueChange={setActiveModeTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-800">
        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        <TabsTrigger value="ai" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          AI Assistant
        </TabsTrigger>
      </TabsList>

      <TabsContent value="manual">
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Report Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Monthly Patient Statistics"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this report covers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCategoryOpen}
                    className="w-full justify-between bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
                  >
                    {formData.category
                      ? (categories.find((cat) => cat.value === formData.category)?.label || formData.category)
                      : "Select or type category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-gray-800 border-gray-700">
                  <Command className="bg-gray-800 text-white">
                    <CommandInput placeholder="Search or type category..." className="text-white placeholder:text-gray-400" />
                    <CommandList>
                      <CommandEmpty className="py-2 px-4 text-sm text-gray-400">
                        No preset found.
                      </CommandEmpty>
                      <CommandGroup heading="Suggestions">
                        {categories.map((cat) => (
                          <CommandItem
                            key={cat.value}
                            value={cat.label} // Use label for searching
                            onSelect={() => {
                              setFormData({ ...formData, category: cat.value })
                              setIsCategoryOpen(false)
                            }}
                            className="text-white hover:bg-gray-700 aria-selected:bg-gray-700 aria-selected:text-white"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.category === cat.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {cat.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                        <CommandGroup heading="Custom">
                            <CommandItem
                                value="custom-category-option"
                                onSelect={() => {
                                    setFormData({ ...formData, category: "" }) // Clear to show input
                                    setIsCategoryOpen(false)
                                }}
                                className="text-green-400 hover:bg-gray-700 aria-selected:bg-gray-700 aria-selected:text-green-400 font-medium"
                            >
                            <Plus className="mr-2 h-4 w-4" />
                            Write custom category...
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Custom input if not in predefined list or explicitly custom */}
              {(!categories.some(c => c.value === formData.category) || formData.category === "") && (
                  <div className="mt-2 transition-all duration-200">
                      {formData.category && !categories.some(c => c.value === formData.category) && (
                          <Label className="text-xs text-green-400 mb-1.5 block">Custom Category Selected:</Label>
                      )}
                      <Input
                          value={formData.category}
                          placeholder="Enter custom category"
                          className="bg-gray-800 border-gray-700 text-white"
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          autoFocus={!categories.some(c => c.value === formData.category)}
                      />
                  </div>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
                required
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value} className="text-white">
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="DRAFT" className="text-white">Draft</SelectItem>
                  <SelectItem value="GENERATED" className="text-white">Generated</SelectItem>
                  <SelectItem value="PUBLISHED" className="text-white">Published</SelectItem>
                  <SelectItem value="ARCHIVED" className="text-white">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="DAILY" className="text-white">Daily</SelectItem>
                  <SelectItem value="WEEKLY" className="text-white">Weekly</SelectItem>
                  <SelectItem value="MONTHLY" className="text-white">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY" className="text-white">Quarterly</SelectItem>
                  <SelectItem value="YEARLY" className="text-white">Yearly</SelectItem>
                  <SelectItem value="ON_DEMAND" className="text-white">On Demand</SelectItem>
                </SelectContent>
              </Select>
            </div>

             {/* Format */}
             <div className="space-y-2">
              <Label htmlFor="format">Format *</Label>
              <Select
                value={formData.format}
                onValueChange={(value) => setFormData({ ...formData, format: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="PDF" className="text-white">PDF</SelectItem>
                  <SelectItem value="EXCEL" className="text-white">Excel</SelectItem>
                  <SelectItem value="CSV" className="text-white">CSV</SelectItem>
                  <SelectItem value="DASHBOARD" className="text-white">Dashboard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                label
              )}
            </Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="ai">
        <div className="mt-4">
          <AIReportAssistant 
            onApply={(data) => {
              setFormData({
                ...formData,
                title: data.title,
                description: data.description
              })
              setActiveModeTab("manual")
            }} 
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}
