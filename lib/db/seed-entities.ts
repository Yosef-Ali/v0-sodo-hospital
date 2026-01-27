"use server"

import { db } from "@/lib/db"
import { vehicles, importPermits, companyRegistrations, tasksV2 } from "@/lib/db/schema"
import { generateTicketNumber } from "@/lib/utils"

// Sample Ethiopian-focused seed data

const VEHICLE_SEEDS = [
  {
    title: "Toyota Hilux Inspection",
    description: "Annual vehicle inspection for hospital ambulance",
    category: "inspection",
    status: "in-progress",
    vehicleInfo: "Toyota Hilux 2021 - White",
    plateNumber: "3-AA-12345",
    vehicleType: "Ambulance",
    vehicleModel: "Hilux",
    vehicleYear: "2021",
    ownerName: "Soddo Christian Hospital",
    currentMileage: "45,000 km",
    serviceType: "inspection",
    currentStage: "INSPECTION",
    documentSections: [
      { id: "1", type: "libre", files: ["https://utfs.io/f/example-libre.pdf"] },
      { id: "2", type: "previous_inspection", files: ["https://utfs.io/f/prev-inspection.pdf"] }
    ],
    documents: ["https://utfs.io/f/example-libre.pdf", "https://utfs.io/f/prev-inspection.pdf"]
  },
  {
    title: "Land Cruiser Road Fund",
    description: "Road fund renewal for hospital director vehicle",
    category: "road_fund",
    status: "pending",
    vehicleInfo: "Toyota Land Cruiser 2020 - Silver",
    plateNumber: "3-AA-56789",
    vehicleType: "Car",
    vehicleModel: "Land Cruiser",
    vehicleYear: "2020",
    ownerName: "Dr. Anderson",
    currentMileage: "62,000 km",
    serviceType: "road_fund",
    currentStage: "PAYMENT",
    documentSections: [
      { id: "1", type: "libre", files: ["https://utfs.io/f/libre-lc.pdf"] },
      { id: "2", type: "bank_slip", files: [] }
    ],
    documents: ["https://utfs.io/f/libre-lc.pdf"]
  },
  {
    title: "Ambulance Insurance Renewal",
    description: "Third party insurance renewal for main ambulance",
    category: "insurance",
    status: "pending",
    vehicleInfo: "Toyota Hiace Ambulance 2022",
    plateNumber: "3-ER-11122",
    documentSections: [
      { id: "1", type: "libre", files: ["https://utfs.io/f/libre-ambo.pdf"] },
      { id: "2", type: "insurance_form", files: ["https://utfs.io/f/ins-form.pdf"] }
    ],
    documents: ["https://utfs.io/f/libre-ambo.pdf", "https://utfs.io/f/ins-form.pdf"]
  },
  {
    title: "Staff Bus Road Transport",
    description: "Road transport authority permit for staff shuttle",
    category: "road_transport",
    status: "completed",
    vehicleInfo: "Coaster Bus 2019 - Yellow",
    plateNumber: "3-BU-33344",
    documentSections: [
      { id: "1", type: "libre", files: ["https://utfs.io/f/libre-bus.pdf"] },
      { id: "2", type: "inspection_result", files: ["https://utfs.io/f/insp-res.pdf"] },
      { id: "3", type: "road_fund_receipt", files: ["https://utfs.io/f/rf-receipt.pdf"] },
      { id: "4", type: "insurance_cert", files: ["https://utfs.io/f/ins-cert.pdf"] }
    ],
    documents: ["https://utfs.io/f/libre-bus.pdf", "https://utfs.io/f/insp-res.pdf", "https://utfs.io/f/rf-receipt.pdf", "https://utfs.io/f/ins-cert.pdf"]
  },
  {
    title: "Pickup Truck Inspection",
    description: "Scheduled inspection for logistics pickup truck",
    category: "inspection",
    status: "urgent",
    vehicleInfo: "Isuzu D-Max 2018 - Blue",
    plateNumber: "3-AA-55566",
    documentSections: [
      { id: "1", type: "libre", files: ["https://utfs.io/f/libre-truck.pdf"] }
    ],
    documents: ["https://utfs.io/f/libre-truck.pdf"]
  },
]

const IMPORT_SEEDS = [
  {
    title: "Medical Equipment Import",
    description: "Importing X-Ray machine and ultrasound equipment from Germany",
    category: "pip",
    status: "in-progress",
    supplierName: "Siemens Healthineers",
    supplierCountry: "Germany",
    currency: "EUR",
    importType: "pip",
    currentStage: "PIP_APPLICATION",
    documentSections: [
      { id: "1", type: "proforma_invoice", files: ["https://utfs.io/f/proforma-xray.pdf"] },
      { id: "2", type: "business_license", files: ["https://utfs.io/f/bus-license.pdf"] },
      { id: "3", type: "support_letter", files: ["https://utfs.io/f/support-letter.pdf"] }
    ],
    documents: ["https://utfs.io/f/proforma-xray.pdf", "https://utfs.io/f/bus-license.pdf", "https://utfs.io/f/support-letter.pdf"]
  },
  {
    title: "Hospital Beds Import",
    description: "100 hospital beds and mattresses from China Single Window",
    category: "single_window",
    status: "pending",
    documentSections: [
      { id: "1", type: "commercial_invoice", files: ["https://utfs.io/f/inv-beds.pdf"] },
      { id: "2", type: "packing_list", files: ["https://utfs.io/f/packing-beds.pdf"] },
      { id: "3", type: "bill_of_lading", files: [] }
    ],
    documents: ["https://utfs.io/f/inv-beds.pdf", "https://utfs.io/f/packing-beds.pdf"]
  },
  {
    title: "Surgical Instruments Import",
    description: "PIP certificate for surgical tools and operating room equipment",
    category: "pip",
    status: "completed",
    documentSections: [
      { id: "1", type: "pip_certificate", files: ["https://utfs.io/f/pip-cert-surg.pdf"] },
      { id: "2", type: "proforma_invoice", files: ["https://utfs.io/f/proforma-surg.pdf"] }
    ],
    documents: ["https://utfs.io/f/pip-cert-surg.pdf", "https://utfs.io/f/proforma-surg.pdf"]
  },
  {
    title: "Laboratory Reagents",
    description: "Import of laboratory chemicals and test reagents via Single Window",
    category: "single_window",
    status: "in-progress",
    documentSections: [
      { id: "1", type: "commercial_invoice", files: ["https://utfs.io/f/inv-lab.pdf"] },
      { id: "2", type: "insurance_cert", files: ["https://utfs.io/f/ins-lab.pdf"] }
    ],
    documents: ["https://utfs.io/f/inv-lab.pdf", "https://utfs.io/f/ins-lab.pdf"]
  },
  {
    title: "Ambulance Parts Import",
    description: "Spare parts and accessories for ambulance fleet",
    category: "pip",
    status: "pending",
    documentSections: [
      { id: "1", type: "proforma_invoice", files: ["https://utfs.io/f/proforma-parts.pdf"] }
    ],
    documents: ["https://utfs.io/f/proforma-parts.pdf"]
  },
  {
    title: "Pharmaceutical Supplies",
    description: "Essential medicines and vaccines through Single Window customs",
    category: "single_window",
    status: "urgent",
    supplierName: "PharmaWorld Intl",
    supplierCountry: "India",
    currency: "USD",
    importType: "single_window",
    currentStage: "APPLY_ONLINE",
    documentSections: [
      { id: "1", type: "commercial_invoice", files: ["https://utfs.io/f/inv-pharma.pdf"] },
      { id: "2", type: "packing_list", files: ["https://utfs.io/f/pack-pharma.pdf"] },
      { id: "3", type: "bill_of_lading", files: ["https://utfs.io/f/bol-pharma.pdf"] }
    ],
    documents: ["https://utfs.io/f/inv-pharma.pdf", "https://utfs.io/f/pack-pharma.pdf", "https://utfs.io/f/bol-pharma.pdf"]
  },
]

const COMPANY_SEEDS = [
  {
    title: "Soddo Medical Supplies PLC Registration",
    description: "New company registration for medical supplies distribution",
    stage: "document_prep",
    status: "in-progress",
    companyName: "Soddo Medical Supplies PLC",
    registrationType: "new",
    documentSections: [
      { id: "1", type: "business_license", files: ["https://utfs.io/f/bus-lic-soddo.pdf"] },
      { id: "2", type: "tin", files: ["https://utfs.io/f/tin-soddo.pdf"] },
      { id: "3", type: "article_of_association", files: ["https://utfs.io/f/aoa-soddo.pdf"] }
    ],
    documents: ["https://utfs.io/f/bus-lic-soddo.pdf", "https://utfs.io/f/tin-soddo.pdf", "https://utfs.io/f/aoa-soddo.pdf"]
  },
  {
    title: "Healthcare Partners Share Company",
    description: "Renewal of business license for healthcare services",
    stage: "apply_online",
    status: "pending",
    companyName: "Healthcare Partners SC",
    registrationType: "renewal",
    documentSections: [
      { id: "1", type: "current_registration", files: ["https://utfs.io/f/curr-reg.pdf"] },
      { id: "2", type: "business_license", files: ["https://utfs.io/f/bus-lic-old.pdf"] }
    ],
    documents: ["https://utfs.io/f/curr-reg.pdf", "https://utfs.io/f/bus-lic-old.pdf"]
  },
  {
    title: "Ethiopian Diagnostics PLC",
    description: "New company for laboratory diagnostic services",
    stage: "approval",
    status: "in-progress",
    companyName: "Ethiopian Diagnostics PLC",
    registrationType: "new",
    documentSections: [
      { id: "1", type: "official_letter", files: ["https://utfs.io/f/letter-eth-diag.pdf"] },
      { id: "2", type: "business_registration", files: ["https://utfs.io/f/reg-eth-diag.pdf"] },
      { id: "3", type: "tin", files: ["https://utfs.io/f/tin-eth-diag.pdf"] },
      { id: "4", type: "coc", files: ["https://utfs.io/f/coc-eth-diag.pdf"] }
    ],
    documents: ["https://utfs.io/f/letter-eth-diag.pdf", "https://utfs.io/f/reg-eth-diag.pdf", "https://utfs.io/f/tin-eth-diag.pdf", "https://utfs.io/f/coc-eth-diag.pdf"]
  },
  {
    title: "Alpha Pharmacy PLC",
    description: "Pharmacy business license renewal",
    stage: "completed",
    status: "completed",
    companyName: "Alpha Pharmacy PLC",
    registrationType: "renewal",
    documentSections: [
      { id: "1", type: "official_letter", files: ["https://utfs.io/f/letter-alpha.pdf"] },
      { id: "2", type: "coc", files: ["https://utfs.io/f/coc-alpha.pdf"] },
      { id: "3", type: "business_license", files: ["https://utfs.io/f/lic-alpha.pdf"] }
    ],
    documents: ["https://utfs.io/f/letter-alpha.pdf", "https://utfs.io/f/coc-alpha.pdf", "https://utfs.io/f/lic-alpha.pdf"]
  },
  {
    title: "Med-Tech Solutions",
    description: "Medical technology company registration",
    stage: "document_prep",
    status: "pending",
    companyName: "Med-Tech Solutions",
    registrationType: "new",
    documentSections: [
      { id: "1", type: "official_letter", files: [] },
      { id: "2", type: "business_license", files: [] }
    ],
    documents: []
  },
]

export async function seedVehicles() {
  try {
    const results = []
    for (const vehicle of VEHICLE_SEEDS) {
      const result = await db.insert(vehicles).values({
        ...vehicle,
        ticketNumber: generateTicketNumber("VEH"),
        dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random due date within 30 days
      }).returning()
      results.push(result[0])
    }
    return { success: true, count: results.length, data: results }
  } catch (error) {
    console.error("Error seeding vehicles:", error)
    return { success: false, error: String(error) }
  }
}

export async function seedImports() {
  try {
    const results = []
    for (const importData of IMPORT_SEEDS) {
      const result = await db.insert(importPermits).values({
        ...importData,
        ticketNumber: generateTicketNumber("IMP"),
        dueDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000), // Random due date within 60 days
      }).returning()
      results.push(result[0])
    }
    return { success: true, count: results.length, data: results }
  } catch (error) {
    console.error("Error seeding imports:", error)
    return { success: false, error: String(error) }
  }
}

export async function seedCompanies() {
  try {
    const results = []
    for (const company of COMPANY_SEEDS) {
      const result = await db.insert(companyRegistrations).values({
        ...company,
        ticketNumber: generateTicketNumber("CMP"),
        dueDate: new Date(Date.now() + Math.random() * 45 * 24 * 60 * 60 * 1000), // Random due date within 45 days
      }).returning()
      results.push(result[0])
    }
    return { success: true, count: results.length, data: results }
  } catch (error) {
    console.error("Error seeding companies:", error)
    return { success: false, error: String(error) }
  }
}

export async function seedTasks(vehicles: any[], imports: any[], companies: any[]) {
  try {
    const tasks = []

    const mapStatus = (s: string) => {
      if (s === 'urgent') return 'in-progress'
      if (s === 'completed') return 'completed'
      if (s === 'in-progress') return 'in-progress'
      return 'pending'
    }

    const mapPriority = (s: string) => {
      return s === 'urgent' ? 'high' : 'medium'
    }

    // Seed Vehicle Tasks
    for (const v of vehicles) {
      tasks.push({
        title: `Process ${v.title}`,
        description: `Vehicle task for ${v.plateNumber}. ${v.description}`,
        status: mapStatus(v.status),
        priority: mapPriority(v.status), // 'urgent' status maps to high priority
        dueDate: v.dueDate ? new Date(v.dueDate) : null,
        entityType: 'vehicle',
        entityId: v.id,
      })
    }

    // Seed Import Tasks
    for (const i of imports) {
      tasks.push({
        title: `Process ${i.title}`,
        description: `Import permit task. ${i.description}`,
        status: mapStatus(i.status),
        priority: mapPriority(i.status),
        dueDate: i.dueDate ? new Date(i.dueDate) : null,
        entityType: 'import',
        entityId: i.id,
      })
    }

    // Seed Company Tasks
    for (const c of companies) {
      tasks.push({
        title: `Process ${c.title}`,
        description: `Company registration task for ${c.companyName}. Renewal/New registration.`,
        status: mapStatus(c.status),
        priority: 'medium',
        dueDate: c.dueDate ? new Date(c.dueDate) : null,
        entityType: 'company',
        entityId: c.id,
      })
    }

    if (tasks.length > 0) {
      // @ts-ignore - Drizzle insert types are sometimes strict with mapped arrays
      const result = await db.insert(tasksV2).values(tasks).returning()
      return { success: true, count: result.length, data: result }
    }

    return { success: true, count: 0, data: [] }

  } catch (error) {
    console.error("Error seeding tasks:", error)
    return { success: false, error: String(error) }
  }
}

export async function seedAll() {
  const vehicleResult = await seedVehicles()
  const importResult = await seedImports()
  const companyResult = await seedCompanies()

  const taskResult = await seedTasks(
    vehicleResult.data || [],
    importResult.data || [],
    companyResult.data || []
  )

  return {
    success: vehicleResult.success && importResult.success && companyResult.success && taskResult.success,
    vehicles: vehicleResult,
    imports: importResult,
    companies: companyResult,
    tasks: taskResult,
  }
}
