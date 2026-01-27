"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, FileText, ClipboardList, BadgeCheck, X, Plus, File, Trash2 } from "lucide-react"
import { UploadDropzone } from "@/lib/uploadthing-utils"

interface CompanySheetProps {
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

export function CompanyTaskSheet({ open, onOpenChange, onSubmit, task }: CompanySheetProps) {
  const [activeTab, setActiveTab] = useState("company")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stage: "document_prep",
    status: "pending",
    dueDate: "",
    assigneeId: "",
    // Company specific fields
    companyName: "",
    registrationType: "",
    tinNumber: "",
    businessLicenseNo: "",
    registrationDate: "",
    legalRepresentative: "",
    businessAddress: "",
    businessSector: "",
    capitalAmount: "",
  })
  
  // Dynamic document sections
  const [documentSections, setDocumentSections] = useState<DocumentSection[]>([])

  // Document types for company registration
  const documentTypes = [
    { value: "official_letter", label: "Official Letter" },
    { value: "business_license", label: "Business License" },
    { value: "coc", label: "COC (Certificate of Competence)" },
    { value: "business_registration", label: "Business Registration" },
    { value: "tin_number", label: "TIN Number" },
    { value: "delegation_kebele", label: "Delegation & ID (Kebele)" },
    { value: "delegation_work", label: "Delegation & ID (Work)" },
  ]

  const businessSectors = [
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "ngo", label: "NGO/Non-Profit" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "services", label: "Services" },
    { value: "other", label: "Other" },
  ]

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        stage: task.stage || "document_prep",
        status: task.status || "pending",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        assigneeId: task.assigneeId || "",
        companyName: task.companyName || "",
        registrationType: task.registrationType || "",
        tinNumber: task.tinNumber || "",
        businessLicenseNo: task.businessLicenseNo || "",
        registrationDate: task.registrationDate || "",
        legalRepresentative: task.legalRepresentative || "",
        businessAddress: task.businessAddress || "",
        businessSector: task.businessSector || "",
        capitalAmount: task.capitalAmount || "",
      })
      setDocumentSections(task.documentSections || [])
    } else {
      setFormData({
        title: "",
        description: "",
        stage: "document_prep",
        status: "pending",
        dueDate: "",
        assigneeId: "",
        companyName: "",
        registrationType: "",
        tinNumber: "",
        businessLicenseNo: "",
        registrationDate: "",
        legalRepresentative: "",
        businessAddress: "",
        businessSector: "",
        capitalAmount: "",
      })
      setDocumentSections([])
    }
    setActiveTab("company")
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
            {isEditMode ? "Edit Registration" : "Add New Company Registration"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {isEditMode
              ? "Update company registration details and documents."
              : "Fill in company details and upload required documents (multiple per section)."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700/50 mb-6">
              <TabsTrigger value="company" className="data-[state=active]:bg-green-600 text-xs">
                <Building2 className="h-3 w-3 mr-1" />
                Company Info
              </TabsTrigger>
              <TabsTrigger value="registration" className="data-[state=active]:bg-green-600 text-xs">
                <BadgeCheck className="h-3 w-3 mr-1" />
                Registration
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-green-600 text-xs">
                <ClipboardList className="h-3 w-3 mr-1" />
                Documents
              </TabsTrigger>
            </TabsList>

            {/* Company Info Tab */}
            <TabsContent value="company" className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-green-400 mb-4 flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Company Details
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-gray-300">Company Name *</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Soddo Christian Hospital"
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tinNumber" className="text-gray-300">TIN Number</Label>
                      <Input
                        id="tinNumber"
                        name="tinNumber"
                        value={formData.tinNumber}
                        onChange={handleChange}
                        placeholder="0000000000"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessLicenseNo" className="text-gray-300">Business License No.</Label>
                      <Input
                        id="businessLicenseNo"
                        name="businessLicenseNo"
                        value={formData.businessLicenseNo}
                        onChange={handleChange}
                        placeholder="BL-2026-XXXX"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Business Sector</Label>
                    <Select
                      value={formData.businessSector}
                      onValueChange={(value) => setFormData({ ...formData, businessSector: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {businessSectors.map((s) => (
                          <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessAddress" className="text-gray-300">Business Address</Label>
                    <Textarea
                      id="businessAddress"
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleChange}
                      placeholder="Wolaita Soddo, SNNPR, Ethiopia"
                      className="bg-gray-700 border-gray-600 text-white min-h-[60px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="legalRepresentative" className="text-gray-300">Legal Representative</Label>
                      <Input
                        id="legalRepresentative"
                        name="legalRepresentative"
                        value={formData.legalRepresentative}
                        onChange={handleChange}
                        placeholder="Full name"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capitalAmount" className="text-gray-300">Capital (ETB)</Label>
                      <Input
                        id="capitalAmount"
                        name="capitalAmount"
                        value={formData.capitalAmount}
                        onChange={handleChange}
                        placeholder="1,000,000"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Registration Tab */}
            <TabsContent value="registration" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Registration Stage *</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => setFormData({ ...formData, stage: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="document_prep" className="text-white">
                      <span className="flex items-center"><FileText className="h-4 w-4 mr-2" /> Document Preparation</span>
                    </SelectItem>
                    <SelectItem value="apply_online" className="text-white">
                      <span className="flex items-center"><ClipboardList className="h-4 w-4 mr-2" /> Apply Online</span>
                    </SelectItem>
                    <SelectItem value="approval" className="text-white">
                      <span className="flex items-center"><BadgeCheck className="h-4 w-4 mr-2" /> Approved the Registration</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Registration Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Business License Renewal 2026"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Additional notes about this registration..."
                  className="bg-gray-700 border-gray-600 text-white min-h-[60px]"
                />
              </div>

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

            {/* Documents Tab - Dynamic */}
            <TabsContent value="documents" className="space-y-4">
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
                    documentTypes={documentTypes}
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
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-700 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
              className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!formData.title || !formData.companyName}>
              {isEditMode ? "Update Registration" : "Add Registration"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
