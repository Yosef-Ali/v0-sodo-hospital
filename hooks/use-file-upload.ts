import { useState } from "react"

interface UploadResult {
  key: string
  url: string
  size: number
  contentType: string
}

interface UseFileUploadOptions {
  folder?: string
  onSuccess?: (result: UploadResult) => void
  onError?: (error: string) => void
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

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

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const result: UploadResult = await response.json()
      setProgress(100)
      options.onSuccess?.(result)
      return result
    } catch (err: any) {
      const errorMsg = err.message || "Upload failed"
      setError(errorMsg)
      options.onError?.(errorMsg)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return { upload, isUploading, progress, error }
}
