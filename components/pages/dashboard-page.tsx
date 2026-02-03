"use client"

import { PageHeader } from "@/components/ui/page-header"
import { StatusCard } from "@/components/ui/status-card"
import { MetricCard } from "@/components/ui/metric-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight, Clock, Calendar, Car, Package, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface ExpiringItem {
  id: string
  type: "permit" | "passport" | "work_permit" | "residence_id" | "medical_license" | "vehicle" | "import" | "company"
  title: string
  entityName: string
  expiryDate: Date
  daysRemaining: number
  status: "expired" | "urgent" | "warning" | "upcoming"
  entityId?: string
  personId?: string
}

interface DashboardPageProps {
  initialData: {
    taskStats: any
    entityStats: any
    overdueCount: number
    myTasks: any[]
    expiringItems: ExpiringItem[]
    currentUser: { id: string; name: string | null } | null
    error?: string
  }
}

export function DashboardPage({ initialData }: DashboardPageProps) {
  const { taskStats, entityStats, overdueCount, myTasks, expiringItems, currentUser, error } = initialData
  const router = useRouter()
  const { toast } = useToast()

  // Count expiring items by status
  const expiredCount = expiringItems?.filter((i: ExpiringItem) => i.status === "expired").length || 0
  const urgentExpiryCount = expiringItems?.filter((i: ExpiringItem) => i.status === "urgent").length || 0
  const warningExpiryCount = expiringItems?.filter((i: ExpiringItem) => i.status === "warning").length || 0
  const totalExpiringCount = expiringItems?.length || 0

  const pendingTasks = taskStats?.byStatus?.pending || 0
  const inProgressTasks = taskStats?.byStatus?.["in-progress"] || 0
  const completedTasks = taskStats?.byStatus?.completed || 0
  const urgentTasks = taskStats?.byStatus?.urgent || 0
  const totalTasks = taskStats?.total || pendingTasks + inProgressTasks + completedTasks + urgentTasks

  const highPriorityTasks = taskStats?.byPriority?.high || 0
  const mediumPriorityTasks = taskStats?.byPriority?.medium || 0
  const lowPriorityTasks = taskStats?.byPriority?.low || 0

  const openTasks = pendingTasks + inProgressTasks + urgentTasks
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Entity counts from stats
  const totalForeigners = entityStats?.foreigners || 0
  const totalVehicles = entityStats?.vehicles || 0
  const totalImports = entityStats?.imports || 0
  const totalCompanies = entityStats?.companies || 0

  return (
    <div className="p-8">
      <PageHeader
        title="Administrative Dashboard"
        description="A quick overview of tasks and recent activity."
      />

      {error && (
        <div className="mb-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-center gap-6 fade-in shadow-lg shadow-amber-500/5">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-amber-500" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-semibold text-amber-400 mb-1">Database Connection Required</h3>
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              {error.includes("SSH") ? "The SSH tunnel is likely down. Please restore it to see your data." : error}
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg px-4 py-2 border border-slate-700 font-mono text-xs text-slate-300">
            ./scripts/start-db-tunnel.sh
          </div>
        </div>
      )}

      {/* Overdue tasks strip */}
      <div className="mt-4 mb-4 flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-amber-100">
          <AlertCircle className="h-4 w-4" />
          <span>
            {overdueCount === 0
              ? "No overdue tasks. You're on track."
              : `${overdueCount} task${overdueCount === 1 ? "" : "s"} overdue.`}
          </span>
        </div>
        {overdueCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-normal border-amber-500/60 text-amber-100 hover:bg-amber-500/20 hover:text-white"
            onClick={() => router.push("/tasks?filter=overdue")}
          >
            Review now
          </Button>
        )}
      </div>

      {/* Expiring items notification */}
      {totalExpiringCount > 0 && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-red-100">
              <Clock className="h-4 w-4" />
              <span>
                {expiredCount > 0 && (
                  <span className="font-semibold text-red-400">{expiredCount} expired</span>
                )}
                {expiredCount > 0 && urgentExpiryCount > 0 && ", "}
                {urgentExpiryCount > 0 && (
                  <span className="font-semibold text-orange-400">{urgentExpiryCount} urgent (within 7 days)</span>
                )}
                {(expiredCount > 0 || urgentExpiryCount > 0) && warningExpiryCount > 0 && ", "}
                {warningExpiryCount > 0 && (
                  <span className="text-yellow-400">{warningExpiryCount} expiring soon</span>
                )}
                <span className="ml-1">- documents/permits need attention</span>
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-normal border-red-500/60 text-red-100 hover:bg-red-500/20 hover:text-white"
              onClick={() => router.push("/calendar")}
            >
              <Calendar className="h-3 w-3 mr-1" />
              View in Calendar
            </Button>
          </div>

          {/* Quick list of most urgent items */}
          {(expiredCount > 0 || urgentExpiryCount > 0) && expiringItems && (
            <div className="mt-3 pt-3 border-t border-red-500/20">
              <p className="text-xs text-red-200 mb-2">Most urgent:</p>
              <ul className="space-y-1">
                {expiringItems
                  .filter((i: ExpiringItem) => i.status === "expired" || i.status === "urgent")
                  .slice(0, 5)
                  .map((item: ExpiringItem) => (
                    <li key={item.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">
                        <span className={item.status === "expired" ? "text-red-400" : "text-orange-400"}>
                          {item.status === "expired" ? "EXPIRED" : `${item.daysRemaining}d left`}
                        </span>
                        {" "}- {item.title} ({item.entityName})
                      </span>
                      <Link
                        href={item.personId ? `/foreigners/${item.personId}` : item.entityId ? `/${item.type}/${item.entityId}` : "#"}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* High-level task snapshot */}
      <div className="mt-8 md:mt-10 lg:mt-12 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard
          title="Open Tasks"
          value={String(openTasks)}
          change={`${urgentTasks} urgent`}
          changeType={urgentTasks > 0 ? "negative" : "positive"}
        />
        <StatusCard
          title="In Progress"
          value={String(inProgressTasks)}
          change={`${pendingTasks} waiting to start`}
          changeType="neutral"
        />
        <StatusCard
          title="Completed"
          value={String(completedTasks)}
          change={`${completionRate}% of all tasks`}
          changeType="positive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 space-y-6">
          {/* Permit and task mix metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard
              icon={<Users className="h-5 w-5 text-gray-400" />}
              title="Entity Overview"
              value={String(totalForeigners + totalVehicles + totalImports + totalCompanies)}
              subtext="Total records"
              change={`${totalForeigners} foreigners`}
              changeType="neutral"
              items={[
                {
                  label: "Foreigners",
                  value: String(totalForeigners),
                  action: { text: "View", link: "/foreigners" },
                },
                {
                  label: "Vehicles",
                  value: String(totalVehicles),
                  action: { text: "View", link: "/vehicle" },
                },
                {
                  label: "Imports",
                  value: String(totalImports),
                  action: { text: "View", link: "/import" },
                },
              ]}
              footer={`${totalCompanies} companies registered`}
              buttonText="View all foreigners"
              buttonLink="/foreigners"
              onChartClick={() => {
                toast({
                  title: "Entities",
                  description: "Opening foreigners list.",
                })
                router.push("/foreigners")
              }}
            />

            <MetricCard
              icon={<AlertCircle className="h-5 w-5 text-gray-400" />}
              title="Task Priority Mix"
              value={String(urgentTasks)}
              subtext="Urgent tasks"
              change={`${highPriorityTasks} high priority`}
              changeType={urgentTasks > 0 || highPriorityTasks > 0 ? "negative" : "positive"}
              items={[
                {
                  label: "High priority",
                  value: String(highPriorityTasks),
                  action: { text: "View", link: "/tasks?priority=high" },
                },
                {
                  label: "Medium priority",
                  value: String(mediumPriorityTasks),
                },
                {
                  label: "Low priority",
                  value: String(lowPriorityTasks),
                },
              ]}
              footer={`${openTasks} open tasks in total`}
              buttonText="Go to task board"
              buttonLink="/tasks"
              onChartClick={() => {
                toast({
                  title: "Tasks",
                  description: "Opening the task board.",
                })
                router.push("/tasks")
              }}
            />
          </div>

          {/* Quick stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalForeigners}</p>
                  <p className="text-xs text-gray-400">Foreigners</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Car className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalVehicles}</p>
                  <p className="text-xs text-gray-400">Vehicles</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Package className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalImports}</p>
                  <p className="text-xs text-gray-400">Imports</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalCompanies}</p>
                  <p className="text-xs text-gray-400">Companies</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right rail with quick links and today's focus */}
        <div className="space-y-6">
          {currentUser && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm p-4">
              <h3 className="font-medium text-white mb-1">
                My work today{currentUser.name ? `, ${currentUser.name.split(" ")[0]}` : ""}
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                {myTasks.length === 0
                  ? "No open tasks are assigned to you."
                  : `${myTasks.length} open task${myTasks.length === 1 ? "" : "s"} assigned to you.`}
              </p>
              {myTasks.length > 0 && (
                <ul className="space-y-2 mb-3 text-sm">
                  {myTasks.slice(0, 3).map((item) => (
                    <li key={item.task.id} className="flex items-center justify-between gap-2">
                      <span className="truncate text-gray-200">{item.task.title}</span>
                      <Badge variant="outline" className="bg-gray-700/60 text-gray-200 border-gray-600">
                        {item.task.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-xs font-medium"
                onClick={() => router.push("/tasks")}
              >
                Go to my tasks
              </Button>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm p-4">
            <h3 className="font-medium text-white mb-3">Quick navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tasks" className="flex items-center justify-between text-gray-300 hover:text-white">
                  <span>Task board</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/foreigners" className="flex items-center justify-between text-gray-300 hover:text-white">
                  <span>Foreigners</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="flex items-center justify-between text-gray-300 hover:text-white">
                  <span>Calendar</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/reports" className="flex items-center justify-between text-gray-300 hover:text-white">
                  <span>Reports</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm p-4">
            <h3 className="font-medium text-white mb-2">Today's focus</h3>
            <p className="text-sm text-gray-400">
              {urgentTasks > 0
                ? `You have ${urgentTasks} urgent task${urgentTasks === 1 ? "" : "s"} to review.`
                : "No urgent tasks right now. Great job staying ahead."}
            </p>
            {openTasks > 0 && (
              <p className="mt-2 text-xs text-gray-400">
                {openTasks} tasks are still open.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
