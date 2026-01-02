import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTicketNumber(prefix: string) {
  // Format: PREFIX-TIMESTAMP-RANDOM (e.g., FOR-1715-AB92)
  const timestamp = Date.now().toString().slice(-4)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
  return `${prefix}-${timestamp}-${random}`
}
