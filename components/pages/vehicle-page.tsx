"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Search, Filter, Plus, Car, FileCheck, Clock, CheckCircle2, AlertCircle, Fuel, Shield, Truck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { VehicleTaskSheet } from "@/components/sheets/vehicle-task-sheet"

interface VehicleTask {
  id: string
  title: string
  description: string
  category: "inspection" | "road_fund" | "insurance" | "road_transport"
  status: "pending" | "in-progress" | "completed" | "urgent"
  dueDate: string
  assignee: string
  vehicleInfo: string
  plateNumber: string
  documents: string[]
  createdAt: string
}

// Sample data
const sampleTasks: VehicleTask[] = [
  {
    id: "1",
    title: "Annual Vehicle Inspection",
    description: "Annual inspection for hospital ambulance",
    category: "inspection",
    status: "pending",
    dueDate: "2026-01-15",
    assignee: "Kalkidan Folli",
    vehicleInfo: "Toyota Land Cruiser Ambulance",
    plateNumber: "AA-12345",
    documents: ["Libre", "Previous Inspection"],
    createdAt: "2026-01-01",
  },
  {
    id: "2",
    title: "Road Fund Payment",
    description: "Quarterly road fund payment for fleet",
    category: "road_fund",
    status: "in-progress",
    dueDate: "2026-01-20",
    assignee: "Bethel Ayalew",
    vehicleInfo: "Hospital Fleet",
    plateNumber: "Multiple",
    documents: ["Bank Slip", "Libre"],
    createdAt: "2026-01-02",
  },
  {
    id: "3",
    title: "Insurance Renewal",
    description: "Comprehensive insurance renewal",
    category: "insurance",
    status: "urgent",
    dueDate: "2026-01-10",
    assignee: "Niccodimos Ezechiel",
    vehicleInfo: "Admin Vehicle",
    plateNumber: "AA-67890",
    documents: ["Current Policy", "Vehicle Registration"],
    createdAt: "2026-01-01",
  },
]

export function VehiclePage() {
  const [tasks, setTasks] = useState<VehicleTask[]>(sampleTasks)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTask, setSelectedTask] = useState<VehicleTask | null>(null)

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (activeTab !== "all" && activeTab !== task.category && activeTab !== task.status) {
      return false
    }
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !task.plateNumber.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  // Count tasks
  const taskCounts = {
    all: tasks.length,
    inspection: tasks.filter((t) => t.category === "inspection").length,
    road_fund: tasks.filter((t) => t.category === "road_fund").length,
    insurance: tasks.filter((t) => t.category === "insurance").length,
    road_transport: tasks.filter((t) => t.category === "road_transport").length,
  }

  const handleCreateNew = () => {
    setSelectedTask(null)
    setIsSheetOpen(true)
  }

  const handleEditTask = (task: VehicleTask) => {
    setSelectedTask(task)
    setIsSheetOpen(true)
  }

  const handleAddTask = (taskData: any) => {
    if (taskData.id) {
      setTasks(tasks.map((t) => (t.id === taskData.id ? { ...t, ...taskData } : t)))
    } else {
      const newTask: VehicleTask = {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "inspection": return <FileCheck className="h-5 w-5 text-blue-400" />
      case "road_fund": return <Fuel className="h-5 w-5 text-amber-400" />
      case "insurance": return <Shield className="h-5 w-5 text-green-400" />
      case "road_transport": return <Truck className="h-5 w-5 text-purple-400" />
      default: return <Car className="h-5 w-5 text-gray-400" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "inspection": return "Inspection"
      case "road_fund": return "Road Fund"
      case "insurance": return "Insurance"
      case "road_transport": return "Road Transport"
      default: return category
    }
  }

  return (
    <div className="p-8">
      <PageHeader 
        title="Vehicle Management" 
        description="Manage vehicle inspections, road fund, insurance and transport permits" 
      />

      <div className="mt-8 md:mt-10 lg:mt-12 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <div className="w-full overflow-x-auto">
            <TabsList className="bg-gray-800 border border-gray-700 inline-flex min-w-max gap-2 rounded-md">
              <TabsTrigger value="all" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                All <Badge className="ml-1 bg-slate-500/20 text-slate-300 text-xs border border-slate-500/30">{taskCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="inspection" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Inspection <Badge className="ml-1 bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">{taskCounts.inspection}</Badge>
              </TabsTrigger>
              <TabsTrigger value="road_fund" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Road Fund <Badge className="ml-1 bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">{taskCounts.road_fund}</Badge>
              </TabsTrigger>
              <TabsTrigger value="insurance" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Insurance <Badge className="ml-1 bg-green-500/20 text-green-300 text-xs border border-green-500/30">{taskCounts.insurance}</Badge>
              </TabsTrigger>
              <TabsTrigger value="road_transport" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Road Transport <Badge className="ml-1 bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">{taskCounts.road_transport}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <Input
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/60 border-gray-700 text-gray-300"
            />
          </div>
          <Button variant="outline" size="sm" className="border-gray-700 bg-gray-800/60 text-gray-300">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" /> New Task
          </Button>
        </div>
      </div>

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <div className="bg-gray-800/60 rounded-lg border border-gray-700 p-8 text-center">
          <Car className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No vehicle tasks found</h3>
          <p className="text-gray-400 mb-4">
            {searchQuery ? "No tasks match your search." : "Create a new vehicle task to get started."}
          </p>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" /> Create Vehicle Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:border-gray-600 transition-all">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-gray-700 p-2 rounded-md">
                    {getCategoryIcon(task.category)}
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
                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {task.plateNumber}
                  </Badge>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Vehicle:</span>
                    <span className="text-gray-400">{task.vehicleInfo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="text-gray-400">{task.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assignee:</span>
                    <span className="text-gray-400">{task.assignee}</span>
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

      <VehicleTaskSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        onSubmit={handleAddTask}
        task={selectedTask}
      />
    </div>
  )
}
