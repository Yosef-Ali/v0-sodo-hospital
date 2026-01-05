"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, FileText, CheckCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
  url: string
  name: string
  size: number
  type: string
  key: string
}

interface UploadDropzoneProps {
  endpoint?: string // kept for compatibility, not used
  folder?: string
  maxFiles?: number
  maxSize?: number // in MB
  accept?: string[]
  onClientUploadComplete?: (files: UploadedFile[]) => void
  onUploadBegin?: () => void
  onUploadError?: (error: Error) => void
  onUploadProgress?: (progress: number) => void
  appearance?: {
    container?: string
    uploadIcon?: string
    label?: string
    allowedContent?: string
    button?: string
  }
  className?: string
}

export function UploadDropzone({
  folder = "uploads",
  maxFiles = 5,
  maxSize = 10,
  accept = ["image/*", "application/pdf", ".doc", ".docx"],
  onClientUploadComplete,
  onUploadBegin,
  onUploadError,
  onUploadProgress,
  appearance,
  className,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const result = await response.json()
      return {
        url: result.url,
        name: result.name,
        size: result.size,
        type: result.type,
        key: result.key,
      }
    } catch (error) {
      throw error
    }
  }

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).slice(0, maxFiles)
    
    // Validate files
    for (const file of fileArray) {
      if (file.size > maxSize * 1024 * 1024) {
        onUploadError?.(new Error(`File ${file.name} exceeds ${maxSize}MB limit`))
        return
      }
    }

    setIsUploading(true)
    onUploadBegin?.()
    setProgress(0)

    const uploaded: UploadedFile[] = []
    
    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        const result = await uploadFile(file)
        if (result) {
          uploaded.push(result)
        }
        const progressPercent = Math.round(((i + 1) / fileArray.length) * 100)
        setProgress(progressPercent)
        onUploadProgress?.(progressPercent)
      }

      setUploadedFiles(uploaded)
      onClientUploadComplete?.(uploaded)
    } catch (error) {
      onUploadError?.(error instanceof Error ? error : new Error("Upload failed"))
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files)
    }
  }, [folder, maxFiles, maxSize])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
        isDragging ? "border-green-500 bg-green-500/10" : "border-gray-600 hover:border-gray-500",
        appearance?.container,
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={accept.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center gap-2 text-center">
        {isUploading ? (
          <>
            <Loader2 className={cn("h-10 w-10 animate-spin text-green-500", appearance?.uploadIcon)} />
            <p className={cn("text-sm text-gray-300", appearance?.label)}>
              Uploading... {progress}%
            </p>
            <div className="w-full max-w-xs bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <Upload className={cn("h-10 w-10 text-green-500", appearance?.uploadIcon)} />
            <p className={cn("text-sm text-gray-300", appearance?.label)}>
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className={cn("text-xs text-gray-500", appearance?.allowedContent)}>
              PDF, Images up to {maxSize}MB (max {maxFiles} files)
            </p>
          </>
        )}
      </div>
    </div>
  )
}

interface UploadButtonProps {
  endpoint?: string
  folder?: string
  maxSize?: number
  onClientUploadComplete?: (files: UploadedFile[]) => void
  onUploadBegin?: () => void
  onUploadError?: (error: Error) => void
  appearance?: {
    button?: string
  }
  className?: string
  children?: React.ReactNode
}

export function UploadButton({
  folder = "uploads",
  maxSize = 10,
  onClientUploadComplete,
  onUploadBegin,
  onUploadError,
  appearance,
  className,
  children,
}: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxSize * 1024 * 1024) {
      onUploadError?.(new Error(`File exceeds ${maxSize}MB limit`))
      return
    }

    setIsUploading(true)
    onUploadBegin?.()

    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const result = await response.json()
      onClientUploadComplete?.([{
        url: result.url,
        name: result.name,
        size: result.size,
        type: result.type,
        key: result.key,
      }])
    } catch (error) {
      onUploadError?.(error instanceof Error ? error : new Error("Upload failed"))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
          "bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed",
          appearance?.button,
          className
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          children || (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </>
          )
        )}
      </button>
    </>
  )
}
