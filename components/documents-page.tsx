import { Search, Plus, Filter, FileText, FileCheck, FileWarning, MoreHorizontal, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export function DocumentsPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Top announcement bar */}
      <div className="bg-gray-800 py-3 px-6 flex items-center justify-center text-sm">
        <span className="mr-2">We might win Hospital of the Year!</span>
        <a href="#" className="text-blue-400 hover:text-blue-300">
          SUPPORT US
        </a>
        <button className="ml-auto text-gray-400 hover:text-gray-300">
          <span className="sr-only">Close</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - same as in TasksPage */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Sidebar content would be the same as in TasksPage */}
          {/* For brevity, I'm not duplicating it here */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-white mr-2"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span className="font-bold text-lg text-white">SODDO HOSPITAL</span>
            </div>
          </div>

          <div className="flex-1">
            {/* Sidebar navigation would go here */}
            {/* This is a placeholder to show the layout */}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-2">Documents</h1>
            <p className="text-gray-400 mb-6">
              Manage and organize all hospital documents, forms, and records in one place.
            </p>

            <div className="flex items-center justify-between mb-6">
              <Tabs defaultValue="all" className="w-auto">
                <TabsList className="bg-gray-800 border border-gray-700">
                  <TabsTrigger
                    value="all"
                    className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                  >
                    All <Badge className="ml-1 bg-gray-600 text-xs">156</Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                  >
                    Pending Review
                  </TabsTrigger>
                  <TabsTrigger
                    value="approved"
                    className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                  >
                    Approved
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    placeholder="Filter documents..."
                    className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-64 text-gray-300"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm font-normal border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button size="sm" className="text-sm font-normal bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </div>

            {/* Document Processing Status */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-5 mb-6">
              <h3 className="font-medium text-white mb-4">Document Processing Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">License Renewals</span>
                    <span className="text-sm text-white">45%</span>
                  </div>
                  <Progress value={45} className="h-2 bg-gray-700" indicatorClassName="bg-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Support Letters</span>
                    <span className="text-sm text-white">35%</span>
                  </div>
                  <Progress value={35} className="h-2 bg-gray-700" indicatorClassName="bg-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Authentication</span>
                    <span className="text-sm text-white">20%</span>
                  </div>
                  <Progress value={20} className="h-2 bg-gray-700" indicatorClassName="bg-blue-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DocumentCard
                title="Hospital License Renewal"
                description="Annual hospital license renewal application with supporting documentation and compliance reports."
                status="pending"
                category="License"
                fileType="PDF"
                fileSize="4.2 MB"
                lastUpdated="2 days ago"
                owner="Dr. Samuel"
              />
              <DocumentCard
                title="Medical Staff Bylaws"
                description="Official bylaws governing the medical staff organization, responsibilities, and privileges."
                status="approved"
                category="Administrative"
                fileType="DOCX"
                fileSize="1.8 MB"
                lastUpdated="1 month ago"
                owner="Medical Director"
              />
              <DocumentCard
                title="Infection Control Policy"
                description="Updated infection control policies and procedures for all hospital departments."
                status="review"
                category="Policies"
                fileType="PDF"
                fileSize="3.5 MB"
                lastUpdated="1 week ago"
                owner="Infection Control Officer"
              />
              <DocumentCard
                title="Emergency Response Plan"
                description="Comprehensive emergency response procedures for various scenarios including natural disasters."
                status="approved"
                category="Safety"
                fileType="PDF"
                fileSize="7.2 MB"
                lastUpdated="3 months ago"
                owner="Safety Officer"
              />
              <DocumentCard
                title="Pharmacy Formulary"
                description="Current hospital formulary listing all approved medications with dosing guidelines."
                status="pending"
                category="Pharmacy"
                fileType="XLSX"
                fileSize="2.4 MB"
                lastUpdated="5 days ago"
                owner="Chief Pharmacist"
              />
              <DocumentCard
                title="Quality Improvement Report"
                description="Quarterly quality metrics and improvement initiatives across all departments."
                status="review"
                category="Quality"
                fileType="PPTX"
                fileSize="5.8 MB"
                lastUpdated="2 weeks ago"
                owner="Quality Director"
              />
              <DocumentCard
                title="Patient Consent Forms"
                description="Updated patient consent forms for various procedures and treatments."
                status="approved"
                category="Legal"
                fileType="PDF"
                fileSize="1.2 MB"
                lastUpdated="2 months ago"
                owner="Legal Counsel"
              />
              <DocumentCard
                title="Equipment Maintenance Logs"
                description="Documentation of preventive maintenance for critical medical equipment."
                status="pending"
                category="Maintenance"
                fileType="XLSX"
                fileSize="3.7 MB"
                lastUpdated="3 days ago"
                owner="Maintenance Director"
              />
              <DocumentCard
                title="Staff Training Materials"
                description="Training materials for new employee orientation and continuing education."
                status="approved"
                category="Training"
                fileType="ZIP"
                fileSize="12.5 MB"
                lastUpdated="1 month ago"
                owner="HR Director"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface DocumentCardProps {
  title: string
  description: string
  status: "pending" | "approved" | "review"
  category: string
  fileType: string
  fileSize: string
  lastUpdated: string
  owner: string
}

function DocumentCard({
  title,
  description,
  status,
  category,
  fileType,
  fileSize,
  lastUpdated,
  owner,
}: DocumentCardProps) {
  const statusColors = {
    pending: "bg-yellow-600",
    approved: "bg-green-600",
    review: "bg-blue-600",
  }

  const statusIcons = {
    pending: <FileWarning className="h-4 w-4" />,
    approved: <FileCheck className="h-4 w-4" />,
    review: <FileText className="h-4 w-4" />,
  }

  const statusLabels = {
    pending: "Pending",
    approved: "Approved",
    review: "Under Review",
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-200 flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <Badge className={`${statusColors[status]} text-xs font-medium flex items-center gap-1`}>
            {statusIcons[status]}
            {statusLabels[status]}
          </Badge>
          <button className="text-gray-500 hover:text-gray-300">
            <MoreHorizontal size={16} />
          </button>
        </div>
        <h3 className="font-medium text-lg mb-2 text-white">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{description}</p>
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Category:</span>
            <span className="text-gray-400">{category}</span>
          </div>
          <div className="flex justify-between">
            <span>File Type:</span>
            <span className="text-gray-400">{fileType}</span>
          </div>
          <div className="flex justify-between">
            <span>Size:</span>
            <span className="text-gray-400">{fileSize}</span>
          </div>
          <div className="flex justify-between">
            <span>Updated:</span>
            <span className="text-gray-400">{lastUpdated}</span>
          </div>
          <div className="flex justify-between">
            <span>Owner:</span>
            <span className="text-gray-400">{owner}</span>
          </div>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center">
        <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">View Document</button>
        <button className="text-xs text-gray-400 hover:text-gray-300 font-medium flex items-center">
          <Download size={12} className="mr-1" />
          Download
        </button>
      </div>
    </div>
  )
}
