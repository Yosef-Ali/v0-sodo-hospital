import { NextRequest, NextResponse } from "next/server"
import { uploadFile, getSignedUploadUrl } from "@/lib/s3"
import { auth } from "@/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

// Check if S3 is configured
const isS3Configured = !!process.env.S3_ENDPOINT && process.env.S3_ENDPOINT !== "http://minio:9000"

// Allow uploads without auth in development
const REQUIRE_AUTH = process.env.NODE_ENV === "production"

export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional in development)
    if (REQUIRE_AUTH) {
      const session = await auth()
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10MB" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split(".").pop()
    const uniqueName = `${timestamp}-${random}.${ext}`

    let result: { url: string; key: string }

    if (isS3Configured) {
      // Upload to S3/MinIO
      result = await uploadFile(buffer, file.name, file.type, folder)
    } else {
      // Fallback: Save to local public/uploads directory
      const uploadDir = path.join(process.cwd(), "public", "uploads", folder)
      await mkdir(uploadDir, { recursive: true })

      const filePath = path.join(uploadDir, uniqueName)
      await writeFile(filePath, buffer)

      result = {
        url: `/uploads/${folder}/${uniqueName}`,
        key: `${folder}/${uniqueName}`,
      }
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      name: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}

// Get presigned URL for client-side upload
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("fileName")
    const contentType = searchParams.get("contentType")
    const folder = searchParams.get("folder") || "uploads"

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "fileName and contentType are required" },
        { status: 400 }
      )
    }

    const result = await getSignedUploadUrl(fileName, contentType, folder)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Presigned URL error:", error)
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    )
  }
}
