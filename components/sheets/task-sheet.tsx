"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUsers } from "@/lib/actions/users"
import { getPeople } from "@/lib/actions/v2/foreigners"
import { getVehicles } from "@/lib/actions/v2/vehicles"
import { getImports } from "@/lib/actions/v2/imports"
import { getCompanies } from "@/lib/actions/v2/companies"
import { 
  Briefcase, 
  UserCircle, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Car,
  Stethoscope,
  Plane,
  User
} from "lucide-react"

// Define the shape of the task object coming from the database/parent
interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: Date | string | null
  assigneeId?: string
  permitId?: string
  category?: string // Derived or matched
  subType?: string
  permit?: {
    category: string
    subType?: string
    personId?: string
  }
}

interface TaskFormData {
  id?: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  assignee: string
  category: string
  subType: string
  // Entity linking (NEW)
  entityType: string  // 'person', 'vehicle', 'import', 'company'
  entityId: string    // ID of the linked entity
  personId: string    // Legacy, will be phased out
}

interface TaskSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: TaskFormData) => void
  task?: Task | null
}

export function TaskSheet({ open, onOpenChange, onSubmit, task }: TaskSheetProps) {
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string }[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [imports, setImports] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingEntities, setLoadingEntities] = useState(false)
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    assignee: "",
    category: "",
    subType: "",
    entityType: "",
    entityId: "",
    personId: ""
  })

  // Fetch users and all entities on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoadingUsers(true)
      const usersResult = await getUsers()
      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data)
      }
      setLoadingUsers(false)

      setLoadingEntities(true)
      
      // Fetch all entity types in parallel
      const [peopleResult, vehiclesResult, importsResult, companiesResult] = await Promise.all([
        getPeople({ limit: 100 }),
        getVehicles({ limit: 100 }),
        getImports({ limit: 100 }),
        getCompanies({ limit: 100 }),
      ])
      
      if (peopleResult.success && peopleResult.data) {
        setPeople(peopleResult.data)
      }
      if (vehiclesResult.success && vehiclesResult.data) {
        setVehicles(vehiclesResult.data)
      }
      if (importsResult.success && importsResult.data) {
        setImports(importsResult.data)
      }
      if (companiesResult.success && companiesResult.data) {
        setCompanies(companiesResult.data)
      }
      
      setLoadingEntities(false)
    }
    fetchData()
  }, [])

  // Populate form when editing
  useEffect(() => {
    if (task && open) {
      // Format due date safely
      let formattedDueDate = new Date().toISOString().split("T")[0]
      if (task.dueDate) {
        try {
          formattedDueDate = new Date(task.dueDate).toISOString().split("T")[0]
        } catch (e) {
          console.error("Invalid date:", task.dueDate)
        }
      }

      // Determine category from task or linked permit
      let category = task.category || ""
      let subType = task.subType || ""
      let personId = ""
      
      if (task.permit) {
        if (!category) category = task.permit.category.toLowerCase()
        if (task.permit.subType) subType = task.permit.subType
        if (task.permit.personId) personId = task.permit.personId
      }

      setFormData({
        id: task.id,
        title: task.title || "",
        description: task.description || "",
        status: task.status || "pending",
        priority: task.priority || "medium",
        dueDate: formattedDueDate,
        assignee: task.assigneeId || "",
        category: category,
        subType: subType,
        entityType: (task as any).entityType || "",
        entityId: (task as any).entityId || "",
        personId: personId
      })
    } else if (!task && open) {
      // Reset for create mode
      setFormData({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        dueDate: new Date().toISOString().split("T")[0],
        assignee: "",
        category: "",
        subType: "",
        entityType: "",
        entityId: "",
        personId: ""
      })
    }
  }, [task, open])

  // Predefined options
  const categories = [
    { value: "work-permit", label: "Work Permit", icon: Briefcase },
    { value: "residence-id", label: "Residence ID", icon: UserCircle },
    { value: "moh-licensing", label: "MOH Licensing", icon: Stethoscope },
    { value: "customs", label: "Customs / PIP / ESW", icon: Plane },
    { value: "bolo-insurance", label: "Vehicle Bolo & Insurance", icon: Car },
    { value: "company-registration", label: "Company Registration", icon: Building2 },
    { value: "govt-affairs", label: "Gov't Affairs", icon: Building2 },
  ]

  const workPermitSubTypes = [
    { value: "NEW", label: "New Work Permit" },
    { value: "RENEWAL", label: "Renewal Work Permit" },
    { value: "OTHER", label: "Other" },
  ]
  
  const mohSubTypes = [
    { value: "NEW", label: "Permanent/New License" },
    { value: "TEMPORARY", label: "Temporary License" },
    { value: "RENEWAL", label: "Renewal" },
    { value: "RETURN", label: "Return Expired" },
  ]

  const customsSubTypes = [
    { value: "PIP", label: "Pre Import Permit (PIP)" },
    { value: "ESW", label: "Ethiopia Single Window (ESW)" },
    { value: "OTHER", label: "General Customs" },
  ]

  const boloSubTypes = [
    { value: "NEW", label: "New Inspection/Bolo" },
    { value: "RENEWAL", label: "Renewal" },
  ]

  // Mapping simple categories to data keys if needed, 
  // but for now keeping the quick titles simple
  const quickTitles: Record<string, string[]> = {
    "work-permit": [
      "New Work Permit Application",
      "Work Permit Renewal",
      "Collect Required Documents",
      "Follow up on Work Permit Status",
      "Submit Physical Documents",
    ],
    "residence-id": [
      "New Residence ID Application",
      "Residence ID Renewal",
      "New Residence ID for Wife & Child",
      "Renewal Residence ID for Dependents",
      "Submit Document AND Payment",
    ],
    "moh-licensing": [
      "Permanent/New License Application",
      "Temporary License Application",
      "License Renewal",
      "Return Expired License",
      "Document Preparation",
    ],
    "customs": [
      "Pre Import Permit (PIP)",
      "Ethiopia Single Window (ESW)",
      "Submit Customs Declaration",
      "Collect Cleared Items",
      "Document Collection for PIP",
    ],
    "bolo-insurance": [
      "Bolo and Insurance Inspection",
      "Process Road Fund Payment",
      "Obtain Vehicle Insurance",
      "Complete Road Transport Requirements",
    ],
    "company-registration": [
      "Company Registration",
      "Prepare Registration Documents",
      "Submit Online Application",
      "Collect Business License",
    ],
    "govt-affairs": [
      "Investment Commission Process",
      "ETA Requirements",
      "PACCS Process",
      "Family Medicine Licensing",
    ]
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const isEditMode = !!task

  // Determine which fields to show based on category
  const showPersonSelector = ["work-permit", "residence-id", "moh-licensing"].includes(formData.category)
  const showSubType = ["work-permit", "moh-licensing", "customs", "bolo-insurance"].includes(formData.category)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">
            {isEditMode ? "Edit Task" : "Create New Task"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {isEditMode
              ? "Update the task details below."
              : "Orchestrate a new workflow item."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          
          {/* GROUP 1: CONTEXT */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center uppercase tracking-wider">
              <Building2 className="h-4 w-4 mr-2" />
              Context & Subject
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-300">
                  Workflow Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value, title: "", subType: "" })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 transition-colors">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-white">
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4 text-gray-400" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sub-Type (Dynamic) */}
              {showSubType && (
                <div className="space-y-2">
                  <Label htmlFor="subType" className="text-gray-300">
                    Specific Type
                  </Label>
                  <Select
                    value={formData.subType}
                    onValueChange={(value) => setFormData({ ...formData, subType: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 transition-colors">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                    {formData.category === "work-permit" && (
                      workPermitSubTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-white">
                          {type.label}
                        </SelectItem>
                      ))
                    )}
                    {formData.category === "moh-licensing" && (
                      mohSubTypes.map((type) => (
                         <SelectItem key={type.value} value={type.value} className="text-white">
                          {type.label}
                        </SelectItem>
                      ))
                    )}
                    {formData.category === "customs" && (
                      customsSubTypes.map((type) => (
                         <SelectItem key={type.value} value={type.value} className="text-white">
                          {type.label}
                        </SelectItem>
                      ))
                    )}
                    {formData.category === "bolo-insurance" && (
                      boloSubTypes.map((type) => (
                         <SelectItem key={type.value} value={type.value} className="text-white">
                          {type.label}
                        </SelectItem>
                      ))
                    )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Entity Selector - Link to existing records */}
            <div className="space-y-4 mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300 font-medium">Link to Entity</Label>
                <span className="text-xs text-gray-500">Select existing record</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Entity Type Selector */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-xs">Entity Type</Label>
                  <Select
                    value={formData.entityType}
                    onValueChange={(value) => setFormData({ ...formData, entityType: value, entityId: "", personId: "" })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 transition-colors">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="person" className="text-white">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-400" />
                          Foreigner / Person
                        </div>
                      </SelectItem>
                      <SelectItem value="vehicle" className="text-white">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-green-400" />
                          Vehicle
                        </div>
                      </SelectItem>
                      <SelectItem value="import" className="text-white">
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-orange-400" />
                          Import Permit
                        </div>
                      </SelectItem>
                      <SelectItem value="company" className="text-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-purple-400" />
                          Company
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Entity Selector (Dynamic based on type) */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-xs">Select Record</Label>
                  <Select
                    value={formData.entityId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, entityId: value })
                      // Also set personId for backward compatibility
                      if (formData.entityType === "person") {
                        setFormData(prev => ({ ...prev, entityId: value, personId: value }))
                      }
                    }}
                    disabled={!formData.entityType || loadingEntities}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 transition-colors">
                      <SelectValue placeholder={loadingEntities ? "Loading..." : "Select record..."} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 max-h-[200px]">
                      {formData.entityType === "person" && people.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-white">
                          {p.firstName} {p.lastName}
                        </SelectItem>
                      ))}
                      {formData.entityType === "vehicle" && vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id} className="text-white">
                          {v.plateNumber || v.title} {v.ownerName ? `- ${v.ownerName}` : ""}
                        </SelectItem>
                      ))}
                      {formData.entityType === "import" && imports.map((i) => (
                        <SelectItem key={i.id} value={i.id} className="text-white">
                          {i.title} ({i.category?.toUpperCase()})
                        </SelectItem>
                      ))}
                      {formData.entityType === "company" && companies.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-white">
                          {c.companyName || c.title} {c.tinNumber ? `(TIN: ${c.tinNumber})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* GROUP 2: DETAILS */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center uppercase tracking-wider">
              <FileText className="h-4 w-4 mr-2" />
              Task Specifics
            </h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">
                  Task Title
                </Label>
                {/* Quick Title Logic */}
                <div className="flex gap-2 flex-col">
                  {formData.category && quickTitles[formData.category] && (
                    <Select
                      value={quickTitles[formData.category]?.includes(formData.title) ? formData.title : "custom"}
                      onValueChange={(value) => {
                        if (value !== "custom") {
                          setFormData({ ...formData, title: value })
                        } else {
                           if (quickTitles[formData.category]?.includes(formData.title)) {
                              setFormData({ ...formData, title: "" })
                           }
                        }
                      }}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 transition-colors">
                        <SelectValue placeholder="Select a standard task..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {quickTitles[formData.category]?.map((title) => (
                          <SelectItem key={title} value={title} className="text-white">
                            {title}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom" className="text-green-400 font-medium border-t border-gray-600 mt-1 pt-1">
                          + Create custom title
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  
                  {/* Custom Input */}
                  {(!formData.category || !quickTitles[formData.category]?.includes(formData.title)) && (
                    <Input
                      value={formData.title}
                      placeholder="e.g., Renew Medical License for Dr. Smith"
                      className="bg-gray-700 border-gray-600 text-white"
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">
                  Description & Notes
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter detailed steps, required documents, or special instructions..."
                  className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                  required
                />
              </div>
            </div>
          </div>

          {/* GROUP 3: EXECUTION */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
             <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Execution
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignee" className="text-gray-300">
                  Assign To
                </Label>
                <Select
                  value={formData.assignee}
                  onValueChange={(value) => setFormData({ ...formData, assignee: value })}
                  disabled={loadingUsers}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 transition-colors">
                    <SelectValue placeholder={loadingUsers ? "Loading..." : "Select assignee"} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600 max-h-[200px]">
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="text-white">
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                 <Label htmlFor="dueDate" className="text-gray-300">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-300">
                  Initial Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 transition-colors">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="pending" className="text-white">Pending</SelectItem>
                    <SelectItem value="in-progress" className="text-blue-400">In Progress</SelectItem>
                    <SelectItem value="completed" className="text-green-400">Completed</SelectItem>
                    <SelectItem value="urgent" className="text-red-400">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-gray-300">
                  Priority Level
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 transition-colors">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="low" className="text-gray-400">Low</SelectItem>
                    <SelectItem value="medium" className="text-yellow-400">Medium</SelectItem>
                    <SelectItem value="high" className="text-red-500">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Footer / Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.title || !formData.category || !formData.assignee}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditMode ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}


