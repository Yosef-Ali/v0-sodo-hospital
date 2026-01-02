"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, FileText, ClipboardList, Globe, CheckCircle } from "lucide-react"
import { SmartDocumentChecklist, StageProgress, DocumentSection as DocSection } from "@/components/ui/smart-document-checklist"
import { useOcrAutoFill, mapOcrToImportForm } from "@/lib/hooks/use-ocr-autofill"
import { toast } from "sonner"

// OCR-enabled document types (Bill of Lading/AWB contains import info)
const OCR_DOCUMENT_TYPES: Record<string, string> = {
  bill_of_lading: "bill_of_lading",
}

// ===================== CONFIG =====================

const IMPORT_TYPES = [
  { value: "pip", label: "PIP Certificate", icon: CheckCircle },
  { value: "single_window", label: "Single Window", icon: Globe },
]

const STAGES = {
  pip: [
    { value: "SUPPORT_LETTER", label: "Support Letter" },
    { value: "PIP_APPLICATION", label: "PIP Application" },
    { value: "DOCUMENT_ARRANGEMENT", label: "Documents" },
    { value: "SUBMIT", label: "Submit" },
    { value: "APPROVED", label: "Approved" },
  ],
  single_window: [
    { value: "DOCUMENT_ARRANGEMENT", label: "Documents" },
    { value: "APPLY_ONLINE", label: "Apply Online" },
    { value: "SUBMIT", label: "Submit" },
    { value: "APPROVED", label: "Approved" },
  ],
}

const DOCUMENT_REQUIREMENTS = {
  pip: [
    { value: "pip_certificate", label: "PIP Certificate" },
    { value: "support_letter", label: "Support Letter" },
    { value: "proforma_invoice", label: "Proforma Invoice" },
    { value: "business_license", label: "Business License" },
    { value: "tin", label: "TIN Number" },
    { value: "delegation_id", label: "Delegation with ID" },
  ],
  single_window: [
    { value: "commercial_invoice", label: "Commercial Invoice" },
    { value: "packing_list", label: "Packing List" },
    { value: "bill_of_lading", label: "Bill of Lading / AWB" },
    { value: "insurance_cert", label: "Insurance Certificate" },
    { value: "business_license", label: "Business License" },
    { value: "tin", label: "TIN Number" },
    { value: "delegation_id", label: "Delegation with ID" },
  ],
}

// ===================== INTERFACES =====================

interface ImportSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  permit?: any
}

interface DocumentSection {
  id: string
  type: string
  customTitle?: string
  files: string[]
}

// ===================== MAIN COMPONENT =====================

export function ImportSheet({ open, onOpenChange, onSubmit, permit }: ImportSheetProps) {
  const [activeTab, setActiveTab] = useState("basic")
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    supplierName: "",
    supplierCountry: "",
    itemDescription: "",
    estimatedValue: "",
    currency: "USD",
    importType: "",
    currentStage: "SUPPORT_LETTER",
    notes: "",
  })
  
  const [documentSections, setDocumentSections] = useState<DocumentSection[]>([])

  // OCR Auto-fill hook
  const { extractFromImage, isLoading: isOcrLoading } = useOcrAutoFill()

  // OCR extraction handler for Bill of Lading / AWB
  const handleOcrExtract = async (docType: string, imageUrl: string) => {
    if (docType !== "bill_of_lading") return

    const result = await extractFromImage(imageUrl, "bill_of_lading")
    
    if (result.success && result.data) {
      const mappedFields = mapOcrToImportForm(result.data)
      
      if (Object.keys(mappedFields).length > 0) {
        setFormData(prev => ({ ...prev, ...mappedFields }))
        
        const fieldCount = Object.keys(mappedFields).length
        toast.success(`Auto-filled ${fieldCount} field${fieldCount > 1 ? 's' : ''} from Bill of Lading`, {
          description: Object.keys(mappedFields).join(', ')
        })
      }
    } else if (result.error) {
      toast.error('OCR extraction failed', { description: result.error })
    }
  }

  useEffect(() => {
    if (permit) {
      setFormData({
        title: permit.title || "",
        description: permit.description || "",
        supplierName: permit.supplierName || "",
        supplierCountry: permit.supplierCountry || "",
        itemDescription: permit.itemDescription || "",
        estimatedValue: permit.estimatedValue || "",
        currency: permit.currency || "USD",
        importType: permit.importType || permit.category || "",
        currentStage: permit.currentStage || "SUPPORT_LETTER",
        notes: permit.notes || "",
      })
      setDocumentSections(permit.documentSections || [])
    } else {
      setFormData({
        title: "", description: "", supplierName: "", supplierCountry: "",
        itemDescription: "", estimatedValue: "", currency: "USD",
        importType: "", currentStage: "SUPPORT_LETTER", notes: "",
      })
      setDocumentSections([])
    }
    setActiveTab("basic")
  }, [permit, open])

  // Get document requirements based on import type
  const getDocumentRequirements = () => {
    if (!formData.importType) return []
    return DOCUMENT_REQUIREMENTS[formData.importType as keyof typeof DOCUMENT_REQUIREMENTS] || []
  }

  // Get stages based on import type
  const getStages = () => {
    if (!formData.importType) return []
    return STAGES[formData.importType as keyof typeof STAGES] || []
  }

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === "importType") {
      setDocumentSections([])
      const firstStage = value === "pip" ? "SUPPORT_LETTER" : "DOCUMENT_ARRANGEMENT"
      setFormData(prev => ({ ...prev, currentStage: firstStage }))
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submissionData = {
      ...formData,
      documentSections,
      documents: documentSections.flatMap(s => s.files),
    }
    onSubmit(submissionData)
    onOpenChange(false)
  }

  const isEditMode = !!permit
  const currencies = ["USD", "EUR", "GBP", "ETB", "CNY"]
  const countries = ["China", "USA", "Germany", "India", "Japan", "UAE", "Kenya", "Other"]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-green-500" />
            {isEditMode ? "Edit Import Permit" : "Add New Import Permit"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {isEditMode ? "Update import permit details and documents." : "Enter import details, select type, and upload required documents."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700/50 mb-4">
              <TabsTrigger value="basic" className="data-[state=active]:bg-green-600 text-xs">
                <Package className="h-3 w-3 mr-1" /> Basic Info
              </TabsTrigger>
              <TabsTrigger value="process" className="data-[state=active]:bg-green-600 text-xs">
                <FileText className="h-3 w-3 mr-1" /> Process & Docs
              </TabsTrigger>
            </TabsList>

            {/* ===================== BASIC TAB ===================== */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Title *</Label>
                <Input name="title" value={formData.title} onChange={handleChange}
                  placeholder="Import permit title" className="bg-gray-700 border-gray-600 text-white" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Supplier Name</Label>
                  <Input name="supplierName" value={formData.supplierName} onChange={handleChange}
                    placeholder="Supplier name" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Supplier Country</Label>
                  <Select value={formData.supplierCountry} onValueChange={(v) => handleSelectChange("supplierCountry", v)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {countries.map(c => <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Item Description</Label>
                <Textarea name="itemDescription" value={formData.itemDescription} onChange={handleChange}
                  placeholder="Describe the items being imported..." className="bg-gray-700 border-gray-600 text-white min-h-[80px]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Estimated Value</Label>
                  <Input name="estimatedValue" value={formData.estimatedValue} onChange={handleChange}
                    placeholder="10,000" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Currency</Label>
                  <Select value={formData.currency} onValueChange={(v) => handleSelectChange("currency", v)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {currencies.map(c => <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* ===================== PROCESS TAB ===================== */}
            <TabsContent value="process" className="space-y-4">
              {/* Import Type Selection */}
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-green-400 mb-3">Select Import Type</h4>
                <div className="grid grid-cols-2 gap-2">
                  {IMPORT_TYPES.map(type => (
                    <button key={type.value} type="button"
                      onClick={() => handleSelectChange("importType", type.value)}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2
                        ${formData.importType === type.value 
                          ? 'border-green-500 bg-green-500/20 text-green-400' 
                          : 'border-gray-600 hover:border-gray-500 text-gray-400'}`}>
                      <type.icon className="h-4 w-4" />
                      <span className="text-xs">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stage Progress */}
              {formData.importType && (
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
              {formData.importType && (
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
              disabled={!formData.title}>
              {isEditMode ? "Update Import" : "Add Import"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// Keep backward compatibility export
export { ImportSheet as ImportTaskSheet }
