/**
 * File Upload Utilities for Neon DB
 *
 * For production use with Neon DB, you have several options for file storage:
 * 1. Vercel Blob Storage (recommended for Vercel deployments)
 * 2. AWS S3
 * 3. Cloudflare R2
 * 4. Supabase Storage
 *
 * This file provides a unified interface for file uploads.
 */

export interface UploadedFile {
  url: string
  filename: string
  size: number
  mimeType: string
  uploadedAt: Date
}

export interface UploadOptions {
  maxSize?: number // in bytes, default 10MB
  allowedTypes?: string[] // MIME types
  folder?: string // storage folder/path
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB
const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
]

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options: UploadOptions = {}
): { valid: boolean; error?: string } {
  const maxSize = options.maxSize || DEFAULT_MAX_SIZE
  const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_TYPES

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  return { valid: true }
}

/**
 * Generate a unique filename with timestamp
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalFilename.split('.').pop()
  const nameWithoutExt = originalFilename.replace(`.${extension}`, '')
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-')

  return `${sanitizedName}-${timestamp}-${randomString}.${extension}`
}

/**
 * Upload file to Vercel Blob Storage (recommended for Vercel + Neon)
 *
 * Setup:
 * 1. npm install @vercel/blob
 * 2. Add BLOB_READ_WRITE_TOKEN to your .env file
 *
 * @example
 * const result = await uploadToVercelBlob(file, { folder: 'reports' })
 * // Save result.url to database
 */
export async function uploadToVercelBlob(
  file: File,
  options: UploadOptions = {}
): Promise<UploadedFile> {
  // Validate file
  const validation = validateFile(file, options)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // This is a placeholder - actual implementation requires @vercel/blob package
  // Uncomment and install @vercel/blob to use:
  /*
  import { put } from '@vercel/blob'

  const filename = generateUniqueFilename(file.name)
  const folder = options.folder || 'uploads'
  const pathname = `${folder}/${filename}`

  const blob = await put(pathname, file, {
    access: 'public',
  })

  return {
    url: blob.url,
    filename: filename,
    size: file.size,
    mimeType: file.type,
    uploadedAt: new Date()
  }
  */

  // Mock implementation for development
  const filename = generateUniqueFilename(file.name)
  const folder = options.folder || 'uploads'

  return {
    url: `/storage/${folder}/${filename}`,
    filename: filename,
    size: file.size,
    mimeType: file.type,
    uploadedAt: new Date()
  }
}

/**
 * Upload file to AWS S3
 *
 * Setup:
 * 1. npm install @aws-sdk/client-s3
 * 2. Add AWS credentials to .env:
 *    - AWS_ACCESS_KEY_ID
 *    - AWS_SECRET_ACCESS_KEY
 *    - AWS_REGION
 *    - AWS_S3_BUCKET
 */
export async function uploadToS3(
  file: File,
  options: UploadOptions = {}
): Promise<UploadedFile> {
  // Validate file
  const validation = validateFile(file, options)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Placeholder - requires AWS SDK
  const filename = generateUniqueFilename(file.name)
  const folder = options.folder || 'uploads'

  // Mock S3 URL
  return {
    url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${folder}/${filename}`,
    filename: filename,
    size: file.size,
    mimeType: file.type,
    uploadedAt: new Date()
  }
}

/**
 * Upload file to Cloudflare R2
 *
 * Setup:
 * 1. npm install @cloudflare/workers-types
 * 2. Configure R2 bucket in Cloudflare dashboard
 * 3. Add credentials to .env:
 *    - R2_ACCOUNT_ID
 *    - R2_ACCESS_KEY_ID
 *    - R2_SECRET_ACCESS_KEY
 *    - R2_BUCKET_NAME
 */
export async function uploadToCloudflareR2(
  file: File,
  options: UploadOptions = {}
): Promise<UploadedFile> {
  // Validate file
  const validation = validateFile(file, options)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Placeholder - requires Cloudflare R2 setup
  const filename = generateUniqueFilename(file.name)
  const folder = options.folder || 'uploads'

  return {
    url: `https://${process.env.R2_BUCKET_NAME}.r2.dev/${folder}/${filename}`,
    filename: filename,
    size: file.size,
    mimeType: file.type,
    uploadedAt: new Date()
  }
}

/**
 * Convert file to base64 (NOT recommended for large files)
 * Only use for small images or files that need to be embedded
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/csv': 'csv',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  }

  return mimeToExt[mimeType] || 'bin'
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
