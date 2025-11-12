import { db, users, categories, departments, tasks, documents } from "./index"

async function seed() {
  try {
    console.log("🌱 Seeding database...")

    // Clear existing data (in reverse order of dependencies)
    console.log("Clearing existing data...")
    await db.delete(tasks)
    await db.delete(documents)
    await db.delete(categories)
    await db.delete(departments)
    await db.delete(users)

    // Seed users
    console.log("Creating users...")
    const [user1, user2, user3, user4, user5] = await db
      .insert(users)
      .values([
        {
          email: "dr.samuel@sodohospital.com",
          name: "Dr. Samuel",
          role: "Doctor",
        },
        {
          email: "nurse.johnson@sodohospital.com",
          name: "Nurse Johnson",
          role: "Nurse",
        },
        {
          email: "store.manager@sodohospital.com",
          name: "Store Manager",
          role: "Inventory Manager",
        },
        {
          email: "hr.director@sodohospital.com",
          name: "HR Director",
          role: "HR Manager",
        },
        {
          email: "finance.officer@sodohospital.com",
          name: "Finance Officer",
          role: "Finance",
        },
      ])
      .returning()

    console.log(`✓ Created ${5} users`)

    // Seed departments
    console.log("Creating departments...")
    const [adminDept, medicalDept, financeDept] = await db
      .insert(departments)
      .values([
        {
          name: "Administrative",
          description: "Administrative department",
          headId: user1.id,
        },
        {
          name: "Medical",
          description: "Medical department",
          headId: user2.id,
        },
        {
          name: "Finance",
          description: "Finance department",
          headId: user5.id,
        },
      ])
      .returning()

    console.log(`✓ Created ${3} departments`)

    // Seed categories
    console.log("Creating categories...")
    const taskCategories = await db
      .insert(categories)
      .values([
        { name: "Administrative", type: "task", color: "blue" },
        { name: "Records", type: "task", color: "purple" },
        { name: "Inventory", type: "task", color: "green" },
        { name: "Training", type: "task", color: "yellow" },
        { name: "Maintenance", type: "task", color: "orange" },
        { name: "Finance", type: "task", color: "teal" },
        { name: "Quality", type: "task", color: "red" },
        { name: "HR", type: "task", color: "pink" },
      ])
      .returning()

    const documentCategories = await db
      .insert(categories)
      .values([
        { name: "License", type: "document", color: "blue" },
        { name: "Policies", type: "document", color: "purple" },
        { name: "Safety", type: "document", color: "orange" },
        { name: "Pharmacy", type: "document", color: "green" },
        { name: "Compliance", type: "document", color: "red" },
      ])
      .returning()

    console.log(`✓ Created ${taskCategories.length + documentCategories.length} categories`)

    // Seed tasks
    console.log("Creating tasks...")
    const tasksData = await db
      .insert(tasks)
      .values([
        {
          title: "License Renewal Processing",
          description: "Review and process hospital license renewal applications from various departments.",
          status: "urgent",
          priority: "high",
          dueDate: new Date("2025-05-15"),
          assigneeId: user1.id,
          categoryId: taskCategories[0].id,
          departmentId: adminDept.id,
          createdById: user1.id,
        },
        {
          title: "Patient Record Verification",
          description: "Verify and update patient records in the system to ensure accuracy and completeness.",
          status: "in-progress",
          priority: "medium",
          dueDate: new Date("2025-05-20"),
          assigneeId: user2.id,
          categoryId: taskCategories[1].id,
          departmentId: medicalDept.id,
          createdById: user1.id,
        },
        {
          title: "Medical Supply Inventory",
          description: "Conduct inventory check of medical supplies and update the procurement list.",
          status: "pending",
          priority: "low",
          dueDate: new Date("2025-05-25"),
          assigneeId: user3.id,
          categoryId: taskCategories[2].id,
          departmentId: adminDept.id,
          createdById: user1.id,
        },
        {
          title: "Staff Training Documentation",
          description: "Update training records for all staff who completed the recent infection control workshop.",
          status: "completed",
          priority: "medium",
          dueDate: new Date("2025-05-10"),
          assigneeId: user4.id,
          categoryId: taskCategories[3].id,
          departmentId: adminDept.id,
          createdById: user4.id,
          completedAt: new Date("2025-05-10"),
        },
        {
          title: "Equipment Maintenance Schedule",
          description: "Create maintenance schedule for all critical medical equipment for the next quarter.",
          status: "pending",
          priority: "high",
          dueDate: new Date("2025-05-18"),
          assigneeId: user3.id,
          categoryId: taskCategories[4].id,
          departmentId: medicalDept.id,
          createdById: user1.id,
        },
        {
          title: "Insurance Claim Processing",
          description: "Process pending insurance claims for patients treated in the last month.",
          status: "in-progress",
          priority: "medium",
          dueDate: new Date("2025-05-22"),
          assigneeId: user5.id,
          categoryId: taskCategories[5].id,
          departmentId: financeDept.id,
          createdById: user5.id,
        },
        {
          title: "Department Budget Review",
          description: "Review and approve departmental budget proposals for the next fiscal year.",
          status: "pending",
          priority: "high",
          dueDate: new Date("2025-06-15"),
          assigneeId: user5.id,
          categoryId: taskCategories[5].id,
          departmentId: financeDept.id,
          createdById: user1.id,
        },
        {
          title: "Medication Error Report",
          description: "Compile and analyze medication error reports from all departments for the quality committee.",
          status: "urgent",
          priority: "high",
          dueDate: new Date("2025-05-16"),
          assigneeId: user2.id,
          categoryId: taskCategories[6].id,
          departmentId: medicalDept.id,
          createdById: user1.id,
        },
        {
          title: "New Staff Orientation",
          description: "Prepare orientation materials for new staff joining next week.",
          status: "in-progress",
          priority: "medium",
          dueDate: new Date("2025-05-19"),
          assigneeId: user4.id,
          categoryId: taskCategories[7].id,
          departmentId: adminDept.id,
          createdById: user4.id,
        },
      ])
      .returning()

    console.log(`✓ Created ${tasksData.length} tasks`)

    // Seed documents
    console.log("Creating documents...")
    const documentsData = await db
      .insert(documents)
      .values([
        {
          title: "Hospital License Renewal",
          description: "Annual hospital license renewal application with supporting documentation and compliance reports.",
          status: "pending",
          categoryId: documentCategories[0].id,
          fileType: "PDF",
          fileSize: "4.2 MB",
          ownerId: user1.id,
          departmentId: adminDept.id,
          tags: ["License", "Renewal", "Compliance"],
        },
        {
          title: "Medical Staff Bylaws",
          description: "Official bylaws governing the medical staff organization, responsibilities, and privileges.",
          status: "approved",
          categoryId: documentCategories[1].id,
          fileType: "DOCX",
          fileSize: "1.8 MB",
          ownerId: user1.id,
          departmentId: medicalDept.id,
          tags: ["Bylaws", "Staff", "Governance"],
        },
        {
          title: "Infection Control Policy",
          description: "Updated infection control policies and procedures for all hospital departments.",
          status: "review",
          categoryId: documentCategories[1].id,
          fileType: "PDF",
          fileSize: "3.5 MB",
          ownerId: user2.id,
          departmentId: medicalDept.id,
          tags: ["Policy", "Infection Control", "Safety"],
        },
        {
          title: "Emergency Response Plan",
          description: "Comprehensive emergency response procedures for various scenarios including natural disasters.",
          status: "approved",
          categoryId: documentCategories[2].id,
          fileType: "PDF",
          fileSize: "7.2 MB",
          ownerId: user1.id,
          departmentId: adminDept.id,
          tags: ["Emergency", "Safety", "Procedures"],
        },
        {
          title: "Pharmacy Formulary",
          description: "Current hospital formulary listing all approved medications with dosing guidelines.",
          status: "pending",
          categoryId: documentCategories[3].id,
          fileType: "XLSX",
          fileSize: "2.4 MB",
          ownerId: user2.id,
          departmentId: medicalDept.id,
          tags: ["Pharmacy", "Medications", "Formulary"],
        },
      ])
      .returning()

    console.log(`✓ Created ${documentsData.length} documents`)

    console.log("✅ Database seeded successfully!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  }
}

// Run the seed function
seed()
  .catch((error) => {
    console.error("Seeding failed:", error)
    process.exit(1)
  })
  .finally(() => {
    console.log("Seeding completed")
    process.exit(0)
  })
