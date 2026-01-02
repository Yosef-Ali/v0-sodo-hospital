import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

const REPORT_SYSTEM_PROMPT = `You are an AI Expert Report and Letter Writer for SODDO Christian Hospital.
Your task is to generate professional, accurate, and compassionate reports and letters in both English and Amharic.

Guidelines:
1. Formats: Formal medical reports, support letters, status updates, or internal memos.
2. Tone: Professional, clear, and empathetic.
3. Multilingual: ALWAYS provide the output in both English and Amharic, clearly separated.
4. Accuracy: Use the provided data (from OCR or database) strictly. Do not hallucinate facts.
5. Structure:
   - Header (Hospital Info)
   - Date
   - Subject
   - Body
   - Conclusion/Sign-off

Output format: Return ONLY a valid JSON object with "english" and "amharic" keys. 
Each key should contain "subject" and "content" (markdown formatted).
Example:
{
  "english": { "subject": "...", "content": "..." },
  "amharic": { "subject": "...", "content": "..." }
}`

export async function POST(req: Request) {
  try {
    const { prompt, ocrData, type = "report", context = {} } = await req.json()

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ success: false, error: "GOOGLE_API_KEY not configured" }, { status: 500 })
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: REPORT_SYSTEM_PROMPT,
    })

    const generationPrompt = `
      Type: ${type}
      User Instructions: ${prompt}
      
      Data Context (from OCR or Database):
      ${JSON.stringify(ocrData || context, null, 2)}

      Please generate the ${type} now.
    `

    const result = await model.generateContent(generationPrompt)
    const response = result.response
    const text = response.text()

    try {
      const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      const generatedContent = JSON.parse(cleanedText)

      return NextResponse.json({
        success: true,
        data: generatedContent,
      })
    } catch (parseError) {
      console.error("Failed to parse AI response:", text)
      return NextResponse.json({
        success: true,
        data: {
          english: { subject: "Generated Report", content: text },
          amharic: { subject: "የተፈጠረ ሪፖርት", content: "Translation failed. Please see english version." }
        },
        warning: "Could not parse structured JSON",
      })
    }
  } catch (error) {
    console.error("AI Generation Error:", error)
    return NextResponse.json(
      { success: false, error: "AI generation failed" },
      { status: 500 }
    )
  }
}
