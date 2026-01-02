"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, FileText, ClipboardList, X, Plus, File, Trash2 } from "lucide-react"
import { UploadDropzone } from "@/lib/uploadthing-utils"

interface ImportSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  task?: any
}

interface DocumentSection {
  id: string
  type: string
  customTitle?: string
  files: string[]
}

// Document Preview Component
function DocumentPreview({ 
  url, 
  index,
  onRemove 
}: { 
  url: string
  index: number
  onRemove: () => void 
}) {
  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  
  return (
    <div className="relative group">
      <div className="border border-gray-600 rounded-lg p-2 bg-gray-700/50 h-24">
        {isImage ? (
          <img 
            src={url} 
            alt={`Document ${index + 1}`}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <File className="h-6 w-6 mb-1" />
            <span className="text-[10px] text-center truncate w-full px-1">PDF</span>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

// Dynamic Document Section Component
function DynamicDocumentSection({
  section,
  documentTypes,
  onUpdateType,
  onUpdateCustomTitle,
  onAddFile,
  onRemoveFile,
  onRemoveSection
}: {
  section: DocumentSection
  documentTypes: { value: string; label: string }[]
  onUpdateType: (type: string) => void
  onUpdateCustomTitle: (title: string) => void
  onAddFile: (url: string) => void
  onRemoveFile: (index: number) => void
  onRemoveSection: () => void
}) {
  const [showUploader, setShowUploader] = useState(false)
  
  // Check if document type is selected (required)
  const isTypeSelected = section.type && (section.type !== "custom" || section.customTitle)

  return (
    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <Label className="text-gray-300 text-xs">
            Document Type <span className="text-red-400">*</span>
          </Label>
          <Select value={section.type} onValueChange={onUpdateType}>
            <SelectTrigger className={`bg-gray-700 border-gray-600 text-white h-9 ${!section.type ? 'border-red-500/50' : ''}`}>
              <SelectValue placeholder="Select document type (required)" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {documentTypes.map((dt) => (
                <SelectItem key={dt.value} value={dt.value} className="text-white">{dt.label}</SelectItem>
              ))}
              <SelectItem value="custom" className="text-white border-t border-gray-600 mt-1 pt-1">
                <span className="flex items-center"><Plus className="h-3 w-3 mr-2" /> Custom Title</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemoveSection}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-5"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Custom title input */}
      {section.type === "custom" && (
        <div className="space-y-2">
          <Label className="text-gray-300 text-xs">
            Custom Document Title <span className="text-red-400">*</span>
          </Label>
          <Input
            value={section.customTitle || ""}
            onChange={(e) => onUpdateCustomTitle(e.target.value)}
            placeholder="Enter document title (required)..."
            className={`bg-gray-700 border-gray-600 text-white h-9 ${section.type === 'custom' && !section.customTitle ? 'border-red-500/50' : ''}`}
          />
        </div>
      )}
      
      {/* Uploaded Files Grid */}
      {section.files.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {section.files.map((url, index) => (
            <DocumentPreview
              key={index}
              url={url}
              index={index}
              onRemove={() => onRemoveFile(index)}
            />
          ))}
        </div>
      )}
      
      {/* Upload Area - Only show if type is selected */}
      {!isTypeSelected ? (
        <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-md p-3 text-center">
          ⚠️ Please select a document type first to enable upload
        </div>
      ) : showUploader ? (
        <div className="relative">
          <UploadDropzone
            endpoint="permitDocumentUploader"
            onClientUploadComplete={(res) => {
              if (res) {
                res.forEach((file) => {
                  if (file.url) onAddFile(file.url)
                })
              }
              setShowUploader(false)
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error)
              setShowUploader(false)
            }}
            className="ut-label:text-gray-400 ut-allowed-content:text-gray-500 ut-button:bg-green-600 ut-button:hover:bg-green-700 border-gray-600 bg-gray-700/30"
          />
          <button
            type="button"
            onClick={() => setShowUploader(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowUploader(true)}
          className="w-full border-dashed border-gray-600 bg-gray-700/30 hover:bg-gray-700/50 text-gray-400"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      )}
    </div>
  )
}

export function ImportTaskSheet({ open, onOpenChange, onSubmit, task }: ImportSheetProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    status: "pending",
    dueDate: "",
    assigneeId: "",
    // PIP specific fields
    proformaInvoiceNo: "",
    proformaDate: "",
    proformaValue: "",
    supplierName: "",
    supplierCountry: "",
    itemDescription: "",
    hsCode: "",
    quantity: "",
    unitPrice: "",
  })

  // Dynamic document sections
  const [documentSections, setDocumentSections] = useState<DocumentSection[]>([])

  // Document types per category
  const getDocumentTypes = () => {
    if (formData.category === "pip") {
      return [
        { value: "support_letter", label: "Support Letter from Region" },
        { value: "official_letter", label: "Official Letter" },
        { value: "proforma_invoice", label: "Proforma Invoice" },
        { value: "donation", label: "Donation Letter" },
        { value: "coo", label: "COO (Certificate of Origin)" },
        { value: "coc_soddo", label: "COC (Soddo)" },
        { value: "coc", label: "COC" },
      ]
    } else if (formData.category === "single_window") {
      return [
        { value: "pip_certificate", label: "PIP Certificate" },
        { value: "commercial_invoice", label: "Commercial Invoice" },
        { value: "packing_list", label: "Packing List" },
        { value: "donation", label: "Donation Letter" },
        { value: "awb_coo", label: "AWB-COO" },
        { value: "gmp", label: "GMP Certificate" },
      ]
    }
    return []
  }

  const countries = [
    { value: "USA", label: "United States" },
    { value: "China", label: "China" },
    { value: "India", label: "India" },
    { value: "Germany", label: "Germany" },
    { value: "UK", label: "United Kingdom" },
    { value: "UAE", label: "United Arab Emirates" },
    { value: "Kenya", label: "Kenya" },
    { value: "Other", label: "Other" },
  ]

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        category: task.category || "",
        status: task.status || "pending",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        assigneeId: task.assigneeId || "",
        proformaInvoiceNo: task.proformaInvoiceNo || "",
        proformaDate: task.proformaDate || "",
        proformaValue: task.proformaValue || "",
        supplierName: task.supplierName || "",
        supplierCountry: task.supplierCountry || "",
        itemDescription: task.itemDescription || "",
        hsCode: task.hsCode || "",
        quantity: task.quantity || "",
        unitPrice: task.unitPrice || "",
      })
      setDocumentSections(task.documentSections || [])
    } else {
      setFormData({
        title: "",
        description: "",
        category: "",
        status: "pending",
        dueDate: "",
        assigneeId: "",
        proformaInvoiceNo: "",
        proformaDate: "",
        proformaValue: "",
        supplierName: "",
        supplierCountry: "",
        itemDescription: "",
        hsCode: "",
        quantity: "",
        unitPrice: "",
      })
      setDocumentSections([])
    }
    setActiveTab("basic")
  }, [task, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addDocumentSection = () => {
    const newSection: DocumentSection = {
      id: Date.now().toString(),
      type: "",
      files: [],
    }
    setDocumentSections([...documentSections, newSection])
  }

  const updateDocumentSection = (id: string, updates: Partial<DocumentSection>) => {
    setDocumentSections(documentSections.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ))
  }

  const removeDocumentSection = (id: string) => {
    setDocumentSections(documentSections.filter(s => s.id !== id))
  }

  const addFileToSection = (id: string, url: string) => {
    setDocumentSections(documentSections.map(s => 
      s.id === id ? { ...s, files: [...s.files, url] } : s
    ))
  }

  const removeFileFromSection = (sectionId: string, fileIndex: number) => {
    setDocumentSections(documentSections.map(s => 
      s.id === sectionId ? { ...s, files: s.files.filter((_, i) => i !== fileIndex) } : s
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const allDocuments = documentSections.flatMap(s => s.files)
    onSubmit(task ? { 
      ...formData, 
      id: task.id, 
      documents: allDocuments,
      documentSections 
    } : { 
      ...formData, 
      documents: allDocuments,
      documentSections 
    })
    onOpenChange(false)
  }

  const isEditMode = !!task

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">
            {isEditMode ? "Edit Import Permit" : "Add New Import Permit"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {isEditMode
              ? "Update the import permit details and required documents."
              : "Fill in the import permit details and upload required documents (multiple per section)."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700/50 mb-6">
              <TabsTrigger value="basic" className="data-[state=active]:bg-green-600 text-xs">
                <Package className="h-3 w-3 mr-1" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="supplier" className="data-[state=active]:bg-green-600 text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Supplier & Items
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-green-600 text-xs">
                <ClipboardList className="h-3 w-3 mr-1" />
                Documents
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              {/* Permit Type */}
              <div className="space-y-2">
                <Label className="text-gray-300">Permit Type *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData({ ...formData, category: value })
                    setDocumentSections([])
                  }}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select permit type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="pip" className="text-white">Pre Import Permit (PIP)</SelectItem>
                    <SelectItem value="single_window" className="text-white">Ethiopia Single Window</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Permit Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Medical Equipment Import - Q1 2026"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the import permit purpose and contents..."
                  className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                />
              </div>

              {/* Status & Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="pending" className="text-white">Pending</SelectItem>
                      <SelectItem value="in-progress" className="text-white">In Progress</SelectItem>
                      <SelectItem value="completed" className="text-white">Completed</SelectItem>
                      <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-gray-300">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Supplier & Items Tab */}
            <TabsContent value="supplier" className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-green-400 mb-4 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Proforma Invoice Details
                </h4>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proformaInvoiceNo" className="text-gray-300">Proforma Invoice No.</Label>
                      <Input
                        id="proformaInvoiceNo"
                        name="proformaInvoiceNo"
                        value={formData.proformaInvoiceNo}
                        onChange={handleChange}
                        placeholder="PI-2026-001"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proformaDate" className="text-gray-300">Proforma Date</Label>
                      <Input
                        id="proformaDate"
                        name="proformaDate"
                        type="date"
                        value={formData.proformaDate}
                        onChange={handleChange}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proformaValue" className="text-gray-300">Total Value (USD)</Label>
                    <Input
                      id="proformaValue"
                      name="proformaValue"
                      value={formData.proformaValue}
                      onChange={handleChange}
                      placeholder="25,000.00"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-green-400 mb-4">Supplier Information</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplierName" className="text-gray-300">Supplier Name</Label>
                    <Input
                      id="supplierName"
                      name="supplierName"
                      value={formData.supplierName}
                      onChange={handleChange}
                      placeholder="Medical Supplies Co."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Supplier Country</Label>
                    <Select
                      value={formData.supplierCountry}
                      onValueChange={(value) => setFormData({ ...formData, supplierCountry: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {countries.map((c) => (
                          <SelectItem key={c.value} value={c.value} className="text-white">{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-green-400 mb-4">Item Details</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemDescription" className="text-gray-300">Item Description</Label>
                    <Textarea
                      id="itemDescription"
                      name="itemDescription"
                      value={formData.itemDescription}
                      onChange={handleChange}
                      placeholder="Describe the items being imported..."
                      className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hsCode" className="text-gray-300">HS Code</Label>
                      <Input
                        id="hsCode"
                        name="hsCode"
                        value={formData.hsCode}
                        onChange={handleChange}
                        placeholder="9018.90"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-gray-300">Quantity</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="100"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitPrice" className="text-gray-300">Unit Price</Label>
                      <Input
                        id="unitPrice"
                        name="unitPrice"
                        value={formData.unitPrice}
                        onChange={handleChange}
                        placeholder="250.00"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Documents Tab - Dynamic */}
            <TabsContent value="documents" className="space-y-4">
              {formData.category ? (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-green-400 flex items-center">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Document Sections
                    </h4>
                    <span className="text-xs text-gray-500">{documentSections.length} section(s)</span>
                  </div>

                  {/* Document Sections */}
                  <div className="space-y-4">
                    {documentSections.map((section) => (
                      <DynamicDocumentSection
                        key={section.id}
                        section={section}
                        documentTypes={getDocumentTypes()}
                        onUpdateType={(type) => updateDocumentSection(section.id, { type })}
                        onUpdateCustomTitle={(title) => updateDocumentSection(section.id, { customTitle: title })}
                        onAddFile={(url) => addFileToSection(section.id, url)}
                        onRemoveFile={(index) => removeFileFromSection(section.id, index)}
                        onRemoveSection={() => removeDocumentSection(section.id)}
                      />
                    ))}
                  </div>

                  {/* Add Document Section Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDocumentSection}
                    className="w-full border-dashed border-green-600/50 bg-green-600/10 hover:bg-green-600/20 text-green-400"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document Section
                  </Button>
                </>
              ) : (
                <div className="bg-gray-700/30 rounded-lg p-8 border border-gray-700 text-center">
                  <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Please select a permit type first to see required documents.</p>
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
              disabled={!formData.category || !formData.title}>
              {isEditMode ? "Update Import Permit" : "Add Import Permit"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
