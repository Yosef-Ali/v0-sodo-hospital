import { NextRequest, NextResponse } from "next/server"
import { getFile } from "@/lib/storage/s3"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await params
    const fileKey = key.join("/")

    const response = await getFile(fileKey)
    
    if (!response.Body) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const chunks: Uint8Array[] = []
    const reader = response.Body.transformToWebStream().getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    const buffer = Buffer.concat(chunks)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (error: any) {
    console.error("File fetch error:", error)
    if (error.name === "NoSuchKey") {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 })
  }
}
