import { NextResponse } from "next/server"
import { backfillMissingTicketNumbers } from "@/lib/actions/v2/foreigners"
import { backfillVehicleTicketNumbers } from "@/lib/actions/v2/vehicles"
import { backfillImportTicketNumbers } from "@/lib/actions/v2/imports"
import { backfillCompanyTicketNumbers } from "@/lib/actions/v2/companies"
import { backfillPermitTicketNumbers } from "@/lib/actions/v2/permits"

export async function POST() {
  try {
    // Run all backfills in parallel
    const [foreigners, vehicles, imports, companies, permits] = await Promise.all([
      backfillMissingTicketNumbers(),
      backfillVehicleTicketNumbers(),
      backfillImportTicketNumbers(),
      backfillCompanyTicketNumbers(),
      backfillPermitTicketNumbers(),
    ])

    return NextResponse.json({
      success: true,
      results: {
        foreigners,
        vehicles,
        imports,
        companies,
        permits,
      },
      summary: {
        totalUpdated:
          (foreigners.updated || 0) +
          (vehicles.updated || 0) +
          (imports.updated || 0) +
          (companies.updated || 0) +
          (permits.updated || 0),
      }
    })
  } catch (error) {
    console.error("Backfill error:", error)
    return NextResponse.json(
      { success: false, error: "Backfill failed" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to run ticket number backfill for all entities",
    endpoint: "/api/admin/backfill-tickets",
    entities: ["foreigners", "vehicles", "imports", "companies", "permits"]
  })
}
