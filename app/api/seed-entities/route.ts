import { NextResponse } from "next/server"
import { seedAll, seedVehicles, seedImports, seedCompanies } from "@/lib/db/seed-entities"

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all"

    let result

    switch (type) {
      case "vehicles":
        result = await seedVehicles()
        break
      case "imports":
        result = await seedImports()
        break
      case "companies":
        result = await seedCompanies()
        break
      case "all":
      default:
        result = await seedAll()
        break
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Seed API for vehicles, imports, and companies",
    usage: {
      all: "POST /api/seed-entities",
      vehicles: "POST /api/seed-entities?type=vehicles",
      imports: "POST /api/seed-entities?type=imports",
      companies: "POST /api/seed-entities?type=companies",
    }
  })
}
