"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Search, Filter, Plus, Car, FileCheck, Fuel, Shield, Truck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { VehicleSheet } from "@/components/sheets/vehicle-sheet"
import { getVehicles, getVehicleStats, createVehicle, updateVehicle, deleteVehicle, getVehicleById } from "@/lib/actions/v2/vehicles"

interface VehiclePageProps {
  initialData: {
    vehicles: any[]
    stats: {
      total: number
      inspection: number
      roadFund: number
      insurance: number
      roadTransport: number
    }
  }
}

export function VehiclePage({ initialData }: VehiclePageProps) {
  const [vehicles, setVehicles] = useState<any[]>(initialData.vehicles)
  const [stats, setStats] = useState(initialData.stats)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  // Load vehicles with optional filters
  const loadVehicles = async (query?: string) => {
    setLoading(true)
    const result = await getVehicles({ query, limit: 100 })
    if (result.success && result.data) {
      setVehicles(result.data)
    }
    const statsResult = await getVehicleStats()
    if (statsResult.success && statsResult.data) {
      setStats(statsResult.data)
    }
    setLoading(false)
  }

  // Filter vehicles based on current tab and search
  const filteredVehicles = vehicles.filter((item) => {
    if (activeTab !== "all" && activeTab !== item.category && activeTab !== item.status) {
      return false
    }
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !item.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  const handleCreateNew = () => {
    setSelectedVehicle(null)
    setIsSheetOpen(true)
  }

  const handleEditVehicle = async (item: any) => {
    // Optimistically select item, but fetch fresh data
    setSelectedVehicle(item)
    setIsSheetOpen(true)
    
    // Fetch fresh data to ensure we have all fields (especially those missing from list view cache)
    const freshData = await getVehicleById(item.id)
    if (freshData.success && freshData.data) {
      setSelectedVehicle(freshData.data)
    }
  }

  const handleSubmit = async (data: any) => {
    if (data.id) {
      const result = await updateVehicle(data.id, data)
      if (result.success) {
        loadVehicles()
      }
    } else {
      const result = await createVehicle(data)
      if (result.success) {
        loadVehicles()
      }
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
                All <Badge className="ml-1 bg-slate-500/20 text-slate-300 text-xs border border-slate-500/30">{stats.total}</Badge>
              </TabsTrigger>
              <TabsTrigger value="inspection" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Inspection <Badge className="ml-1 bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">{stats.inspection}</Badge>
              </TabsTrigger>
              <TabsTrigger value="road_fund" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Road Fund <Badge className="ml-1 bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">{stats.roadFund}</Badge>
              </TabsTrigger>
              <TabsTrigger value="insurance" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Insurance <Badge className="ml-1 bg-green-500/20 text-green-300 text-xs border border-green-500/30">{stats.insurance}</Badge>
              </TabsTrigger>
              <TabsTrigger value="road_transport" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Road Transport <Badge className="ml-1 bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">{stats.roadTransport}</Badge>
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
            <Plus className="h-4 w-4 mr-2" /> New Vehicle
          </Button>
        </div>
      </div>

      {/* Vehicle Cards */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-gray-800/60 rounded-lg border border-gray-700 p-8 text-center">
          <Car className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No vehicle records found</h3>
          <p className="text-gray-400 mb-4">
            {searchQuery ? "No vehicles match your search." : "Create a new vehicle record to get started."}
          </p>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" /> Create Vehicle Record
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((item) => (
            <Card key={item.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:border-gray-600 transition-all">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-gray-700 p-2 rounded-md">
                    {getCategoryIcon(item.category)}
                  </div>
                  <Badge className={`text-xs border ${getStatusColor(item.status)}`}>
                    {item.status.replace("-", " ")}
                  </Badge>
                </div>

                <h3 className="font-medium text-lg mb-1 text-white">{item.title}</h3>
                {item.ticketNumber && (
                  <p className="text-xs text-green-400 font-mono mb-1">{item.ticketNumber}</p>
                )}
                <p className="text-sm text-gray-400 mb-3">{item.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {getCategoryLabel(item.category)}
                  </Badge>
                  {item.plateNumber && (
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                      {item.plateNumber}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  {item.vehicleInfo && (
                    <div className="flex justify-between">
                      <span>Vehicle:</span>
                      <span className="text-gray-400">{item.vehicleInfo}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="text-gray-400">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center">
                <a 
                  href={`/vehicle/${item.id}`}
                  className="text-xs text-green-400 hover:text-green-300 font-medium"
                >
                  View Details
                </a>
                <button 
                  onClick={() => handleEditVehicle(item)}
                  className="text-xs text-gray-400 hover:text-gray-300 font-medium"
                >
                  Edit
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <VehicleSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        onSubmit={handleSubmit}
        vehicle={selectedVehicle}
      />
    </div>
  )
}
