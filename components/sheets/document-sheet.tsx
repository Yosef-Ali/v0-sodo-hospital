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
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [tagInput, setTagInput] = useState("")

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
    setCurrentStep(1)
  }

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const isStepValid = () => {
    if (currentStep === 1) {
      return selectedFile !== null
    }
    if (currentStep === 2) {
      return formData.title.trim() !== "" && formData.description.trim() !== ""
    }
    if (currentStep === 3) {
      return formData.status !== "" && formData.category.trim() !== "" && formData.owner.trim() !== ""
    }
    return true
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-white">Upload Document</SheetTitle>
          <SheetDescription className="text-gray-400">
            Step {currentStep} of {totalSteps}:{" "}
            {currentStep === 1 ? "Upload File" : currentStep === 2 ? "Document Details" : "Metadata"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6 relative z-10">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center bg-gradient-to-b from-blue-900/10 to-transparent">
                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center">
                      <div className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 p-2 rounded-lg shadow-[0_0_10px_rgba(79,70,229,0.3)]">
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
                          className="text-blue-400"
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
                      className="mt-2 bg-transparent border-gray-600 hover:bg-gray-800/50 hover:border-gray-500 text-gray-300"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-medium mb-1">Drag and drop your file</h3>
                    <p className="text-gray-400 text-sm mb-4">or click to browse files</p>
                    <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-transparent border-gray-600 hover:bg-gray-800/50 hover:border-gray-500 text-gray-300"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      Browse Files
                    </Button>
                    <p className="text-xs text-gray-500 mt-4">Supported formats: PDF, DOCX, XLSX, PPTX, JPG, PNG</p>
                  </>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter document title"
                  className="bg-gray-700 border-gray-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter document description"
                  className="bg-gray-700 border-gray-600 min-h-[100px]"
                  required
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Enter category"
                  className="bg-gray-700 border-gray-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Input
                  id="owner"
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  placeholder="Enter document owner"
                  className="bg-gray-700 border-gray-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tags"
                    className="bg-gray-700 border-gray-600 flex-1"
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
            </div>
          )}

          <div className="flex justify-between pt-4">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="bg-transparent border-gray-600 hover:bg-gray-800/50 hover:border-gray-500 text-gray-300"
              >
                Previous
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_0_15px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:shadow-none disabled:from-gray-700 disabled:to-gray-700"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!isStepValid()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_0_15px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:shadow-none disabled:from-gray-700 disabled:to-gray-700"
              >
                Upload Document
              </Button>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    currentStep > index
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_5px_rgba(79,70,229,0.5)]"
                      : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
