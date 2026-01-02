"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, FileCheck, ClipboardList, Fuel, Shield, Truck, X, Plus, File, Trash2 } from "lucide-react"
import { UploadDropzone } from "@/lib/uploadthing-utils"

interface VehicleSheetProps {
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


export function VehicleTaskSheet({ open, onOpenChange, onSubmit, task }: VehicleSheetProps) {
  const [activeTab, setActiveTab] = useState("vehicle")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    status: "pending",
    dueDate: "",
    assigneeId: "",
    vehicleInfo: "",
    plateNumber: "",
    chassisNumber: "",
    engineNumber: "",
    vehicleType: "",
    vehicleModel: "",
    vehicleYear: "",
    ownerName: "",
    currentMileage: "",
  })
  
  // Dynamic document sections
  const [documentSections, setDocumentSections] = useState<DocumentSection[]>([])

  // Document types based on category
  const getDocumentTypes = () => {
    const baseTypes = [
      { value: "libre", label: "Libre (Vehicle Registration)" },
      { value: "inspection_result", label: "Inspection Result" },
    ]
    
    switch (formData.category) {
      case "inspection":
        return baseTypes
      case "road_fund":
        return [
          ...baseTypes,
          { value: "bank_slip", label: "Bank Slip" },
          { value: "delegation_id", label: "Delegation with ID" },
        ]
      case "insurance":
        return [
          ...baseTypes,
          { value: "bank_slip", label: "Bank Slip of Road Fund" },
          { value: "insurance", label: "Insurance Documents" },
          { value: "road_fund_receipt", label: "Road Fund Receipt" },
          { value: "delegation_id", label: "Delegation with ID" },
        ]
      case "road_transport":
        return [
          ...baseTypes,
          { value: "insurance", label: "Insurance Documents" },
          { value: "road_fund_receipt", label: "Road Fund Receipt" },
        ]
      default:
        return baseTypes
    }
  }

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        category: task.category || "",
        status: task.status || "pending",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        assigneeId: task.assigneeId || "",
        vehicleInfo: task.vehicleInfo || "",
        plateNumber: task.plateNumber || "",
        chassisNumber: task.chassisNumber || "",
        engineNumber: task.engineNumber || "",
        vehicleType: task.vehicleType || "",
        vehicleModel: task.vehicleModel || "",
        vehicleYear: task.vehicleYear || "",
        ownerName: task.ownerName || "",
        currentMileage: task.currentMileage || "",
      })
      // Parse existing documents if any
      setDocumentSections(task.documentSections || [])
    } else {
      setFormData({
        title: "",
        description: "",
        category: "",
        status: "pending",
        dueDate: "",
        assigneeId: "",
        vehicleInfo: "",
        plateNumber: "",
        chassisNumber: "",
        engineNumber: "",
        vehicleType: "",
        vehicleModel: "",
        vehicleYear: "",
        ownerName: "",
        currentMileage: "",
      })
      setDocumentSections([])
    }
    setActiveTab("vehicle")
  }, [task, open])

  const vehicleTypes = [
    { value: "ambulance", label: "Ambulance" },
    { value: "pickup", label: "Pickup" },
    { value: "suv", label: "SUV" },
    { value: "sedan", label: "Sedan" },
    { value: "bus", label: "Bus/Van" },
    { value: "truck", label: "Truck" },
    { value: "other", label: "Other" },
  ]

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
    // Flatten all documents for the database
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
            {isEditMode ? "Edit Vehicle Record" : "Add New Vehicle Record"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {isEditMode
              ? "Update vehicle details and documents."
              : "Fill in vehicle details and upload required documents (multiple per section)."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700/50 mb-6">
              <TabsTrigger value="vehicle" className="data-[state=active]:bg-green-600 text-xs">
                <Car className="h-3 w-3 mr-1" />
                Vehicle Info
              </TabsTrigger>
              <TabsTrigger value="service" className="data-[state=active]:bg-green-600 text-xs">
                <FileCheck className="h-3 w-3 mr-1" />
                Service Type
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-green-600 text-xs">
                <ClipboardList className="h-3 w-3 mr-1" />
                Documents
              </TabsTrigger>
            </TabsList>

            {/* Vehicle Info Tab */}
            <TabsContent value="vehicle" className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-green-400 mb-4 flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  Vehicle Identification
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plateNumber" className="text-gray-300">Plate Number *</Label>
                      <Input
                        id="plateNumber"
                        name="plateNumber"
                        value={formData.plateNumber}
                        onChange={handleChange}
                        placeholder="AA-12345"
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Vehicle Type</Label>
                      <Select
                        value={formData.vehicleType}
                        onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {vehicleTypes.map((t) => (
                            <SelectItem key={t.value} value={t.value} className="text-white">{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleInfo" className="text-gray-300">Vehicle Description</Label>
                    <Input
                      id="vehicleInfo"
                      name="vehicleInfo"
                      value={formData.vehicleInfo}
                      onChange={handleChange}
                      placeholder="e.g., Toyota Land Cruiser Ambulance"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleModel" className="text-gray-300">Model</Label>
                      <Input
                        id="vehicleModel"
                        name="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={handleChange}
                        placeholder="Land Cruiser"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleYear" className="text-gray-300">Year</Label>
                      <Input
                        id="vehicleYear"
                        name="vehicleYear"
                        value={formData.vehicleYear}
                        onChange={handleChange}
                        placeholder="2023"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chassisNumber" className="text-gray-300">Chassis Number</Label>
                      <Input
                        id="chassisNumber"
                        name="chassisNumber"
                        value={formData.chassisNumber}
                        onChange={handleChange}
                        placeholder="JTMHX05J..."
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="engineNumber" className="text-gray-300">Engine Number</Label>
                      <Input
                        id="engineNumber"
                        name="engineNumber"
                        value={formData.engineNumber}
                        onChange={handleChange}
                        placeholder="1GR-..."
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Service Type Tab */}
            <TabsContent value="service" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Service Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData({ ...formData, category: value })
                    // Reset document sections when category changes
                    setDocumentSections([])
                  }}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="inspection" className="text-white">
                      <span className="flex items-center"><FileCheck className="h-4 w-4 mr-2" /> Bolo & Inspection</span>
                    </SelectItem>
                    <SelectItem value="road_fund" className="text-white">
                      <span className="flex items-center"><Fuel className="h-4 w-4 mr-2" /> Road Fund</span>
                    </SelectItem>
                    <SelectItem value="insurance" className="text-white">
                      <span className="flex items-center"><Shield className="h-4 w-4 mr-2" /> Insurance</span>
                    </SelectItem>
                    <SelectItem value="road_transport" className="text-white">
                      <span className="flex items-center"><Truck className="h-4 w-4 mr-2" /> Road Transport</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Record Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Annual Inspection - Ambulance AA-12345"
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
                  placeholder="Additional notes..."
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
                  <Car className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Please select a service category first to add documents.</p>
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
              disabled={!formData.category || !formData.title || !formData.plateNumber}>
              {isEditMode ? "Update Vehicle Record" : "Add Vehicle Record"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
