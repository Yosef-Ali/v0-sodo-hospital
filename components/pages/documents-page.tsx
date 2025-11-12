"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { DocumentCard } from "@/components/ui/document-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, Plus, Calendar, SortAsc, FileText } from "lucide-react"
import { DocumentSheet } from "@/components/sheets/document-sheet"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Document type definition
export interface Document {
  id: string
  title: string
  description: string
  status: "pending" | "approved" | "review"
  category: string
  fileType: string
  fileSize: string
  lastUpdated: string
  owner: string
  tags: string[]
  createdAt: string
}

// Sample documents data
const initialDocuments: Document[] = [
  {
    id: "doc-1",
    title: "Hospital License Renewal",
    description: "Annual hospital license renewal application with supporting documentation and compliance reports.",
    status: "pending",
    category: "License",
    fileType: "PDF",
    fileSize: "4.2 MB",
    lastUpdated: "2023-05-13",
    owner: "Dr. Samuel",
    tags: ["License", "Renewal", "Compliance"],
    createdAt: "2023-05-01",
  },
  {
    id: "doc-2",
    title: "Medical Staff Bylaws",
    description: "Official bylaws governing the medical staff organization, responsibilities, and privileges.",
    status: "approved",
    category: "Administrative",
    fileType: "DOCX",
    fileSize: "1.8 MB",
    lastUpdated: "2023-04-15",
    owner: "Medical Director",
    tags: ["Bylaws", "Staff", "Governance"],
    createdAt: "2023-04-01",
  },
  {
    id: "doc-3",
    title: "Infection Control Policy",
    description: "Updated infection control policies and procedures for all hospital departments.",
    status: "review",
    category: "Policies",
    fileType: "PDF",
    fileSize: "3.5 MB",
    lastUpdated: "2023-05-08",
    owner: "Infection Control Officer",
    tags: ["Policy", "Infection Control", "Safety"],
    createdAt: "2023-05-01",
  },
  {
    id: "doc-4",
    title: "Emergency Response Plan",
    description: "Comprehensive emergency response procedures for various scenarios including natural disasters.",
    status: "approved",
    category: "Safety",
    fileType: "PDF",
    fileSize: "7.2 MB",
    lastUpdated: "2023-02-20",
    owner: "Safety Officer",
    tags: ["Emergency", "Safety", "Procedures"],
    createdAt: "2023-02-01",
  },
  {
    id: "doc-5",
    title: "Pharmacy Formulary",
    description: "Current hospital formulary listing all approved medications with dosing guidelines.",
    status: "pending",
    category: "Pharmacy",
    fileType: "XLSX",
    fileSize: "2.4 MB",
    lastUpdated: "2023-05-10",
    owner: "Chief Pharmacist",
    tags: ["Pharmacy", "Medications", "Formulary"],
    createdAt: "2023-05-01",
  },
  {
    id: "doc-6",
    title: "Quality Improvement Report",
    description: "Quarterly quality metrics and improvement initiatives across all departments.",
    status: "review",
    category: "Quality",
    fileType: "PPTX",
    fileSize: "5.8 MB",
    lastUpdated: "2023-05-01",
    owner: "Quality Director",
    tags: ["Quality", "Metrics", "Improvement"],
    createdAt: "2023-04-15",
  },
  {
    id: "doc-7",
    title: "Patient Consent Forms",
    description: "Updated patient consent forms for various procedures and treatments.",
    status: "approved",
    category: "Legal",
    fileType: "PDF",
    fileSize: "1.2 MB",
    lastUpdated: "2023-03-15",
    owner: "Legal Counsel",
    tags: ["Legal", "Consent", "Forms"],
    createdAt: "2023-03-01",
  },
  {
    id: "doc-8",
    title: "Equipment Maintenance Logs",
    description: "Documentation of preventive maintenance for critical medical equipment.",
    status: "pending",
    category: "Maintenance",
    fileType: "XLSX",
    fileSize: "3.7 MB",
    lastUpdated: "2023-05-12",
    owner: "Maintenance Director",
    tags: ["Maintenance", "Equipment", "Logs"],
    createdAt: "2023-05-01",
  },
  {
    id: "doc-9",
    title: "Staff Training Materials",
    description: "Training materials for new employee orientation and continuing education.",
    status: "approved",
    category: "Training",
    fileType: "ZIP",
    fileSize: "12.5 MB",
    lastUpdated: "2023-04-05",
    owner: "HR Director",
    tags: ["Training", "HR", "Education"],
    createdAt: "2023-04-01",
  },
]

export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Filter documents based on active tab and search query
  const filteredDocuments = documents.filter((document) => {
    // Filter by tab
    if (activeTab !== "all" && document.status !== activeTab) {
      return false
    }

    // Filter by search query
    if (
      searchQuery &&
      !document.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !document.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !document.owner.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !document.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !document.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false
    }

    return true
  })

  // Count documents by status
  const documentCounts = {
    all: documents.length,
    pending: documents.filter((document) => document.status === "pending").length,
    approved: documents.filter((document) => document.status === "approved").length,
    review: documents.filter((document) => document.status === "review").length,
  }

  // Calculate document processing percentages
  const licenseRenewals =
    Math.round((documents.filter((doc) => doc.category === "License").length / documents.length) * 100) || 0
  const supportLetters = Math.round(
    (documents.filter((doc) => doc.category === "Administrative").length / documents.length) * 100 || 0,
  )
  const authentication =
    Math.round((documents.filter((doc) => doc.category === "Legal").length / documents.length) * 100) || 0

  // Handle adding a new document
  const handleAddDocument = (newDocument: Omit<Document, "id" | "createdAt" | "lastUpdated">) => {
    const id = `doc-${documents.length + 1}`
    const createdAt = new Date().toISOString().split("T")[0]
    const lastUpdated = createdAt

    setDocuments([...documents, { id, createdAt, lastUpdated, ...newDocument }])
    setIsSheetOpen(false)

    toast({
      title: "Document Created",
      description: `"${newDocument.title}" has been created successfully.`,
    })
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Documents"
        description="Manage and organize all hospital documents, forms, and records in one place."
      />

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-gray-800 border border-gray-700 w-full md:w-auto grid grid-cols-4">
            <TabsTrigger value="all" className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              All <Badge className="ml-1 bg-gray-600 text-xs">{documentCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              Pending <Badge className="ml-1 bg-gray-600 text-xs">{documentCounts.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="review"
              className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              Under Review <Badge className="ml-1 bg-gray-600 text-xs">{documentCounts.review}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              Approved <Badge className="ml-1 bg-gray-600 text-xs">{documentCounts.approved}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full text-gray-300"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-sm font-normal border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-300">
              <DropdownMenuItem className="hover:bg-gray-700">
                <Calendar className="h-4 w-4 mr-2" />
                Date Updated
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700">
                <SortAsc className="h-4 w-4 mr-2" />
                File Size
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            className="text-sm font-normal bg-green-600 hover:bg-green-700"
            onClick={() => setIsSheetOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Document Processing Status */}
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-5 mb-6 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-300">
        <h3 className="font-medium text-white mb-4">Document Processing Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">License Renewals</span>
              <span className="text-sm text-white">{licenseRenewals}%</span>
            </div>
            <Progress
              value={licenseRenewals}
              className="h-2 bg-gray-700/50"
              indicatorClassName="bg-gradient-to-r from-green-500 to-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Support Letters</span>
              <span className="text-sm text-white">{supportLetters}%</span>
            </div>
            <Progress
              value={supportLetters}
              className="h-2 bg-gray-700/50"
              indicatorClassName="bg-gradient-to-r from-green-500 to-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Authentication</span>
              <span className="text-sm text-white">{authentication}%</span>
            </div>
            <Progress
              value={authentication}
              className="h-2 bg-gray-700/50"
              indicatorClassName="bg-gradient-to-r from-green-500 to-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
            />
          </div>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No documents found</h3>
          <p className="text-gray-400 mb-4">
            {searchQuery
              ? "No documents match your search criteria. Try adjusting your search."
              : "There are no documents in this category. Upload a new document to get started."}
          </p>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload New Document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              title={document.title}
              description={document.description}
              status={document.status}
              category={document.category}
              fileType={document.fileType}
              fileSize={document.fileSize}
              lastUpdated={document.lastUpdated}
              owner={document.owner}
            />
          ))}
        </div>
      )}

      <DocumentSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} onSubmit={handleAddDocument} />
      <Toaster />
    </div>
  )
}
