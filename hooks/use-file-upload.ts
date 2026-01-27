"use client"

import { useState } from "react"

interface UploadResult {
  url: string
  key: string
  name: string
  size: number
  type: string
}

interface UseFileUploadOptions {
  folder?: string
  onSuccess?: (result: UploadResult) => void
  onError?: (error: Error) => void
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  const upload = async (file: File): Promise<UploadResult | null> => {
    setIsUploading(true)
    setProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (options.folder) {
        formData.append("folder", options.folder)
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const result = await response.json()
      setProgress(100)
      options.onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Upload failed")
      setError(error)
      options.onError?.(error)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const uploadMultiple = async (files: File[]): Promise<UploadResult[]> => {
    const results: UploadResult[] = []
    for (const file of files) {
      const result = await upload(file)
      if (result) results.push(result)
    }
    return results
  }

  return {
    upload,
    uploadMultiple,
    isUploading,
    progress,
    error,
  }
}
