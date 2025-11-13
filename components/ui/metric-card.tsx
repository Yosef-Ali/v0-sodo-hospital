import type React from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"

interface MetricCardItem {
  label: string
  value: string
  hint?: string
  action?: { text: string; link: string }
  progress?: number
}

interface MetricCardProps {
  icon: React.ReactNode
  title: string
  value: string
  subtext: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  changeLabel?: string
  items: MetricCardItem[]
  footer: string
  buttonText: string
  buttonLink: string
  isLoading?: boolean
}

export function MetricCard({
  icon,
  title,
  value,
  subtext,
  change,
  changeType,
  changeLabel = "vs last 7 days",
  items,
  footer,
  buttonText,
  buttonLink,
  isLoading = false,
}: MetricCardProps) {
  const badgeColors =
    changeType === "positive"
      ? "bg-emerald-500/10 text-emerald-400"
      : changeType === "negative"
        ? "bg-rose-500/10 text-rose-300"
        : "bg-slate-500/10 text-slate-300"

  const rowsToRender = isLoading ? Math.max(items.length, 3) : items.length

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900/70 shadow-lg shadow-black/10">
      <div className="border-b border-gray-800 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-gray-800/80 p-2 text-gray-300">{icon}</div>
            <div>
              <div className="text-sm font-medium text-gray-300">{title}</div>
              <div className="mt-2 flex items-baseline gap-2">
                {isLoading ? (
                  <Skeleton className="h-8 w-24 bg-gray-800" />
                ) : (
                  <span className="text-3xl font-semibold text-white">{value}</span>
                )}
                {isLoading ? (
                  <Skeleton className="h-3 w-16 bg-gray-800" />
                ) : (
                  <span className="text-xs text-gray-500">{subtext}</span>
                )}
              </div>
            </div>
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-6 w-24 bg-gray-800" />
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
            {isLoading ? (
              <Skeleton className="mt-2 h-3 w-20 bg-gray-800" />
            ) : (
              <div className="mt-2 text-right text-xs text-gray-500">{changeLabel}</div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 px-6 py-4">
        {Array.from({ length: rowsToRender }).map((_, index) => {
          const item = items[index]
          return (
            <div
              key={index}
              className="border-b border-gray-800 py-3 last:border-0"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  {isLoading ? (
                    <Skeleton className="h-4 w-28 bg-gray-800" />
                  ) : (
                    <div className="text-sm font-medium text-gray-300">{item?.label}</div>
                  )}
                  {isLoading ? (
                    <Skeleton className="mt-2 h-3 w-24 bg-gray-800" />
                  ) : item?.hint ? (
                    <div className="mt-1 text-xs text-gray-500">{item.hint}</div>
                  ) : null}
                </div>
                {isLoading ? (
                  <Skeleton className="h-4 w-12 bg-gray-800" />
                ) : (
                  <div className="text-sm font-semibold text-white">{item?.value}</div>
                )}
              </div>
              {!isLoading && item?.progress !== undefined ? (
                <Progress value={item.progress} className="mt-3 h-2 bg-gray-800" />
              ) : null}
              {!isLoading && item?.action ? (
                <div className="mt-2 text-xs">
                  <Link
                    href={item.action.link}
                    className="text-green-400 transition hover:text-green-300"
                  >
                    {item.action.text}
                  </Link>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="border-t border-gray-800 px-6 py-4">
        {isLoading ? (
          <>
            <Skeleton className="h-3 w-40 bg-gray-800" />
            <Skeleton className="mt-3 h-4 w-24 bg-gray-800" />
          </>
        ) : (
          <>
            <div className="text-xs text-amber-400">{footer}</div>
            <Link href={buttonLink} className="mt-3 inline-flex text-xs font-medium text-green-400 hover:text-green-300">
              {buttonText}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
