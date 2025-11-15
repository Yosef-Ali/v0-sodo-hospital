"use client"

import { useState, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UploadButton } from "@/lib/uploadthing-utils"

interface ChatInputProps {
  onSend: (message: string) => void
  onFileUpload?: (files: { url: string; name: string; size: number }[]) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  onFileUpload,
  disabled = false,
  placeholder = "Type your message..."
}: ChatInputProps) {
  const [input, setInput] = useState("")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input)
      setInput("")
    }
  }

  const handleUploadComplete = (files: any[]) => {
    console.log("Files uploaded from ChatInput:", files)
    setIsUploading(false)
    setUploadProgress(100)

    if (onFileUpload && files.length > 0) {
      const uploadedFiles = files.map((f) => ({
        url: f.url,
        name: f.name,
        size: f.size,
      }))
      onFileUpload(uploadedFiles)
    }

    // Close dialog after successful upload
    setTimeout(() => {
      setUploadDialogOpen(false)
      setUploadProgress(0)
      setUploadError(null)
    }, 1000)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-700 bg-gray-900 p-4">
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 text-gray-400 hover:text-gray-300 hover:bg-gray-800"
          disabled={disabled}
          onClick={() => setUploadDialogOpen(true)}
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Text input */}
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[44px] max-h-32 resize-none bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500 rounded-xl"
          rows={1}
        />

        {/* Send button */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          size="icon"
          className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-700 disabled:text-gray-500 rounded-xl"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded-md">Enter</kbd>{" "}
        to send, <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded-md">Shift + Enter</kbd>{" "}
        for new line
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Upload Attachment</DialogTitle>
            <DialogDescription className="text-gray-400">
              Upload a file to attach to your message
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Error Message */}
            {uploadError && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-300">{uploadError}</p>
              </div>
            )}

            {/* Loading Indicator */}
            {isUploading && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-xs text-blue-300 mb-1">Uploading...</p>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            {!isUploading && uploadProgress < 100 && (
              <UploadButton
                endpoint="permitDocumentUploader"
                onClientUploadComplete={handleUploadComplete}
                onUploadBegin={() => {
                  setIsUploading(true)
                  setUploadError(null)
                  setUploadProgress(0)
                }}
                onUploadError={(error: Error) => {
                  console.error("Upload error:", error)
                  setIsUploading(false)
                  setUploadError(`Upload failed: ${error.message}`)
                }}
                onUploadProgress={(progress) => {
                  setUploadProgress(progress)
                }}
                appearance={{
                  button:
                    "bg-green-600 hover:bg-green-700 text-white w-full ut-ready:bg-green-600 ut-uploading:bg-green-700 ut-uploading:cursor-wait",
                  allowedContent: "text-gray-400 text-sm",
                }}
              />
            )}

            {/* Success Message */}
            {uploadProgress === 100 && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                <p className="text-sm text-green-300 flex items-center gap-2">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  File uploaded successfully! Closing...
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
