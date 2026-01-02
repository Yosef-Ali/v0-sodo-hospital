"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Search, Filter, Plus, Building2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CompanySheet } from "@/components/sheets/company-sheet"
import { getCompanies, getCompanyStats, createCompany, updateCompany, deleteCompany } from "@/lib/actions/v2/companies"

interface CompanyPageProps {
  initialData: {
    companies: any[]
    stats: {
      total: number
      documentPrep: number
      applyOnline: number
      approval: number
      completed: number
    }
  }
}

export function CompanyPage({ initialData }: CompanyPageProps) {
  const [companies, setCompanies] = useState<any[]>(initialData.companies)
  const [stats, setStats] = useState(initialData.stats)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  // Load companies with optional filters
  const loadCompanies = async (query?: string) => {
    setLoading(true)
    const result = await getCompanies({ query, limit: 100 })
    if (result.success && result.data) {
      setCompanies(result.data)
    }
    const statsResult = await getCompanyStats()
    if (statsResult.success && statsResult.data) {
      setStats(statsResult.data)
    }
    setLoading(false)
  }

  // Filter companies based on current tab and search
  const filteredCompanies = companies.filter((item) => {
    if (activeTab !== "all" && activeTab !== item.stage && activeTab !== item.status) {
      return false
    }
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  const handleCreateNew = () => {
    setSelectedCompany(null)
    setIsSheetOpen(true)
  }

  const handleEditCompany = (item: any) => {
    setSelectedCompany(item)
    setIsSheetOpen(true)
  }

  const handleSubmit = async (data: any) => {
    if (data.id) {
      const result = await updateCompany(data.id, data)
      if (result.success) {
        loadCompanies()
      }
    } else {
      const result = await createCompany(data)
      if (result.success) {
        loadCompanies()
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
                All <Badge className="ml-1 bg-slate-500/20 text-slate-300 text-xs border border-slate-500/30">{stats.total}</Badge>
              </TabsTrigger>
              <TabsTrigger value="document_prep" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Document Prep <Badge className="ml-1 bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">{stats.documentPrep}</Badge>
              </TabsTrigger>
              <TabsTrigger value="apply_online" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Apply Online <Badge className="ml-1 bg-cyan-500/20 text-cyan-300 text-xs border border-cyan-500/30">{stats.applyOnline}</Badge>
              </TabsTrigger>
              <TabsTrigger value="approval" className="text-sm whitespace-nowrap data-[state=active]:bg-gray-700">
                Approval <Badge className="ml-1 bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">{stats.approval}</Badge>
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

      {/* Company Cards */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-gray-800/60 rounded-lg border border-gray-700 p-8 text-center">
          <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No registration records found</h3>
          <p className="text-gray-400 mb-4">
            {searchQuery ? "No registrations match your search." : "Create a new registration to get started."}
          </p>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" /> Create Registration
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((item) => (
            <Card key={item.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:border-gray-600 transition-all">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-gray-700 p-2 rounded-md">
                    <Building2 className="h-5 w-5 text-blue-400" />
                  </div>
                  <Badge className={`text-xs border ${getStatusColor(item.status)}`}>
                    {item.status.replace("-", " ")}
                  </Badge>
                </div>

                <h3 className="font-medium text-lg mb-1 text-white">{item.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{item.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`text-xs border ${getStageColor(item.stage)}`}>
                    {getStageLabel(item.stage)}
                  </Badge>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  {item.companyName && (
                    <div className="flex justify-between">
                      <span>Company:</span>
                      <span className="text-gray-400">{item.companyName}</span>
                    </div>
                  )}
                  {item.registrationType && (
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="text-gray-400">{item.registrationType}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="text-gray-400">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Documents:</span>
                    <span className="text-gray-400">{(item.documents || []).length} attached</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center">
                <a 
                  href={`/company/${item.id}`}
                  className="text-xs text-green-400 hover:text-green-300 font-medium"
                >
                  View Details
                </a>
                <button 
                  onClick={() => handleEditCompany(item)}
                  className="text-xs text-gray-400 hover:text-gray-300 font-medium"
                >
                  Edit
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CompanySheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        onSubmit={handleSubmit}
        company={selectedCompany}
      />
    </div>
  )
}
