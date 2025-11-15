"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UploadDropzone } from "@/lib/uploadthing-utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, X, Check } from "lucide-react"

interface DocumentUploaderProps {
  ticketNumber: string
  personId: string
  permitId: string
  onUploadComplete?: () => void
}

export function DocumentUploader({
  ticketNumber,
  personId,
  permitId,
  onUploadComplete,
}: DocumentUploaderProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ url: string; name: string }>
  >([])
  const [documentType, setDocumentType] = useState("")
  const [documentTitle, setDocumentTitle] = useState("")
  const [documentNotes, setDocumentNotes] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const documentTypes = [
    { value: "passport", label: "Passport" },
    { value: "photo", label: "Photo" },
    { value: "medical_certificate", label: "Medical Certificate" },
    { value: "work_contract", label: "Work Contract" },
    { value: "educational_certificate", label: "Educational Certificate" },
    { value: "police_clearance", label: "Police Clearance" },
    { value: "bank_statement", label: "Bank Statement" },
    { value: "residence_proof", label: "Residence Proof" },
    { value: "other", label: "Other" },
  ]

  const handleUploadBegin = () => {
    console.log("Upload started...")
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)
  }

  const handleUploadComplete = async (files: any[]) => {
    console.log("Files uploaded successfully:", files)
    setIsUploading(false)
    setUploadProgress(100)
    setUploadedFiles(
      files.map((f) => ({
        url: f.url,
        name: f.name,
      }))
    )
    setShowForm(true)
  }

  const handleSaveDocuments = async () => {
    if (!documentType || uploadedFiles.length === 0) {
      alert("Please select a document type and upload at least one file")
      return
    }

    try {
      setUploading(true)

      // Import the server action
      const { createDocument } = await import("@/lib/actions/v2/documents")

      // Save each uploaded file as a document
      for (const file of uploadedFiles) {
        const result = await createDocument({
          type: documentType,
          title: documentTitle || file.name,
          number: ticketNumber,
          personId: personId,
          fileUrl: file.url,
        })

        if (!result.success) {
          console.error("Failed to save document:", result.error)
          alert(`Failed to save document: ${result.error}`)
          return
        }
      }

      // Reset form
      setUploadedFiles([])
      setDocumentType("")
      setDocumentTitle("")
      setDocumentNotes("")
      setShowForm(false)

      // Notify parent
      if (onUploadComplete) {
        onUploadComplete()
      }

      // Refresh the page to show new documents
      router.refresh()
    } catch (error) {
      console.error("Error saving documents:", error)
      alert("Failed to save documents. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setUploadedFiles([])
    setDocumentType("")
    setDocumentTitle("")
    setDocumentNotes("")
    setShowForm(false)
  }

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Upload className="h-5 w-5 mr-2 text-green-500" />
        Upload Documents
      </h3>

      {!showForm ? (
        <div className="space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {isUploading && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <div className="flex-1">
                  <p className="text-sm text-blue-300 mb-1">Uploading...</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <UploadDropzone
            endpoint="permitDocumentUploader"
            onClientUploadComplete={handleUploadComplete}
            onUploadBegin={handleUploadBegin}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error)
              setIsUploading(false)
              setError(`Upload failed: ${error.message}`)
            }}
            onUploadProgress={(progress) => {
              setUploadProgress(progress)
            }}
            appearance={{
              container: "border-gray-600 bg-gray-900/50",
              uploadIcon: "text-green-500",
              label: "text-gray-300",
              allowedContent: "text-gray-500",
              button:
                "bg-green-600 hover:bg-green-700 text-white ut-ready:bg-green-600 ut-uploading:bg-green-700 ut-uploading:cursor-wait",
            }}
          />
          <p className="text-xs text-gray-500 text-center">
            Accepted formats: PDF, JPG, PNG • Max size: 8MB (PDF), 4MB (Images) • Max 5 files
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Uploaded Files Preview */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">
                Uploaded Files ({uploadedFiles.length})
              </span>
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-800 p-2 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{file.name}</span>
                  </div>
                  <button
                    onClick={() =>
                      setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))
                    }
                    className="text-gray-500 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Document Metadata Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="documentType" className="text-gray-300">
                Document Type *
              </Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {documentTypes.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="text-white"
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="documentTitle" className="text-gray-300">
                Document Title (Optional)
              </Label>
              <Input
                id="documentTitle"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="e.g., Passport - Valid until 2030"
                className="bg-gray-700 border-gray-600 text-white mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use filename
              </p>
            </div>

            <div>
              <Label htmlFor="documentNotes" className="text-gray-300">
                Notes (Optional)
              </Label>
              <Textarea
                id="documentNotes"
                value={documentNotes}
                onChange={(e) => setDocumentNotes(e.target.value)}
                placeholder="Add any notes about this document"
                className="bg-gray-700 border-gray-600 text-white mt-1 min-h-[80px]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveDocuments}
              disabled={uploading || !documentType || uploadedFiles.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {uploading ? "Saving..." : "Save Documents"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
