
import dotenv from "dotenv"

// Load environment variables *before* any other imports
dotenv.config({ path: '.env.local' })

async function cleanupBrokenLinks() {
  console.log("🧹 Starting cleanup of broken legacy links...")

  // Dynamic imports
  const { db, people, documentsV2, vehicles, companyRegistrations, importPermits, permits } = await import("@/lib/db")
  const { eq, like, notLike } = await import("drizzle-orm")

  let removedCount = 0
  let updatedPeople = 0

  // 1. Clean up People (documentSections JSONB)
  console.log("\n👤 Cleaning People document sections...")
  const allPeople = await db.select().from(people)

  for (const person of allPeople) {
    let modified = false
    const sections = person.documentSections as any[] || []

    if (!Array.isArray(sections)) continue

    for (const section of sections) {
      if (section.files && Array.isArray(section.files)) {
        const originalLength = section.files.length
        // Filter OUT files that start with /uploads/ (legacy/broken)
        // Keep files that start with /api/files/ (migrated/new) or other valid paths
        section.files = section.files.filter((url: string) => !url.startsWith("/uploads/"))

        if (section.files.length !== originalLength) {
          modified = true
          removedCount += (originalLength - section.files.length)
        }
      }
    }

    if (modified) {
      await db.update(people)
        .set({ documentSections: sections, updatedAt: new Date() })
        .where(eq(people.id, person.id))
      updatedPeople++
      console.log(`  ✨ Cleaned ${person.firstName} ${person.lastName}`)
    }
  }

  // 2. Clean up DocumentsV2 (Delete rows with broken links)
  console.log("\n📄 Cleaning DocumentsV2...")
  const result = await db.delete(documentsV2)
    .where(like(documentsV2.fileUrl, "/uploads/%"))
    .returning()

  if (result.length > 0) {
    console.log(`  🗑️ Deleted ${result.length} broken document records`)
    removedCount += result.length
  } else {
    console.log("  No broken records found in documentsV2")
  }

  // 3. Clean up Vehicles (documents array + documentSections)
  console.log("\n🚗 Cleaning Vehicles...")
  let updatedVehicles = 0
  const allVehicles = await db.select().from(vehicles)

  for (const vehicle of allVehicles) {
    let modified = false

    // Clean documents array
    const docs = vehicle.documents as string[] || []
    const cleanDocs = docs.filter(url => !url.startsWith("/uploads/"))
    if (cleanDocs.length !== docs.length) {
      modified = true
      removedCount += (docs.length - cleanDocs.length)
    }

    // Clean documentSections
    const sections = vehicle.documentSections as any[] || []
    for (const section of sections) {
      if (section.files && Array.isArray(section.files)) {
        const originalLength = section.files.length
        section.files = section.files.filter((url: string) => !url.startsWith("/uploads/"))
        if (section.files.length !== originalLength) {
          modified = true
          removedCount += (originalLength - section.files.length)
        }
      }
    }

    if (modified) {
      await db.update(vehicles)
        .set({
          documents: cleanDocs,
          documentSections: sections,
          updatedAt: new Date()
        })
        .where(eq(vehicles.id, vehicle.id))
      updatedVehicles++
      console.log(`  ✨ Cleaned vehicle: ${vehicle.title}`)
    }
  }

  console.log(`\n🎉 Cleanup Complete!`)
  console.log(`Removed ${removedCount} broken links/files.`)
  console.log(`Updated ${updatedPeople} people records.`)
  console.log(`Updated ${updatedVehicles} vehicle records.`)
}

cleanupBrokenLinks().catch(console.error)
