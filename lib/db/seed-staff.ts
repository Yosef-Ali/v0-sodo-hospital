import { config } from "dotenv"
import { db, users } from "./index"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

// Load environment variables from .env.local
config({ path: ".env.local" })

async function seedStaff() {
  try {
    console.log("🌱 Seeding staff members...")

    const staffMembers = [
      {
        name: "Niccodimos Ezechiel",
        email: "Nicco@soddo.org",
        phone: "+251911002060",
        role: "ADMIN" as const,
      },
      {
        name: "Bethel Ayalew",
        email: "Bethel@soddo.org",
        phone: "+251912329677",
        role: "USER" as const,
      },
      {
        name: "Kalkidan Folli",
        email: "Kalkidan@soddo.org",
        phone: "+251949225139",
        role: "USER" as const,
      },
    ]

    for (const staff of staffMembers) {
      // Check if user already exists by email
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, staff.email.toLowerCase()),
      })

      if (existingUser) {
        // Update existing user with new role if needed
        console.log(`Updating existing user: ${staff.name}...`)
        await db
          .update(users)
          .set({
            name: staff.name,
            role: staff.role,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingUser.id))
        console.log(`✓ Updated ${staff.name} with role: ${staff.role}`)
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash("Soddo@2025!", 10)
        await db.insert(users).values({
          email: staff.email.toLowerCase(),
          name: staff.name,
          password: hashedPassword,
          role: staff.role,
          locale: "en",
        })
        console.log(`✓ Created ${staff.name} (${staff.email}) with role: ${staff.role}`)
      }
    }

    console.log("\n✅ Staff members seeded successfully!")
    console.log("\n📋 Summary:")
    console.log("  - Niccodimos Ezechiel: ADMIN (Nicco@soddo.org)")
    console.log("  - Bethel Ayalew: USER (Bethel@soddo.org)")
    console.log("  - Kalkidan Folli: USER (Kalkidan@soddo.org)")
    console.log("\n🔑 Default password: Soddo@2025!")
    console.log("   (Please change passwords after first login)")
  } catch (error) {
    console.error("❌ Error seeding staff:", error)
    throw error
  }
}

// Run the seed function
seedStaff()
  .catch((error) => {
    console.error("Staff seeding failed:", error)
    process.exit(1)
  })
  .finally(() => {
    console.log("Staff seeding completed")
    process.exit(0)
  })
