import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// S3 Client configuration for MinIO
export const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || "http://minio:9000",
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin123",
  },
  forcePathStyle: true, // Required for MinIO
})

export const BUCKET_NAME = process.env.S3_BUCKET || "documents"

// Generate unique filename
export function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = originalName.split(".").pop()
  return `${timestamp}-${random}.${ext}`
}

// Upload file to S3/MinIO
export async function uploadFile(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = "uploads"
): Promise<{ url: string; key: string }> {
  const key = `${folder}/${generateFileName(fileName)}`
  
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  )

  // Return URL via API proxy (MinIO is internal, not browser-accessible)
  const url = `/api/files/${key}`

  return { url, key }
}

// Delete file from S3/MinIO
export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  )
}

// Get signed URL for private files
export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })
  return getSignedUrl(s3Client, command, { expiresIn })
}

// Get signed URL for upload (client-side uploads)
export async function getSignedUploadUrl(
  fileName: string,
  contentType: string,
  folder: string = "uploads"
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const key = `${folder}/${generateFileName(fileName)}`
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })
  
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  const publicUrl = `/api/files/${key}`

  return { uploadUrl, key, publicUrl }
}
