

import dotenv from "dotenv"

// Load environment variables *before* any other imports
dotenv.config({ path: '.env.local' })

async function checkDocumentUrls() {
  // Dynamic import ensures db is initialized with loaded env vars
  const { db, documentsV2, people } = await import("@/lib/db")
  const { eq, sql } = await import("drizzle-orm")

  const personId = "971b35f0-7df5-4587-aad5-c709498e55ce"

  console.log(`Checking documents for person: ${personId}`)

  try {
    // 1. Get the person's document sections (JSONB)
    const person = await db.query.people.findFirst({
      where: eq(people.id, personId),
      columns: {
        id: true,
        firstName: true,
        documentSections: true
      }
    })

    if (!person) {
      console.log("Person not found")
      return
    }

    console.log(`Person: ${person.firstName}`)
    console.log("--- JSONB Document Sections ---")
    if (person.documentSections && Array.isArray(person.documentSections)) {
      person.documentSections.forEach((section: any, idx: number) => {
        console.log(`Section ${idx} (${section.type}):`)
        if (section.files && Array.isArray(section.files)) {
          section.files.forEach((url: string, fIdx: number) => {
            console.log(`  File ${fIdx}: ${url}`)
          })
        } else {
          console.log("  No files")
        }
      })
    } else {
      console.log("No document sections")
    }

    // 2. Get documents from documentsV2 table
    console.log("\n--- documentsV2 Table (Migrated) ---")
    const migratedDocs = await db
      .select()
      .from(documentsV2)
      .where(sql`${documentsV2.fileUrl} LIKE '/api/files/%'`)

    console.log(`Total migrated documents: ${migratedDocs.length}`)
    migratedDocs.forEach((doc, idx) => {
      console.log(`[${idx}] ${doc.title}: ${doc.fileUrl}`)
    })

  } catch (error) {
    console.error("Error:", error)
  }
}

checkDocumentUrls()
