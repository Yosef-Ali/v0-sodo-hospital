import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { getGoogleApiKey } from "@/lib/api-keys"
import { readFile } from "fs/promises"
import path from "path"
import { getFile } from "@/lib/storage/s3"

// Document-specific extraction prompts
const EXTRACTION_PROMPTS: Record<string, string> = {
  passport: `Analyze this passport image and extract the following information in JSON format:
{
  "fullName": "First and last name as shown",
  "passportNo": "Passport number",
  "nationality": "Country of citizenship",
  "dateOfBirth": "YYYY-MM-DD format",
  "gender": "MALE or FEMALE",
  "expiryDate": "YYYY-MM-DD format",
  "issueDate": "YYYY-MM-DD format if visible"
}
Only include fields that are clearly visible. Return ONLY valid JSON, no markdown.`,

  work_permit: `Analyze this work permit document and extract the following information in JSON format:
{
  "permitNo": "Work permit number",
  "fullName": "Holder's full name",
  "issueDate": "YYYY-MM-DD format",
  "expiryDate": "YYYY-MM-DD format",
  "employer": "Employer name if visible",
  "position": "Job position if visible"
}
Only include fields that are clearly visible. Return ONLY valid JSON, no markdown.`,

  residence_id: `Analyze this residence ID document and extract the following information in JSON format:
{
  "idNo": "Residence ID number",
  "fullName": "Holder's full name",
  "issueDate": "YYYY-MM-DD format",
  "expiryDate": "YYYY-MM-DD format",
  "nationality": "Nationality if visible"
}
Only include fields that are clearly visible. Return ONLY valid JSON, no markdown.`,

  medical_license: `Analyze this medical license document and extract the following information in JSON format:
{
  "licenseNo": "License number",
  "fullName": "Doctor's full name",
  "issueDate": "YYYY-MM-DD format",
  "expiryDate": "YYYY-MM-DD format",
  "specialty": "Medical specialty if visible"
}
Only include fields that are clearly visible. Return ONLY valid JSON, no markdown.`,

  libre: `Analyze this Ethiopian vehicle registration document (Libre) and extract the following information in JSON format:
{
  "plateNumber": "License plate number (format like 3-AA-12345)",
  "chassisNumber": "Chassis/VIN number",
  "engineNumber": "Engine number",
  "ownerName": "Owner's full name",
  "vehicleType": "Type of vehicle (Car, Truck, Motorcycle, etc.)",
  "vehicleModel": "Make and model",
  "vehicleYear": "Year of manufacture",
  "color": "Vehicle color if visible"
}
Only include fields that are clearly visible. Return ONLY valid JSON, no markdown.`,

  bill_of_lading: `Analyze this Bill of Lading or Airway Bill document and extract the following information in JSON format:
{
  "blNumber": "Bill of Lading or Airway Bill number",
  "shipperName": "Shipper/Sender company name",
  "consigneeName": "Consignee/Receiver name",
  "shipperCountry": "Origin country",
  "itemDescription": "Description of goods",
  "quantity": "Number of packages/units",
  "grossWeight": "Gross weight with unit",
  "estimatedValue": "Declared value if visible",
  "currency": "Currency code (USD, EUR, etc.)"
}
Only include fields that are clearly visible. Return ONLY valid JSON, no markdown.`,

  business_license: `Analyze this Ethiopian business license/trade license document and extract the following information in JSON format:
{
  "companyName": "Registered business/company name",
  "tinNumber": "TIN (Tax Identification Number)",
  "licenseNumber": "Business license number",
  "businessType": "Type of business (PLC, Share Company, Sole Proprietorship, etc.)",
  "address": "Business address",
  "contactPerson": "Owner or manager name if visible",
  "issueDate": "Issue date in YYYY-MM-DD format",
  "expiryDate": "Expiry date in YYYY-MM-DD format if visible",
  "sector": "Business sector or activity description"
}
Only include fields that are clearly visible. Return ONLY valid JSON, no markdown.`,

  general: `Analyze this document and extract any relevant information such as:
- Names
- ID/Permit/License numbers
- Dates (issue, expiry, birth)
- Nationality
- Gender

Return as JSON with descriptive field names. Return ONLY valid JSON, no markdown.`
}

export async function POST(req: Request) {
  try {
    const { imageUrl, documentType = "general" } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: "Image URL is required" }, { status: 400 })
    }

    // Get API key from settings or env
    const apiKey = await getGoogleApiKey()
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "Google API Key not configured. Please add it in Settings > AI Services"
      }, { status: 500 })
    }

    // Initialize Gemini with the API key
    const genAI = new GoogleGenerativeAI(apiKey)

    // Get the appropriate prompt
    const prompt = EXTRACTION_PROMPTS[documentType] || EXTRACTION_PROMPTS.general

    let base64Image: string
    let mimeType: string

    // Determine mime type from extension
    const getMimeType = (filePath: string): string => {
      const ext = path.extname(filePath).toLowerCase()
      const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.pdf': 'application/pdf',
      }
      return mimeTypes[ext] || 'image/jpeg'
    }

    // Handle /api/files/ URLs (MinIO storage)
    if (imageUrl.startsWith('/api/files/')) {
      const fileKey = imageUrl.replace('/api/files/', '')
      try {
        const response = await getFile(decodeURIComponent(fileKey))
        if (!response.Body) {
          return NextResponse.json({ success: false, error: "File not found in storage" }, { status: 400 })
        }
        const chunks: Uint8Array[] = []
        const reader = response.Body.transformToWebStream().getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
        }
        const buffer = Buffer.concat(chunks)
        base64Image = buffer.toString('base64')
        mimeType = response.ContentType || getMimeType(fileKey)
      } catch (fileError) {
        console.error('Failed to read file from S3/MinIO:', fileError)
        return NextResponse.json({ success: false, error: "Failed to read file from storage" }, { status: 400 })
      }
    } else if (imageUrl.startsWith('/uploads/')) {
      // Handle local file paths (fallback for local dev)
      const filePath = path.join(process.cwd(), 'public', imageUrl)
      try {
        const fileBuffer = await readFile(filePath)
        base64Image = fileBuffer.toString('base64')
        mimeType = getMimeType(imageUrl)
      } catch (fileError) {
        console.error('Failed to read local file:', fileError)
        return NextResponse.json({ success: false, error: "Failed to read image file" }, { status: 400 })
      }
    } else {
      // Fetch remote image and convert to base64
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        return NextResponse.json({ success: false, error: "Failed to fetch image" }, { status: 400 })
      }
      const imageBuffer = await imageResponse.arrayBuffer()
      base64Image = Buffer.from(imageBuffer).toString("base64")
      mimeType = imageResponse.headers.get("content-type") || "image/jpeg"
    }

    // Use Gemini 2.5 Flash for vision (multimodal OCR)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ])

    const response = result.response
    const text = response.text()

    // Parse the JSON response
    try {
      // Remove any markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      const extractedData = JSON.parse(cleanedText)

      return NextResponse.json({
        success: true,
        data: extractedData,
        documentType,
      })
    } catch (parseError) {
      console.error("Failed to parse OCR response:", text)
      return NextResponse.json({
        success: true,
        data: { rawText: text },
        documentType,
        warning: "Could not parse structured data",
      })
    }
  } catch (error) {
    console.error("OCR Error:", error)
    return NextResponse.json(
      { success: false, error: "OCR processing failed" },
      { status: 500 }
    )
  }
}
