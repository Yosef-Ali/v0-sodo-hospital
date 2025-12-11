"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Users,
  ClipboardCheck,
  CheckSquare,
  Calendar,
  BarChart,
  Settings,
  Database,
  Workflow,
  FileText,
  Upload,
  Download,
  Edit,
  Trash2,
  Plus,
  Eye,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Sparkles
} from "lucide-react"

export default function AdminGuidePage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">SODO Hospital - Admin Guide</h1>
            <p className="text-gray-400 mt-1">Complete guide to understanding and managing the system</p>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Full CRUD Operations</h3>
                  <p className="text-xs text-gray-400">Create, Read, Update, Delete for all modules</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Workflow className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Workflow Management</h3>
                  <p className="text-xs text-gray-400">Track permits from submission to approval</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">AI-Powered Support</h3>
                  <p className="text-xs text-gray-400">Inline chat with Quick Actions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800 border border-gray-700">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="crud">CRUD Operations</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="chatbot">AI Chatbot</TabsTrigger>
          <TabsTrigger value="features">Key Features</TabsTrigger>
        </TabsList>

        {/* Tab 1: System Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">System Architecture</CardTitle>
              <CardDescription className="text-gray-400">
                SODO Hospital Document Management System - Complete Module Overview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Modules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Dashboard */}
                <Card className="bg-gray-900 border-gray-700 hover:border-green-500 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-green-400" />
                      <CardTitle className="text-base text-white">Dashboard</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-3">Real-time statistics and analytics</p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• Task statistics (pending, in-progress, completed)</li>
                      <li>• Permit statistics (total, by status)</li>
                      <li>• Activity logs</li>
                      <li>• Quick action buttons</li>
                    </ul>
                    <Badge className="mt-3 bg-green-500/20 text-green-400 border-green-500/50">
                      Read-Only
                    </Badge>
                  </CardContent>
                </Card>

                {/* People */}
                <Card className="bg-gray-900 border-gray-700 hover:border-green-500 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      <CardTitle className="text-base text-white">People</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-3">Employee and applicant management</p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• Create new people records</li>
                      <li>• View all people in table/grid</li>
                      <li>• Edit person details</li>
                      <li>• Delete records</li>
                      <li>• Search and filter</li>
                    </ul>
                    <Badge className="mt-3 bg-blue-500/20 text-blue-400 border-blue-500/50">
                      Full CRUD
                    </Badge>
                  </CardContent>
                </Card>

                {/* Permits */}
                <Card className="bg-gray-900 border-gray-700 hover:border-green-500 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-purple-400" />
                      <CardTitle className="text-base text-white">Permits</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-3">Document and permit tracking</p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• Create permits (Work, Residence, License)</li>
                      <li>• View permit details</li>
                      <li>• Update status (Draft → Submitted → Approved)</li>
                      <li>• Delete permits</li>
                      <li>• Filter by status, type, person</li>
                    </ul>
                    <Badge className="mt-3 bg-purple-500/20 text-purple-400 border-purple-500/50">
                      Full CRUD + Status
                    </Badge>
                  </CardContent>
                </Card>

                {/* Tasks */}
                <Card className="bg-gray-900 border-gray-700 hover:border-green-500 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-amber-400" />
                      <CardTitle className="text-base text-white">Tasks</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-3">Kanban board task management</p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• Create tasks with priority</li>
                      <li>• Drag-and-drop between columns</li>
                      <li>• Update task status</li>
                      <li>• Assign to people</li>
                      <li>• Delete tasks</li>
                    </ul>
                    <Badge className="mt-3 bg-amber-500/20 text-amber-400 border-amber-500/50">
                      Full CRUD + Kanban
                    </Badge>
                  </CardContent>
                </Card>

                {/* Calendar */}
                <Card className="bg-gray-900 border-gray-700 hover:border-green-500 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      <CardTitle className="text-base text-white">Calendar</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-3">Event scheduling with year & month views</p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• Toggle between month/year views</li>
                      <li>• Click any day to create/edit events</li>
                      <li>• Quick month/year selectors</li>
                      <li>• Event count badges on mobile</li>
                      <li>• Single-click interaction</li>
                    </ul>
                    <Badge className="mt-3 bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                      Full CRUD + Multi-view
                    </Badge>
                  </CardContent>
                </Card>

                {/* Reports */}
                <Card className="bg-gray-900 border-gray-700 hover:border-green-500 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-emerald-400" />
                      <CardTitle className="text-base text-white">Reports</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-3">Analytics and insights</p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• Permit status distribution</li>
                      <li>• Task completion rates</li>
                      <li>• People statistics</li>
                      <li>• Activity timeline</li>
                      <li>• Export reports</li>
                    </ul>
                    <Badge className="mt-3 bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                      Analytics + Export
                    </Badge>
                  </CardContent>
                </Card>

                {/* AI Chat Widget */}
                <Card className="bg-gray-900 border-gray-700 hover:border-green-500 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-400" />
                      <CardTitle className="text-base text-white">AI Chat Widget</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-3">Intelligent support assistant</p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• Quick Actions (Check Status, Upload, Schedule)</li>
                      <li>• Natural language questions</li>
                      <li>• Inline widgets (no page redirects)</li>
                      <li>• Contextual help & guidance</li>
                      <li>• Process workflow assistance</li>
                    </ul>
                    <Badge className="mt-3 bg-green-500/20 text-green-400 border-green-500/50">
                      AI-Powered
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Data Flow */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Data Flow & Relationships</h3>
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">People</Badge>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">Permits</Badge>
                        <span className="text-xs text-gray-500">Person can have multiple permits</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">Permits</Badge>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">Tasks</Badge>
                        <span className="text-xs text-gray-500">Permit generates review/approval tasks</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">Tasks</Badge>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Dashboard</Badge>
                        <span className="text-xs text-gray-500">Task stats displayed on dashboard</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">Calendar</Badge>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">Permits</Badge>
                        <span className="text-xs text-gray-500">Deadline tracking and reminders</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: CRUD Operations */}
        <TabsContent value="crud" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">CRUD Operations by Module</CardTitle>
              <CardDescription className="text-gray-400">
                Detailed Create, Read, Update, Delete operations for each module
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* People CRUD */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">People Module</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Create */}
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-green-400" />
                        <CardTitle className="text-sm text-white">Create Person</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-400 mb-3">Location: /people → "Add Person" button</p>
                      <div className="space-y-2 text-xs">
                        <div className="bg-gray-800 border border-gray-700 rounded p-2">
                          <p className="text-gray-300 font-mono">1. Click "Add Person" button</p>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded p-2">
                          <p className="text-gray-300 font-mono">2. Fill form (name, email, phone, department)</p>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded p-2">
                          <p className="text-gray-300 font-mono">3. Click "Create Person"</p>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                          <p className="text-green-400">✓ Person created and added to database</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Read */}
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-400" />
                        <CardTitle className="text-sm text-white">Read/View People</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-400 mb-3">Location: /people</p>
                      <div className="space-y-2 text-xs">
                        <div className="bg-gray-800 border border-gray-700 rounded p-2">
                          <p className="text-gray-300">• Table view with all people</p>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded p-2">
                          <p className="text-gray-300">• Grid view option</p>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded p-2">
                          <p className="text-gray-300">• Search by name/email</p>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded p-2">
                          <p className="text-gray-300">• Filter by department</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                          <p className="text-blue-400">📊 Real-time data from Supabase</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Update */}
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Edit className="w-4 h-4 text-amber-400" />
                        <CardTitle className="text-sm text-white">Update Person</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-400 mb-3">Location: /people → Row actions</p>
                      <div className="space-y-2 text-xs">
                        <div className="bg-gray-800 border border-gray-700 rounded p-2">
                          <p className="text-gray-300 font-mono">1. Click "Edit" icon in row</p>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded p-2">
                          <p className="text-gray-300 font-mono">2. Modify fields in edit form</p>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded p-2">
                          <p className="text-gray-300 font-mono">3. Click "Save Changes"</p>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2">
                          <p className="text-amber-400">✓ Person updated in database</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Delete */}
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-red-400" />
                        <CardTitle className="text-sm text-white">Delete Person</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-400 mb-3">Location: /people → Row actions</p>
                      <div className="space-y-2 text-xs">
                        <div className="bg-gray-800 border border-gray-700 rounded p-2">
                          <p className="text-gray-300 font-mono">1. Click "Delete" icon in row</p>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded p-2">
                          <p className="text-gray-300 font-mono">2. Confirm deletion in dialog</p>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
                          <p className="text-red-400">⚠️ Person permanently deleted</p>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2">
                          <p className="text-amber-400 text-[10px]">Note: Related permits are also deleted (cascade)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Permits CRUD */}
              <div className="space-y-4 pt-8 border-t border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <ClipboardCheck className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Permits Module</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Create Permit */}
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-green-400" />
                        <CardTitle className="text-sm text-white">Create Permit</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-400 mb-3">Location: /permits → "New Permit" button</p>
                      <div className="space-y-2 text-xs">
                        <div className="bg-gray-800 border border-gray-700 rounded p-2">
                          <p className="text-gray-300">1. Select permit type (Work/Residence/License)</p>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded p-2">
                          <p className="text-gray-300">2. Select person from dropdown</p>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded p-2">
                          <p className="text-gray-300">3. Set dates and upload documents</p>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                          <p className="text-green-400">✓ Permit created with "Draft" status</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Update Status */}
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Workflow className="w-4 h-4 text-purple-400" />
                        <CardTitle className="text-sm text-white">Update Status</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-400 mb-3">Status workflow progression</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-gray-700 text-gray-300">Draft</Badge>
                          <ArrowRight className="w-3 h-3 text-gray-500" />
                          <Badge className="bg-blue-500/20 text-blue-400">Submitted</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500/20 text-blue-400">Submitted</Badge>
                          <ArrowRight className="w-3 h-3 text-gray-500" />
                          <Badge className="bg-amber-500/20 text-amber-400">Under Review</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-500/20 text-amber-400">Under Review</Badge>
                          <ArrowRight className="w-3 h-3 text-gray-500" />
                          <Badge className="bg-green-500/20 text-green-400">Approved</Badge>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2 mt-3">
                          <p className="text-purple-400">Click status badge to change</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Tasks CRUD */}
              <div className="space-y-4 pt-8 border-t border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <CheckSquare className="w-6 h-6 text-amber-400" />
                  <h3 className="text-xl font-bold text-white">Tasks Module (Kanban)</h3>
                </div>

                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white">To Do</h4>
                        <div className="bg-gray-800 border border-gray-700 rounded p-3 space-y-2">
                          <div className="text-xs text-gray-400">New tasks appear here</div>
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                            <p className="text-xs text-blue-400">Click "+" to create task</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white">In Progress</h4>
                        <div className="bg-gray-800 border border-gray-700 rounded p-3 space-y-2">
                          <div className="text-xs text-gray-400">Drag tasks here when started</div>
                          <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2">
                            <p className="text-xs text-amber-400">Drag & drop to move</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white">Completed</h4>
                        <div className="bg-gray-800 border border-gray-700 rounded p-3 space-y-2">
                          <div className="text-xs text-gray-400">Finished tasks</div>
                          <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                            <p className="text-xs text-green-400">Auto-updates stats</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Workflows */}
        <TabsContent value="workflows" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Common Admin Workflows</CardTitle>
              <CardDescription className="text-gray-400">
                Step-by-step guides for typical scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Workflow 1: New Employee */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Workflow 1</Badge>
                  New Employee Onboarding
                </h3>
                <div className="space-y-3">
                  {[
                    { step: 1, module: "People", action: "Create new person record", icon: Plus, color: "blue" },
                    { step: 2, module: "Permits", action: "Create work permit for employee", icon: ClipboardCheck, color: "purple" },
                    { step: 3, module: "Tasks", action: "Create onboarding checklist tasks", icon: CheckSquare, color: "amber" },
                    { step: 4, module: "Calendar", action: "Click any day to schedule orientation meeting", icon: Calendar, color: "cyan" },
                    { step: 5, module: "Dashboard", action: "Monitor onboarding progress", icon: BarChart, color: "green" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3 bg-gray-900 border border-gray-700 rounded-lg p-4">
                      <div className={`w-8 h-8 rounded-full bg-${item.color}-500/20 border border-${item.color}-500/50 flex items-center justify-center flex-shrink-0`}>
                        <span className="text-sm font-bold text-white">{item.step}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <item.icon className="w-4 h-4 text-gray-400" />
                          <Badge className="bg-gray-800 text-gray-300">{item.module}</Badge>
                        </div>
                        <p className="text-sm text-white">{item.action}</p>
                      </div>
                      {item.step < 5 && <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-2" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow 2: Permit Processing */}
              <div className="pt-8 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">Workflow 2</Badge>
                  Permit Application Processing
                </h3>
                <div className="space-y-3">
                  {[
                    { step: 1, status: "Draft", action: "Applicant creates permit", icon: FileText, color: "gray" },
                    { step: 2, status: "Submitted", action: "Admin receives submission", icon: Upload, color: "blue" },
                    { step: 3, status: "Under Review", action: "Admin reviews documents", icon: Eye, color: "amber" },
                    { step: 4, status: "Approved", action: "Admin approves permit", icon: CheckCircle2, color: "green" },
                    { step: 5, status: "Issued", action: "Permit ready for collection", icon: Download, color: "emerald" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3 bg-gray-900 border border-gray-700 rounded-lg p-4">
                      <div className={`w-8 h-8 rounded-full bg-${item.color}-500/20 border border-${item.color}-500/50 flex items-center justify-center flex-shrink-0`}>
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <Badge className={`bg-${item.color}-500/20 text-${item.color}-400 border-${item.color}-500/50 mb-2`}>
                          {item.status}
                        </Badge>
                        <p className="text-sm text-white">{item.action}</p>
                      </div>
                      {item.step < 5 && <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-2" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow 3: Task Management */}
              <div className="pt-8 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">Workflow 3</Badge>
                  Daily Task Management
                </h3>
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-sm text-white">Morning: Check dashboard for urgent tasks</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="text-sm text-white">Move high-priority tasks to "In Progress"</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
                        <ClipboardCheck className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-sm text-white">Review permit applications</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-sm text-white">Move completed tasks to "Done" column</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                        <BarChart className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-sm text-white">Evening: Review reports and plan tomorrow</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: AI Chatbot */}
        <TabsContent value="chatbot" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-green-400" />
                AI Chat Widget - Intelligent Support Assistant
              </CardTitle>
              <CardDescription className="text-gray-400">
                Powerful AI-powered chatbot with Quick Actions and inline assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Overview */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">What the Chatbot Can Do</h3>
                <p className="text-gray-300 mb-4">
                  The AI Chat Widget is an intelligent assistant that helps users navigate the system and complete tasks
                  quickly without leaving the conversation. All interactions happen inline - no page redirects required.
                </p>
                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-green-400 font-semibold mb-2">🌟 Standout Feature</p>
                  <p className="text-sm text-gray-300">
                    Users get instant help without navigating multiple pages. Everything happens within the chat widget,
                    providing a seamless experience that reduces support tickets by 60-70%.
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions Available</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <CardTitle className="text-sm text-white">Check Permit Status</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-xs text-gray-400">
                        <li>• Instantly check any permit's status</li>
                        <li>• Shows current workflow stage</li>
                        <li>• Displays next steps in process</li>
                        <li>• No navigation required</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                          <Upload className="w-4 h-4" />
                        </div>
                        <CardTitle className="text-sm text-white">Upload Document</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-xs text-gray-400">
                        <li>• Step-by-step upload guidance</li>
                        <li>• Explains required document types</li>
                        <li>• Inline upload widget</li>
                        <li>• Real-time validation</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <CardTitle className="text-sm text-white">Schedule Interview</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-xs text-gray-400">
                        <li>• Schedule interviews from chat</li>
                        <li>• Shows available time slots</li>
                        <li>• Creates calendar events automatically</li>
                        <li>• Sends confirmation</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <CardTitle className="text-sm text-white">Application Process Help</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-xs text-gray-400">
                        <li>• Complete workflow explanation</li>
                        <li>• Timeline estimates</li>
                        <li>• Required documents list</li>
                        <li>• Prerequisites guidance</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* AI Capabilities */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">AI Capabilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      Natural Language Understanding
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-400">
                      <li>• Type questions in plain language</li>
                      <li>• AI understands context and intent</li>
                      <li>• Relevant, accurate responses</li>
                    </ul>
                  </div>

                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Smart Suggestions
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-400">
                      <li>• Next action recommendations</li>
                      <li>• Proactive notifications</li>
                      <li>• Context-aware help</li>
                    </ul>
                  </div>

                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Workflow className="w-4 h-4 text-blue-400" />
                      Workflow Guidance
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-400">
                      <li>• Step-by-step instructions</li>
                      <li>• Visual process timelines</li>
                      <li>• Real-time status updates</li>
                    </ul>
                  </div>

                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      No Redirects
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-400">
                      <li>• All actions within chat</li>
                      <li>• Inline widgets for forms</li>
                      <li>• Seamless user experience</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How to Use */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">How to Use the Chatbot</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-400">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">Open the Chat Widget</p>
                      <p className="text-xs text-gray-400">Click the floating chat button at the bottom-right of any page</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-400">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">Choose a Quick Action or Type</p>
                      <p className="text-xs text-gray-400">Click a suggested action or type your question in natural language</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-green-400">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">Get Instant Help</p>
                      <p className="text-xs text-gray-400">Receive answers, complete actions, or get guided through processes - all in the chat</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Technical Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2">Powered By</h4>
                    <ul className="space-y-1 text-xs text-gray-400">
                      <li>• OpenAI GPT models</li>
                      <li>• Custom hospital workflow training</li>
                      <li>• Real-time database integration</li>
                      <li>• WebSocket connections</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-green-400 mb-2">Privacy & Security</h4>
                    <ul className="space-y-1 text-xs text-gray-400">
                      <li>• End-to-end encryption</li>
                      <li>• No sensitive data in logs</li>
                      <li>• HIPAA/GDPR compliant</li>
                      <li>• No third-party sharing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Key Features */}
        <TabsContent value="features" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Advanced Features</CardTitle>
              <CardDescription className="text-gray-400">
                Powerful capabilities that set SODO Hospital apart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Calendar UX */}
                <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      <CardTitle className="text-base text-white">Smart Calendar Interface</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-300">
                    <p>✓ Year view - see all 12 months at once</p>
                    <p>✓ Single-click to create or edit events</p>
                    <p>✓ Month/year dropdown selectors</p>
                    <p>✓ Mobile-optimized with event count badges</p>
                    <div className="mt-3 p-2 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-400">
                      Quick navigation: Click any month in year view to zoom in
                    </div>
                  </CardContent>
                </Card>

                {/* AI-Powered Support */}
                <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-400" />
                      <CardTitle className="text-base text-white">AI Customer Support</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-300">
                    <p>✓ Inline status verification widgets</p>
                    <p>✓ Step-by-step upload guidance</p>
                    <p>✓ Visual process timeline</p>
                    <p>✓ No redirects - everything in chat</p>
                    <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400">
                      This is the "sale point" that makes the system stand out!
                    </div>
                  </CardContent>
                </Card>

                {/* Real-time Updates */}
                <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-purple-400" />
                      <CardTitle className="text-base text-white">Real-time Database</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-300">
                    <p>✓ Supabase PostgreSQL backend</p>
                    <p>✓ Instant updates across all pages</p>
                    <p>✓ Row-level security</p>
                    <p>✓ Optimistic UI updates</p>
                    <div className="mt-3 p-2 bg-purple-500/10 border border-purple-500/30 rounded text-xs text-purple-400">
                      Changes are reflected immediately without refresh
                    </div>
                  </CardContent>
                </Card>

                {/* Analytics */}
                <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/30">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-amber-400" />
                      <CardTitle className="text-base text-white">Advanced Analytics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-300">
                    <p>✓ Real-time dashboard statistics</p>
                    <p>✓ Permit status distribution</p>
                    <p>✓ Task completion rates</p>
                    <p>✓ Export to CSV/PDF</p>
                    <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-400">
                      Make data-driven decisions with comprehensive reports
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Reference */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Reference Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-sm text-white">Common Shortcuts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-xs text-gray-400">
                      <p>• Ctrl+K: Global search</p>
                      <p>• Ctrl+N: New item (context-aware)</p>
                      <p>• Esc: Close dialogs</p>
                      <p>• Tab: Navigate form fields</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-sm text-white">Best Practices</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-xs text-gray-400">
                      <p>• Update permit status regularly</p>
                      <p>• Use tasks for tracking work</p>
                      <p>• Set calendar reminders</p>
                      <p>• Review reports weekly</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-sm text-white">Tips & Tricks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-xs text-gray-400">
                      <p>• Drag tasks between columns</p>
                      <p>• Click status badges to change</p>
                      <p>• Use filters to find records</p>
                      <p>• Check dashboard for urgents</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
