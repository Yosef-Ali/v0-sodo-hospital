"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, FileCheck, ClipboardList, Fuel, Shield, Truck } from "lucide-react"
import { SmartDocumentChecklist, StageProgress, DocumentSection as DocSection } from "@/components/ui/smart-document-checklist"
import { useOcrAutoFill, mapOcrToVehicleForm } from "@/lib/hooks/use-ocr-autofill"
import { toast } from "sonner"

// OCR-enabled document types (Libre contains vehicle info)
const OCR_DOCUMENT_TYPES: Record<string, string> = {
  libre: "libre",
}

// ===================== CONFIG =====================

const SERVICE_TYPES = [
  { value: "inspection", label: "Vehicle Inspection", icon: ClipboardList },
  { value: "road_fund", label: "Road Fund", icon: Fuel },
  { value: "insurance", label: "Insurance", icon: Shield },
  { value: "road_transport", label: "Road Transport", icon: Truck },
]

const STAGES = {
  inspection: [
    { value: "DOCUMENT_PREP", label: "Document Prep" },
    { value: "INSPECTION", label: "Inspection" },
    { value: "COMPLETED", label: "Completed" },
  ],
  road_fund: [
    { value: "DOCUMENT_PREP", label: "Document Prep" },
    { value: "PAYMENT", label: "Payment" },
    { value: "APPLY", label: "Apply" },
    { value: "COMPLETED", label: "Completed" },
  ],
  insurance: [
    { value: "DOCUMENT_PREP", label: "Document Prep" },
    { value: "APPLY", label: "Apply" },
    { value: "PAYMENT", label: "Payment" },
    { value: "COMPLETED", label: "Completed" },
  ],
  road_transport: [
    { value: "DOCUMENT_PREP", label: "Document Prep" },
    { value: "APPLY", label: "Apply" },
    { value: "APPROVED", label: "Approved" },
  ],
}

const DOCUMENT_REQUIREMENTS = {
  inspection: [
    { value: "libre", label: "Libre (Vehicle Registration)" },
    { value: "previous_inspection", label: "Previous Inspection Result" },
  ],
  road_fund: [
    { value: "libre", label: "Libre (Vehicle Registration)" },
    { value: "inspection_result", label: "Inspection Result" },
    { value: "bank_slip", label: "Bank Slip" },
    { value: "delegation_id", label: "Delegation with ID" },
  ],
  insurance: [
    { value: "libre", label: "Libre (Vehicle Registration)" },
    { value: "inspection_result", label: "Inspection Result" },
    { value: "road_fund_receipt", label: "Road Fund Receipt" },
    { value: "insurance_form", label: "Insurance Application Form" },
    { value: "delegation_id", label: "Delegation with ID" },
  ],
  road_transport: [
    { value: "libre", label: "Libre (Vehicle Registration)" },
    { value: "inspection_result", label: "Inspection Result" },
    { value: "road_fund_receipt", label: "Road Fund Receipt" },
    { value: "insurance_cert", label: "Insurance Certificate" },
    { value: "delegation_id", label: "Delegation with ID" },
  ],
}

// ===================== INTERFACES =====================

interface VehicleSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  vehicle?: any
}

interface DocumentSection {
  id: string
  type: string
  customTitle?: string
  files: string[]
}

// ===================== MAIN COMPONENT =====================

export function VehicleSheet({ open, onOpenChange, onSubmit, vehicle }: VehicleSheetProps) {
  const [activeTab, setActiveTab] = useState("vehicle")
  
  const [formData, setFormData] = useState({
    plateNumber: "",
    chassisNumber: "",
    engineNumber: "",
    vehicleType: "",
    vehicleModel: "",
    vehicleYear: "",
    ownerName: "",
    currentMileage: "",
    serviceType: "",
    currentStage: "DOCUMENT_PREP",
    notes: "",
  })
  
  const [documentSections, setDocumentSections] = useState<DocumentSection[]>([])

  // OCR Auto-fill hook
  const { extractFromImage, isLoading: isOcrLoading } = useOcrAutoFill()

  // OCR extraction handler for Libre
  const handleOcrExtract = async (docType: string, imageUrl: string) => {
    if (docType !== "libre") return

    const result = await extractFromImage(imageUrl, "libre")
    
    if (result.success && result.data) {
      const mappedFields = mapOcrToVehicleForm(result.data)
      
      if (Object.keys(mappedFields).length > 0) {
        setFormData(prev => ({ ...prev, ...mappedFields }))
        
        const fieldCount = Object.keys(mappedFields).length
        toast.success(`Auto-filled ${fieldCount} field${fieldCount > 1 ? 's' : ''} from Libre`, {
          description: Object.keys(mappedFields).join(', ')
        })
      }
    } else if (result.error) {
      toast.error('OCR extraction failed', { description: result.error })
    }
  }

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plateNumber: vehicle.plateNumber || "",
        chassisNumber: vehicle.chassisNumber || "",
        engineNumber: vehicle.engineNumber || "",
        vehicleType: vehicle.vehicleType || "",
        vehicleModel: vehicle.vehicleModel || "",
        vehicleYear: vehicle.vehicleYear || "",
        ownerName: vehicle.ownerName || "",
        currentMileage: vehicle.currentMileage || "",
        serviceType: vehicle.serviceType || vehicle.category || "",
        currentStage: vehicle.currentStage || "DOCUMENT_PREP",
        notes: vehicle.notes || "",
      })
      setDocumentSections(vehicle.documentSections || [])
    } else {
      setFormData({
        plateNumber: "", chassisNumber: "", engineNumber: "",
        vehicleType: "", vehicleModel: "", vehicleYear: "",
        ownerName: "", currentMileage: "",
        serviceType: "", currentStage: "DOCUMENT_PREP", notes: "",
      })
      setDocumentSections([])
    }
    setActiveTab("vehicle")
  }, [vehicle, open])

  // Get document requirements based on service type
  const getDocumentRequirements = () => {
    if (!formData.serviceType) return []
    return DOCUMENT_REQUIREMENTS[formData.serviceType as keyof typeof DOCUMENT_REQUIREMENTS] || []
  }

  // Get stages based on service type
  const getStages = () => {
    if (!formData.serviceType) return []
    return STAGES[formData.serviceType as keyof typeof STAGES] || []
  }

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === "serviceType") {
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

  const isEditMode = !!vehicle
  const vehicleTypes = ["Car", "SUV", "Truck", "Bus", "Motorcycle", "Other"]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <Car className="h-5 w-5 text-green-500" />
            {isEditMode ? "Edit Vehicle Record" : "Add New Vehicle"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {isEditMode ? "Update vehicle details and documents." : "Enter vehicle details, select service type, and upload required documents."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700/50 mb-4">
              <TabsTrigger value="vehicle" className="data-[state=active]:bg-green-600 text-xs">
                <Car className="h-3 w-3 mr-1" /> Vehicle Info
              </TabsTrigger>
              <TabsTrigger value="service" className="data-[state=active]:bg-green-600 text-xs">
                <FileCheck className="h-3 w-3 mr-1" /> Service & Docs
              </TabsTrigger>
            </TabsList>

            {/* ===================== VEHICLE TAB ===================== */}
            <TabsContent value="vehicle" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Plate Number *</Label>
                  <Input name="plateNumber" value={formData.plateNumber} onChange={handleChange}
                    placeholder="3-AA-12345" className="bg-gray-700 border-gray-600 text-white" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Vehicle Type</Label>
                  <Select value={formData.vehicleType} onValueChange={(v) => handleSelectChange("vehicleType", v)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {vehicleTypes.map(t => <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Chassis Number</Label>
                  <Input name="chassisNumber" value={formData.chassisNumber} onChange={handleChange}
                    placeholder="Chassis #" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Engine Number</Label>
                  <Input name="engineNumber" value={formData.engineNumber} onChange={handleChange}
                    placeholder="Engine #" className="bg-gray-700 border-gray-600 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Model</Label>
                  <Input name="vehicleModel" value={formData.vehicleModel} onChange={handleChange}
                    placeholder="Toyota Corolla" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Year</Label>
                  <Input name="vehicleYear" value={formData.vehicleYear} onChange={handleChange}
                    placeholder="2020" className="bg-gray-700 border-gray-600 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Owner Name</Label>
                  <Input name="ownerName" value={formData.ownerName} onChange={handleChange}
                    placeholder="Owner name" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Current Mileage</Label>
                  <Input name="currentMileage" value={formData.currentMileage} onChange={handleChange}
                    placeholder="50,000 km" className="bg-gray-700 border-gray-600 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Notes</Label>
                <Textarea name="notes" value={formData.notes} onChange={handleChange}
                  placeholder="Additional notes..." className="bg-gray-700 border-gray-600 text-white min-h-[80px]" />
              </div>
            </TabsContent>

            {/* ===================== SERVICE TAB ===================== */}
            <TabsContent value="service" className="space-y-4">
              {/* Service Type Selection */}
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-green-400 mb-3">Select Service Type</h4>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_TYPES.map(type => (
                    <button key={type.value} type="button"
                      onClick={() => handleSelectChange("serviceType", type.value)}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2
                        ${formData.serviceType === type.value 
                          ? 'border-green-500 bg-green-500/20 text-green-400' 
                          : 'border-gray-600 hover:border-gray-500 text-gray-400'}`}>
                      <type.icon className="h-4 w-4" />
                      <span className="text-xs">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stage Progress */}
              {formData.serviceType && (
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
              {formData.serviceType && (
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
              disabled={!formData.plateNumber}>
              {isEditMode ? "Update Vehicle" : "Add Vehicle"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// Keep backward compatibility export
export { VehicleSheet as VehicleTaskSheet }
