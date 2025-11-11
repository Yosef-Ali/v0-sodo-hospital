"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CustomerSupportWidget } from "@/components/ui/customer-support-widget"
import {
  FileText,
  Clock,
  Shield,
  CheckCircle,
  Users,
  TrendingUp,
  ArrowRight,
  Star
} from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(147,51,234,0.1),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 mb-8">
              <Star className="h-4 w-4 text-blue-400 mr-2" />
              Professional Document Management System
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl mb-6">
              Streamline Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                Document Workflow
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              Manage administrative tasks, process documents efficiently, and track progress with our comprehensive hospital document management system.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/documents">
                <Button variant="outline" size="lg" className="border-gray-700 text-gray-300 hover:bg-gray-800 px-8 py-6 text-lg">
                  View Documents
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-800 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-700 bg-gray-900 p-8 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">1,200+</div>
              <div className="text-sm text-gray-400">Documents Processed</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-700 bg-gray-900 p-8 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">98%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-700 bg-gray-900 p-8 text-center">
              <div className="text-4xl font-bold text-amber-400 mb-2">4.2</div>
              <div className="text-sm text-gray-400">Days Avg Processing</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-700 bg-gray-900 p-8 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-sm text-gray-400">System Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything You Need to Manage Documents
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Comprehensive tools designed for hospital administrative efficiency
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative rounded-xl border border-gray-700 bg-gray-800 p-8 hover:border-blue-500 transition-all duration-300">
              <div className="mb-4 inline-flex rounded-lg bg-blue-500/10 p-3 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Document Processing</h3>
              <p className="text-gray-400">
                Handle license renewals, support letters, and authentication documents with ease.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative rounded-xl border border-gray-700 bg-gray-800 p-8 hover:border-green-500 transition-all duration-300">
              <div className="mb-4 inline-flex rounded-lg bg-green-500/10 p-3 text-green-400 group-hover:bg-green-500/20 transition-colors">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Time Tracking</h3>
              <p className="text-gray-400">
                Monitor processing times and identify bottlenecks in your workflow.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative rounded-xl border border-gray-700 bg-gray-800 p-8 hover:border-amber-500 transition-all duration-300">
              <div className="mb-4 inline-flex rounded-lg bg-amber-500/10 p-3 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure & Compliant</h3>
              <p className="text-gray-400">
                Enterprise-grade security with full compliance for healthcare documentation.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative rounded-xl border border-gray-700 bg-gray-800 p-8 hover:border-purple-500 transition-all duration-300">
              <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-3 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Approval Workflows</h3>
              <p className="text-gray-400">
                Streamlined approval processes for Ministry of Labor, HERQA, and internal reviews.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group relative rounded-xl border border-gray-700 bg-gray-800 p-8 hover:border-pink-500 transition-all duration-300">
              <div className="mb-4 inline-flex rounded-lg bg-pink-500/10 p-3 text-pink-400 group-hover:bg-pink-500/20 transition-colors">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Team Collaboration</h3>
              <p className="text-gray-400">
                Work together seamlessly with role-based access and real-time updates.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group relative rounded-xl border border-gray-700 bg-gray-800 p-8 hover:border-cyan-500 transition-all duration-300">
              <div className="mb-4 inline-flex rounded-lg bg-cyan-500/10 p-3 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Analytics & Insights</h3>
              <p className="text-gray-400">
                Track performance metrics and generate comprehensive reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative isolate overflow-hidden bg-gray-800 px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Transform Your Workflow?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-400">
            Start managing your hospital documents more efficiently today. Join hundreds of administrators who trust our system.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                Access Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-400">
              © 2025 SODO Hospital Document Management. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/documents" className="text-sm text-gray-400 hover:text-white transition-colors">
                Documents
              </Link>
              <Link href="/tasks" className="text-sm text-gray-400 hover:text-white transition-colors">
                Tasks
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Customer Support Widget */}
      <CustomerSupportWidget />
    </div>
  )
}
