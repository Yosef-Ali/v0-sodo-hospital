"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Activity, Sparkles, Users, Briefcase, FileText, Clock, Star, TrendingDown, CheckCircle, ArrowRight, AlertTriangle, Terminal } from "lucide-react"
import { A2UIChatWidget } from "@/components/a2ui"
import { Button } from "@/components/ui/button"
import { UserButton } from "@/components/auth/user-button"
import { Badge } from "@/components/ui/badge"

interface LandingPageProps {
  initialPeople?: any[]
  notifications?: any[]
  taskStats?: {
    total: number
    byStatus: {
      pending: number
      "in-progress": number
      completed: number
      urgent: number
    }
    byPriority: {
      low: number
      medium: number
      high: number
    }
  } | null
  dbError?: string
}

export function LandingPage({ 
  initialPeople = [], 
  notifications = [],
  taskStats,
  dbError
}: LandingPageProps) {
  const { data: session } = useSession()
  
  // Get foreigners with photos first, then fill with placeholders
  const foreignersWithPhotos = initialPeople.filter(p => p.photoUrl).slice(0, 3)
  const placeholders = [
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=60&h=60&fit=crop&crop=face"
  ]
  
  const displayAvatars = [...foreignersWithPhotos]
  while (displayAvatars.length < 3) {
    displayAvatars.push({ photoUrl: placeholders[displayAvatars.length], firstName: "Placeholder" })
  }

  return (
    <div className="min-h-screen antialiased overflow-x-hidden text-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-400/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-green-400/5 via-transparent to-transparent pointer-events-none"></div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Soddo Christian General Hospital</span>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-sm">
            {session?.user ? (
              <UserButton user={session.user} />
            ) : (
              <Button
                asChild
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
              >
                <Link href="/login">
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mr-auto ml-auto pt-16 pr-6 pb-8 pl-6">
        {dbError && (
          <div className="mb-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-center gap-6 fade-in shadow-lg shadow-amber-500/5">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold text-amber-400 mb-1">Database Connection Required</h3>
              <p className="text-slate-400 text-sm mb-4 md:mb-0">
                The application cannot connect to the VPS database. This usually means the SSH tunnel is down.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <div className="bg-slate-900/50 rounded-lg px-4 py-2 border border-slate-700 flex items-center gap-2 group">
                <Terminal className="w-4 h-4 text-slate-500 group-hover:text-green-400 transition-colors" />
                <code className="text-xs text-slate-300 font-mono">./scripts/start-db-tunnel.sh</code>
              </div>
              <p className="text-[10px] text-slate-500 text-center">Run this command in a separate terminal</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">

          {/* Hero Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 row-span-2 flex flex-col fade-in pt-8 pr-8 pb-12 pl-8 justify-center">
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-xs font-medium text-green-400 mb-6">
                <Sparkles className="w-3 h-3" />
                <span>Hospital Administration Workspace v2.0</span>
              </div>
              <h1 className="sm:text-5xl lg:text-6xl leading-tight text-4xl font-bold tracking-tight mb-4 text-white">
                Empowering <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">International</span>
                {" "}Medical Teams
              </h1>
              <p className="leading-relaxed max-w-lg text-lg text-slate-400">
                A specialized administrative platform for Soddo Christian General Hospital to track Work Permits, Medical Licenses, and Residence IDs for our global healthcare professionals.
              </p>
            </div>
            <div className="flex items-center space-x-4 mb-8">
              <Button
                asChild
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Link href="/dashboard">
                  Access dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Administrative Teams */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between col-span-1 lg:col-span-2 fade-in fade-in-delay-1 hover:scale-105 transition-transform duration-300">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Users className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold">Our Team</h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Coordinating specialized medical professionals from across the globe to serve our community.
              </p>
            </div>
            <div className="flex -space-x-3">
              {displayAvatars.map((person, i) => (
                <div key={i} className="relative">
                  <img 
                    src={person.photoUrl} 
                    className="w-12 h-12 object-cover border-slate-700 border-2 rounded-full bg-slate-800" 
                    alt={person.firstName || "Foreigner"} 
                  />
                  {person.photoUrl && !person.photoUrl.includes("unsplash.com") && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full" title="Verified Profile"></div>
                  )}
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center text-xs font-medium">
                +{initialPeople.length > 3 ? initialPeople.length - 3 + 45 : 45}
              </div>
            </div>
          </div>

          {/* Active Records */}
          <div className="glass-card rounded-2xl p-5 flex flex-col justify-between fade-in fade-in-delay-2 hover:scale-105 transition-transform duration-300">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">
                  Active Records
                </p>
                <p className="text-xs text-slate-500 leading-snug">
                  International staff & documentation
                </p>
              </div>
              <div className="text-right mt-4">
                <span className="text-xl font-semibold text-green-400">842</span>
                <p className="text-[11px] text-slate-500 leading-snug">
                  verified professionals
                </p>
              </div>
          </div>

          {/* Staff Portal */}
          <div className="glass-card flex flex-col col-span-1 sm:col-span-1 lg:col-span-1 row-span-2 fade-in fade-in-delay-3 hover:scale-105 transition-transform duration-300 rounded-2xl pt-6 pr-6 pb-6 pl-6 justify-between">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl items-center justify-center">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Staff Portal</h3>
              <p className="text-sm text-slate-400 mb-4">
                Log in to handle renewals, track applications, and manage hospital documents.
              </p>
              <Button
                asChild
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                <Link href="/dashboard">
                  Admin Login
                </Link>
              </Button>
            </div>
          </div>

          {/* Document Types */}
          <div className="glass-card flex flex-col fade-in fade-in-delay-4 hover:scale-105 transition-transform duration-300 rounded-2xl pt-5 pr-5 pb-5 pl-5 justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <h3 className="text-sm font-semibold tracking-tight">Core Services</h3>
              </div>
              <span className="text-2xl font-semibold text-orange-400">5</span>
            </div>
            <p className="text-xs text-slate-400 leading-snug">
              Work Permits, Medical Licenses, Residence IDs, Customs Clearance & Support Letters.
            </p>
          </div>

          {/* Live Task Status (Restored Layout) */}
          <div className="glass-card flex flex-col fade-in fade-in-delay-4 hover:scale-105 transition-transform duration-300 rounded-2xl pt-6 pr-6 pb-6 pl-6 justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-3xl font-semibold text-amber-400">{taskStats?.byStatus.urgent || 0}</span>
                <Badge variant="outline" className="text-[9px] bg-red-500/10 text-red-400 border-red-500/20 px-1.5 py-0 animate-pulse">URGENT</Badge>
              </div>
              <p className="text-sm text-slate-400 leading-tight">Tasks requiring immediate attention</p>
            </div>
            <div className="flex mb-3 space-x-2 items-center">
              <h3 className="text-lg font-semibold">Live Status</h3>
              <Activity className="w-5 h-5 text-green-400" />
            </div>
          </div>

          {/* Urgent Notifications & Expiring Permits */}
          <div className="glass-card flex flex-col col-span-1 sm:col-span-2 lg:col-span-3 fade-in fade-in-delay-5 hover:scale-105 transition-transform duration-300 rounded-2xl pt-6 pr-6 pb-6 pl-6 justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Staff Notifications</h3>
              </div>
              <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                {notifications.length} Alert{notifications.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    {/* Foreigner Avatar */}
                    {item.person?.photoUrl ? (
                      <img 
                        src={item.person.photoUrl} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-slate-600 flex-shrink-0" 
                        alt={item.person.firstName || "Staff"} 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600 flex-shrink-0">
                        <Users className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.task?.title || "Notification"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.person ? `${item.person.firstName} ${item.person.lastName}` : "Unassigned"}
                        {item.task?.dueDate && (
                          <span className="ml-2 text-amber-400">
                            Due: {new Date(item.task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                    {/* Status Indicator */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      item.notificationType === "urgent" ? "bg-red-500 animate-pulse" : "bg-amber-400"
                    }`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">All tasks are on track. No urgent notifications.</p>
              </div>
            )}
            {notifications.length > 4 && (
              <Link href="/tasks" className="mt-4 text-xs text-green-400 hover:text-green-300 text-center block">
                View all {notifications.length} notifications →
              </Link>
            )}
          </div>

          {/* Processing/Completed Status */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-center items-center text-center fade-in fade-in-delay-6 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Total Completed</h3>
            <p className="text-xs text-slate-400">{taskStats?.byStatus.completed || 0} tasks</p>
          </div>

          {/* Success Rate/Total Board */}
          <div className="glass-card flex flex-col fade-in fade-in-delay-7 hover:scale-105 transition-transform duration-300 text-center rounded-2xl pt-6 pr-6 pb-6 pl-6 items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Efficiency</h3>
            <p className="text-xs text-slate-400">{taskStats?.total || 0} total records</p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800">
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center fade-in fade-in-delay-1 gap-2">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} Soddo Christian General Hospital. All rights reserved.</p>
          <p className="text-slate-500 text-xs">
            Developed by <a href="mailto:dev.yosefali@gmail.com" className="text-green-400 hover:text-green-300 transition-colors">Yosef Ali</a>
          </p>
        </div>
      </footer>

      {/* AI Support Chat Widget - Pure Google A2UI + Gemini */}
      <A2UIChatWidget />

      <style jsx>{`
        .fade-in { opacity: 0; transform: translateY(20px); animation: fadeInUp 0.8s ease-out forwards; }
        .fade-in-delay-1 { animation-delay: 0.1s; }
        .fade-in-delay-2 { animation-delay: 0.2s; }
        .fade-in-delay-3 { animation-delay: 0.3s; }
        .fade-in-delay-4 { animation-delay: 0.4s; }
        .fade-in-delay-5 { animation-delay: 0.5s; }
        .fade-in-delay-6 { animation-delay: 0.6s; }
        .fade-in-delay-7 { animation-delay: 0.7s; }
        .fade-in-delay-8 { animation-delay: 0.8s; }
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .glass-card {
          backdrop-filter: blur(8px);
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .gradient-border {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2));
          padding: 1px;
          border-radius: 16px;
        }
        .gradient-border-inner {
          background: rgb(15, 23, 42);
          border-radius: 15px;
          height: 100%;
          width: 100%;
        }
        .glow-card {
          box-shadow: 0 0 40px rgba(34, 197, 94, 0.15);
        }
      `}</style>
    </div>
  )
}
