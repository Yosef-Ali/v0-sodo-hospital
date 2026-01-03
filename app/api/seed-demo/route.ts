import { NextResponse } from "next/server"
import { seedDemoWorkflow } from "@/lib/actions/seed-demo-workflow"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await seedDemoWorkflow()
    
    if (result.success) {
      return NextResponse.json(result)
    }
    
    return NextResponse.json(result, { status: 400 })
  } catch (error) {
    console.error("Error in seed-demo API:", error)
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 })
  }
}
