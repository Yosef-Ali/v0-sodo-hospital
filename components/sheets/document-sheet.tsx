"use client"

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, Plus } from "lucide-react"
import type { Document } from "@/components/pages/documents-page"
import { Badge } from "@/components/ui/badge"

interface DocumentSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (document: Omit<Document, "id" | "createdAt" | "lastUpdated">) => void
}

export function DocumentSheet({ open, onOpenChange, onSubmit }: DocumentSheetProps) {
  const [formData, setFormData] = useState<Omit<Document, "id" | "createdAt" | "lastUpdated">>({
    title: "",
    description: "",
    status: "pending",
    category: "",
    fileType: "PDF",
    fileSize: "0 KB",
    owner: "",
    tags: [],
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [tagInput, setTagInput] = useState("")

  // Predefined options
  const categories = [
    { value: "work_permit", label: "Work Permit Documents" },
    { value: "residence_id", label: "Residence ID Documents" },
    { value: "license", label: "Professional License Documents" },
    { value: "contract", label: "Employment Contract" },
    { value: "certificate", label: "Certificates" },
    { value: "health", label: "Health Documents" },
  ]

  const quickTitles: Record<string, string[]> = {
    work_permit: [
      "Work Permit Application",
      "Work Permit Copy",
      "Work Permit Renewal Application",
      "Work Permit Approval Letter",
    ],
    residence_id: [
      "Residence ID Application",
      "Residence ID Copy",
      "Residence ID Renewal",
      "Proof of Residence",
    ],
    license: [
      "Professional License Copy",
      "License Application",
      "License Renewal Documents",
      "Good Standing Certificate",
    ],
    contract: [
      "Employment Contract",
      "Contract Amendment",
      "Contract Renewal",
      "Offer Letter",
    ],
    certificate: [
      "Educational Certificate",
      "Experience Letter",
      "Professional Certification",
      "Training Certificate",
    ],
    health: [
      "Health Certificate",
      "Medical Exam Report",
      "TB Screening Results",
      "Vaccination Records",
    ],
  }

  // Sample people - you can fetch from database
  const people = [
    { value: "person1", label: "Dr. Sarah Johnson" },
    { value: "person2", label: "Nurse Maria Garcia" },
    { value: "person3", label: "Dr. Ahmed Hassan" },
    { value: "person4", label: "Admin John Doe" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      // Extract file type from file name
      const fileExtension = file.name.split(".").pop()?.toUpperCase() || "UNKNOWN"

      // Format file size
      let fileSize = ""
      if (file.size < 1024) {
        fileSize = `${file.size} B`
      } else if (file.size < 1024 * 1024) {
        fileSize = `${(file.size / 1024).toFixed(1)} KB`
      } else {
        fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      }

      setFormData((prev) => ({
        ...prev,
        fileType: fileExtension,
        fileSize: fileSize,
      }))
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() !== "" && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)

    // Reset form
    setFormData({
      title: "",
      description: "",
      status: "pending",
      category: "",
      fileType: "PDF",
      fileSize: "0 KB",
      owner: "",
      tags: [],
    })
    setSelectedFile(null)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">Upload Document</SheetTitle>
          <SheetDescription className="text-gray-400">
            Fill in the details below. Use dropdowns for quick selection.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-gray-300">File Upload *</Label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center bg-gray-900/30">
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <div className="bg-green-600/20 p-2 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-400"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-white">{selectedFile.name}</div>
                  <div className="text-xs text-gray-400">
                    {formData.fileSize} • {formData.fileType}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-gray-700 border-gray-600 hover:bg-gray-600"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove File
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-sm font-medium mb-1">Choose a file to upload</h3>
                  <p className="text-gray-400 text-xs mb-4">PDF, DOCX, XLSX, PPTX, JPG, PNG</p>
                  <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Browse Files
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-300">
              Category *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value, title: "" })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="text-white">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Title Selection (based on category) */}
          {formData.category && (
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                Document Title *
              </Label>
              <Select
                value={formData.title}
                onValueChange={(value) => setFormData({ ...formData, title: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select or type custom title" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {quickTitles[formData.category]?.map((title) => (
                    <SelectItem key={title} value={title} className="text-white">
                      {title}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom" className="text-white">
                    + Custom Title
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Custom title input */}
              {formData.title === "custom" && (
                <Input
                  placeholder="Enter custom title"
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Description *
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter document description"
              className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
              required
            />
          </div>

          {/* Status and Owner */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-300">
                Status *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="pending" className="text-white">Pending</SelectItem>
                  <SelectItem value="review" className="text-white">Under Review</SelectItem>
                  <SelectItem value="approved" className="text-white">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner" className="text-gray-300">
                Owner *
              </Label>
              <Select
                value={formData.owner}
                onValueChange={(value) => setFormData({ ...formData, owner: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {people.map((person) => (
                    <SelectItem key={person.value} value={person.value} className="text-white">
                      {person.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-gray-300">Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags"
                className="bg-gray-700 border-gray-600 text-white flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                onClick={handleAddTag}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} className="bg-gray-700 text-gray-300 hover:bg-gray-600">
                    {tag}
                    <button
                      type="button"
                      className="ml-1 text-gray-400 hover:text-gray-300"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!selectedFile || !formData.category || !formData.title || !formData.description || !formData.owner}
            >
              Upload Document
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
