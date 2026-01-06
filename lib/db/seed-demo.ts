"use server"

import { db, people, vehicles, importPermits, tasksV2 } from "@/lib/db"
import { generateTicketNumber } from "@/lib/utils"

/**
 * Seed demo data for customer demonstration
 * Creates: 1 foreigner, 1 vehicle, 1 import permit, with 3 tasks for each
 */
export async function seedDemoData() {
  try {
    const results = {
      foreigner: null as any,
      vehicle: null as any,
      import: null as any,
      tasks: [] as any[]
    }

    // 1. Create a demo foreigner (medical professional)
    const [foreigner] = await db.insert(people).values({
      ticketNumber: generateTicketNumber("FOR"),
      firstName: "Dr. Sarah",
      lastName: "Mitchell",
      nationality: "USA",
      gender: "FEMALE",
      familyStatus: "MARRIED",
      passportNo: "US789456123",
      passportIssueDate: new Date("2022-03-15"),
      passportExpiryDate: new Date("2032-03-14"),
      phone: "+1-555-123-4567",
      email: "sarah.mitchell@example.com",
      workPermitNo: "WP-2024-00123",
      workPermitSubType: "NEW",
      workPermitIssueDate: new Date("2024-06-01"),
      workPermitExpiryDate: new Date("2026-05-31"),
      residenceIdNo: "RES-ET-2024-456",
      residenceIdIssueDate: new Date("2024-07-01"),
      residenceIdExpiryDate: new Date("2025-07-01"),
      permitType: "WORK_PERMIT",
      applicationType: "NEW",
      currentStage: "DOCUMENT_ARRANGEMENT",
      familyDetails: {
        spouseName: "John Mitchell",
        spousePhone: "+1-555-987-6543",
        children: [
          { name: "Emma Mitchell", age: "8", gender: "FEMALE" },
          { name: "Lucas Mitchell", age: "5", gender: "MALE" }
        ]
      }
    }).returning()
    results.foreigner = foreigner

    // 2. Create a demo vehicle
    const [vehicle] = await db.insert(vehicles).values({
      ticketNumber: generateTicketNumber("VEH"),
      title: "Hospital Ambulance - Main",
      description: "Primary ambulance for emergency medical services",
      category: "inspection",
      status: "in-progress",
      vehicleInfo: "Toyota Hiace Ambulance 2023 - Red/White",
      plateNumber: "3-ET-98765",
      vehicleType: "Ambulance",
      vehicleModel: "Hiace",
      vehicleYear: "2023",
      ownerName: "Soddo Christian Hospital",
      currentMileage: "12,500 km",
      chassisNumber: "JTFSK22P900123456",
      engineNumber: "2GD-FTV-7890123",
      serviceType: "inspection",
      currentStage: "INSPECTION",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      documentSections: [
        { id: "1", type: "libre", files: [] },
        { id: "2", type: "previous_inspection", files: [] }
      ],
      documents: []
    }).returning()
    results.vehicle = vehicle

    // 3. Create a demo import permit
    const [importPermit] = await db.insert(importPermits).values({
      ticketNumber: generateTicketNumber("IMP"),
      title: "Medical Equipment Import - MRI Scanner",
      description: "State-of-the-art MRI scanner for diagnostic imaging department",
      category: "pip",
      status: "pending",
      supplierName: "GE Healthcare",
      supplierCountry: "USA",
      itemDescription: "1.5T MRI Scanner with accessories",
      estimatedValue: "850,000",
      currency: "USD",
      importType: "pip",
      currentStage: "SUPPORT_LETTER",
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      documentSections: [
        { id: "1", type: "proforma_invoice", files: [] },
        { id: "2", type: "support_letter", files: [] },
        { id: "3", type: "bank_permit", files: [] }
      ],
      documents: []
    }).returning()
    results.import = importPermit

    // 4. Create 3 tasks for the foreigner
    const foreignerTasks = [
      {
        title: "Prepare Work Permit Application Documents",
        description: "Gather and verify all required documents for Dr. Mitchell's work permit application",
        status: "in-progress" as const,
        priority: "high" as const,
        entityType: "person",
        entityId: foreigner.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Schedule Immigration Interview",
        description: "Book appointment at Immigration office for work permit interview",
        status: "pending" as const,
        priority: "medium" as const,
        entityType: "person",
        entityId: foreigner.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Medical License Verification",
        description: "Verify Dr. Mitchell's medical credentials with Ethiopian Medical Board",
        status: "pending" as const,
        priority: "high" as const,
        entityType: "person",
        entityId: foreigner.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      }
    ]

    // 5. Create 3 tasks for the vehicle
    const vehicleTasks = [
      {
        title: "Complete Vehicle Inspection",
        description: "Schedule and complete annual safety inspection for ambulance",
        status: "in-progress" as const,
        priority: "high" as const,
        entityType: "vehicle",
        entityId: vehicle.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Renew Vehicle Insurance",
        description: "Process third-party liability insurance renewal",
        status: "pending" as const,
        priority: "medium" as const,
        entityType: "vehicle",
        entityId: vehicle.id,
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Update Vehicle Registration",
        description: "Update Libre with new inspection certificate",
        status: "pending" as const,
        priority: "low" as const,
        entityType: "vehicle",
        entityId: vehicle.id,
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      }
    ]

    // 6. Create 3 tasks for the import permit
    const importTasks = [
      {
        title: "Obtain Bank Permit for USD Transfer",
        description: "Apply for foreign currency permit for MRI equipment payment",
        status: "in-progress" as const,
        priority: "high" as const,
        entityType: "import",
        entityId: importPermit.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Get Ministry Support Letter",
        description: "Request support letter from Ministry of Health for equipment import",
        status: "pending" as const,
        priority: "high" as const,
        entityType: "import",
        entityId: importPermit.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Customs Pre-Clearance Documentation",
        description: "Prepare all customs documentation for duty-free import",
        status: "pending" as const,
        priority: "medium" as const,
        entityType: "import",
        entityId: importPermit.id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    ]

    // Insert all tasks
    const allTasks = [...foreignerTasks, ...vehicleTasks, ...importTasks]
    for (const task of allTasks) {
      const [createdTask] = await db.insert(tasksV2).values(task).returning()
      results.tasks.push(createdTask)
    }

    return {
      success: true,
      data: results,
      summary: {
        foreigner: `${foreigner.firstName} ${foreigner.lastName} (${foreigner.ticketNumber})`,
        vehicle: `${vehicle.title} - ${vehicle.plateNumber} (${vehicle.ticketNumber})`,
        import: `${importPermit.title} (${importPermit.ticketNumber})`,
        tasksCreated: results.tasks.length
      }
    }
  } catch (error) {
    console.error("Error seeding demo data:", error)
    return { success: false, error: String(error) }
  }
}
