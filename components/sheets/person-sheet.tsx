"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, FileText, Briefcase, Home, X, Image as ImageIcon, File, Plus } from "lucide-react"
import { UploadDropzone } from "@/lib/uploadthing-utils"

interface PersonFormData {
  id?: string
  firstName: string
  lastName: string
  nationality: string
  dateOfBirth: string
  gender: string
  familyStatus: string
  photoUrl: string
  // Passport
  passportNo: string
  passportIssueDate: string
  passportExpiryDate: string
  passportDocuments: string[]
  // Medical License
  medicalLicenseNo: string
  medicalLicenseIssueDate: string
  medicalLicenseExpiryDate: string
  medicalLicenseDocuments: string[]
  // Work Permit
  workPermitNo: string
  workPermitIssueDate: string
  workPermitExpiryDate: string
  workPermitDocuments: string[]
  // Residence ID
  residenceIdNo: string
  residenceIdIssueDate: string
  residenceIdExpiryDate: string
  residenceIdDocuments: string[]
  // Contact
  email: string
  phone: string
  guardianId?: string
}

interface PersonSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (person: PersonFormData) => void
  person?: PersonFormData | null
}

// Document Preview Component for single document
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
  const fileName = url.split('/').pop() || `Document ${index + 1}`
  
  return (
    <div className="relative group">
      <div className="border border-gray-600 rounded-lg p-2 bg-gray-700/50 h-28">
        {isImage ? (
          <img 
            src={url} 
            alt={`Document ${index + 1}`}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <File className="h-8 w-8 mb-1" />
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

// Multi-Document Upload Section
function MultiDocumentUpload({
  label,
  documents,
  onAdd,
  onRemove
}: {
  label: string
  documents: string[]
  onAdd: (url: string) => void
  onRemove: (index: number) => void
}) {
  const [showUploader, setShowUploader] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-gray-300">{label}</Label>
        <span className="text-xs text-gray-500">{documents.length} file(s)</span>
      </div>
      
      {/* Document Grid */}
      {documents.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {documents.map((url, index) => (
            <DocumentPreview
              key={index}
              url={url}
              index={index}
              onRemove={() => onRemove(index)}
            />
          ))}
        </div>
      )}
      
      {/* Upload Area */}
      {showUploader ? (
        <div className="relative">
          <UploadDropzone
            endpoint="permitDocumentUploader"
            onClientUploadComplete={(res) => {
              if (res) {
                res.forEach((file) => {
                  if (file.url) onAdd(file.url)
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
          Add Document
        </Button>
      )}
    </div>
  )
}

export function PersonSheet({ open, onOpenChange, onSubmit, person }: PersonSheetProps) {
  const [activeTab, setActiveTab] = useState("personal")
  const [formData, setFormData] = useState<PersonFormData>({
    firstName: "",
    lastName: "",
    nationality: "",
    dateOfBirth: "",
    gender: "",
    familyStatus: "",
    photoUrl: "",
    passportNo: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    passportDocuments: [],
    medicalLicenseNo: "",
    medicalLicenseIssueDate: "",
    medicalLicenseExpiryDate: "",
    medicalLicenseDocuments: [],
    workPermitNo: "",
    workPermitIssueDate: "",
    workPermitExpiryDate: "",
    workPermitDocuments: [],
    residenceIdNo: "",
    residenceIdIssueDate: "",
    residenceIdExpiryDate: "",
    residenceIdDocuments: [],
    email: "",
    phone: "",
  })

  useEffect(() => {
    if (person) {
      setFormData({
        id: person.id,
        firstName: person.firstName || "",
        lastName: person.lastName || "",
        nationality: person.nationality || "",
        dateOfBirth: person.dateOfBirth || "",
        gender: person.gender || "",
        familyStatus: person.familyStatus || "",
        photoUrl: person.photoUrl || "",
        passportNo: person.passportNo || "",
        passportIssueDate: person.passportIssueDate || "",
        passportExpiryDate: person.passportExpiryDate || "",
        passportDocuments: person.passportDocuments || [],
        medicalLicenseNo: person.medicalLicenseNo || "",
        medicalLicenseIssueDate: person.medicalLicenseIssueDate || "",
        medicalLicenseExpiryDate: person.medicalLicenseExpiryDate || "",
        medicalLicenseDocuments: person.medicalLicenseDocuments || [],
        workPermitNo: person.workPermitNo || "",
        workPermitIssueDate: person.workPermitIssueDate || "",
        workPermitExpiryDate: person.workPermitExpiryDate || "",
        workPermitDocuments: person.workPermitDocuments || [],
        residenceIdNo: person.residenceIdNo || "",
        residenceIdIssueDate: person.residenceIdIssueDate || "",
        residenceIdExpiryDate: person.residenceIdExpiryDate || "",
        residenceIdDocuments: person.residenceIdDocuments || [],
        email: person.email || "",
        phone: person.phone || "",
      })
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        nationality: "",
        dateOfBirth: "",
        gender: "",
        familyStatus: "",
        photoUrl: "",
        passportNo: "",
        passportIssueDate: "",
        passportExpiryDate: "",
        passportDocuments: [],
        medicalLicenseNo: "",
        medicalLicenseIssueDate: "",
        medicalLicenseExpiryDate: "",
        medicalLicenseDocuments: [],
        workPermitNo: "",
        workPermitIssueDate: "",
        workPermitExpiryDate: "",
        workPermitDocuments: [],
        residenceIdNo: "",
        residenceIdIssueDate: "",
        residenceIdExpiryDate: "",
        residenceIdDocuments: [],
        email: "",
        phone: "",
      })
    }
    setActiveTab("personal")
  }, [person, open])

  const nationalities = [
    { value: "Ethiopian", label: "Ethiopian" },
    { value: "American", label: "American" },
    { value: "British", label: "British" },
    { value: "Canadian", label: "Canadian" },
    { value: "Indian", label: "Indian" },
    { value: "Kenyan", label: "Kenyan" },
    { value: "Nigerian", label: "Nigerian" },
    { value: "South African", label: "South African" },
    { value: "Chinese", label: "Chinese" },
    { value: "Korean", label: "Korean" },
    { value: "Japanese", label: "Japanese" },
    { value: "German", label: "German" },
    { value: "French", label: "French" },
    { value: "Italian", label: "Italian" },
    { value: "Other", label: "Other" },
  ]

  const genders = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
  ]

  const familyStatuses = [
    { value: "MARRIED", label: "Married" },
    { value: "UNMARRIED", label: "Unmarried" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
  }

  const isEditMode = !!person

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">
            {isEditMode ? "Edit Foreigner" : "Add New Foreigner"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {isEditMode
              ? "Update details and upload multiple documents per section."
              : "Fill in details and upload required documents (multiple allowed per section)."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-700/50 mb-6">
              <TabsTrigger value="personal" className="data-[state=active]:bg-green-600 text-xs">
                <User className="h-3 w-3 mr-1" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="medical" className="data-[state=active]:bg-green-600 text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Medical
              </TabsTrigger>
              <TabsTrigger value="work" className="data-[state=active]:bg-green-600 text-xs">
                <Briefcase className="h-3 w-3 mr-1" />
                Work
              </TabsTrigger>
              <TabsTrigger value="residence" className="data-[state=active]:bg-green-600 text-xs">
                <Home className="h-3 w-3 mr-1" />
                Residence
              </TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal" className="space-y-4">
              {/* Profile Photo */}
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Profile Photo
                </h4>
                {formData.photoUrl ? (
                  <div className="relative inline-block">
                    <img src={formData.photoUrl} alt="Profile" className="w-24 h-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photoUrl: "" })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <UploadDropzone
                    endpoint="permitDocumentUploader"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.url) setFormData({ ...formData, photoUrl: res[0].url })
                    }}
                    onUploadError={(error: Error) => console.error("Upload error:", error)}
                    className="ut-label:text-gray-400 ut-allowed-content:text-gray-500 ut-button:bg-green-600 border-gray-600 bg-gray-700/30"
                  />
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300">First Name *</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange}
                    placeholder="Enter first name" className="bg-gray-700 border-gray-600 text-white" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300">Last Name *</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange}
                    placeholder="Enter last name" className="bg-gray-700 border-gray-600 text-white" required />
                </div>
              </div>

              {/* Nationality */}
              <div className="space-y-2">
                <Label className="text-gray-300">Nationality *</Label>
                <Select value={formData.nationality} onValueChange={(value) => setFormData({ ...formData, nationality: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {nationalities.map((n) => (
                      <SelectItem key={n.value} value={n.value} className="text-white">{n.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-gray-300">Date of Birth *</Label>
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth}
                    onChange={handleChange} className="bg-gray-700 border-gray-600 text-white" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {genders.map((g) => (
                        <SelectItem key={g.value} value={g.value} className="text-white">{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Family Status */}
              <div className="space-y-2">
                <Label className="text-gray-300">Family Status</Label>
                <Select value={formData.familyStatus} onValueChange={(value) => setFormData({ ...formData, familyStatus: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {familyStatuses.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Passport Section with Multi-Upload */}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Passport Details
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="passportNo" className="text-gray-300">Passport Number *</Label>
                    <Input id="passportNo" name="passportNo" value={formData.passportNo} onChange={handleChange}
                      placeholder="Enter passport number" className="bg-gray-700 border-gray-600 text-white" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passportIssueDate" className="text-gray-300">Issue Date</Label>
                      <Input id="passportIssueDate" name="passportIssueDate" type="date" value={formData.passportIssueDate}
                        onChange={handleChange} className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passportExpiryDate" className="text-gray-300">Expiry Date *</Label>
                      <Input id="passportExpiryDate" name="passportExpiryDate" type="date" value={formData.passportExpiryDate}
                        onChange={handleChange} className="bg-gray-700 border-gray-600 text-white" required />
                    </div>
                  </div>
                  
                  {/* Passport Documents - Multiple Upload */}
                  <MultiDocumentUpload
                    label="Passport Documents (Multiple Allowed)"
                    documents={formData.passportDocuments}
                    onAdd={(url) => setFormData({ ...formData, passportDocuments: [...formData.passportDocuments, url] })}
                    onRemove={(index) => setFormData({ 
                      ...formData, 
                      passportDocuments: formData.passportDocuments.filter((_, i) => i !== index) 
                    })}
                  />
                </div>
              </div>

              {/* Contact Section */}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <h4 className="text-sm font-medium text-green-400 mb-3">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange}
                      placeholder="email@example.com" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange}
                      placeholder="+251 912 345 678" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Medical License Tab */}
            <TabsContent value="medical" className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-green-400 mb-4 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Medical License Details
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicalLicenseNo" className="text-gray-300">License Number</Label>
                    <Input id="medicalLicenseNo" name="medicalLicenseNo" value={formData.medicalLicenseNo}
                      onChange={handleChange} placeholder="Enter license number" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medicalLicenseIssueDate" className="text-gray-300">Issue Date</Label>
                      <Input id="medicalLicenseIssueDate" name="medicalLicenseIssueDate" type="date"
                        value={formData.medicalLicenseIssueDate} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medicalLicenseExpiryDate" className="text-gray-300">Expiry Date</Label>
                      <Input id="medicalLicenseExpiryDate" name="medicalLicenseExpiryDate" type="date"
                        value={formData.medicalLicenseExpiryDate} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                  </div>
                  
                  {/* Medical License Documents - Multiple Upload */}
                  <MultiDocumentUpload
                    label="Medical License Documents (Multiple Allowed)"
                    documents={formData.medicalLicenseDocuments}
                    onAdd={(url) => setFormData({ ...formData, medicalLicenseDocuments: [...formData.medicalLicenseDocuments, url] })}
                    onRemove={(index) => setFormData({ 
                      ...formData, 
                      medicalLicenseDocuments: formData.medicalLicenseDocuments.filter((_, i) => i !== index) 
                    })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Work Permit Tab */}
            <TabsContent value="work" className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-green-400 mb-4 flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Work Permit Details
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workPermitNo" className="text-gray-300">Permit Number</Label>
                    <Input id="workPermitNo" name="workPermitNo" value={formData.workPermitNo}
                      onChange={handleChange} placeholder="Enter permit number" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workPermitIssueDate" className="text-gray-300">Issue Date</Label>
                      <Input id="workPermitIssueDate" name="workPermitIssueDate" type="date"
                        value={formData.workPermitIssueDate} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workPermitExpiryDate" className="text-gray-300">Expiry Date</Label>
                      <Input id="workPermitExpiryDate" name="workPermitExpiryDate" type="date"
                        value={formData.workPermitExpiryDate} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                  </div>
                  
                  {/* Work Permit Documents - Multiple Upload */}
                  <MultiDocumentUpload
                    label="Work Permit Documents (Multiple Allowed)"
                    documents={formData.workPermitDocuments}
                    onAdd={(url) => setFormData({ ...formData, workPermitDocuments: [...formData.workPermitDocuments, url] })}
                    onRemove={(index) => setFormData({ 
                      ...formData, 
                      workPermitDocuments: formData.workPermitDocuments.filter((_, i) => i !== index) 
                    })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Residence ID Tab */}
            <TabsContent value="residence" className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-green-400 mb-4 flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  Residence ID Details
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="residenceIdNo" className="text-gray-300">Residence ID Number</Label>
                    <Input id="residenceIdNo" name="residenceIdNo" value={formData.residenceIdNo}
                      onChange={handleChange} placeholder="Enter ID number" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="residenceIdIssueDate" className="text-gray-300">Issue Date</Label>
                      <Input id="residenceIdIssueDate" name="residenceIdIssueDate" type="date"
                        value={formData.residenceIdIssueDate} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="residenceIdExpiryDate" className="text-gray-300">Expiry Date</Label>
                      <Input id="residenceIdExpiryDate" name="residenceIdExpiryDate" type="date"
                        value={formData.residenceIdExpiryDate} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                  </div>
                  
                  {/* Residence ID Documents - Multiple Upload */}
                  <MultiDocumentUpload
                    label="Residence ID Documents (Multiple Allowed)"
                    documents={formData.residenceIdDocuments}
                    onAdd={(url) => setFormData({ ...formData, residenceIdDocuments: [...formData.residenceIdDocuments, url] })}
                    onRemove={(index) => setFormData({ 
                      ...formData, 
                      residenceIdDocuments: formData.residenceIdDocuments.filter((_, i) => i !== index) 
                    })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-700 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
              className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!formData.firstName || !formData.lastName || !formData.nationality || !formData.passportNo || !formData.dateOfBirth || !formData.gender || !formData.passportExpiryDate}>
              {isEditMode ? "Update Foreigner" : "Add Foreigner"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
