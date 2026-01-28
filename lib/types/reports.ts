/**
 * Report data interface for A4 PDF export and preview
 */
export interface ReportData {
  id: string
  title: string
  description: string | null
  status: string
  frequency: string
  format: string
  department: string | null
  category: string | null
  lastGenerated: Date | null
  createdAt: Date
  updatedAt: Date
  parameters?: Record<string, any> | null
  generatedBy?: string | null
  fileUrl?: string | null
  fileSize?: number | null
}

/**
 * Report category types
 */
export type ReportCategory = "financial" | "patient" | "staff" | "operations" | "general"

/**
 * Report status types
 */
export type ReportStatus = "DRAFT" | "GENERATED" | "PUBLISHED" | "ARCHIVED"

/**
 * Report frequency types
 */
export type ReportFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "ON_DEMAND"

/**
 * Report format types
 */
export type ReportFormat = "PDF" | "EXCEL" | "CSV" | "DASHBOARD"

/**
 * Sample data structure for different report types
 */
export interface ReportSampleData {
  financial?: {
    revenue: number
    expenses: number
    profit: number
    transactions: Array<{
      date: string
      description: string
      amount: number
    }>
  }
  patient?: {
    totalPatients: number
    newPatients: number
    admissions: number
    discharges: number
    departments: Array<{
      name: string
      count: number
    }>
  }
  staff?: {
    totalStaff: number
    doctors: number
    nurses: number
    admin: number
    departments: Array<{
      name: string
      count: number
      available: number
    }>
  }
  operations?: {
    surgeries: number
    emergencies: number
    bedOccupancy: number
    equipment: Array<{
      name: string
      status: string
      usage: string
    }>
  }
}
