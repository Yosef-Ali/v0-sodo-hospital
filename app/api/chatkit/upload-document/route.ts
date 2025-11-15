import { NextResponse } from "next/server"
import { uploadDocument } from "@/lib/actions/v2/documents"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const result = await uploadDocument(formData)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in upload-document API route:", error)
    return NextResponse.json(
      { success: false, error: "Failed to upload document" },
      { status: 500 }
    )
  }
}

