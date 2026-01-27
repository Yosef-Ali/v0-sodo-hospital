"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, FileText, ClipboardList, Globe, CheckCircle, Copy, Check, Sparkles, CheckCircle2, RefreshCw } from "lucide-react"
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
  { value: "customs_clearance", label: "Customs Clearance", icon: RefreshCw },
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
  customs_clearance: [
    { value: "DOCUMENT_COLLECTION", label: "Document Collection" },
    { value: "SUBMISSION", label: "Submission" },
    { value: "ASSESSMENT", label: "Assessment" },
    { value: "RELEASE", label: "Release" },
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
  customs_clearance: [
    { value: "commercial_invoice", label: "Commercial Invoice" },
    { value: "packing_list", label: "Packing List" },
    { value: "certificate_of_origin", label: "Certificate of Origin" },
    { value: "donation_certificate", label: "Donation Certificate" },
    { value: "release_order", label: "Release Order" },
    { value: "franco_letter", label: "Franco Letter" },
    { value: "bill_of_lading", label: "Bill of Lading / AWB" },
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
  const [ticketCopied, setTicketCopied] = useState(false)
  
  // OCR Preview state
  const [ocrPreview, setOcrPreview] = useState<{
    isOpen: boolean
    data: Record<string, string>
    editedData: Record<string, string>
    docType: string
  } | null>(null)

  // Get ticket number from permit prop
  const ticketNumber = permit?.ticketNumber || ""

  // OCR Auto-fill hook
  const { extractFromImage, isLoading: isOcrLoading } = useOcrAutoFill()

  // OCR extraction handler for Bill of Lading / AWB - now shows preview
  const handleOcrExtract = async (docType: string, imageUrl: string) => {
    if (docType !== "bill_of_lading") return

    const result = await extractFromImage(imageUrl, "bill_of_lading")
    
    if (result.success && result.data) {
      const mappedFields = mapOcrToImportForm(result.data)
      
      if (Object.keys(mappedFields).length > 0) {
        setOcrPreview({
          isOpen: true,
          data: mappedFields,
          editedData: { ...mappedFields },
          docType: docType
        })
        toast.success('Document scanned successfully!', {
          description: 'Please review and confirm the extracted data'
        })
      }
    } else if (result.error) {
      toast.error('OCR extraction failed', { description: result.error })
    }
  }

  // Apply OCR data after user confirmation
  const handleApplyOcrData = () => {
    if (ocrPreview?.editedData) {
      setFormData(prev => ({ ...prev, ...ocrPreview.editedData }))
      toast.success(`Applied ${Object.keys(ocrPreview.editedData).length} fields from document`)
      setOcrPreview(null)
    }
  }

  // Edit field in preview
  const handlePreviewFieldEdit = (field: string, value: string) => {
    if (ocrPreview) {
      setOcrPreview({ ...ocrPreview, editedData: { ...ocrPreview.editedData, [field]: value } })
    }
  }

  // Reset field to original
  const handleResetField = (field: string) => {
    if (ocrPreview && ocrPreview.data[field]) {
      setOcrPreview({ ...ocrPreview, editedData: { ...ocrPreview.editedData, [field]: ocrPreview.data[field] } })
    }
  }

  // Get field label
  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      title: 'Title', supplierName: 'Supplier Name', supplierCountry: 'Supplier Country',
      itemDescription: 'Item Description', estimatedValue: 'Estimated Value', currency: 'Currency'
    }
    return labels[field] || field
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
      let firstStage = "DOCUMENT_ARRANGEMENT"
      if (value === "pip") firstStage = "SUPPORT_LETTER"
      if (value === "customs_clearance") firstStage = "DOCUMENT_COLLECTION"
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
      category: formData.importType, // Map importType to category for the action
      documentSections,
      documents: documentSections.flatMap(s => s.files),
    }
    onSubmit(submissionData)
    // Don't close here - parent handles closing after async operation completes
  }

  const isEditMode = !!permit
  const currencies = ["USD", "EUR", "GBP", "ETB", "CNY"]
  const countries = ["China", "USA", "Germany", "India", "Japan", "UAE", "Kenya", "Other"]

  return (
    <>
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

    {/* OCR Preview Dialog */}
    <Dialog open={ocrPreview?.isOpen || false} onOpenChange={(open) => !open && setOcrPreview(null)}>
      <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-400" />
            AI Scanned Data Preview
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Review and edit the extracted data below. Click "Apply" to fill the form.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4 max-h-80 overflow-y-auto">
          {Object.entries(ocrPreview?.editedData || {}).map(([field, value]) => {
            const isEdited = value !== ocrPreview?.data[field]
            return (
              <div key={field} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400 font-medium">{getFieldLabel(field)}</label>
                  {isEdited && (
                    <button type="button" onClick={() => handleResetField(field)}
                      className="p-1 text-gray-500 hover:text-amber-400 transition-colors" title="Reset">
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <Input value={value} onChange={(e) => handlePreviewFieldEdit(field, e.target.value)}
                  className={`bg-gray-600 border-gray-500 text-white h-9 text-sm ${isEdited ? 'border-amber-500/50' : ''}`} />
              </div>
            )
          })}
        </div>

        {Object.keys(ocrPreview?.editedData || {}).length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <p className="text-sm text-green-300">Ready to apply {Object.keys(ocrPreview?.editedData || {}).length} fields</p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOcrPreview(null)} className="bg-gray-700 border-gray-600">Cancel</Button>
          <Button onClick={handleApplyOcrData} className="bg-green-600 hover:bg-green-700"
            disabled={Object.keys(ocrPreview?.editedData || {}).length === 0}>
            <Check className="h-4 w-4 mr-2" /> Apply {Object.keys(ocrPreview?.editedData || {}).length} Fields
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

// Keep backward compatibility export
export { ImportSheet as ImportTaskSheet }
