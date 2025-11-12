"use client"

import Link from "next/link"
import { Activity, Sparkles, Users, Briefcase, FileText, Clock, Star, TrendingDown, CheckCircle, Award } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen antialiased overflow-x-hidden text-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-400/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-400/5 via-transparent to-transparent pointer-events-none"></div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">SODO Hospital</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm">
            <Link href="/documents" className="text-slate-400 hover:text-white transition-colors">Documents</Link>
            <Link href="/teams" className="text-slate-400 hover:text-white transition-colors">Teams</Link>
            <Link href="/reports" className="text-slate-400 hover:text-white transition-colors">Reports</Link>
            <Link href="/dashboard">
              <button className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-slate-100 transition-all duration-200 hover:scale-105">
                Access Dashboard
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mr-auto ml-auto pt-16 pr-6 pb-8 pl-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-[180px] gap-4">

          {/* Hero Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 row-span-2 flex flex-col fade-in pt-8 pr-8 pb-8 pl-8 justify-center">
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-xs font-medium text-green-400 mb-6">
                <Sparkles className="w-3 h-3" />
                <span>SODO Hospital Management System</span>
              </div>
              <h1 className="sm:text-5xl lg:text-6xl leading-tight text-4xl font-bold tracking-tight mb-4">
                <span className="bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">Hospital</span>
                {' '}Document Management
              </h1>
              <p className="leading-relaxed max-w-lg text-lg text-slate-400">
                Efficiently manage license renewals, support letters, and authentication documents with our comprehensive administrative platform.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 shadow-lg">
                  Access Dashboard
                </button>
              </Link>
              <Link href="/documents">
                <button className="border border-slate-600 text-slate-300 px-6 py-3 rounded-lg font-medium hover:border-slate-500 hover:text-white transition-all duration-200">
                  View Documents
                </button>
              </Link>
            </div>
          </div>

          {/* Administrative Teams */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between col-span-1 lg:col-span-2 fade-in fade-in-delay-1 hover:scale-105 transition-transform duration-300">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Users className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold">Our Teams</h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">9 departments working together seamlessly</p>
            </div>
            <div className="flex -space-x-3">
              <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face" className="w-12 h-12 object-cover border-slate-700 border-2 rounded-full" alt="Department Lead" />
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop&crop=face" className="w-12 h-12 rounded-full border-2 border-slate-700" alt="Team Member" />
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=60&h=60&fit=crop&crop=face" className="w-12 h-12 rounded-full border-2 border-slate-700" alt="Administrator" />
              <div className="w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center text-xs font-medium">
                +45
              </div>
            </div>
          </div>

          {/* Documents Processed */}
          <div className="gradient-border fade-in fade-in-delay-2 hover:scale-105 transition-transform duration-300">
            <div className="gradient-border-inner flex flex-col h-full glow-card pt-6 pr-6 pb-6 pl-6 justify-between">
              <div className="flex space-x-3 items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Documents Processed</h3>
                  <p className="text-sm text-slate-400">Licenses, letters, and authentication docs</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-green-400">1,247</span>
                <p className="text-xs text-slate-500">completed this year</p>
              </div>
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
              <p className="text-sm text-slate-400 mb-4">Access your dashboard and track document progress</p>
              <Link href="/dashboard">
                <button className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                  Sign In
                </button>
              </Link>
            </div>
          </div>

          {/* Document Types */}
          <div className="glass-card flex flex-col fade-in fade-in-delay-4 hover:scale-105 transition-transform duration-300 rounded-2xl pt-6 pr-6 pb-6 pl-6 justify-between">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-semibold tracking-tight">Document Types</h3>
            </div>
            <div>
              <span className="text-3xl font-semibold text-orange-400">3</span>
              <p className="text-sm text-slate-400">Main document categories</p>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="glass-card flex flex-col fade-in fade-in-delay-4 hover:scale-105 transition-transform duration-300 rounded-2xl pt-6 pr-6 pb-6 pl-6 justify-between">
            <div>
              <span className="text-3xl font-semibold text-amber-400">32</span>
              <p className="text-sm text-slate-400">Awaiting review</p>
            </div>
            <div className="flex mb-3 space-x-2 items-center">
              <h3 className="text-lg font-semibold">Approvals</h3>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          {/* Staff Testimonial */}
          <div className="glass-card flex flex-col col-span-1 sm:col-span-2 lg:col-span-3 fade-in fade-in-delay-5 hover:scale-105 transition-transform duration-300 rounded-2xl pt-6 pr-6 pb-6 pl-6 justify-between">
            <div className="flex mb-4 space-x-4 items-center">
              <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=60&h=60&fit=crop&crop=face" className="w-12 h-12 rounded-full" alt="Dr. Ahmed Hassan" />
              <div>
                <p className="font-semibold">Dr. Ahmed Hassan</p>
                <p className="text-xs text-slate-400">Director of Administration, SODO Hospital</p>
              </div>
              <div className="flex text-yellow-400 ml-auto">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
            </div>
            <div className="text-base font-normal text-white mt-4">&quot;The system reduced our document processing time from 7 days to 4.2 days, significantly improving our workflow efficiency and staff productivity.&quot;</div>
          </div>

          {/* Processing Time */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-center items-center text-center fade-in fade-in-delay-6 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-3">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Avg. Processing</h3>
            <p className="text-xs text-slate-400">4.2 days</p>
          </div>

          {/* Success Rate */}
          <div className="glass-card flex flex-col fade-in fade-in-delay-7 hover:scale-105 transition-transform duration-300 text-center rounded-2xl pt-6 pr-6 pb-6 pl-6 items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Success Rate</h3>
            <p className="text-xs text-slate-400">98% approved</p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800">
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center fade-in fade-in-delay-1">
          <p className="text-slate-400 text-sm">© 2024 SODO Hospital. All rights reserved.</p>
        </div>
      </footer>

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
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(168, 85, 247, 0.2));
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
