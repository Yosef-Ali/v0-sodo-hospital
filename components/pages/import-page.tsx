"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Search, Filter, Plus, Package, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ImportSheet } from "@/components/sheets/import-sheet"
import { getImports, getImportStats, createImport, updateImport, deleteImport, getImportById } from "@/lib/actions/v2/imports"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ImportPageProps {
  initialData: {
    imports: any[]
    stats: {
      total: number
      pip: number
      singleWindow: number
      pending: number
      completed: number
    }
  }
}

export function ImportPage({ initialData }: ImportPageProps) {
  const router = useRouter()
  const [imports, setImports] = useState<any[]>(initialData.imports)
  const [stats, setStats] = useState(initialData.stats)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedImport, setSelectedImport] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  // Load imports with optional filters
  const loadImports = async (query?: string) => {
    setLoading(true)
    const result = await getImports({ query, limit: 100 })
    if (result.success && result.data) {
      setImports(result.data)
    }
    const statsResult = await getImportStats()
    if (statsResult.success && statsResult.data) {
      setStats(statsResult.data)
    }
    setLoading(false)
  }

  // Filter imports based on current tab and search
  const filteredImports = imports.filter((item) => {
    if (activeTab !== "all" && activeTab !== item.category && activeTab !== item.status) {
      return false
    }
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  const handleCreateNew = () => {
    setSelectedImport(null)
    setIsSheetOpen(true)
  }

  const handleEditImport = async (item: any) => {
    // Optimistically select item, but fetch fresh data
    setSelectedImport(item)
    setIsSheetOpen(true)
    
    // Fetch fresh data
    const freshData = await getImportById(item.id)
    if (freshData.success && freshData.data) {
      setSelectedImport(freshData.data)
    }
  }

  const handleSubmit = async (data: any) => {
    if (selectedImport?.id) {
      const result = await updateImport(selectedImport.id, data)
      if (result.success) {
        toast.success("Import permit updated successfully")
        setIsSheetOpen(false)
        setSelectedImport(null)
        loadImports()
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update import permit")
      }
    } else {
      const result = await createImport({
        ...data,
        category: data.importType || "pip",
      })
      if (result.success) {
        toast.success("Import permit created successfully")
        setIsSheetOpen(false)
        setSelectedImport(null)
        loadImports()
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create import permit")
      }
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
                All <Badge className="ml-1 bg-slate-500/20 text-slate-300 text-xs border border-slate-500/30">{stats.total}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pip" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                PIP <Badge className="ml-1 bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">{stats.pip}</Badge>
              </TabsTrigger>
              <TabsTrigger value="single_window" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Single Window <Badge className="ml-1 bg-cyan-500/20 text-cyan-300 text-xs border border-cyan-500/30">{stats.singleWindow}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Pending <Badge className="ml-1 bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">{stats.pending}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Completed <Badge className="ml-1 bg-green-500/20 text-green-300 text-xs border border-green-500/30">{stats.completed}</Badge>
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

      {/* Import Cards */}
      {filteredImports.length === 0 ? (
        <div className="bg-gray-800/60 rounded-lg border border-gray-700 p-8 text-center">
          <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No import permits found</h3>
          <p className="text-gray-400 mb-4">
            {searchQuery ? "No permits match your search." : "Create a new import permit to get started."}
          </p>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" /> Create Import Permit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImports.map((item) => (
            <Card key={item.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:border-gray-600 transition-all">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-gray-700 p-2 rounded-md">
                    {item.category === "pip" ? (
                      <FileText className="h-5 w-5 text-purple-400" />
                    ) : (
                      <Package className="h-5 w-5 text-cyan-400" />
                    )}
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
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="text-gray-400">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Documents:</span>
                    <span className="text-gray-400">{(item.documents || []).length} attached</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center">
                <a 
                  href={`/import/${item.id}`}
                  className="text-xs text-green-400 hover:text-green-300 font-medium"
                >
                  View Details
                </a>
                <button 
                  onClick={() => handleEditImport(item)}
                  className="text-xs text-gray-400 hover:text-gray-300 font-medium"
                >
                  Edit
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ImportSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        onSubmit={handleSubmit}
        permit={selectedImport}
      />
    </div>
  )
}
