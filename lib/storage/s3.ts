import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// S3-compatible client (works with MinIO)
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || "http://minio:9000",
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin123",
  },
  forcePathStyle: true, // Required for MinIO
})

const BUCKET = process.env.S3_BUCKET || "documents"

export interface UploadResult {
  key: string
  url: string
  size: number
  contentType: string
}

// Generate unique filename
export function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = originalName.split(".").pop()
  return `${timestamp}-${random}.${ext}`
}

/**
 * Upload a file to S3/MinIO
 */
export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string,
  folder: string = "uploads"
): Promise<UploadResult> {
  const key = `${folder}/${generateFileName(filename)}`

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  )

  return {
    key,
    url: `/api/files/${encodeURIComponent(key)}`,
    size: file.length,
    contentType,
  }
}

/**
 * Get a signed URL for downloading a file
 */
export async function getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })
  return getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Get file as stream
 */
export async function getFile(key: string) {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  )
  return response
}

/**
 * Delete a file from S3/MinIO
 */
export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  )
}

/**
 * Get signed URL for upload (client-side uploads)
 */
export async function getSignedUploadUrl(
  fileName: string,
  contentType: string,
  folder: string = "uploads"
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const key = `${folder}/${generateFileName(fileName)}`

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  const publicUrl = `/api/files/${key}`

  return { uploadUrl, key, publicUrl }
}

export { s3Client, BUCKET }
