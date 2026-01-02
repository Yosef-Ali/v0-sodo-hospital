"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, FileText, Users, Plus, Trash2, X, File, Check, Circle, Briefcase, Home, Stethoscope, Loader2, Sparkles } from "lucide-react"
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
  onSubmit: (data: any) => void
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
  const [showCompleted, setShowCompleted] = useState(false)
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
        
        {hasFiles && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {section?.files.map((url, idx) => (
              <DocumentPreview key={idx} url={url} index={idx} onRemove={() => onRemoveFile(doc.value, idx)} />
            ))}
          </div>
        )}
        
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

      {/* Completed Section */}
      {completedDocs.length > 0 && (
        <div>
          <button 
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-xs text-green-400 hover:text-green-300 mb-2 w-full"
          >
            <Check className="h-3 w-3" />
            <span>Completed ({completedDocs.length})</span>
            <span className="text-gray-500">{showCompleted ? '▼' : '▶'}</span>
          </button>
          {showCompleted && (
            <div className="space-y-2 pl-2 border-l-2 border-green-600/30">
              {completedDocs.map(doc => renderDocumentItem(doc))}
            </div>
          )}
        </div>
      )}

      {/* Remaining Section */}
      {remainingDocs.length > 0 && (
        <div>
          <button 
            type="button"
            onClick={() => setShowRemaining(!showRemaining)}
            className="flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 mb-2 w-full"
          >
            <Circle className="h-3 w-3" />
            <span>Remaining ({remainingDocs.length})</span>
            <span className="text-gray-500">{showRemaining ? '▼' : '▶'}</span>
          </button>
          {showRemaining && (
            <div className="space-y-2 pl-2 border-l-2 border-amber-600/30">
              {remainingDocs.map(doc => renderDocumentItem(doc))}
            </div>
          )}
        </div>
      )}

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

  // OCR Auto-fill hook
  const { extractFromImage, isLoading: isOcrLoading } = useOcrAutoFill()

  // OCR extraction handler
  const handleOcrExtract = async (docType: string, imageUrl: string) => {
    const ocrDocType = OCR_DOCUMENT_TYPES[docType]
    if (!ocrDocType) return

    const result = await extractFromImage(imageUrl, ocrDocType)
    
    if (result.success && result.data) {
      const mappedFields = mapOcrToPersonForm(result.data, ocrDocType)
      
      if (Object.keys(mappedFields).length > 0) {
        setFormData(prev => ({
          ...prev,
          ...mappedFields,
        }))
        
        const fieldCount = Object.keys(mappedFields).length
        toast.success(`Auto-filled ${fieldCount} field${fieldCount > 1 ? 's' : ''} from document`, {
          description: Object.keys(mappedFields).join(', ')
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
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
    
    onSubmit(submissionData)
    onOpenChange(false)
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
        </SheetHeader>

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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">First Name *</Label>
                  <Input name="firstName" value={formData.firstName} onChange={handleChange}
                    placeholder="John" className="bg-gray-700 border-gray-600 text-white" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Last Name *</Label>
                  <Input name="lastName" value={formData.lastName} onChange={handleChange}
                    placeholder="Doe" className="bg-gray-700 border-gray-600 text-white" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Nationality</Label>
                  <Select value={formData.nationality} onValueChange={(v) => handleSelectChange("nationality", v)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {nationalities.map(n => <SelectItem key={n} value={n} className="text-white">{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleSelectChange("gender", v)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
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
                  <Label className="text-gray-300">Date of Birth</Label>
                  <Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Passport No.</Label>
                  <Input name="passportNo" value={formData.passportNo} onChange={handleChange}
                    placeholder="AB1234567" className="bg-gray-700 border-gray-600 text-white" />
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
              className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!formData.firstName || !formData.lastName}>
              {isEditMode ? "Update Record" : "Add Foreigner"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
