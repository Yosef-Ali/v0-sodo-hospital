import { NextRequest, NextResponse } from "next/server"
import { uploadFile, getSignedUploadUrl } from "@/lib/storage"
import { auth } from "@/auth"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to S3/MinIO
    const { url, key } = await uploadFile(buffer, file.name, file.type)

    return NextResponse.json({
      success: true,
      url,
      key,
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

// Get presigned URL for direct upload
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")
    const contentType = searchParams.get("contentType") || "application/octet-stream"

    if (!filename) {
      return NextResponse.json({ error: "Filename required" }, { status: 400 })
    }

    const { uploadUrl, key } = await getSignedUploadUrl(filename, contentType)

    return NextResponse.json({ uploadUrl, key })
  } catch (error) {
    console.error("Presign error:", error)
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    )
  }
}
