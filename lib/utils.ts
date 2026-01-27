import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTicketNumber(prefix: string) {
  // Format: PREFIX-NNNNNN (e.g., FOR-001006, VEH-000123)
  // Uses timestamp-based unique ID with padding for clean format
  const sequence = Date.now() % 1000000 // Last 6 digits of timestamp
  return `${prefix}-${sequence.toString().padStart(6, "0")}`
}
