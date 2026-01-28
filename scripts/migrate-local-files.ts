
import dotenv from "dotenv"
import fs from "fs/promises"
import path from "path"

// Load environment variables first
dotenv.config({ path: '.env.local' })

// FORCE localhost for S3 endpoint (since we are tunneling)
process.env.S3_ENDPOINT = "http://localhost:9000"

async function migrateLocalFiles() {
  const { db, people, documentsV2, vehicles, companyRegistrations, importPermits, permits } = await import("@/lib/db")
  const { eq, like, sql } = await import("drizzle-orm")
  const { uploadFile } = await import("@/lib/storage/s3")

  console.log("🚀 Starting migration of local files to S3...")

  let totalMigrated = 0
  let totalErrors = 0

  // Helper to migrate a single URL
  async function migrateUrl(url: string, type: string): Promise<string | null> {
    if (!url.startsWith("/uploads/")) return null

    try {
      // Construct local path
      // Remove leading slash and construct absolute path
      // url is like /uploads/folder/file.pdf
      const relativePath = url.substring(1) // uploads/folder/file.pdf
      const localPath = path.join(process.cwd(), "public", relativePath)

      // Check if file exists
      try {
        await fs.access(localPath)
      } catch {
        console.warn(`  ⚠️ File not found locally: ${localPath}`)
        return null
      }

      console.log(`  📤 Uploading: ${url}`)
      const buffer = await fs.readFile(localPath)
      const filename = path.basename(url)

      // Determine content type (basic)
      const ext = path.extname(filename).toLowerCase()
      let contentType = "application/octet-stream"
      if (ext === ".pdf") contentType = "application/pdf"
      else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg"
      else if (ext === ".png") contentType = "image/png"

      // Upload to S3
      const result = await uploadFile(buffer, filename, contentType, "migrated")
      console.log(`  ✅ Migrated to: ${result.url}`)
      return result.url

    } catch (error) {
      console.error(`  ❌ Failed to migrate ${url}:`, error)
      totalErrors++
      return null
    }
  }

  // 1. Process People (documentSections JSONB)
  console.log("\n👤 Processing People...")
  const allPeople = await db.select().from(people)

  for (const person of allPeople) {
    let modified = false
    const sections = person.documentSections as any[] || []

    if (!Array.isArray(sections)) continue

    for (const section of sections) {
      if (section.files && Array.isArray(section.files)) {
        const newFiles = []
        for (const fileUrl of section.files) {
          const newUrl = await migrateUrl(fileUrl, "person")
          if (newUrl) {
            newFiles.push(newUrl)
            modified = true
            totalMigrated++
          } else {
            newFiles.push(fileUrl)
          }
        }
        section.files = newFiles
      }
    }

    if (modified) {
      await db.update(people)
        .set({ documentSections: sections, updatedAt: new Date() })
        .where(eq(people.id, person.id))
      console.log(`  💾 Updated person: ${person.firstName} ${person.lastName}`)
    }
  }

  // 2. Process DocumentsV2
  console.log("\n📄 Processing DocumentsV2...")
  const docs = await db.select().from(documentsV2).where(like(documentsV2.fileUrl, "/uploads/%"))

  for (const doc of docs) {
    if (doc.fileUrl) {
      const newUrl = await migrateUrl(doc.fileUrl, "document")
      if (newUrl) {
        await db.update(documentsV2)
          .set({ fileUrl: newUrl, updatedAt: new Date() })
          .where(eq(documentsV2.id, doc.id))
        totalMigrated++
        console.log(`  💾 Updated document: ${doc.title}`)
      }
    }
  }

  // 3. Process Vehicles (documents array + documentSections)
  console.log("\n🚗 Processing Vehicles...")
  const allVehicles = await db.select().from(vehicles)
  for (const vehicle of allVehicles) {
    let modified = false

    // Array of strings
    const docs = vehicle.documents as string[] || []
    const newDocs = []
    for (const url of docs) {
      const newUrl = await migrateUrl(url, "vehicle_doc")
      if (newUrl) {
        newDocs.push(newUrl)
        modified = true
        totalMigrated++
      } else {
        newDocs.push(url)
      }
    }

    // JSONB sections
    const sections = vehicle.documentSections as any[] || []
    for (const section of sections) {
      if (section.files && Array.isArray(section.files)) {
        const newFiles = []
        for (const fileUrl of section.files) {
          const newUrl = await migrateUrl(fileUrl, "vehicle_section")
          if (newUrl) {
            newFiles.push(newUrl)
            modified = true
            totalMigrated++
          } else {
            newFiles.push(fileUrl)
          }
        }
        section.files = newFiles
      }
    }

    if (modified) {
      await db.update(vehicles)
        .set({
          documents: newDocs,
          documentSections: sections,
          updatedAt: new Date()
        })
        .where(eq(vehicles.id, vehicle.id))
      console.log(`  💾 Updated vehicle: ${vehicle.title}`)
    }
  }

  console.log(`\n✨ Migration Complete!`)
  console.log(`Total files migrated: ${totalMigrated}`)
  console.log(`Total errors: ${totalErrors}`)
}

migrateLocalFiles().catch(console.error)
