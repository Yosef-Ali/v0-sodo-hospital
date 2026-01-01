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
import { getPeople } from "@/lib/actions/v2/people"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase, 
  user as UserIcon, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Car,
  Stethoscope,
  Plane,
  CreditCard,
  UserCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

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
  personId: string
}

interface TaskSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: TaskFormData) => void
  task?: Task | null
}

export function TaskSheet({ open, onOpenChange, onSubmit, task }: TaskSheetProps) {
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string }[]>([])
  const [people, setPeople] = useState<{ id: string; firstName: string; lastName: string }[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingPeople, setLoadingPeople] = useState(false)
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    assignee: "",
    category: "",
    subType: "",
    personId: ""
  })

  // Fetch users and people on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoadingUsers(true)
      const usersResult = await getUsers()
      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data)
      }
      setLoadingUsers(false)

      setLoadingPeople(true)
      const peopleResult = await getPeople({ limit: 100 }) // Fetch reasonable limit for dropdown
      if (peopleResult.success && peopleResult.data) {
        setPeople(peopleResult.data)
      }
      setLoadingPeople(false)
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
        assignee: task.assigneeId || "", // Use assigneeId from DB
        category: category,
        subType: subType,
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
        personId: ""
      })
    }
  }, [task, open])

  // Predefined options
  const categories = [
    { value: "work_permit", label: "Work Permit", icon: Briefcase },
    { value: "residence_id", label: "Residence ID", icon: UserCircle },
    { value: "medical_license", label: "Medical License / MOH", icon: Stethoscope },
    { value: "pip", label: "Pre Import Permit (PIP)", icon: Plane },
    { value: "customs", label: "Customs / Single Window", icon: Plane },
    { value: "car_bolo_insurance", label: "Car Bolo & Insurance", icon: Car },
    { value: "company_registration", label: "Company Registration", icon: Building2 },
    { value: "govt_affairs", label: "Gov't Affairs", icon: Building2 },
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

  // Mapping simple categories to data keys if needed, 
  // but for now keeping the quick titles simple
  const quickTitles: Record<string, string[]> = {
    work_permit: [
      "Submit Work Permit Application",
      "Collect Required Documents",
      "Follow up on Work Permit Status",
      "Work Permit Approved - Collect",
    ],
    residence_id: [
      "Submit Residence ID Application",
      "Collect Required Documents",
      "Follow up on Residence ID Status",
      "Residence ID Ready - Collect",
    ],
    medical_license: [
      "Submit Medical License Application",
      "Prepare License Documents",
      "License Verification Process",
      "Medical License Renewal",
    ],
    moh_licensing: [ // Alias for medical_license if needed
      "Permanent/New License Application",
      "Temporary License Application",
      "License Renewal",
      "Return Expired License",
    ],
    pip: [
      "Submit Pre Import Permit Request",
      "Prepare PIP Documents",
      "Follow up on PIP Status",
      "PIP Approved - Proceed",
    ],
    customs: [
      "Submit Customs Declaration",
      "Single Window Application",
      "Customs Clearance Process",
      "Collect Cleared Items",
    ],
    car_bolo_insurance: [
      "Apply for Car Bolo",
      "Renew Car Insurance",
      "Update Vehicle Registration",
      "Car Bolo & Insurance Renewal",
    ],
    company_registration: [
      "Prepare Registration Documents",
      "Submit Online Application",
      "Collect Business License",
    ],
    govt_affairs: [
      "Investment Commission Process",
      "ETA Requirements",
      "PACCS Process",
    ]
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    // onOpenChange(false) // Let parent handle closing if needed, or keep it here
  }

  const isEditMode = !!task

  // Determine which fields to show based on category
  const showPersonSelector = ["work_permit", "residence_id", "medical_license", "moh_licensing"].includes(formData.category)
  const showSubType = ["work_permit", "medical_license", "moh_licensing"].includes(formData.category)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-slate-950 border-l border-slate-800 w-full sm:max-w-xl p-0 shadow-2xl overflow-y-auto">
        
        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-6 sticky top-0 z-10">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              {isEditMode ? "Update Task" : "Create New Task"}
            </SheetTitle>
            <SheetDescription className="text-slate-400">
              {isEditMode
                ? "Refine and update the task details below."
                : "Orchestrate a new workflow item."}
            </SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8 pb-24">
          
          {/* GROUP 1: CONTEXT */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              <h3 className="text-sm font-semibold text-blue-400 tracking-wider uppercase">
                Context & Subject
              </h3>
            </div>
            
            <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-800/60 shadow-inner space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                    Workflow Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value, title: "", subType: "" })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-100 h-10 hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-200">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="text-slate-200 focus:bg-slate-800 focus:text-blue-400">
                          <div className="flex items-center gap-2">
                            <cat.icon className="w-4 h-4 text-slate-400" />
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
                    <Label htmlFor="subType" className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                      Specific Type
                    </Label>
                    <Select
                      value={formData.subType}
                      onValueChange={(value) => setFormData({ ...formData, subType: value })}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-100 h-10 hover:bg-slate-800 transition-all">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                      {formData.category === "work_permit" ? (
                        workPermitSubTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-slate-200 focus:bg-slate-800">
                            {type.label}
                          </SelectItem>
                        ))
                      ) : (
                        mohSubTypes.map((type) => (
                           <SelectItem key={type.value} value={type.value} className="text-slate-200 focus:bg-slate-800">
                            {type.label}
                          </SelectItem>
                        ))
                      )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Person Selector (Dynamic) */}
              {showPersonSelector && (
                <div className="space-y-2 pt-1">
                  <Label htmlFor="personId" className="text-slate-300 text-xs font-medium uppercase tracking-wide flex items-center justify-between">
                    <span>Subject Person</span>
                    <span className="text-[10px] text-slate-500 normal-case font-normal">Who is this for?</span>
                  </Label>
                  <Select
                    value={formData.personId}
                    onValueChange={(value) => setFormData({ ...formData, personId: value })}
                    disabled={loadingPeople}
                  >
                    <SelectTrigger className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-slate-700 text-slate-100 h-11 hover:border-blue-500/50 transition-all duration-300 group">
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                        <SelectValue placeholder={loadingPeople ? "Loading..." : "Link to a person..."} />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 max-h-[250px]">
                      {people.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-slate-200 focus:bg-slate-800 focus:text-blue-400 cursor-pointer">
                          {p.firstName} {p.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </section>

          {/* GROUP 2: DETAILS */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-1 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
              <h3 className="text-sm font-semibold text-purple-400 tracking-wider uppercase">
                Task Specifics
              </h3>
            </div>

            <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-800/60 shadow-inner space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300 text-xs font-medium uppercase tracking-wide">
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
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-100 h-10 hover:bg-slate-800 hover:border-purple-500/50 transition-all">
                        <SelectValue placeholder="Select a standard task..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {quickTitles[formData.category]?.map((title) => (
                          <SelectItem key={title} value={title} className="text-slate-200 focus:bg-slate-800">
                            {title}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom" className="text-purple-400 font-medium border-t border-slate-700 mt-1 pt-1 focus:bg-slate-800">
                          + create custom title
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  
                  {/* Custom Input */}
                  {(!formData.category || !quickTitles[formData.category]?.includes(formData.title)) && (
                    <Input
                      value={formData.title}
                      placeholder="e.g., Renew Medical License for Dr. Smith"
                      className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                  Description & Notes
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter detailed steps, required documents, or special instructions..."
                  className="bg-slate-800/50 border-slate-700 text-slate-100 min-h-[120px] placeholder:text-slate-500 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all"
                  required
                />
              </div>
            </div>
          </section>

          {/* GROUP 3: EXECUTION */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-1 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <h3 className="text-sm font-semibold text-emerald-400 tracking-wider uppercase">
                Execution Logic
              </h3>
            </div>

            <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-800/60 shadow-inner space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="assignee" className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                    Assign To
                  </Label>
                  <Select
                    value={formData.assignee}
                    onValueChange={(value) => setFormData({ ...formData, assignee: value })}
                    disabled={loadingUsers}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-100 h-10 hover:bg-slate-800 hover:border-emerald-500/50 transition-all">
                      <SelectValue placeholder={loadingUsers ? "Loading..." : "Select assignee"} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 max-h-[200px]">
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id} className="text-slate-200 focus:bg-slate-800">
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                   <Label htmlFor="dueDate" className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="bg-slate-800/50 border-slate-700 text-slate-100 h-10 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                    Initial Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-100 h-10 hover:bg-slate-800 transition-all">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="pending" className="text-slate-200 focus:bg-slate-800">Pending</SelectItem>
                      <SelectItem value="in-progress" className="text-blue-400 focus:bg-slate-800">In Progress</SelectItem>
                      <SelectItem value="completed" className="text-emerald-400 focus:bg-slate-800">Completed</SelectItem>
                      <SelectItem value="urgent" className="text-red-400 focus:bg-slate-800">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                    Priority Level
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-100 h-10 hover:bg-slate-800 transition-all">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="low" className="text-slate-400 focus:bg-slate-800">Low</SelectItem>
                      <SelectItem value="medium" className="text-yellow-400 focus:bg-slate-800">Medium</SelectItem>
                      <SelectItem value="high" className="text-red-500 focus:bg-slate-800">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>

          {/* Footer / Actions */}
          <div className="sticky bottom-0 -mx-6 -mb-6 p-6 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 flex items-center justify-end gap-3 z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.title || !formData.category || !formData.assignee}
              className={cn(
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-500/20 transition-all duration-300",
                !formData.title && "opacity-50 grayscale cursor-not-allowed"
              )}
            >
              {isEditMode ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}


