
import { backfillPermitTicketNumbers } from "@/lib/actions/v2/permits"
import { backfillVehicleTicketNumbers } from "@/lib/actions/v2/vehicles"
import { backfillImportTicketNumbers } from "@/lib/actions/v2/imports"
// import { backfillCompanyTicketNumbers } from "@/lib/actions/v2/companies" // Assuming this might exist, but let's stick to what we saw

async function main() {
  console.log("Starting backfill process...")

  console.log("1. Backfilling Permits...")
  const permitsResult = await backfillPermitTicketNumbers()
  console.log("Permits:", permitsResult)

  console.log("2. Backfilling Vehicles...")
  const vehiclesResult = await backfillVehicleTicketNumbers()
  console.log("Vehicles:", vehiclesResult)

  console.log("3. Backfilling Imports...")
  const importsResult = await backfillImportTicketNumbers()
  console.log("Imports:", importsResult)

  // Try companies if it exists, otherwise skip
  try {
    const { backfillCompanyTicketNumbers } = await import("@/lib/actions/v2/companies")
    if (backfillCompanyTicketNumbers) {
      console.log("4. Backfilling Companies...")
      const companiesResult = await backfillCompanyTicketNumbers()
      console.log("Companies:", companiesResult)
    }
  } catch (e) {
    console.log("Skipping Companies (module or function not found)")
  }

  console.log("Backfill complete!")
  process.exit(0)
}

main().catch(console.error)
