import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// S3-compatible client (works with MinIO, AWS S3, etc.)
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin123",
  },
  forcePathStyle: true, // Required for MinIO
})

const BUCKET = process.env.S3_BUCKET || "documents"

export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  const key = `uploads/${Date.now()}-${filename}`
  
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  )

  // Return the public URL
  const url = `${process.env.S3_ENDPOINT}/${BUCKET}/${key}`
  return { url, key }
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })
  return getSignedUrl(s3Client, command, { expiresIn })
}

export async function getSignedUploadUrl(
  filename: string,
  contentType: string,
  expiresIn = 3600
): Promise<{ uploadUrl: string; key: string }> {
  const key = `uploads/${Date.now()}-${filename}`
  
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  })
  
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn })
  return { uploadUrl, key }
}

export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  )
}

export { s3Client, BUCKET }
