"use client"

import { useState } from "react"

interface OcrResult {
  success: boolean
  data?: Record<string, any>
  error?: string
  warning?: string
}

export type DocumentTypeForOcr =
  | "passport" | "work_permit" | "residence_id" | "medical_license"
  | "libre" | "bill_of_lading" | "business_license" | "general"

/**
 * Hook for OCR auto-fill functionality using Gemini 2.5 Flash
 */
export function useOcrAutoFill() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const extractFromImage = async (
    imageUrl: string,
    documentType: DocumentTypeForOcr = "general"
  ): Promise<OcrResult> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, documentType }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || "OCR failed")
        return { success: false, error: result.error }
      }

      return {
        success: true,
        data: result.data,
        warning: result.warning
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "OCR request failed"
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }

  return { extractFromImage, isLoading, error }
}

/**
 * Maps OCR extracted data to PersonSheet form fields
 */
export function mapOcrToPersonForm(
  ocrData: Record<string, any>,
  documentType: DocumentTypeForOcr
): Record<string, string> {
  const mapped: Record<string, string> = {}

  if (ocrData.fullName) {
    const nameParts = ocrData.fullName.trim().split(/\s+/)
    if (nameParts.length >= 2) {
      mapped.firstName = nameParts[0]
      mapped.lastName = nameParts.slice(1).join(" ")
    } else {
      mapped.firstName = ocrData.fullName
    }
  }

  if (ocrData.gender) {
    const gender = ocrData.gender.toUpperCase()
    if (gender === "M" || gender.includes("MALE")) mapped.gender = "MALE"
    if (gender === "F" || gender.includes("FEMALE")) mapped.gender = "FEMALE"
  }

  if (ocrData.nationality) mapped.nationality = ocrData.nationality

  switch (documentType) {
    case "passport":
      if (ocrData.passportNo) mapped.passportNo = ocrData.passportNo
      if (ocrData.dateOfBirth) mapped.dateOfBirth = ocrData.dateOfBirth
      if (ocrData.expiryDate) mapped.passportExpiryDate = ocrData.expiryDate
      break
    case "work_permit":
      if (ocrData.permitNo) mapped.workPermitNo = ocrData.permitNo
      if (ocrData.expiryDate) mapped.workPermitExpiryDate = ocrData.expiryDate
      break
    case "residence_id":
      if (ocrData.idNo) mapped.residenceIdNo = ocrData.idNo
      if (ocrData.expiryDate) mapped.residenceIdExpiryDate = ocrData.expiryDate
      break
    case "medical_license":
      if (ocrData.licenseNo) mapped.medicalLicenseNo = ocrData.licenseNo
      if (ocrData.expiryDate) mapped.medicalLicenseExpiryDate = ocrData.expiryDate
      break
  }

  return mapped
}

/**
 * Maps OCR extracted data to VehicleSheet form fields (from Libre document)
 */
export function mapOcrToVehicleForm(ocrData: Record<string, any>): Record<string, string> {
  const mapped: Record<string, string> = {}

  if (ocrData.plateNumber) mapped.plateNumber = ocrData.plateNumber
  if (ocrData.chassisNumber) mapped.chassisNumber = ocrData.chassisNumber
  if (ocrData.engineNumber) mapped.engineNumber = ocrData.engineNumber
  if (ocrData.ownerName) mapped.ownerName = ocrData.ownerName
  if (ocrData.vehicleType) mapped.vehicleType = ocrData.vehicleType
  if (ocrData.vehicleModel) mapped.vehicleModel = ocrData.vehicleModel
  if (ocrData.vehicleYear) mapped.vehicleYear = ocrData.vehicleYear

  return mapped
}

/**
 * Maps OCR extracted data to ImportSheet form fields (from Bill of Lading/AWB)
 */
export function mapOcrToImportForm(ocrData: Record<string, any>): Record<string, string> {
  const mapped: Record<string, string> = {}

  if (ocrData.blNumber) mapped.blNumber = ocrData.blNumber
  if (ocrData.shipperName) mapped.supplierName = ocrData.shipperName
  if (ocrData.consigneeName) mapped.consigneeName = ocrData.consigneeName
  if (ocrData.shipperCountry) mapped.supplierCountry = ocrData.shipperCountry
  if (ocrData.itemDescription) mapped.itemDescription = ocrData.itemDescription
  if (ocrData.estimatedValue) mapped.estimatedValue = ocrData.estimatedValue
  if (ocrData.currency) mapped.currency = ocrData.currency

  return mapped
}

/**
 * Maps OCR extracted data to CompanySheet form fields (from Business License)
 */
export function mapOcrToCompanyForm(ocrData: Record<string, any>): Record<string, string> {
  const mapped: Record<string, string> = {}

  if (ocrData.companyName) mapped.companyName = ocrData.companyName
  if (ocrData.tinNumber) mapped.tinNumber = ocrData.tinNumber
  if (ocrData.licenseNumber) mapped.licenseNumber = ocrData.licenseNumber
  if (ocrData.businessType) mapped.businessType = ocrData.businessType
  if (ocrData.address) mapped.address = ocrData.address
  if (ocrData.contactPerson) mapped.contactPerson = ocrData.contactPerson

  return mapped
}
