"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  ExternalLink,
  FileText,
  Download
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { format } from "date-fns"

// Widget type definitions
export interface ChatWidget {
  type: "card" | "button-group" | "progress" | "list" | "form" | "date-picker" | "chart" | "status-badge" | "quick-action"
  data: any
}

// Status Badge Widget
interface StatusBadgeWidgetProps {
  status: "success" | "pending" | "error" | "warning"
  label: string
  count?: number
}

export function StatusBadgeWidget({ status, label, count }: StatusBadgeWidgetProps) {
  const variants = {
    success: { color: "bg-green-500/20 text-green-400 border-green-500/50", icon: CheckCircle },
    pending: { color: "bg-amber-500/20 text-amber-400 border-amber-500/50", icon: Clock },
    error: { color: "bg-red-500/20 text-red-400 border-red-500/50", icon: AlertCircle },
    warning: { color: "bg-orange-500/20 text-orange-400 border-orange-500/50", icon: AlertCircle }
  }

  const { color, icon: Icon } = variants[status]

  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full border", color)}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
      {count !== undefined && (
        <Badge variant="secondary" className="ml-1 h-5 px-2">
          {count}
        </Badge>
      )}
    </div>
  )
}

// Action Card Widget
interface ActionCardWidgetProps {
  title: string
  description: string
  actions: Array<{
    label: string
    variant?: "default" | "outline" | "secondary"
    onClick?: () => void
    href?: string
  }>
  icon?: React.ReactNode
  status?: "success" | "pending" | "error"
}

export function ActionCardWidget({ title, description, actions, icon, status }: ActionCardWidgetProps) {
  return (
    <Card className="bg-gray-800 border-gray-700 max-w-md">
      <CardHeader>
        <div className="flex items-start gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-white text-base">{title}</CardTitle>
            {description && (
              <CardDescription className="text-gray-400 mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          {status && (
            <StatusBadgeWidget
              status={status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
            />
          )}
        </div>
      </CardHeader>
      {actions.length > 0 && (
        <CardFooter className="flex gap-2 pt-0">
          {actions.map((action, idx) => (
            action.href ? (
              <Link key={idx} href={action.href}>
                <Button variant={action.variant || "default"} size="sm">
                  {action.label}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            ) : (
              <Button
                key={idx}
                variant={action.variant || "default"}
                size="sm"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )
          ))}
        </CardFooter>
      )}
    </Card>
  )
}

// Progress Widget
interface ProgressWidgetProps {
  label: string
  value: number
  max: number
  showPercentage?: boolean
  color?: "blue" | "green" | "amber" | "red"
}

export function ProgressWidget({ label, value, max, showPercentage = true, color = "blue" }: ProgressWidgetProps) {
  const percentage = Math.round((value / max) * 100)
  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    amber: "bg-amber-600",
    red: "bg-red-600"
  }

  return (
    <div className="space-y-2 max-w-md">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        {showPercentage && (
          <span className="text-gray-400">
            {value}/{max} ({percentage}%)
          </span>
        )}
      </div>
      <Progress value={percentage} className={cn("h-2", colorClasses[color])} />
    </div>
  )
}

// List Widget
interface ListWidgetProps {
  items: Array<{
    title: string
    subtitle?: string
    value?: string | number
    status?: "success" | "pending" | "error"
    icon?: React.ReactNode
    onClick?: () => void
  }>
  title?: string
}

export function ListWidget({ items, title }: ListWidgetProps) {
  return (
    <Card className="bg-gray-800 border-gray-700 max-w-md">
      {title && (
        <CardHeader>
          <CardTitle className="text-white text-base">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-2 p-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={item.onClick}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-700",
              item.onClick && "cursor-pointer hover:bg-gray-700/50 transition-colors"
            )}
          >
            <div className="flex items-center gap-3 flex-1">
              {item.icon && (
                <div className="text-blue-400">
                  {item.icon}
                </div>
              )}
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{item.title}</div>
                {item.subtitle && (
                  <div className="text-gray-400 text-xs mt-0.5">{item.subtitle}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.value && (
                <span className="text-white font-medium text-sm">{item.value}</span>
              )}
              {item.status && (
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  item.status === "success" && "bg-green-500",
                  item.status === "pending" && "bg-amber-500",
                  item.status === "error" && "bg-red-500"
                )} />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Quick Action Buttons Widget
interface QuickActionButtonsProps {
  actions: Array<{
    label: string
    icon?: React.ReactNode
    onClick?: () => void
    variant?: "default" | "outline" | "secondary"
  }>
}

export function QuickActionButtonsWidget({ actions }: QuickActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 max-w-md">
      {actions.map((action, idx) => (
        <Button
          key={idx}
          variant={action.variant || "outline"}
          size="sm"
          onClick={action.onClick}
          className="border-gray-700 hover:border-blue-500 hover:bg-gray-800"
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  )
}

// Date Picker Widget
interface DatePickerWidgetProps {
  label: string
  onSelect: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePickerWidget({ label, onSelect, placeholder = "Pick a date" }: DatePickerWidgetProps) {
  const [date, setDate] = useState<Date>()

  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    onSelect(newDate)
  }

  return (
    <div className="space-y-2 max-w-xs">
      <Label className="text-gray-300">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-gray-800 border-gray-700",
              !date && "text-gray-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            className="bg-gray-800"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Document Card Widget
interface DocumentCardWidgetProps {
  title: string
  status: "processing" | "completed" | "pending" | "error"
  type: string
  date: string
  progress?: number
  actions?: Array<{
    label: string
    onClick?: () => void
  }>
}

export function DocumentCardWidget({ title, status, type, date, progress, actions }: DocumentCardWidgetProps) {
  const statusConfig = {
    processing: { color: "text-blue-400", icon: Clock, label: "Processing" },
    completed: { color: "text-green-400", icon: CheckCircle, label: "Completed" },
    pending: { color: "text-amber-400", icon: Clock, label: "Pending" },
    error: { color: "text-red-400", icon: AlertCircle, label: "Error" }
  }

  const { color, icon: Icon, label } = statusConfig[status]

  return (
    <Card className="bg-gray-800 border-gray-700 max-w-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <CardTitle className="text-white text-base mb-1">{title}</CardTitle>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{type}</span>
                <span>•</span>
                <span>{date}</span>
              </div>
            </div>
          </div>
          <div className={cn("flex items-center gap-1.5 text-xs font-medium", color)}>
            <Icon className="w-4 h-4" />
            {label}
          </div>
        </div>
      </CardHeader>
      {progress !== undefined && status === "processing" && (
        <CardContent className="pt-0">
          <ProgressWidget label="Processing" value={progress} max={100} color="blue" />
        </CardContent>
      )}
      {actions && actions.length > 0 && (
        <CardFooter className="flex gap-2 pt-0">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="border-gray-700 hover:border-blue-500"
            >
              {action.label}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  )
}

// Metric Card Widget
interface MetricCardWidgetProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: "increase" | "decrease"
  }
  description?: string
}

export function MetricCardWidget({ title, value, change, description }: MetricCardWidgetProps) {
  return (
    <Card className="bg-gray-800 border-gray-700 max-w-xs">
      <CardContent className="p-4">
        <div className="text-gray-400 text-sm mb-1">{title}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-white text-3xl font-bold">{value}</span>
          {change && (
            <span className={cn(
              "text-sm font-medium flex items-center gap-0.5",
              change.type === "increase" ? "text-green-400" : "text-red-400"
            )}>
              {change.type === "increase" ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {change.value}
            </span>
          )}
        </div>
        {description && (
          <div className="text-gray-500 text-xs mt-1">{description}</div>
        )}
      </CardContent>
    </Card>
  )
}
