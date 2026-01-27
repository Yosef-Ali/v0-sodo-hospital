import { NextResponse } from "next/server"
import { seedDemoData } from "@/lib/db/seed-demo"

export async function POST() {
  try {
    const result = await seedDemoData()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Demo data seeded successfully!",
        data: result.summary
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Seed demo error:", error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
