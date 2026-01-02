import { config } from "dotenv"
import { db, documentsV2, permits, people } from "./index"

// Load environment variables from .env.local
config({ path: ".env.local" })

async function seedDocuments() {
  try {
    console.log("📄 Seeding sample documents linked to tickets...")

    // Get all permits with their people
    const allPermits = await db.query.permits.findMany({
      with: {
        person: true,
      },
    })

    if (allPermits.length === 0) {
      console.log("⚠️  No permits found. Run db:seed-mvp first.")
      return
    }

    // Seed documents for each permit
    for (const permit of allPermits) {
      const ticketNumber = permit.ticketNumber
      const personId = permit.person.id

      if (!ticketNumber) continue

      // Add 2-3 sample documents per permit based on category
      if (permit.category === "WORK_PERMIT") {
        await db
          .insert(documentsV2)
          .values([
            {
              type: "passport",
              title: "Passport Copy",
              number: ticketNumber,
              issuedBy: "UK Passport Office",
              issueDate: new Date("2020-01-15"),
              expiryDate: new Date("2030-01-15"),
              fileUrl: "/uploads/demo/passport-gb123456789.pdf",
              fileSize: 2048576, // 2MB
              mimeType: "application/pdf",
              personId: personId,
            },
            {
              type: "employment_contract",
              title: "Employment Contract",
              number: ticketNumber,
              issuedBy: "Soddo Hospital",
              issueDate: new Date("2025-01-01"),
              fileUrl: "/uploads/demo/contract-john-smith.pdf",
              fileSize: 524288, // 512KB
              mimeType: "application/pdf",
              personId: personId,
            },
            {
              type: "health_certificate",
              title: "Medical Certificate",
              number: ticketNumber,
              issuedBy: "Addis Ababa Medical Center",
              issueDate: new Date("2025-05-10"),
              expiryDate: new Date("2025-11-10"),
              fileUrl: "/uploads/demo/health-cert.pdf",
              fileSize: 1048576, // 1MB
              mimeType: "application/pdf",
              personId: personId,
            },
          ])
          .onConflictDoNothing()

        console.log(`✓ Added 3 documents for ${ticketNumber} (Work Permit)`)
      }

      if (permit.category === "RESIDENCE_ID") {
        await db
          .insert(documentsV2)
          .values([
            {
              type: "passport",
              title: "Passport with Visa",
              number: ticketNumber,
              issuedBy: "UK Passport Office",
              issueDate: new Date("2020-01-15"),
              expiryDate: new Date("2030-01-15"),
              fileUrl: "/uploads/demo/passport-visa.pdf",
              fileSize: 2048576,
              mimeType: "application/pdf",
              personId: personId,
            },
            {
              type: "rental_agreement",
              title: "Rental Agreement",
              number: ticketNumber,
              issuedBy: "Addis Ababa Housing",
              issueDate: new Date("2025-02-01"),
              fileUrl: "/uploads/demo/rental-agreement.pdf",
              fileSize: 786432, // 768KB
              mimeType: "application/pdf",
              personId: personId,
            },
          ])
          .onConflictDoNothing()

        console.log(`✓ Added 2 documents for ${ticketNumber} (Residence ID)`)
      }

      if (permit.category === "LICENSE") {
        await db
          .insert(documentsV2)
          .values([
            {
              type: "degree_certificate",
              title: "Nursing Degree Certificate",
              number: ticketNumber,
              issuedBy: "University of California",
              issueDate: new Date("2018-06-15"),
              fileUrl: "/uploads/demo/nursing-degree.pdf",
              fileSize: 1572864, // 1.5MB
              mimeType: "application/pdf",
              personId: personId,
            },
            {
              type: "professional_registration",
              title: "US Nursing License",
              number: ticketNumber,
              issuedBy: "California Board of Nursing",
              issueDate: new Date("2018-08-01"),
              expiryDate: new Date("2026-08-01"),
              fileUrl: "/uploads/demo/us-nursing-license.pdf",
              fileSize: 524288,
              mimeType: "application/pdf",
              personId: personId,
            },
          ])
          .onConflictDoNothing()

        console.log(`✓ Added 2 documents for ${ticketNumber} (MOH License)`)
      }

      if (permit.category === "PIP") {
        await db
          .insert(documentsV2)
          .values([
            {
              type: "proforma_invoice",
              title: "Proforma Invoice - Medical Supplies",
              number: ticketNumber,
              issuedBy: "Global Medical Supplies Inc.",
              issueDate: new Date("2025-05-01"),
              fileUrl: "/uploads/demo/proforma-invoice.pdf",
              fileSize: 419430, // 410KB
              mimeType: "application/pdf",
              personId: personId,
            },
            {
              type: "product_registration",
              title: "EFDA Product Registration",
              number: ticketNumber,
              issuedBy: "Ethiopian Food and Drug Authority",
              issueDate: new Date("2024-01-15"),
              expiryDate: new Date("2029-01-15"),
              fileUrl: "/uploads/demo/efda-registration.pdf",
              fileSize: 1048576,
              mimeType: "application/pdf",
              personId: personId,
            },
          ])
          .onConflictDoNothing()

        console.log(`✓ Added 2 documents for ${ticketNumber} (PIP)`)
      }
    }

    console.log("✅ Sample documents seeded successfully!")
    console.log("\n📋 Summary:")
    console.log("  - Documents are linked to tickets via the 'number' field")
    console.log("  - Ask ChatKit: 'What is the status of WRK-2025-0001?'")
    console.log("  - You'll see both the permit status AND uploaded documents")
  } catch (error) {
    console.error("❌ Error seeding documents:", error)
    throw error
  }
}

// Run the seed function
seedDocuments()
  .catch((error) => {
    console.error("Document seeding failed:", error)
    process.exit(1)
  })
  .finally(() => {
    console.log("Document seeding completed")
    process.exit(0)
  })
