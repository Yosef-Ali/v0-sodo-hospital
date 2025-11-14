import type React from "react"
import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react"
import Link from "next/link"

interface MetricCardItem {
  label: string
  value: string
  action?: {
    text: string
    link: string
  }
}

interface MetricCardProps {
  icon: React.ReactNode
  title: string
  value: string
  subtext: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  items: MetricCardItem[]
  footer: string
  buttonText: string
  buttonLink: string
  onChartClick?: () => void
}

export function MetricCard({
  icon,
  title,
  value,
  subtext,
  change,
  changeType,
  items,
  footer,
  buttonText,
  buttonLink,
  onChartClick,
}: MetricCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-start">
          <div className="bg-gray-700 p-2 rounded-md">{icon}</div>
          <button
            onClick={onChartClick}
            className={`flex items-center text-xs font-medium transition-all hover:scale-110 ${
              changeType === "positive"
                ? "text-green-500 hover:text-green-400"
                : changeType === "negative"
                  ? "text-red-500 hover:text-red-400"
                  : "text-gray-500 hover:text-gray-400"
            } ${onChartClick ? "cursor-pointer" : ""}`}
            title={onChartClick ? "Click to view details" : undefined}
          >
            {changeType === "positive" ? (
              <ChevronUp className="h-3 w-3 mr-1" />
            ) : changeType === "negative" ? (
              <ChevronDown className="h-3 w-3 mr-1" />
            ) : null}
            {change}
          </button>
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-400 font-medium">{title}</div>
          <div className="flex items-baseline mt-1">
            <div className="text-3xl font-bold text-white">{value}</div>
            <div className="ml-2 text-xs text-gray-400">{subtext}</div>
          </div>
        </div>
      </div>
      <div className="px-6 py-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 group">
            <div className="flex-1">
              <div className="text-sm text-gray-400">{item.label}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-white">{item.value}</div>
              {item.action && (
                <Link
                  href={item.action.link}
                  className="text-xs text-green-400 hover:text-green-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                >
                  {item.action.text}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-gray-700">
        <div className="text-xs text-amber-500 mb-3">{footer}</div>
        <Link href={buttonLink} className="text-xs text-green-400 font-medium hover:text-green-300 transition-colors inline-flex items-center gap-1">
          {buttonText}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
