import type React from "react"
import { Search, Plus, Filter, Clock, CheckCircle, AlertCircle, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TasksPage() {
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
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
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

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              <NavItem href="#" label="Home" icon={<HomeIcon />} />
              <NavItem href="#" label="Courses" icon={<CoursesIcon />} />
              <NavItem href="#" label="Topics" icon={<TopicsIcon />} active />
              <NavItem href="#" label="Projects" icon={<ProjectsIcon />} />
              <NavItem href="#" label="Teams" icon={<TeamsIcon />} />
              <NavItem href="#" label="Extras" icon={<ExtrasIcon />} />
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Sign in to unlock courses, challenges and more.</div>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              SIGN IN
            </button>
          </div>

          <div className="p-4 border-t border-gray-700">
            <div className="text-sm font-medium text-gray-400 mb-2">Popular</div>
            <ul className="space-y-1">
              <PopularItem label="AI" icon={<AIIcon />} />
              <PopularItem label="Algorithms" icon={<AlgorithmsIcon />} />
              <PopularItem label="CSS" icon={<CSSIcon />} />
              <PopularItem label="Databases" icon={<DatabasesIcon />} />
              <PopularItem label="Fullstack" icon={<FullstackIcon />} />
            </ul>
            <button className="text-sm text-gray-400 hover:text-gray-300 mt-2">Show more...</button>
          </div>

          <div className="p-4 border-t border-gray-700 bg-gray-750">
            <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-2 px-4 rounded text-sm font-medium">
              UPGRADE & SAVE 25%
            </button>
            <div className="text-xs text-center text-yellow-500 mt-1">25% OFF FOREVER</div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-2">Tasks</h1>
            <p className="text-gray-400 mb-6">Manage and track all your hospital administrative tasks in one place.</p>

            <div className="flex items-center justify-between mb-6">
              <Tabs defaultValue="all" className="w-auto">
                <TabsList className="bg-gray-800 border border-gray-700">
                  <TabsTrigger
                    value="all"
                    className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                  >
                    All <Badge className="ml-1 bg-gray-600 text-xs">45</Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                  >
                    Pending
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                  >
                    Completed
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    placeholder="Filter tasks..."
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
                  New Task
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TaskCard
                title="License Renewal Processing"
                description="Review and process hospital license renewal applications from various departments."
                status="urgent"
                dueDate="Today"
                assignee="Dr. Samuel"
                category="Administrative"
              />
              <TaskCard
                title="Patient Record Verification"
                description="Verify and update patient records in the system to ensure accuracy and completeness."
                status="in-progress"
                dueDate="Tomorrow"
                assignee="Nurse Johnson"
                category="Records"
              />
              <TaskCard
                title="Medical Supply Inventory"
                description="Conduct inventory check of medical supplies and update the procurement list."
                status="pending"
                dueDate="Next week"
                assignee="Store Manager"
                category="Inventory"
              />
              <TaskCard
                title="Staff Training Documentation"
                description="Update training records for all staff who completed the recent infection control workshop."
                status="completed"
                dueDate="Completed"
                assignee="HR Director"
                category="Training"
              />
              <TaskCard
                title="Equipment Maintenance Schedule"
                description="Create maintenance schedule for all critical medical equipment for the next quarter."
                status="pending"
                dueDate="Next week"
                assignee="Maintenance Head"
                category="Maintenance"
              />
              <TaskCard
                title="Insurance Claim Processing"
                description="Process pending insurance claims for patients treated in the last month."
                status="in-progress"
                dueDate="3 days"
                assignee="Finance Officer"
                category="Finance"
              />
              <TaskCard
                title="Department Budget Review"
                description="Review and approve departmental budget proposals for the next fiscal year."
                status="pending"
                dueDate="Next month"
                assignee="Finance Director"
                category="Finance"
              />
              <TaskCard
                title="Medication Error Report"
                description="Compile and analyze medication error reports from all departments for the quality committee."
                status="urgent"
                dueDate="Tomorrow"
                assignee="Quality Officer"
                category="Quality"
              />
              <TaskCard
                title="New Staff Orientation"
                description="Prepare orientation materials for new staff joining next week."
                status="in-progress"
                dueDate="4 days"
                assignee="HR Assistant"
                category="HR"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  label: string
  icon: React.ReactNode
  active?: boolean
}

function NavItem({ href, label, icon, active }: NavItemProps) {
  return (
    <li>
      <a
        href={href}
        className={`flex items-center px-4 py-2 text-sm rounded-md ${
          active ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
        }`}
      >
        <span className="mr-3">{icon}</span>
        <span>{label}</span>
      </a>
    </li>
  )
}

interface PopularItemProps {
  label: string
  icon: React.ReactNode
}

function PopularItem({ label, icon }: PopularItemProps) {
  return (
    <li>
      <a href="#" className="flex items-center px-2 py-1 text-sm text-gray-400 hover:text-white rounded">
        <span className="mr-3 text-gray-500">{icon}</span>
        <span>{label}</span>
      </a>
    </li>
  )
}

interface TaskCardProps {
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "urgent"
  dueDate: string
  assignee: string
  category: string
}

function TaskCard({ title, description, status, dueDate, assignee, category }: TaskCardProps) {
  const statusColors = {
    pending: "bg-gray-600",
    "in-progress": "bg-blue-600",
    completed: "bg-green-600",
    urgent: "bg-red-600",
  }

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    "in-progress": <AlertCircle className="h-4 w-4" />,
    completed: <CheckCircle className="h-4 w-4" />,
    urgent: <AlertCircle className="h-4 w-4" />,
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-200 flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <Badge className={`${statusColors[status]} text-xs font-medium flex items-center gap-1`}>
            {statusIcons[status]}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          <button className="text-gray-500 hover:text-gray-300">
            <MoreHorizontal size={16} />
          </button>
        </div>
        <h3 className="font-medium text-lg mb-2 text-white">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{description}</p>
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Due:</span>
            <span className="text-gray-400">{dueDate}</span>
          </div>
          <div className="flex justify-between">
            <span>Assignee:</span>
            <span className="text-gray-400">{assignee}</span>
          </div>
          <div className="flex justify-between">
            <span>Category:</span>
            <span className="text-gray-400">{category}</span>
          </div>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center">
        <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">View Details</button>
        <button className="text-xs text-gray-400 hover:text-gray-300 font-medium">Mark Complete</button>
      </div>
    </div>
  )
}

// Icons
function HomeIcon() {
  return (
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
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function CoursesIcon() {
  return (
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
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}

function TopicsIcon() {
  return (
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
      <path d="M12 2H2v10h10V2Z" />
      <path d="M22 12h-10v10h10V12Z" />
      <path d="M12 12H2v10h10V12Z" />
      <path d="M22 2h-10v10h10V2Z" />
    </svg>
  )
}

function ProjectsIcon() {
  return (
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
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function TeamsIcon() {
  return (
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ExtrasIcon() {
  return (
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
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}

function AIIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v8" />
      <path d="M4.93 10.93 10 16" />
      <path d="M2 18h12" />
      <path d="M19.07 10.93 14 16" />
      <path d="M22 18h-4" />
      <path d="M19.07 7.07 14 2" />
      <path d="M4.93 7.07 10 2" />
    </svg>
  )
}

function AlgorithmsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}

function CSSIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 2v20h20" />
      <path d="M6 16a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
      <path d="M18 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
      <path d="M14 18a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
      <path d="M8 8h8" />
      <path d="M9 16c.6-2.3 1.4-4.3 3-6" />
    </svg>
  )
}

function DatabasesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  )
}

function FullstackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 10h-4V4h4v6z" />
      <path d="M14 10h-4V4h4v6z" />
      <path d="M10 10H6V4h4v6z" />
      <path d="M18 20h-4v-6h4v6z" />
      <path d="M14 20h-4v-6h4v6z" />
      <path d="M10 20H6v-6h4v6z" />
    </svg>
  )
}
