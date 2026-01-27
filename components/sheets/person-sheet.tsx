"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, FileText, Users, Plus, Trash2, X, File, Check, Circle, Briefcase, Home, Stethoscope, Loader2, Sparkles, Copy, Eye, CheckCircle2, ScanLine, AlertCircle, RefreshCw, Pencil } from "lucide-react"
import { UploadDropzone } from "@/lib/uploadthing-utils"
import { useOcrAutoFill, mapOcrToPersonForm, type DocumentTypeForOcr } from "@/lib/hooks/use-ocr-autofill"
import { toast } from "sonner"

// Map document types to OCR document types
const OCR_DOCUMENT_TYPES: Record<string, DocumentTypeForOcr> = {
  passport: "passport",
  work_permit: "work_permit", 
  residence_id: "residence_id",
  medical_license: "medical_license",
}

// ===================== DOCUMENT REQUIREMENTS CONFIG =====================
const DOCUMENT_REQUIREMENTS = {
  WORK_PERMIT: {
    NEW: [
      { value: "application_letter", label: "Application Letter" },
      { value: "visa_entry", label: "Visa (Visa & Entry Date on Passport)" },
      { value: "education", label: "Educational Documents" },
      { value: "contract", label: "Contract Employee Agreement" },
      { value: "support_letter_snnp", label: "Support Letter (South Region)" },
      { value: "support_letter_moh", label: "Support Letter (MOH)" },
      { value: "delegation_kebele", label: "Delegation & ID (Kebele)" },
      { value: "delegation_work", label: "Delegation & ID (Work)" },
      { value: "passport", label: "Passport" },
      { value: "photo", label: "Photo (2 pcs)" },
      { value: "business_license", label: "Business License" },
      { value: "coc", label: "COC (Certificate of Competence)" },
      { value: "business_registration", label: "Business Registration" },
      { value: "tin", label: "TIN Number" },
    ],
    RENEWAL: [
      { value: "application_letter", label: "Application Letter" },
      { value: "contract", label: "Contract Employee Agreement" },
      { value: "support_letter_snnp", label: "Support Letter (South Region)" },
      { value: "support_letter_moh", label: "Support Letter (MOH)" },
      { value: "visa_permit_residence", label: "Visa (Work Permit & Residence ID)" },
      { value: "passport", label: "Passport" },
      { value: "business_license", label: "Business License" },
      { value: "coc", label: "COC" },
      { value: "business_registration", label: "Business Registration" },
      { value: "tin", label: "TIN Number" },
    ]
  },
  RESIDENCE_ID: {
    NEW: {
      main: [
        { value: "electronic_visa", label: "Electronic Visa" },
        { value: "entry_date", label: "Entry Date (from Passport)" },
        { value: "photo_immigration", label: "Photo with Immigration Form" },
        { value: "official_letter", label: "Official Letter" },
        { value: "support_letter", label: "Support Letter" },
        { value: "work_permit", label: "Work Permit" },
        { value: "passport", label: "Passport" },
        { value: "photo", label: "Photo" },
        { value: "ceo_passport", label: "CEO Passport" },
        { value: "business_license", label: "Business License" },
        { value: "coc", label: "COC" },
        { value: "business_registration", label: "Business Registration" },
        { value: "tin", label: "TIN Number" },
        { value: "delegation_kebele", label: "Delegation & ID (Kebele)" },
        { value: "delegation_work", label: "Delegation & ID (Work)" },
      ],
      dependents: [
        { value: "birth_certificate", label: "Authenticated Birth Certificate" },
        { value: "marriage_certificate", label: "Authenticated Marriage Certificate" },
        { value: "work_permit_copy", label: "Work Permit Copy" },
        { value: "official_letter_names", label: "Official Letter (with names)" },
        { value: "all_docs_copy", label: "All Documents Copy" },
      ]
    },
    RENEWAL: {
      main: [
        { value: "ics_form", label: "ICS Form (Immigration Citizenship)" },
        { value: "official_letter", label: "Official Letter (from Soddo)" },
        { value: "passport_copy", label: "Passport Copy" },
        { value: "residence_id", label: "Residence ID" },
        { value: "work_permit", label: "Work Permit" },
        { value: "support_letter_snnp", label: "Support Letter (SNNP)" },
        { value: "business_license", label: "Business License" },
        { value: "coc", label: "COC" },
        { value: "business_registration", label: "Business Registration" },
        { value: "tin", label: "TIN Number" },
        { value: "delegation_kebele", label: "Delegation & ID (Kebele)" },
        { value: "delegation_work", label: "Delegation & ID (Work)" },
      ],
      dependents: [
        { value: "ics_form", label: "ICS Form" },
        { value: "child_photo", label: "Current Photo (for children)" },
        { value: "passport_copy", label: "Passport Copy" },
        { value: "residence_id", label: "Residence ID" },
        { value: "work_permit", label: "Work Permit" },
        { value: "renewed_residence_id", label: "Renewed Residence ID" },
        { value: "birth_certificate", label: "Birth Certificate (for kids)" },
        { value: "marriage_certificate", label: "Marriage Certificate" },
        { value: "business_license", label: "Business License" },
        { value: "coc", label: "COC" },
        { value: "business_registration", label: "Business Registration" },
        { value: "tin", label: "TIN Number" },
        { value: "delegation_kebele", label: "Delegation & ID (Kebele)" },
        { value: "delegation_work", label: "Delegation & ID (Work)" },
      ]
    }
  },
  MEDICAL_LICENSE: {
    NEW: [
      { value: "application_letter", label: "Application Letter" },
      { value: "medical_degree", label: "Medical Degree/Diploma" },
      { value: "license_verification", label: "License Verification (Home Country)" },
      { value: "passport", label: "Passport" },
      { value: "photo", label: "Photo (2 pcs)" },
      { value: "support_letter", label: "Support Letter" },
    ],
    RENEWAL: [
      { value: "current_license", label: "Current Medical License" },
      { value: "cme_certificates", label: "CME Certificates" },
      { value: "passport", label: "Passport" },
      { value: "photo", label: "Photo" },
      { value: "support_letter", label: "Support Letter" },
    ]
  }
}

const STAGES = [
  { value: "SUPPORT_LETTER", label: "Support Letter", icon: FileText },
  { value: "DOCUMENT_ARRANGEMENT", label: "Document Arrangement", icon: FileText },
  { value: "APPLY_ONLINE", label: "Apply Online", icon: FileText },
  { value: "SUBMIT_DOCUMENT", label: "Submit Document", icon: FileText },
  { value: "PAYMENT", label: "Payment", icon: FileText },
  { value: "PICK_ID", label: "Pick ID", icon: FileText },
  { value: "COMPLETED", label: "Completed", icon: Check },
]

// ===================== INTERFACES =====================
interface PersonFormData {
  id?: string
  firstName: string
  lastName: string
  nationality: string
  dateOfBirth: string
  gender: string
  photoUrl: string
  email: string
  phone: string
  // Permit workflow
  permitType: string
  applicationType: string
  currentStage: string
  // Permit numbers (kept for data)
  passportNo: string
  passportExpiryDate: string
  medicalLicenseNo: string
  medicalLicenseExpiryDate: string
  workPermitNo: string
  workPermitExpiryDate: string
  residenceIdNo: string
  residenceIdExpiryDate: string
  // Family
  familyDetails: {
    spouseName?: string
    spousePhone?: string
    children?: { name: string; age: string; gender: string }[]
  }
}

interface DocumentSection {
  id: string
  type: string
  customTitle?: string
  files: string[]
  isComplete?: boolean
}

interface PersonSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void> | void
  person?: any | null
}

// ===================== HELPER COMPONENTS =====================

function DocumentPreview({ url, index, onRemove }: { url: string; index: number; onRemove: () => void }) {
  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  return (
    <div className="relative group">
      <div className="border border-gray-600 rounded-lg p-2 bg-gray-700/50 h-20 w-20">
        {isImage ? (
          <img src={url} alt={`Doc ${index + 1}`} className="w-full h-full object-cover rounded" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <File className="h-5 w-5 mb-1" />
            <span className="text-[9px]">PDF</span>
          </div>
        )}
      </div>
      <button type="button" onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

function StageProgress({ currentStage, permitType }: { currentStage: string; permitType: string }) {
  if (!permitType) return null
  
  const stageIndex = STAGES.findIndex(s => s.value === currentStage)
  
  return (
    <div className="flex items-center justify-between mb-4 px-2">
      {STAGES.slice(0, -1).map((stage, idx) => {
        const isCompleted = idx < stageIndex
        const isCurrent = stage.value === currentStage
        
        return (
          <div key={stage.value} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
              ${isCompleted ? 'bg-green-600 border-green-600 text-white' : 
                isCurrent ? 'border-green-500 text-green-500' : 'border-gray-600 text-gray-500'}`}>
              {isCompleted ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
            </div>
            <span className={`text-[9px] mt-1 text-center max-w-[60px] ${isCurrent ? 'text-green-400' : 'text-gray-500'}`}>
              {stage.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function DocumentChecklist({
  documents,
  documentSections,
  onToggleSection,
  onAddFile,
  onRemoveFile,
  onOcrExtract,
  isOcrLoading,
  onAddCustomDocument
}: {
  documents: { value: string; label: string }[]
  documentSections: DocumentSection[]
  onToggleSection: (docType: string) => void
  onAddFile: (docType: string, url: string) => void
  onRemoveFile: (docType: string, fileIndex: number) => void
  onOcrExtract?: (docType: string, url: string) => Promise<void>
  isOcrLoading?: boolean
  onAddCustomDocument?: (title: string) => void
}) {
  const [activeUpload, setActiveUpload] = useState<string | null>(null)
  const [ocrDocType, setOcrDocType] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(true)  // Show completed by default
  const [showRemaining, setShowRemaining] = useState(true)
  const [customTitle, setCustomTitle] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Separate completed and remaining
  const completedDocs = documents.filter(doc => {
    const section = documentSections.find(s => s.type === doc.value)
    return section && section.files.length > 0
  })
  const remainingDocs = documents.filter(doc => {
    const section = documentSections.find(s => s.type === doc.value)
    return !section || section.files.length === 0
  })

  // Get custom documents (those not in the predefined list)
  const customDocs = documentSections.filter(s => 
    s.customTitle && !documents.some(d => d.value === s.type)
  )

  const renderDocumentItem = (doc: { value: string; label: string }, isCustom = false) => {
    const section = documentSections.find(s => s.type === doc.value)
    const hasFiles = section && section.files.length > 0

    return (
      <div key={doc.value} className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all
              ${hasFiles ? 'bg-green-600 border-green-600' : 'border-gray-500'}`}>
              {hasFiles && <Check className="h-3 w-3 text-white" />}
            </div>
            <span className={`text-sm ${hasFiles ? 'text-green-400' : 'text-gray-300'}`}>
              {doc.label}
              {isCustom && <span className="text-xs text-gray-500 ml-1">(custom)</span>}
            </span>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setActiveUpload(activeUpload === doc.value ? null : doc.value)}
            className="text-xs text-gray-400 hover:text-white h-7">
            {isOcrLoading && ocrDocType === doc.value ? (
              <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Scanning...</>
            ) : hasFiles ? (
              `${section?.files.length} file(s)`
            ) : (
              OCR_DOCUMENT_TYPES[doc.value] ? (
                <><Sparkles className="h-3 w-3 mr-1" /> Auto-fill</>
              ) : 'Upload'
            )}
          </Button>
        </div>
        
        {activeUpload === doc.value && (
          <div className="mt-2">
            <UploadDropzone
              endpoint="permitDocumentUploader"
              onClientUploadComplete={async (res) => {
                if (res) {
                  for (const file of res) {
                    if (file.url) {
                      onAddFile(doc.value, file.url)
                      if (onOcrExtract && OCR_DOCUMENT_TYPES[doc.value]) {
                        setOcrDocType(doc.value)
                        await onOcrExtract(doc.value, file.url)
                        setOcrDocType(null)
                      }
                    }
                  }
                }
                setActiveUpload(null)
              }}
              onUploadError={(error: Error) => { console.error("Upload error:", error); setActiveUpload(null) }}
              className="ut-label:text-gray-400 ut-allowed-content:text-gray-500 ut-button:bg-green-600 border-gray-600 bg-gray-700/30 ut-button:text-xs"
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Progress Summary */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-gray-400">
          <span className="text-green-400 font-medium">{completedDocs.length}</span> of {documents.length} completed
        </span>
        <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300" 
            style={{ width: `${(completedDocs.length / documents.length) * 100}%` }}
          />
        </div>
      </div>

      {/* All Documents - Simple flat list */}
      <div className="space-y-2">
        {documents.map(doc => renderDocumentItem(doc))}
      </div>

      {/* Custom Documents */}
      {customDocs.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-600">
          <span className="text-xs text-gray-400">Other Documents</span>
          {customDocs.map(section => renderDocumentItem({ 
            value: section.type, 
            label: section.customTitle || 'Custom Document' 
          }, true))}
        </div>
      )}

      {/* Add Other Document */}
      <div className="pt-2 border-t border-gray-600">
        {showCustomInput ? (
          <div className="flex gap-2">
            <Input 
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Document name..."
              className="bg-gray-700 border-gray-600 text-white h-8 text-xs flex-1"
              autoFocus
            />
            <Button 
              type="button" 
              size="sm"
              onClick={() => {
                if (customTitle.trim() && onAddCustomDocument) {
                  onAddCustomDocument(customTitle.trim())
                  setCustomTitle("")
                  setShowCustomInput(false)
                }
              }}
              disabled={!customTitle.trim()}
              className="bg-green-600 hover:bg-green-700 h-8 text-xs"
            >
              Add
            </Button>
            <Button 
              type="button" 
              variant="ghost"
              size="sm"
              onClick={() => { setShowCustomInput(false); setCustomTitle("") }}
              className="h-8 text-xs text-gray-400"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={() => setShowCustomInput(true)}
            className="w-full border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 h-9"
          >
            <Plus className="h-3 w-3 mr-2" /> Add Other Document
          </Button>
        )}
      </div>
    </div>
  )
}

// ===================== MAIN COMPONENT =====================

export function PersonSheet({ open, onOpenChange, onSubmit, person }: PersonSheetProps) {
  const [activeTab, setActiveTab] = useState("personal")
  
  const [formData, setFormData] = useState<PersonFormData>({
    firstName: "", lastName: "", nationality: "", dateOfBirth: "", gender: "", photoUrl: "",
    email: "", phone: "",
    permitType: "", applicationType: "", currentStage: "SUPPORT_LETTER",
    passportNo: "", passportExpiryDate: "",
    medicalLicenseNo: "", medicalLicenseExpiryDate: "",
    workPermitNo: "", workPermitExpiryDate: "",
    residenceIdNo: "", residenceIdExpiryDate: "",
    familyDetails: { spouseName: "", spousePhone: "", children: [] }
  })

  const [documentSections, setDocumentSections] = useState<DocumentSection[]>([])
  const [ticketCopied, setTicketCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track auto-filled fields for visual highlighting
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set())

  // Quick scan mode state
  const [quickScanOpen, setQuickScanOpen] = useState(false)
  const [quickScanDocType, setQuickScanDocType] = useState<DocumentTypeForOcr>("passport")

  // OCR Preview state - shows extracted data before applying
  const [ocrPreview, setOcrPreview] = useState<{
    isOpen: boolean
    data: Record<string, string>
    editedData: Record<string, string>
    rawData: Record<string, any>
    docType: string
    imageUrl: string
  } | null>(null)

  // Get ticket number from person prop
  const ticketNumber = person?.ticketNumber || ""

  // OCR Auto-fill hook
  const { extractFromImage, isLoading: isOcrLoading } = useOcrAutoFill()

  // OCR extraction handler - now shows preview instead of auto-applying
  const handleOcrExtract = async (docType: string, imageUrl: string) => {
    const ocrDocType = OCR_DOCUMENT_TYPES[docType]
    if (!ocrDocType) return

    const result = await extractFromImage(imageUrl, ocrDocType)

    if (result.success && result.data) {
      const mappedFields = mapOcrToPersonForm(result.data, ocrDocType)

      if (Object.keys(mappedFields).length > 0) {
        // Show preview dialog instead of auto-applying
        setOcrPreview({
          isOpen: true,
          data: mappedFields,
          editedData: { ...mappedFields }, // Allow editing before applying
          rawData: result.data,
          docType: docType,
          imageUrl: imageUrl
        })
        toast.success('Document scanned successfully!', {
          description: 'Please review and confirm the extracted data'
        })
      } else if (result.warning) {
        toast.warning('Could not extract structured data', {
          description: 'Please fill in the form manually'
        })
      }
    } else if (result.error) {
      toast.error('OCR extraction failed', {
        description: result.error
      })
    }
  }

  // Quick scan handler - scans document without going through document checklist
  const handleQuickScan = async (imageUrl: string) => {
    const result = await extractFromImage(imageUrl, quickScanDocType)

    if (result.success && result.data) {
      const mappedFields = mapOcrToPersonForm(result.data, quickScanDocType)

      if (Object.keys(mappedFields).length > 0) {
        setOcrPreview({
          isOpen: true,
          data: mappedFields,
          editedData: { ...mappedFields },
          rawData: result.data,
          docType: quickScanDocType,
          imageUrl: imageUrl
        })
        setQuickScanOpen(false)
        toast.success('Document scanned successfully!', {
          description: `Found ${Object.keys(mappedFields).length} fields`
        })
      } else {
        toast.warning('Could not extract structured data', {
          description: 'Try a clearer image or different document type'
        })
      }
    } else if (result.error) {
      toast.error('OCR extraction failed', {
        description: result.error
      })
    }
  }

  // Apply OCR data after user confirmation
  const handleApplyOcrData = () => {
    if (ocrPreview?.editedData) {
      // Apply the edited data to form
      setFormData(prev => ({
        ...prev,
        ...ocrPreview.editedData,
      }))

      // Track which fields were auto-filled for visual highlighting
      const newAutoFilledFields = new Set(autoFilledFields)
      Object.keys(ocrPreview.editedData).forEach(field => newAutoFilledFields.add(field))
      setAutoFilledFields(newAutoFilledFields)

      // Clear auto-fill highlight after 5 seconds
      setTimeout(() => {
        setAutoFilledFields(new Set())
      }, 5000)

      const fieldCount = Object.keys(ocrPreview.editedData).length
      toast.success(`Applied ${fieldCount} field${fieldCount > 1 ? 's' : ''} from document`, {
        description: 'Fields are highlighted in green'
      })
      setOcrPreview(null)
    }
  }

  // Update edited field in preview
  const handlePreviewFieldEdit = (field: string, value: string) => {
    if (ocrPreview) {
      setOcrPreview({
        ...ocrPreview,
        editedData: { ...ocrPreview.editedData, [field]: value }
      })
    }
  }

  // Reset a field to original OCR value
  const handleResetField = (field: string) => {
    if (ocrPreview && ocrPreview.data[field]) {
      setOcrPreview({
        ...ocrPreview,
        editedData: { ...ocrPreview.editedData, [field]: ocrPreview.data[field] }
      })
    }
  }

  // Check if a field is auto-filled for styling
  const isAutoFilled = (fieldName: string) => autoFilledFields.has(fieldName)

  // Get human-readable field label
  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      firstName: 'First Name',
      lastName: 'Last Name',
      nationality: 'Nationality',
      gender: 'Gender',
      dateOfBirth: 'Date of Birth',
      passportNo: 'Passport Number',
      passportExpiryDate: 'Passport Expiry',
      workPermitNo: 'Work Permit Number',
      workPermitExpiryDate: 'Work Permit Expiry',
      residenceIdNo: 'Residence ID Number',
      residenceIdExpiryDate: 'Residence ID Expiry',
      medicalLicenseNo: 'Medical License Number',
      medicalLicenseExpiryDate: 'Medical License Expiry',
    }
    return labels[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
  }

  useEffect(() => {
    if (person) {
      setFormData({
        id: person.id,
        firstName: person.firstName || "",
        lastName: person.lastName || "",
        nationality: person.nationality || "",
        dateOfBirth: person.dateOfBirth ? new Date(person.dateOfBirth).toISOString().split('T')[0] : "",
        gender: (person.gender || "").toUpperCase(),
        photoUrl: person.photoUrl || "",
        email: person.email || "",
        phone: person.phone || "",
        permitType: person.permitType || "",
        applicationType: person.applicationType || "",
        currentStage: person.currentStage || "SUPPORT_LETTER",
        passportNo: person.passportNo || "",
        passportExpiryDate: person.passportExpiryDate ? new Date(person.passportExpiryDate).toISOString().split('T')[0] : "",
        medicalLicenseNo: person.medicalLicenseNo || "",
        medicalLicenseExpiryDate: person.medicalLicenseExpiryDate ? new Date(person.medicalLicenseExpiryDate).toISOString().split('T')[0] : "",
        workPermitNo: person.workPermitNo || "",
        workPermitExpiryDate: person.workPermitExpiryDate ? new Date(person.workPermitExpiryDate).toISOString().split('T')[0] : "",
        residenceIdNo: person.residenceIdNo || "",
        residenceIdExpiryDate: person.residenceIdExpiryDate ? new Date(person.residenceIdExpiryDate).toISOString().split('T')[0] : "",
        familyDetails: { spouseName: "", spousePhone: "", children: [], ...(person.familyDetails || {}) },
      })
      setDocumentSections(person.documentSections || [])
    } else {
      setFormData({
        firstName: "", lastName: "", nationality: "", dateOfBirth: "", gender: "", photoUrl: "",
        email: "", phone: "",
        permitType: "", applicationType: "", currentStage: "SUPPORT_LETTER",
        passportNo: "", passportExpiryDate: "",
        medicalLicenseNo: "", medicalLicenseExpiryDate: "",
        workPermitNo: "", workPermitExpiryDate: "",
        residenceIdNo: "", residenceIdExpiryDate: "",
        familyDetails: { spouseName: "", spousePhone: "", children: [] }
      })
      setDocumentSections([])
    }
    setActiveTab("personal")
  }, [person, open])

  // Get document requirements based on permit type and application type
  const getDocumentRequirements = () => {
    if (!formData.permitType || !formData.applicationType) return []
    
    const permitConfig = DOCUMENT_REQUIREMENTS[formData.permitType as keyof typeof DOCUMENT_REQUIREMENTS]
    if (!permitConfig) return []
    
    const appTypeConfig = permitConfig[formData.applicationType as keyof typeof permitConfig]
    if (!appTypeConfig) return []
    
    // Handle nested structure for RESIDENCE_ID
    if (Array.isArray(appTypeConfig)) {
      return appTypeConfig
    } else if (typeof appTypeConfig === 'object' && 'main' in appTypeConfig) {
      return appTypeConfig.main
    }
    return []
  }

  const getDependentDocuments = () => {
    if (formData.permitType !== "RESIDENCE_ID" || !formData.applicationType) return []
    
    const config = DOCUMENT_REQUIREMENTS.RESIDENCE_ID[formData.applicationType as keyof typeof DOCUMENT_REQUIREMENTS.RESIDENCE_ID]
    if (config && 'dependents' in config) {
      return config.dependents
    }
    return []
  }

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Reset document sections when permit type changes
    if (name === "permitType" || name === "applicationType") {
      setDocumentSections([])
    }
  }

  const handleToggleSection = (docType: string) => {
    const exists = documentSections.find(s => s.type === docType)
    if (exists) {
      // Toggle complete status or do nothing
    } else {
      setDocumentSections([...documentSections, { id: Date.now().toString(), type: docType, files: [] }])
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

  // Custom document handler
  const handleAddCustomDocument = (title: string) => {
    const customId = `custom_${Date.now()}`
    setDocumentSections(prev => [
      ...prev,
      { id: customId, type: customId, customTitle: title, files: [] }
    ])
  }

  // Children handlers
  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      familyDetails: {
        ...prev.familyDetails,
        children: [...(prev.familyDetails.children || []), { name: "", age: "", gender: "MALE" }]
      }
    }))
  }

  const removeChild = (index: number) => {
    setFormData(prev => ({
      ...prev,
      familyDetails: {
        ...prev.familyDetails,
        children: (prev.familyDetails.children || []).filter((_, i) => i !== index)
      }
    }))
  }

  const updateChild = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      familyDetails: {
        ...prev.familyDetails,
        children: (prev.familyDetails.children || []).map((c, i) => i === index ? { ...c, [field]: value } : c)
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    
    const submissionData = {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      passportExpiryDate: formData.passportExpiryDate ? new Date(formData.passportExpiryDate) : undefined,
      medicalLicenseExpiryDate: formData.medicalLicenseExpiryDate ? new Date(formData.medicalLicenseExpiryDate) : undefined,
      workPermitExpiryDate: formData.workPermitExpiryDate ? new Date(formData.workPermitExpiryDate) : undefined,
      residenceIdExpiryDate: formData.residenceIdExpiryDate ? new Date(formData.residenceIdExpiryDate) : undefined,
      gender: formData.gender || undefined,
      permitType: formData.permitType || undefined,
      applicationType: formData.applicationType || undefined,
      currentStage: formData.currentStage || undefined,
      documentSections,
    }
    
    try {
      // Await the onSubmit - let parent control when to close the sheet
      await onSubmit(submissionData)
    } finally {
      setIsSubmitting(false)
    }
    // Don't close here - parent will close after successful save
  }

  const isEditMode = !!person
  const nationalities = ["Ethiopian", "American", "British", "Canadian", "Indian", "Kenyan", "Korean", "Chinese", "Other"]
  const showDependentsTab = formData.permitType === "RESIDENCE_ID"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5 text-green-500" />
            {isEditMode ? "Edit Foreigner Record" : "Add New Foreigner"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {isEditMode ? "Update foreigner details and documents." : "Enter foreigner details, select permit type, and upload required documents."}
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

          {/* Quick Scan Feature - Prominent AI Auto-fill Button */}
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setQuickScanOpen(true)}
              className="w-full border-dashed border-green-500/50 bg-green-500/5 hover:bg-green-500/10 text-green-400 hover:text-green-300 transition-all"
              disabled={isOcrLoading}
            >
              {isOcrLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning document...
                </>
              ) : (
                <>
                  <ScanLine className="h-4 w-4 mr-2" />
                  Quick Scan Document (AI Auto-fill)
                </>
              )}
            </Button>
          </div>
        </SheetHeader>

        {/* Quick Scan Dialog */}
        <Dialog open={quickScanOpen} onOpenChange={setQuickScanOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <ScanLine className="h-5 w-5 text-green-400" />
                Quick Scan Document
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Upload a document to automatically extract and fill form data using AI.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Document Type Selection */}
              <div className="space-y-2">
                <Label className="text-gray-300">Document Type</Label>
                <Select
                  value={quickScanDocType}
                  onValueChange={(v) => setQuickScanDocType(v as DocumentTypeForOcr)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="passport" className="text-white">Passport</SelectItem>
                    <SelectItem value="work_permit" className="text-white">Work Permit</SelectItem>
                    <SelectItem value="residence_id" className="text-white">Residence ID</SelectItem>
                    <SelectItem value="medical_license" className="text-white">Medical License</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Upload Area */}
              <div className="space-y-2">
                <Label className="text-gray-300">Upload Document</Label>
                <UploadDropzone
                  endpoint="permitDocumentUploader"
                  onClientUploadComplete={async (res) => {
                    if (res?.[0]?.url) {
                      await handleQuickScan(res[0].url)
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Upload failed: ${error.message}`)
                  }}
                  appearance={{
                    container: "border-gray-600 bg-gray-700/30 h-40",
                    button: "bg-green-600 hover:bg-green-700",
                    label: "text-gray-400",
                    allowedContent: "text-gray-500 text-xs",
                  }}
                />
              </div>

              {/* Supported Formats Note */}
              <div className="flex items-start gap-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-300">
                  Supports JPG, PNG, PDF, and other image formats. For best results, ensure the document is clear and well-lit.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setQuickScanOpen(false)}
                className="bg-gray-700 border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <form onSubmit={handleSubmit} className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${showDependentsTab ? 'grid-cols-3' : 'grid-cols-2'} bg-gray-700/50 mb-4`}>
              <TabsTrigger value="personal" className="data-[state=active]:bg-green-600 text-xs">
                <User className="h-3 w-3 mr-1" /> Personal
              </TabsTrigger>
              <TabsTrigger value="permit" className="data-[state=active]:bg-green-600 text-xs">
                <Briefcase className="h-3 w-3 mr-1" /> Permit
              </TabsTrigger>
              {showDependentsTab && (
                <TabsTrigger value="dependents" className="data-[state=active]:bg-green-600 text-xs">
                  <Users className="h-3 w-3 mr-1" /> Dependents
                </TabsTrigger>
              )}
            </TabsList>

            {/* ===================== PERSONAL TAB ===================== */}
            <TabsContent value="personal" className="space-y-4">
              {/* Profile Photo Upload */}
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-green-400 uppercase tracking-wider">Profile Photo</h4>
                  {formData.photoUrl && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, photoUrl: "" }))}
                      className="text-red-400 hover:text-red-300 h-7 text-[10px]">
                      Remove
                    </Button>
                  )}
                </div>
                
                {formData.photoUrl ? (
                  <div className="flex justify-center">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-green-500/50 shadow-lg glow-icon">
                      <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  </div>
                ) : (
                  <UploadDropzone
                    endpoint="permitDocumentUploader"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.url) {
                        setFormData(prev => ({ ...prev, photoUrl: res[0].url }))
                        toast.success("Profile photo uploaded")
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`Upload failed: ${error.message}`)
                    }}
                    appearance={{
                      container: "border-gray-600 bg-gray-700/30 h-32 py-2",
                      button: "bg-green-600 hover:bg-green-700 text-[10px] h-8 px-3",
                      label: "text-gray-400 text-xs",
                      allowedContent: "text-gray-500 text-[10px]",
                    }}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={`text-gray-300 flex items-center gap-1 ${isAutoFilled('firstName') ? 'text-green-400' : ''}`}>
                    First Name * {isAutoFilled('firstName') && <Sparkles className="h-3 w-3" />}
                  </Label>
                  <Input name="firstName" value={formData.firstName} onChange={handleChange}
                    placeholder="John"
                    className={`bg-gray-700 border-gray-600 text-white transition-all duration-500 ${
                      isAutoFilled('firstName') ? 'border-green-500 ring-2 ring-green-500/30 bg-green-500/10' : ''
                    }`} required />
                </div>
                <div className="space-y-2">
                  <Label className={`text-gray-300 flex items-center gap-1 ${isAutoFilled('lastName') ? 'text-green-400' : ''}`}>
                    Last Name * {isAutoFilled('lastName') && <Sparkles className="h-3 w-3" />}
                  </Label>
                  <Input name="lastName" value={formData.lastName} onChange={handleChange}
                    placeholder="Doe"
                    className={`bg-gray-700 border-gray-600 text-white transition-all duration-500 ${
                      isAutoFilled('lastName') ? 'border-green-500 ring-2 ring-green-500/30 bg-green-500/10' : ''
                    }`} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={`text-gray-300 flex items-center gap-1 ${isAutoFilled('nationality') ? 'text-green-400' : ''}`}>
                    Nationality {isAutoFilled('nationality') && <Sparkles className="h-3 w-3" />}
                  </Label>
                  <Select value={formData.nationality} onValueChange={(v) => handleSelectChange("nationality", v)}>
                    <SelectTrigger className={`bg-gray-700 border-gray-600 text-white transition-all duration-500 ${
                      isAutoFilled('nationality') ? 'border-green-500 ring-2 ring-green-500/30 bg-green-500/10' : ''
                    }`}>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {nationalities.map(n => <SelectItem key={n} value={n} className="text-white">{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={`text-gray-300 flex items-center gap-1 ${isAutoFilled('gender') ? 'text-green-400' : ''}`}>
                    Gender {isAutoFilled('gender') && <Sparkles className="h-3 w-3" />}
                  </Label>
                  <Select value={formData.gender} onValueChange={(v) => handleSelectChange("gender", v)}>
                    <SelectTrigger className={`bg-gray-700 border-gray-600 text-white transition-all duration-500 ${
                      isAutoFilled('gender') ? 'border-green-500 ring-2 ring-green-500/30 bg-green-500/10' : ''
                    }`}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="MALE" className="text-white">Male</SelectItem>
                      <SelectItem value="FEMALE" className="text-white">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={`text-gray-300 flex items-center gap-1 ${isAutoFilled('dateOfBirth') ? 'text-green-400' : ''}`}>
                    Date of Birth {isAutoFilled('dateOfBirth') && <Sparkles className="h-3 w-3" />}
                  </Label>
                  <Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                    className={`bg-gray-700 border-gray-600 text-white transition-all duration-500 ${
                      isAutoFilled('dateOfBirth') ? 'border-green-500 ring-2 ring-green-500/30 bg-green-500/10' : ''
                    }`} />
                </div>
                <div className="space-y-2">
                  <Label className={`text-gray-300 flex items-center gap-1 ${isAutoFilled('passportNo') ? 'text-green-400' : ''}`}>
                    Passport No. {isAutoFilled('passportNo') && <Sparkles className="h-3 w-3" />}
                  </Label>
                  <Input name="passportNo" value={formData.passportNo} onChange={handleChange}
                    placeholder="AB1234567"
                    className={`bg-gray-700 border-gray-600 text-white transition-all duration-500 ${
                      isAutoFilled('passportNo') ? 'border-green-500 ring-2 ring-green-500/30 bg-green-500/10' : ''
                    }`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Email</Label>
                  <Input type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="john@example.com" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Phone</Label>
                  <Input name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="+251..." className="bg-gray-700 border-gray-600 text-white" />
                </div>
              </div>
            </TabsContent>

            {/* ===================== PERMIT TAB ===================== */}
            <TabsContent value="permit" className="space-y-4">
              {/* Permit Type Selection */}
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-green-400 mb-3">Select Permit Type</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "MEDICAL_LICENSE", label: "Medical License", icon: Stethoscope },
                    { value: "WORK_PERMIT", label: "Work Permit", icon: Briefcase },
                    { value: "RESIDENCE_ID", label: "Residence ID", icon: Home },
                  ].map(type => (
                    <button key={type.value} type="button"
                      onClick={() => handleSelectChange("permitType", type.value)}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1
                        ${formData.permitType === type.value 
                          ? 'border-green-500 bg-green-500/20 text-green-400' 
                          : 'border-gray-600 hover:border-gray-500 text-gray-400'}`}>
                      <type.icon className="h-5 w-5" />
                      <span className="text-xs text-center">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Application Type */}
              {formData.permitType && (
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-sm font-medium text-green-400 mb-3">Application Type</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {["NEW", "RENEWAL"].map(type => (
                      <button key={type} type="button"
                        onClick={() => handleSelectChange("applicationType", type)}
                        className={`p-3 rounded-lg border-2 transition-all
                          ${formData.applicationType === type 
                            ? 'border-green-500 bg-green-500/20 text-green-400' 
                            : 'border-gray-600 hover:border-gray-500 text-gray-400'}`}>
                        <span className="text-sm font-medium">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage Progress */}
              {formData.permitType && formData.applicationType && (
                <>
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-green-400">Current Stage</h4>
                      <Select value={formData.currentStage} onValueChange={(v) => handleSelectChange("currentStage", v)}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-48 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {STAGES.map(s => <SelectItem key={s.value} value={s.value} className="text-white text-xs">{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <StageProgress currentStage={formData.currentStage} permitType={formData.permitType} />
                  </div>

                  {/* Document Checklist */}
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-sm font-medium text-green-400 mb-3">
                      Required Documents ({getDocumentRequirements().length} items)
                    </h4>
                    <DocumentChecklist
                      documents={getDocumentRequirements()}
                      documentSections={documentSections}
                      onToggleSection={handleToggleSection}
                      onAddFile={handleAddFile}
                      onRemoveFile={handleRemoveFile}
                      onOcrExtract={handleOcrExtract}
                      isOcrLoading={isOcrLoading}
                      onAddCustomDocument={handleAddCustomDocument}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            {/* ===================== DEPENDENTS TAB ===================== */}
            {showDependentsTab && (
              <TabsContent value="dependents" className="space-y-4">
                {/* Spouse Info */}
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-sm font-medium text-green-400 mb-3">Spouse Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300 text-xs">Spouse Name</Label>
                      <Input name="spouseName" value={formData.familyDetails.spouseName || ""} 
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          familyDetails: { ...prev.familyDetails, spouseName: e.target.value } 
                        }))}
                        placeholder="Full name" className="bg-gray-700 border-gray-600 text-white h-9" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300 text-xs">Spouse Phone</Label>
                      <Input name="spousePhone" value={formData.familyDetails.spousePhone || ""}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          familyDetails: { ...prev.familyDetails, spousePhone: e.target.value } 
                        }))}
                        placeholder="+251..." className="bg-gray-700 border-gray-600 text-white h-9" />
                    </div>
                  </div>
                </div>

                {/* Children */}
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-green-400">Children</h4>
                    <Button type="button" variant="outline" size="sm" onClick={addChild}
                      className="border-green-600/50 bg-green-600/10 hover:bg-green-600/20 text-green-400 h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Add Child
                    </Button>
                  </div>
                  
                  {(formData.familyDetails.children || []).length === 0 ? (
                    <p className="text-gray-500 text-xs text-center py-4">No children added</p>
                  ) : (
                    <div className="space-y-2">
                      {(formData.familyDetails.children || []).map((child, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-700/50 p-2 rounded">
                          <Input value={child.name} onChange={(e) => updateChild(idx, "name", e.target.value)}
                            placeholder="Name" className="bg-gray-600 border-gray-500 text-white h-8 text-xs flex-1" />
                          <Input value={child.age} onChange={(e) => updateChild(idx, "age", e.target.value)}
                            placeholder="Age" className="bg-gray-600 border-gray-500 text-white h-8 text-xs w-16" />
                          <Select value={child.gender} onValueChange={(v) => updateChild(idx, "gender", v)}>
                            <SelectTrigger className="bg-gray-600 border-gray-500 text-white h-8 text-xs w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="MALE" className="text-white text-xs">M</SelectItem>
                              <SelectItem value="FEMALE" className="text-white text-xs">F</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeChild(idx)}
                            className="text-red-400 hover:text-red-300 h-8 w-8 p-0">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dependent Documents */}
                {getDependentDocuments().length > 0 && (
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-sm font-medium text-green-400 mb-3">
                      Dependent Documents ({getDependentDocuments().length} items)
                    </h4>
                    <DocumentChecklist
                      documents={getDependentDocuments()}
                      documentSections={documentSections}
                      onToggleSection={handleToggleSection}
                      onAddFile={handleAddFile}
                      onRemoveFile={handleRemoveFile}
                      onOcrExtract={handleOcrExtract}
                      isOcrLoading={isOcrLoading}
                      onAddCustomDocument={handleAddCustomDocument}
                    />
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-700 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
              className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600"
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!formData.firstName || !formData.lastName || isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                isEditMode ? "Update Record" : "Add Foreigner"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>

      {/* OCR Preview Dialog - Shows extracted data before applying */}
      <Dialog open={ocrPreview?.isOpen || false} onOpenChange={(open) => !open && setOcrPreview(null)}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-400" />
              AI Scanned Data Preview
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Review and edit the extracted data below. Fields with existing values show a comparison.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 overflow-y-auto flex-1">
            {/* Scanned Document Preview */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Scanned Document
              </h4>
              {ocrPreview?.imageUrl && (
                <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-900">
                  {ocrPreview.imageUrl.toLowerCase().endsWith('.pdf') ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                      <File className="h-12 w-12 text-red-400 mb-2" />
                      <span className="text-gray-300 text-sm">PDF Document</span>
                      <span className="text-gray-500 text-xs mt-1 truncate max-w-full">
                        {ocrPreview.imageUrl.split('/').pop()}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={ocrPreview.imageUrl}
                      alt="Scanned document"
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  )}
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Document type: <span className="text-gray-300">{ocrPreview?.docType?.replace(/_/g, ' ').toUpperCase()}</span>
                </p>
                <Badge variant="outline" className="text-xs border-green-500/30 text-green-400 bg-green-500/10">
                  {Object.keys(ocrPreview?.editedData || {}).length} fields found
                </Badge>
              </div>
            </div>

            {/* Extracted Data Fields - Now Editable */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-green-400" />
                  Edit Before Applying
                </h4>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {Object.entries(ocrPreview?.editedData || {}).map(([field, value]) => {
                  const existingValue = formData[field as keyof PersonFormData] as string
                  const originalValue = ocrPreview?.data[field]
                  const isEdited = value !== originalValue
                  const hasExistingValue = existingValue && existingValue !== value

                  return (
                    <div key={field} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-400 font-medium">{getFieldLabel(field)}</label>
                        <div className="flex items-center gap-1">
                          {isEdited && (
                            <button
                              type="button"
                              onClick={() => handleResetField(field)}
                              className="p-1 text-gray-500 hover:text-amber-400 transition-colors"
                              title="Reset to original"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Editable Input */}
                      <Input
                        value={value}
                        onChange={(e) => handlePreviewFieldEdit(field, e.target.value)}
                        className={`bg-gray-600 border-gray-500 text-white h-9 text-sm ${
                          isEdited ? 'border-amber-500/50' : ''
                        }`}
                      />

                      {/* Show existing value comparison if different */}
                      {hasExistingValue && (
                        <div className="flex items-start gap-2 p-2 bg-amber-900/20 border border-amber-500/30 rounded text-xs">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-amber-300">Current value: </span>
                            <span className="text-gray-300">{existingValue}</span>
                            <span className="text-gray-500 block mt-0.5">Will be replaced with new value</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {Object.keys(ocrPreview?.editedData || {}).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-8 w-8 text-gray-500 mb-2" />
                  <p className="text-gray-500 text-sm">No data could be extracted.</p>
                  <p className="text-gray-600 text-xs mt-1">Try a clearer image or different document type.</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary Banner */}
          {Object.keys(ocrPreview?.editedData || {}).length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-green-300">
                  Ready to apply {Object.keys(ocrPreview?.editedData || {}).length} fields to the form
                </p>
                <p className="text-xs text-gray-400">
                  {Object.entries(ocrPreview?.editedData || {}).filter(([field]) => {
                    const existingValue = formData[field as keyof PersonFormData] as string
                    return existingValue && existingValue !== ocrPreview?.editedData[field]
                  }).length > 0 && (
                    <>Some existing values will be replaced.</>
                  )}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={() => setOcrPreview(null)}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyOcrData}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={Object.keys(ocrPreview?.editedData || {}).length === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              Apply {Object.keys(ocrPreview?.editedData || {}).length} Fields
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  )
}
