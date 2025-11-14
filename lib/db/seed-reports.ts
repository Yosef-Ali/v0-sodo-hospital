import { db } from "./index"
import { reports } from "./schema"

/**
 * Seed script for reports table
 * Run with: npx tsx lib/db/seed-reports.ts
 */

const mockReports = [
  {
    title: "Monthly Patient Statistics",
    description: "Comprehensive analysis of patient admissions, discharges, demographics, and treatment outcomes for the month.",
    status: "PUBLISHED" as const,
    frequency: "MONTHLY" as const,
    format: "PDF" as const,
    department: "Administration",
    category: "Patient",
    lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    fileUrl: "/reports/patient-stats-2024-11.pdf",
    fileSize: 2457600, // 2.4 MB
    parameters: {
      startDate: "2024-11-01",
      endDate: "2024-11-30",
      includeCharts: true,
      departments: ["Emergency", "Surgery", "Pediatrics"]
    }
  },
  {
    title: "Financial Performance Report",
    description: "Detailed financial metrics including revenue, expenses, budget variance, and cost analysis by department.",
    status: "GENERATED" as const,
    frequency: "MONTHLY" as const,
    format: "EXCEL" as const,
    department: "Finance",
    category: "Financial",
    lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    fileUrl: "/reports/financial-performance-2024-11.xlsx",
    fileSize: 1843200, // 1.8 MB
    parameters: {
      fiscalYear: 2024,
      quarter: "Q4",
      compareWithPrevious: true
    }
  },
  {
    title: "Staff Productivity Analysis",
    description: "Analysis of staff performance, workload distribution, efficiency metrics, and resource utilization across departments.",
    status: "PUBLISHED" as const,
    frequency: "QUARTERLY" as const,
    format: "PDF" as const,
    department: "Human Resources",
    category: "Staff",
    lastGenerated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    fileUrl: "/reports/staff-productivity-q3-2024.pdf",
    fileSize: 3145728, // 3 MB
    parameters: {
      quarter: "Q3",
      year: 2024,
      includeSurveyResults: true
    }
  },
  {
    title: "Quality Indicators Dashboard",
    description: "Key quality metrics including patient satisfaction scores, safety incidents, compliance rates, and clinical outcomes.",
    status: "PUBLISHED" as const,
    frequency: "MONTHLY" as const,
    format: "DASHBOARD" as const,
    department: "Quality",
    category: "Quality",
    lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    fileUrl: null, // Dashboard doesn't have file
    fileSize: null,
    parameters: {
      metrics: ["patient_satisfaction", "safety_incidents", "readmission_rate"],
      comparisonPeriod: "previous_month"
    }
  },
  {
    title: "Inventory and Supply Chain Report",
    description: "Current inventory levels, usage trends, stock-out incidents, and reorder recommendations for medical supplies.",
    status: "GENERATED" as const,
    frequency: "WEEKLY" as const,
    format: "EXCEL" as const,
    department: "Supply Chain",
    category: "Inventory",
    lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    fileUrl: "/reports/inventory-status-week-45.xlsx",
    fileSize: 1024000, // 1 MB
    parameters: {
      weekNumber: 45,
      criticalItemsOnly: false,
      includeForecasting: true
    }
  },
  {
    title: "Department Utilization Report",
    description: "Analysis of department capacity, utilization rates, resource allocation, and operational efficiency metrics.",
    status: "DRAFT" as const,
    frequency: "MONTHLY" as const,
    format: "PDF" as const,
    department: "Operations",
    category: "Operations",
    lastGenerated: null,
    fileUrl: null,
    fileSize: null,
    parameters: {
      departments: ["Emergency", "ICU", "Surgery", "Radiology"],
      includeStaffing: true
    }
  },
  {
    title: "Medication Usage Analysis",
    description: "Comprehensive analysis of medication prescribing patterns, dispensing trends, and administration compliance.",
    status: "PUBLISHED" as const,
    frequency: "MONTHLY" as const,
    format: "PDF" as const,
    department: "Pharmacy",
    category: "Operations",
    lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    fileUrl: "/reports/medication-usage-2024-10.pdf",
    fileSize: 2097152, // 2 MB
    parameters: {
      month: "October",
      year: 2024,
      includeAdverseEvents: true
    }
  },
  {
    title: "Equipment Maintenance Schedule",
    description: "Status of equipment maintenance activities, repair logs, replacement schedule, and preventive maintenance tracking.",
    status: "GENERATED" as const,
    frequency: "QUARTERLY" as const,
    format: "PDF" as const,
    department: "Facilities",
    category: "Equipment",
    lastGenerated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
    fileUrl: "/reports/equipment-maintenance-q3-2024.pdf",
    fileSize: 1536000, // 1.5 MB
    parameters: {
      quarter: "Q3",
      year: 2024,
      includeWarrantyStatus: true
    }
  },
  {
    title: "Regulatory Compliance Report",
    description: "Status of compliance with regulatory requirements, accreditation standards, audit findings, and corrective actions.",
    status: "ARCHIVED" as const,
    frequency: "QUARTERLY" as const,
    format: "PDF" as const,
    department: "Compliance",
    category: "Compliance",
    lastGenerated: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
    fileUrl: "/reports/regulatory-compliance-q2-2024.pdf",
    fileSize: 4194304, // 4 MB
    parameters: {
      quarter: "Q2",
      year: 2024,
      standards: ["JCI", "ISO", "Local_Health_Authority"]
    }
  },
  {
    title: "Emergency Department Performance",
    description: "Real-time metrics for emergency department including wait times, patient volume, triage efficiency, and outcomes.",
    status: "PUBLISHED" as const,
    frequency: "DAILY" as const,
    format: "DASHBOARD" as const,
    department: "Emergency",
    category: "Operations",
    lastGenerated: new Date(), // Today
    fileUrl: null, // Dashboard
    fileSize: null,
    parameters: {
      realTime: true,
      alertThresholds: {
        waitTime: 30,
        occupancyRate: 85
      }
    }
  },
  {
    title: "Patient Satisfaction Survey Results",
    description: "Comprehensive analysis of patient feedback, satisfaction scores, complaint analysis, and improvement recommendations.",
    status: "DRAFT" as const,
    frequency: "QUARTERLY" as const,
    format: "PDF" as const,
    department: "Quality",
    category: "Quality",
    lastGenerated: null,
    fileUrl: null,
    fileSize: null,
    parameters: {
      surveyPeriod: "Q4-2024",
      responseRate: 0,
      includeDemographics: true
    }
  },
  {
    title: "Infection Control Report",
    description: "Healthcare-associated infection rates, outbreak tracking, prevention measures, and antimicrobial stewardship data.",
    status: "GENERATED" as const,
    frequency: "MONTHLY" as const,
    format: "PDF" as const,
    department: "Quality",
    category: "Quality",
    lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    fileUrl: "/reports/infection-control-2024-11.pdf",
    fileSize: 1638400, // 1.6 MB
    parameters: {
      month: "November",
      year: 2024,
      includeAntimicrobialData: true
    }
  },
  {
    title: "Surgical Outcomes Analysis",
    description: "Analysis of surgical procedures, complication rates, recovery times, and patient outcomes by specialty.",
    status: "PUBLISHED" as const,
    frequency: "QUARTERLY" as const,
    format: "EXCEL" as const,
    department: "Surgery",
    category: "Quality",
    lastGenerated: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
    fileUrl: "/reports/surgical-outcomes-q3-2024.xlsx",
    fileSize: 2621440, // 2.5 MB
    parameters: {
      quarter: "Q3",
      year: 2024,
      specialties: ["General Surgery", "Orthopedic", "Cardiac", "Neurosurgery"]
    }
  },
  {
    title: "HR Recruitment and Retention",
    description: "Analysis of recruitment metrics, turnover rates, retention strategies, and workforce planning data.",
    status: "DRAFT" as const,
    frequency: "YEARLY" as const,
    format: "PDF" as const,
    department: "Human Resources",
    category: "Staff",
    lastGenerated: null,
    fileUrl: null,
    fileSize: null,
    parameters: {
      year: 2024,
      includeSalaryAnalysis: true,
      benchmarkData: true
    }
  },
  {
    title: "Radiology Imaging Volume Report",
    description: "Volume analysis of imaging procedures, equipment utilization, turnaround times, and quality metrics.",
    status: "PUBLISHED" as const,
    frequency: "MONTHLY" as const,
    format: "CSV" as const,
    department: "Radiology",
    category: "Operations",
    lastGenerated: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    fileUrl: "/reports/radiology-volume-2024-11.csv",
    fileSize: 512000, // 500 KB
    parameters: {
      month: "November",
      year: 2024,
      modalities: ["CT", "MRI", "X-Ray", "Ultrasound"]
    }
  }
]

async function seedReports() {
  try {
    console.log("🌱 Starting to seed reports...")

    // Insert all mock reports
    for (const report of mockReports) {
      await db.insert(reports).values({
        title: report.title,
        description: report.description,
        status: report.status,
        frequency: report.frequency,
        format: report.format,
        department: report.department,
        category: report.category,
        lastGenerated: report.lastGenerated,
        fileUrl: report.fileUrl,
        fileSize: report.fileSize,
        parameters: report.parameters,
      })
    }

    console.log(`✅ Successfully seeded ${mockReports.length} reports!`)
    console.log("\n📊 Report Summary:")
    console.log(`  - DRAFT: ${mockReports.filter(r => r.status === 'DRAFT').length}`)
    console.log(`  - GENERATED: ${mockReports.filter(r => r.status === 'GENERATED').length}`)
    console.log(`  - PUBLISHED: ${mockReports.filter(r => r.status === 'PUBLISHED').length}`)
    console.log(`  - ARCHIVED: ${mockReports.filter(r => r.status === 'ARCHIVED').length}`)

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding reports:", error)
    process.exit(1)
  }
}

seedReports()
