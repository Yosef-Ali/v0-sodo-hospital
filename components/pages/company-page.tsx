"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Search, Filter, Plus, Building2, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CompanyTaskSheet } from "@/components/sheets/company-task-sheet"

interface CompanyTask {
  id: string
  title: string
  description: string
  stage: "document_prep" | "apply_online" | "approval" | "completed"
  status: "pending" | "in-progress" | "completed" | "urgent"
  dueDate: string
  assignee: string
  companyName: string
  registrationType: string
  documents: string[]
  createdAt: string
}

// Sample data
const sampleTasks: CompanyTask[] = [
  {
    id: "1",
    title: "Business License Renewal",
    description: "Annual business license renewal for Soddo Christian Hospital",
    stage: "document_prep",
    status: "pending",
    dueDate: "2026-01-30",
    assignee: "Niccodimos Ezechiel",
    companyName: "Soddo Christian Hospital",
    registrationType: "License Renewal",
    documents: ["Official Letter", "Current License", "COC"],
    createdAt: "2026-01-01",
  },
  {
    id: "2",
    title: "TIN Registration Update",
    description: "Update TIN registration details",
    stage: "apply_online",
    status: "in-progress",
    dueDate: "2026-01-25",
    assignee: "Bethel Ayalew",
    companyName: "Soddo Christian Hospital",
    registrationType: "TIN Update",
    documents: ["Business Registration", "ID Documents"],
    createdAt: "2026-01-02",
  },
]

export function CompanyPage() {
  const [tasks, setTasks] = useState<CompanyTask[]>(sampleTasks)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTask, setSelectedTask] = useState<CompanyTask | null>(null)

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (activeTab !== "all" && activeTab !== task.stage && activeTab !== task.status) {
      return false
    }
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  // Count tasks
  const taskCounts = {
    all: tasks.length,
    document_prep: tasks.filter((t) => t.stage === "document_prep").length,
    apply_online: tasks.filter((t) => t.stage === "apply_online").length,
    approval: tasks.filter((t) => t.stage === "approval").length,
    completed: tasks.filter((t) => t.stage === "completed").length,
  }

  const handleCreateNew = () => {
    setSelectedTask(null)
    setIsSheetOpen(true)
  }

  const handleEditTask = (task: CompanyTask) => {
    setSelectedTask(task)
    setIsSheetOpen(true)
  }

  const handleAddTask = (taskData: any) => {
    if (taskData.id) {
      setTasks(tasks.map((t) => (t.id === taskData.id ? { ...t, ...taskData } : t)))
    } else {
      const newTask: CompanyTask = {
        id: Date.now().toString(),
        ...taskData,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setTasks([newTask, ...tasks])
    }
    setIsSheetOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/20 text-amber-300 border-amber-500/30"
      case "in-progress": return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "completed": return "bg-green-500/20 text-green-300 border-green-500/30"
      case "urgent": return "bg-red-500/20 text-red-300 border-red-500/30"
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case "document_prep": return "Document Preparation"
      case "apply_online": return "Apply Online"
      case "approval": return "Pending Approval"
      case "completed": return "Completed"
      default: return stage
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "document_prep": return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "apply_online": return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
      case "approval": return "bg-amber-500/20 text-amber-300 border-amber-500/30"
      case "completed": return "bg-green-500/20 text-green-300 border-green-500/30"
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  return (
    <div className="p-8">
      <PageHeader 
        title="Company Registration" 
        description="Manage business licenses, registrations, TIN and company documentation" 
      />

      <div className="mt-8 md:mt-10 lg:mt-12 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <div className="w-full overflow-x-auto">
            <TabsList className="bg-gray-800 border border-gray-700 inline-flex min-w-max gap-2 rounded-md">
              <TabsTrigger value="all" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                All <Badge className="ml-1 bg-slate-500/20 text-slate-300 text-xs border border-slate-500/30">{taskCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="document_prep" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Document Prep <Badge className="ml-1 bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">{taskCounts.document_prep}</Badge>
              </TabsTrigger>
              <TabsTrigger value="apply_online" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Apply Online <Badge className="ml-1 bg-cyan-500/20 text-cyan-300 text-xs border border-cyan-500/30">{taskCounts.apply_online}</Badge>
              </TabsTrigger>
              <TabsTrigger value="approval" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Approval <Badge className="ml-1 bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">{taskCounts.approval}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Completed <Badge className="ml-1 bg-green-500/20 text-green-300 text-xs border border-green-500/30">{taskCounts.completed}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <Input
              placeholder="Search registrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/60 border-gray-700 text-gray-300"
            />
          </div>
          <Button variant="outline" size="sm" className="border-gray-700 bg-gray-800/60 text-gray-300">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" /> New Registration
          </Button>
        </div>
      </div>

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <div className="bg-gray-800/60 rounded-lg border border-gray-700 p-8 text-center">
          <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No registration tasks found</h3>
          <p className="text-gray-400 mb-4">
            {searchQuery ? "No tasks match your search." : "Create a new registration task to get started."}
          </p>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" /> Create Registration Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:border-gray-600 transition-all">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-gray-700 p-2 rounded-md">
                    <Building2 className="h-5 w-5 text-blue-400" />
                  </div>
                  <Badge className={`text-xs border ${getStatusColor(task.status)}`}>
                    {task.status.replace("-", " ")}
                  </Badge>
                </div>

                <h3 className="font-medium text-lg mb-1 text-white">{task.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{task.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`text-xs border ${getStageColor(task.stage)}`}>
                    {getStageLabel(task.stage)}
                  </Badge>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Company:</span>
                    <span className="text-gray-400">{task.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="text-gray-400">{task.registrationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="text-gray-400">{task.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Documents:</span>
                    <span className="text-gray-400">{task.documents.length} required</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center">
                <button className="text-xs text-green-400 hover:text-green-300 font-medium">
                  View Details
                </button>
                <button 
                  onClick={() => handleEditTask(task)}
                  className="text-xs text-gray-400 hover:text-gray-300 font-medium"
                >
                  Edit
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CompanyTaskSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        onSubmit={handleAddTask}
        task={selectedTask}
      />
    </div>
  )
}
