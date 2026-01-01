"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Search, Filter, Plus, Package, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ImportTaskSheet } from "@/components/sheets/import-task-sheet"

interface ImportTask {
  id: string
  title: string
  description: string
  category: "pip" | "single_window"
  status: "pending" | "in-progress" | "completed" | "urgent"
  dueDate: string
  assignee: string
  documents: string[]
  createdAt: string
}

// Sample data - will be replaced with database data
const sampleTasks: ImportTask[] = [
  {
    id: "1",
    title: "PIP Application - Medical Equipment",
    description: "Pre Import Permit for hospital medical equipment",
    category: "pip",
    status: "pending",
    dueDate: "2026-01-15",
    assignee: "Niccodimos Ezechiel",
    documents: ["Support Letter", "Official Letter", "Proforma Invoice"],
    createdAt: "2026-01-01",
  },
  {
    id: "2",
    title: "Single Window - Pharmaceutical Import",
    description: "Customs clearance for pharmaceutical supplies",
    category: "single_window",
    status: "in-progress",
    dueDate: "2026-01-20",
    assignee: "Bethel Ayalew",
    documents: ["PIP Certificate", "Commercial Invoice", "Packing List"],
    createdAt: "2026-01-02",
  },
]

export function ImportPage() {
  const [tasks, setTasks] = useState<ImportTask[]>(sampleTasks)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTask, setSelectedTask] = useState<ImportTask | null>(null)

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (activeTab !== "all" && activeTab !== task.category && activeTab !== task.status) {
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
    pip: tasks.filter((t) => t.category === "pip").length,
    single_window: tasks.filter((t) => t.category === "single_window").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  }

  const handleCreateNew = () => {
    setSelectedTask(null)
    setIsSheetOpen(true)
  }

  const handleEditTask = (task: ImportTask) => {
    setSelectedTask(task)
    setIsSheetOpen(true)
  }

  const handleAddTask = (taskData: any) => {
    if (taskData.id) {
      setTasks(tasks.map((t) => (t.id === taskData.id ? { ...t, ...taskData } : t)))
    } else {
      const newTask: ImportTask = {
        id: Date.now().toString(),
        ...taskData,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setTasks([newTask, ...tasks])
    }
    setIsSheetOpen(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-amber-400" />
      case "in-progress": return <AlertCircle className="h-4 w-4 text-blue-400" />
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case "urgent": return <AlertCircle className="h-4 w-4 text-red-400" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
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

  const getCategoryLabel = (category: string) => {
    return category === "pip" ? "Pre Import Permit (PIP)" : "Ethiopia Single Window"
  }

  return (
    <div className="p-8">
      <PageHeader 
        title="Import" 
        description="Manage Pre Import Permits (PIP) and Ethiopia Single Window customs processes" 
      />

      <div className="mt-8 md:mt-10 lg:mt-12 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <div className="w-full overflow-x-auto">
            <TabsList className="bg-gray-800 border border-gray-700 inline-flex min-w-max gap-2 rounded-md">
              <TabsTrigger value="all" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                All <Badge className="ml-1 bg-slate-500/20 text-slate-300 text-xs border border-slate-500/30">{taskCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pip" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                PIP <Badge className="ml-1 bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">{taskCounts.pip}</Badge>
              </TabsTrigger>
              <TabsTrigger value="single_window" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Single Window <Badge className="ml-1 bg-cyan-500/20 text-cyan-300 text-xs border border-cyan-500/30">{taskCounts.single_window}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Pending <Badge className="ml-1 bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">{taskCounts.pending}</Badge>
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
              placeholder="Search imports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/60 border-gray-700 text-gray-300"
            />
          </div>
          <Button variant="outline" size="sm" className="border-gray-700 bg-gray-800/60 text-gray-300">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" /> New Import
          </Button>
        </div>
      </div>

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <div className="bg-gray-800/60 rounded-lg border border-gray-700 p-8 text-center">
          <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No import tasks found</h3>
          <p className="text-gray-400 mb-4">
            {searchQuery ? "No tasks match your search." : "Create a new import task to get started."}
          </p>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" /> Create Import Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:border-gray-600 transition-all">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-gray-700 p-2 rounded-md">
                    {task.category === "pip" ? (
                      <FileText className="h-5 w-5 text-purple-400" />
                    ) : (
                      <Package className="h-5 w-5 text-cyan-400" />
                    )}
                  </div>
                  <Badge className={`text-xs border ${getStatusColor(task.status)}`}>
                    {task.status.replace("-", " ")}
                  </Badge>
                </div>

                <h3 className="font-medium text-lg mb-1 text-white">{task.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{task.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {getCategoryLabel(task.category)}
                  </Badge>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="text-gray-400">{task.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assignee:</span>
                    <span className="text-gray-400">{task.assignee}</span>
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

      <ImportTaskSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        onSubmit={handleAddTask}
        task={selectedTask}
      />
    </div>
  )
}
