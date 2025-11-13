import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface StatusCardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  subtitle?: string
  trendLabel?: string
  isLoading?: boolean
}

export function StatusCard({
  title,
  value,
  change,
  changeType,
  subtitle,
  trendLabel = "vs last 7 days",
  isLoading = false,
}: StatusCardProps) {
  const badgeColors =
    changeType === "positive"
      ? "bg-emerald-500/10 text-emerald-400"
      : changeType === "negative"
        ? "bg-rose-500/10 text-rose-300"
        : "bg-slate-500/10 text-slate-300"

  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-800 bg-gray-900/70 p-6 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-gray-300">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-gray-500">{subtitle}</div> : null}
        </div>
        {isLoading ? (
          <Skeleton className="h-6 w-20 bg-gray-800" />
        ) : (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${badgeColors}`}>
            {changeType === "positive" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : changeType === "negative" ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : null}
            {change}
          </span>
        )}
      </div>
      <div className="mt-6 flex items-end justify-between">
        {isLoading ? (
          <Skeleton className="h-9 w-20 bg-gray-800" />
        ) : (
          <span className="text-3xl font-semibold text-white">{value}</span>
        )}
        {isLoading ? (
          <Skeleton className="h-3 w-16 bg-gray-800" />
        ) : (
          <span className="text-xs text-gray-500">{trendLabel}</span>
        )}
      </div>
    </div>
  )
}
