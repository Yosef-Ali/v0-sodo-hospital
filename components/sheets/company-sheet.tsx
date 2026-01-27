"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, FileText, BadgeCheck, RefreshCw, Copy, Check, AlertCircle, Loader2 } from "lucide-react"
import { SmartDocumentChecklist, StageProgress, DocumentSection as DocSection } from "@/components/ui/smart-document-checklist"
import { useOcrAutoFill, mapOcrToCompanyForm } from "@/lib/hooks/use-ocr-autofill"
import { toast } from "sonner"

// OCR-enabled document types (business_license contains company info)
const OCR_DOCUMENT_TYPES: Record<string, string> = {
  business_license: "business_license",
}

// ===================== CONFIG =====================

const REGISTRATION_TYPES = [
  { value: "new", label: "New Registration", icon: BadgeCheck },
  { value: "renewal", label: "Renewal", icon: RefreshCw },
]

const STAGES = {
  new: [
    { value: "DOCUMENT_PREP", label: "Document Prep" },
    { value: "APPLY_ONLINE", label: "Apply Online" },
    { value: "SUBMIT", label: "Submit" },
    { value: "APPROVED", label: "Approved" },
  ],
  renewal: [
    { value: "DOCUMENT_PREP", label: "Document Prep" },
    { value: "APPLY_ONLINE", label: "Apply Online" },
    { value: "APPROVED", label: "Approved" },
  ],
}

const DOCUMENT_REQUIREMENTS = {
  new: [
    { value: "official_letter", label: "Official Letter" },
    { value: "business_license", label: "Business License" },
    { value: "coc", label: "COC (Certificate of Competence)" },
    { value: "business_registration", label: "Business Registration" },
    { value: "tin", label: "TIN Number" },
    { value: "article_of_association", label: "Article of Association" },
    { value: "delegation_kebele", label: "Delegation & ID (Kebele)" },
    { value: "delegation_work", label: "Delegation & ID (Work)" },
  ],
  renewal: [
    { value: "official_letter", label: "Official Letter" },
    { value: "current_registration", label: "Current Registration Certificate" },
    { value: "business_license", label: "Business License" },
    { value: "coc", label: "COC" },
    { value: "tin", label: "TIN Number" },
    { value: "delegation_kebele", label: "Delegation & ID (Kebele)" },
    { value: "delegation_work", label: "Delegation & ID (Work)" },
  ],
}

// ===================== INTERFACES =====================

interface CompanySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  company?: any
}

interface DocumentSection {
  id: string
  type: string
  customTitle?: string
  files: string[]
}

interface FormErrors {
  companyName?: string
  registrationType?: string
}

// ===================== MAIN COMPONENT =====================

export function CompanySheet({ open, onOpenChange, onSubmit, company }: CompanySheetProps) {
  const [activeTab, setActiveTab] = useState("company")

  const [formData, setFormData] = useState({
    companyName: "",
    businessType: "",
    tinNumber: "",
    licenseNumber: "",
    address: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    registrationType: "",
    currentStage: "DOCUMENT_PREP",
    notes: "",
  })

  const [documentSections, setDocumentSections] = useState<DocumentSection[]>([])
  const [ticketCopied, setTicketCopied] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track auto-filled fields for visual highlighting
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set())

  // Get ticket number from company prop
  const ticketNumber = company?.ticketNumber || ""

  // OCR Auto-fill hook
  const { extractFromImage, isLoading: isOcrLoading } = useOcrAutoFill()

  // OCR extraction handler for Business License - Inline Autofill
  const handleOcrExtract = async (docType: string, imageUrl: string) => {
    if (docType !== "business_license") return

    const result = await extractFromImage(imageUrl, "business_license")

    if (result.success && result.data) {
      // Check if the response contains rawText (unstructured) or warning
      if (result.data.rawText || result.warning) {
        toast.warning("Could not extract company details", {
          description: "The uploaded document doesn't appear to be a business license. Please upload a valid business license document.",
          duration: 6000,
        })
        return
      }

      const mappedFields = mapOcrToCompanyForm(result.data)

      if (Object.keys(mappedFields).length > 0) {
        setFormData(prev => ({ ...prev, ...mappedFields }))

        const newAutoFilledFields = new Set(autoFilledFields)
        Object.keys(mappedFields).forEach(field => newAutoFilledFields.add(field))
        setAutoFilledFields(newAutoFilledFields)

        // Clear errors for auto-filled fields
        if (mappedFields.companyName) {
          setErrors(prev => ({ ...prev, companyName: undefined }))
        }

        setTimeout(() => setAutoFilledFields(new Set()), 5000)
        setActiveTab("company")

        toast.success("Document scanned successfully", {
          description: `Auto-filled ${Object.keys(mappedFields).length} fields from Business License`,
        })
      } else {
        toast.warning("Unrecognized document", {
          description: "No company information found. Make sure you uploaded a business license document.",
          duration: 6000,
        })
      }
    } else if (result.error) {
      toast.error("Document scan failed", {
        description: result.error,
        duration: 5000,
      })
    }
  }

  // Check if a field is auto-filled for styling
  const isAutoFilled = (fieldName: string) => autoFilledFields.has(fieldName)

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName || company.title || "",
        businessType: company.businessType || "",
        tinNumber: company.tinNumber || "",
        licenseNumber: company.licenseNumber || "",
        address: company.address || "",
        contactPerson: company.contactPerson || "",
        contactPhone: company.contactPhone || "",
        contactEmail: company.contactEmail || "",
        registrationType: company.registrationType || company.category || "",
        currentStage: company.currentStage || "DOCUMENT_PREP",
        notes: company.notes || "",
      })
      setDocumentSections(company.documentSections || [])
    } else {
      setFormData({
        companyName: "", businessType: "", tinNumber: "", licenseNumber: "",
        address: "", contactPerson: "", contactPhone: "", contactEmail: "",
        registrationType: "", currentStage: "DOCUMENT_PREP", notes: "",
      })
      setDocumentSections([])
    }
    setErrors({})
    setActiveTab("company")
  }, [company, open])

  // Get document requirements based on registration type
  const getDocumentRequirements = () => {
    if (!formData.registrationType) return []
    return DOCUMENT_REQUIREMENTS[formData.registrationType as keyof typeof DOCUMENT_REQUIREMENTS] || []
  }

  // Get stages based on registration type
  const getStages = () => {
    if (!formData.registrationType) return []
    return STAGES[formData.registrationType as keyof typeof STAGES] || []
  }

  // Clear field error on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    if (name === "registrationType") {
      setDocumentSections([])
      setFormData(prev => ({ ...prev, currentStage: "DOCUMENT_PREP" }))
    }
  }

  const handleAddFile = (docType: string, url: string) => {
    setDocumentSections(prev => {
      const existing = prev.find(s => s.type === docType)
      if (existing) {
        return prev.map(s => s.type === docType ? { ...s, files: [...s.files, url] } : s)
      } else {
        return [...prev, { id: Date.now().toString(), type: docType, files: [url] }]
      }
    })
  }

  const handleRemoveFile = (docType: string, fileIndex: number) => {
    setDocumentSections(prev => prev.map(s =>
      s.type === docType ? { ...s, files: s.files.filter((_, i) => i !== fileIndex) } : s
    ))
  }

  const handleAddCustomDocument = (title: string) => {
    const customId = `custom_${Date.now()}`
    setDocumentSections(prev => [
      ...prev,
      { id: customId, type: customId, customTitle: title, files: [] }
    ])
  }

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required"
    }
    if (!formData.registrationType) {
      newErrors.registrationType = "Please select a registration type"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.companyName) {
        setActiveTab("company")
      } else if (newErrors.registrationType) {
        setActiveTab("registration")
      }
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      const submissionData = {
        title: formData.companyName || "Company Registration",
        companyName: formData.companyName,
        registrationType: formData.registrationType,
        stage: formData.currentStage || "document_prep",
        status: "pending",
        description: [
          formData.businessType && `Type: ${formData.businessType}`,
          formData.tinNumber && `TIN: ${formData.tinNumber}`,
          formData.licenseNumber && `License: ${formData.licenseNumber}`,
          formData.address && `Address: ${formData.address}`,
          formData.contactPerson && `Contact: ${formData.contactPerson}`,
          formData.contactPhone && `Phone: ${formData.contactPhone}`,
          formData.contactEmail && `Email: ${formData.contactEmail}`,
          formData.notes,
        ].filter(Boolean).join(" | "),
        documentSections,
        documents: documentSections.flatMap(s => s.files),
      }
      await onSubmit(submissionData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditMode = !!company
  const businessTypes = ["PLC", "Share Company", "Sole Proprietorship", "Partnership", "NGO", "Other"]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-green-500" />
            {isEditMode ? "Edit Company Registration" : "Add New Company Registration"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {isEditMode ? "Update company registration details and documents." : "Enter company details, select registration type, and upload required documents."}
          </SheetDescription>
          {/* Ticket Number Display in Edit Mode */}
          {isEditMode && ticketNumber && (
            <div className="flex items-center gap-2 mt-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <span className="text-gray-400 text-xs">Ticket:</span>
              <span className="text-green-300 font-mono text-sm">{ticketNumber}</span>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(ticketNumber)
                  setTicketCopied(true)
                  setTimeout(() => setTicketCopied(false), 2000)
                }}
                className="p-1 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
              >
                {ticketCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          {/* OCR Progress Banner - visible on all tabs */}
          {isOcrLoading && (
            <div className="mb-4 p-3 rounded-lg border border-blue-500/50 bg-blue-500/10 flex items-center gap-3 animate-pulse">
              <Loader2 className="h-5 w-5 text-blue-400 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-300">Scanning document...</p>
                <p className="text-xs text-blue-400/70">AI is extracting company details from the uploaded Business License</p>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700/50 mb-4">
              <TabsTrigger value="company" className="data-[state=active]:bg-green-600 text-xs">
                <Building2 className="h-3 w-3 mr-1" /> Company Info
                {errors.companyName && <AlertCircle className="h-3 w-3 ml-1 text-red-400" />}
              </TabsTrigger>
              <TabsTrigger value="registration" className="data-[state=active]:bg-green-600 text-xs">
                <FileText className="h-3 w-3 mr-1" /> Registration & Docs
                {errors.registrationType && <AlertCircle className="h-3 w-3 ml-1 text-red-400" />}
              </TabsTrigger>
            </TabsList>

            {/* ===================== COMPANY TAB ===================== */}
            <TabsContent value="company" className="space-y-4">
              <div className="space-y-2">
                <Label className={`${errors.companyName ? 'text-red-400' : 'text-gray-300'}`}>
                  Company Name <span className="text-red-400">*</span>
                </Label>
                <Input name="companyName" value={formData.companyName} onChange={handleChange}
                  placeholder="Company name"
                  className={`bg-gray-700 text-white ${
                    errors.companyName
                      ? 'border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500'
                      : isAutoFilled('companyName')
                        ? 'border-green-500 bg-green-900/20 ring-1 ring-green-500'
                        : 'border-gray-600'
                  }`} />
                {errors.companyName && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.companyName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Business Type</Label>
                  <Select value={formData.businessType} onValueChange={(v) => handleSelectChange("businessType", v)}>
                    <SelectTrigger className={`bg-gray-700 text-white ${isAutoFilled('businessType') ? 'border-green-500 bg-green-900/20 ring-1 ring-green-500' : 'border-gray-600'}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {businessTypes.map(t => <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">TIN Number</Label>
                  <Input name="tinNumber" value={formData.tinNumber} onChange={handleChange}
                    placeholder="TIN number"
                    className={`bg-gray-700 text-white ${isAutoFilled('tinNumber') ? 'border-green-500 bg-green-900/20 ring-1 ring-green-500' : 'border-gray-600'}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">License Number</Label>
                  <Input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange}
                    placeholder="Business license #"
                    className={`bg-gray-700 text-white ${isAutoFilled('licenseNumber') ? 'border-green-500 bg-green-900/20 ring-1 ring-green-500' : 'border-gray-600'}`} />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Address</Label>
                  <Input name="address" value={formData.address} onChange={handleChange}
                    placeholder="Business address"
                    className={`bg-gray-700 text-white ${isAutoFilled('address') ? 'border-green-500 bg-green-900/20 ring-1 ring-green-500' : 'border-gray-600'}`} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Contact Person</Label>
                  <Input name="contactPerson" value={formData.contactPerson} onChange={handleChange}
                    placeholder="Name"
                    className={`bg-gray-700 text-white ${isAutoFilled('contactPerson') ? 'border-green-500 bg-green-900/20 ring-1 ring-green-500' : 'border-gray-600'}`} />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Phone</Label>
                  <Input name="contactPhone" value={formData.contactPhone} onChange={handleChange}
                    placeholder="+251..." className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Email</Label>
                  <Input name="contactEmail" value={formData.contactEmail} onChange={handleChange}
                    placeholder="email@..." className="bg-gray-700 border-gray-600 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Notes</Label>
                <Textarea name="notes" value={formData.notes} onChange={handleChange}
                  placeholder="Additional notes..." className="bg-gray-700 border-gray-600 text-white min-h-[80px]" />
              </div>
            </TabsContent>

            {/* ===================== REGISTRATION TAB ===================== */}
            <TabsContent value="registration" className="space-y-4">
              {/* Registration Type Selection */}
              <div className={`bg-gray-700/30 rounded-lg p-4 border ${errors.registrationType ? 'border-red-500' : 'border-gray-700'}`}>
                <h4 className={`text-sm font-medium mb-3 ${errors.registrationType ? 'text-red-400' : 'text-green-400'}`}>
                  Registration Type <span className="text-red-400">*</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {REGISTRATION_TYPES.map(type => (
                    <button key={type.value} type="button"
                      onClick={() => handleSelectChange("registrationType", type.value)}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2
                        ${formData.registrationType === type.value
                          ? 'border-green-500 bg-green-500/20 text-green-400'
                          : 'border-gray-600 hover:border-gray-500 text-gray-400'}`}>
                      <type.icon className="h-4 w-4" />
                      <span className="text-xs">{type.label}</span>
                    </button>
                  ))}
                </div>
                {errors.registrationType && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-2">
                    <AlertCircle className="h-3 w-3" /> {errors.registrationType}
                  </p>
                )}
              </div>

              {/* Stage Progress */}
              {formData.registrationType && (
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-green-400">Current Stage</h4>
                    <Select value={formData.currentStage} onValueChange={(v) => handleSelectChange("currentStage", v)}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-40 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {getStages().map(s => <SelectItem key={s.value} value={s.value} className="text-white text-xs">{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <StageProgress
                    stages={getStages()}
                    currentStage={formData.currentStage}
                    onStageChange={(stage) => handleSelectChange("currentStage", stage)}
                  />
                </div>
              )}

              {/* Document Checklist */}
              {formData.registrationType && (
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-sm font-medium text-green-400 mb-3">
                    Required Documents ({getDocumentRequirements().length} items)
                  </h4>
                  <SmartDocumentChecklist
                    documents={getDocumentRequirements()}
                    documentSections={documentSections}
                    onAddFile={handleAddFile}
                    onRemoveFile={handleRemoveFile}
                    onAddCustomDocument={handleAddCustomDocument}
                    ocrDocumentTypes={OCR_DOCUMENT_TYPES}
                    onOcrExtract={handleOcrExtract}
                    isOcrLoading={isOcrLoading}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-700 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
              className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isOcrLoading || isSubmitting}>
              {isOcrLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</>
              ) : isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : isEditMode ? "Update Company" : "Confirm & Save Company"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// Keep backward compatibility export
export { CompanySheet as CompanyTaskSheet }
