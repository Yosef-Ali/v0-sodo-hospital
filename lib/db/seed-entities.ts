"use server"

import { db } from "@/lib/db"
import { vehicles, importPermits, companyRegistrations } from "@/lib/db/schema"
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
  },
  {
    title: "Land Cruiser Road Fund",
    description: "Road fund renewal for hospital director vehicle",
    category: "road_fund",
    status: "pending",
    vehicleInfo: "Toyota Land Cruiser 2020 - Silver",
    plateNumber: "3-AA-56789",
  },
  {
    title: "Ambulance Insurance Renewal",
    description: "Third party insurance renewal for main ambulance",
    category: "insurance",
    status: "pending",
    vehicleInfo: "Toyota Hiace Ambulance 2022",
    plateNumber: "3-ER-11122",
  },
  {
    title: "Staff Bus Road Transport",
    description: "Road transport authority permit for staff shuttle",
    category: "road_transport",
    status: "completed",
    vehicleInfo: "Coaster Bus 2019 - Yellow",
    plateNumber: "3-BU-33344",
  },
  {
    title: "Pickup Truck Inspection",
    description: "Scheduled inspection for logistics pickup truck",
    category: "inspection",
    status: "urgent",
    vehicleInfo: "Isuzu D-Max 2018 - Blue",
    plateNumber: "3-AA-55566",
  },
]

const IMPORT_SEEDS = [
  {
    title: "Medical Equipment Import",
    description: "Importing X-Ray machine and ultrasound equipment from Germany",
    category: "pip",
    status: "in-progress",
  },
  {
    title: "Hospital Beds Import",
    description: "100 hospital beds and mattresses from China Single Window",
    category: "single_window",
    status: "pending",
  },
  {
    title: "Surgical Instruments Import",
    description: "PIP certificate for surgical tools and operating room equipment",
    category: "pip",
    status: "completed",
  },
  {
    title: "Laboratory Reagents",
    description: "Import of laboratory chemicals and test reagents via Single Window",
    category: "single_window",
    status: "in-progress",
  },
  {
    title: "Ambulance Parts Import",
    description: "Spare parts and accessories for ambulance fleet",
    category: "pip",
    status: "pending",
  },
  {
    title: "Pharmaceutical Supplies",
    description: "Essential medicines and vaccines through Single Window customs",
    category: "single_window",
    status: "urgent",
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
  },
  {
    title: "Healthcare Partners Share Company",
    description: "Renewal of business license for healthcare services",
    stage: "apply_online",
    status: "pending",
    companyName: "Healthcare Partners SC",
    registrationType: "renewal",
  },
  {
    title: "Ethiopian Diagnostics PLC",
    description: "New company for laboratory diagnostic services",
    stage: "approval",
    status: "in-progress",
    companyName: "Ethiopian Diagnostics PLC",
    registrationType: "new",
  },
  {
    title: "Alpha Pharmacy PLC",
    description: "Pharmacy business license renewal",
    stage: "completed",
    status: "completed",
    companyName: "Alpha Pharmacy PLC",
    registrationType: "renewal",
  },
  {
    title: "Med-Tech Solutions",
    description: "Medical technology company registration",
    stage: "document_prep",
    status: "pending",
    companyName: "Med-Tech Solutions",
    registrationType: "new",
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

export async function seedAll() {
  const vehicleResult = await seedVehicles()
  const importResult = await seedImports()
  const companyResult = await seedCompanies()

  return {
    success: vehicleResult.success && importResult.success && companyResult.success,
    vehicles: vehicleResult,
    imports: importResult,
    companies: companyResult,
  }
}
