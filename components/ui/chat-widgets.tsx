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
import { useState, useRef } from "react"
import { format } from "date-fns"
import { UploadButton } from "@/lib/uploadthing-utils"
import { useRouter } from "next/navigation"

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
    <Card className="bg-gray-800 border-gray-700 w-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-2 min-w-0">
          {icon && (
            <div className="p-1.5 rounded-lg bg-green-500/10 text-green-400 flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-white text-sm font-semibold truncate">{title}</CardTitle>
            {description && (
              <CardDescription className="text-gray-400 text-xs mt-1 line-clamp-2">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
        {status && (
          <div className="mt-2">
            <StatusBadgeWidget
              status={status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
            />
          </div>
        )}
      </CardHeader>
      {actions.length > 0 && (
        <CardFooter className="flex flex-col gap-2 pt-0">
          {actions.map((action, idx) => (
            action.href ? (
              <Link key={idx} href={action.href} className="w-full">
                <Button variant={action.variant || "outline"} size="sm" className="w-full text-xs h-8">
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button
                key={idx}
                variant={action.variant || "outline"}
                size="sm"
                onClick={action.onClick || (() => console.log(`Action: ${action.label}`))}
                className="w-full text-xs h-8"
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
    blue: "bg-green-600",
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
    category?: string
    status?: "success" | "pending" | "error"
    icon?: React.ReactNode
    onClick?: () => void
  }>
  title?: string
}

export function ListWidget({ items, title }: ListWidgetProps) {
  return (
    <Card className="bg-gray-800 border-gray-700 w-full overflow-hidden">
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
                <div className="text-green-400">
                  {item.icon}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-white text-sm font-medium">{item.title}</div>
                  {(item.category || item.value) && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-gray-600 text-gray-300">
                      {String(item.category || item.value)}
                    </Badge>
                  )}
                </div>
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
    <div className="flex flex-wrap gap-2">
      {actions.map((action, idx) => (
        <Button
          key={idx}
          variant={action.variant || "outline"}
          size="sm"
          onClick={action.onClick || (() => console.log(`Action: ${action.label}`))}
          className="text-xs border-gray-700 hover:border-green-500 hover:bg-green-500/10 hover:text-green-400"
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
    processing: { color: "text-green-400", icon: Clock, label: "Processing" },
    completed: { color: "text-green-400", icon: CheckCircle, label: "Completed" },
    pending: { color: "text-amber-400", icon: Clock, label: "Pending" },
    error: { color: "text-red-400", icon: AlertCircle, label: "Error" }
  }

  const { color, icon: Icon, label } = statusConfig[status]

  return (
    <Card className="bg-gray-800 border-gray-700 w-full overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <FileText className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
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
              onClick={action.onClick || (() => console.log(`Action: ${action.label}`))}
              className="border-gray-700 hover:border-green-500"
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

// ==================== CUSTOMER SUPPORT WIDGETS ====================
// These are the "sale point" widgets for inline customer support

// Ticket Verification Widget - For secure customer verification
interface TicketVerificationWidgetProps {
  onSubmit: (ticketNumber: string) => void
  isVerifying?: boolean
  error?: string
  placeholder?: string
}

export function TicketVerificationWidget({
  onSubmit,
  isVerifying = false,
  error,
  placeholder = "e.g., FOR-001006"
}: TicketVerificationWidgetProps) {
  const [ticketNumber, setTicketNumber] = useState("")
  const [validationError, setValidationError] = useState("")
   const [showFormats, setShowFormats] = useState(false)

  const validateTicketNumber = (value: string): boolean => {
    // Accept multiple formats:
    // - New format: FOR-001006, VEH-001234, IMP-001234, CMP-001234
    // - Legacy format: WRK-2024-1234, RES-2024-5678
    const newPattern = /^[A-Z]{3}-\d{6}$/  // FOR-001006
    const legacyPattern = /^[A-Z]{3}-\d{4}-\d{4}$/  // WRK-2024-1234
    const cleanValue = value.trim().toUpperCase()
    return newPattern.test(cleanValue) || legacyPattern.test(cleanValue)
  }

  const handleSubmit = () => {
    const cleanedValue = ticketNumber.trim().toUpperCase()

    if (!cleanedValue) {
      setValidationError("Please enter a ticket number")
      return
    }

    if (!validateTicketNumber(cleanedValue)) {
      setValidationError("Invalid format. Use: FOR-001006 or WRK-2024-1234")
      return
    }

    setValidationError("")
    onSubmit(cleanedValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30 w-full">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-white text-base">Ticket Verification</CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              For your security, please provide your permit or work ticket number
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label className="text-gray-300 text-sm">Ticket Number</Label>
          <Input
            type="text"
            placeholder={placeholder}
            value={ticketNumber}
            onChange={(e) => {
              setTicketNumber(e.target.value)
              setValidationError("")
            }}
            onKeyPress={handleKeyPress}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            disabled={isVerifying}
          />
          {(validationError || error) && (
            <div className="flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>{validationError || error}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-500 flex-wrap gap-2">
          <span>Format: FOR-XXXXXX or XXX-YYYY-XXXX</span>
          <button
            type="button"
            onClick={() => setShowFormats(prev => !prev)}
            className="text-green-300 hover:text-green-200"
          >
            {showFormats ? "Hide examples" : "Show examples"}
          </button>
        </div>
        {showFormats && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-2">Accepted formats:</p>
            <div className="space-y-1">
              <div className="text-xs text-gray-500 font-mono">FOR-001006 (Foreigner)</div>
              <div className="text-xs text-gray-500 font-mono">VEH-001234 (Vehicle)</div>
              <div className="text-xs text-gray-500 font-mono">IMP-001234 (Import)</div>
              <div className="text-xs text-gray-500 font-mono">CMP-001234 (Company)</div>
              <div className="text-xs text-gray-500 font-mono">WRK-2024-1234 (Work Permit)</div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={isVerifying || !ticketNumber.trim()}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isVerifying ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify Ticket
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Permit Status Widget - Display full permit/document status inline
interface PermitStatusWidgetProps {
  ticketNumber: string
  status: "pending" | "submitted" | "processing" | "approved" | "rejected" | "expired"
  type: string
  submittedDate: string
  lastUpdated: string
  currentStage?: string
  nextAction?: string
  estimatedCompletion?: string
  notes?: string
  documentLinks?: Array<{
    name: string
    url: string
  }>
  personName?: string
}

export function PermitStatusWidget({
  ticketNumber,
  status,
  type,
  submittedDate,
  lastUpdated,
  currentStage,
  nextAction,
  estimatedCompletion,
  notes,
  documentLinks,
  personName
}: PermitStatusWidgetProps) {
  const statusConfig = {
    pending: { color: "text-amber-400", bgColor: "bg-amber-500/20", borderColor: "border-amber-500/50", icon: Clock, label: "Pending Review" },
    submitted: { color: "text-blue-400", bgColor: "bg-blue-500/20", borderColor: "border-blue-500/50", icon: CheckCircle, label: "Submitted" },
    processing: { color: "text-green-400", bgColor: "bg-green-500/20", borderColor: "border-green-500/50", icon: Clock, label: "Processing" },
    approved: { color: "text-green-400", bgColor: "bg-green-500/20", borderColor: "border-green-500/50", icon: CheckCircle, label: "Approved" },
    rejected: { color: "text-red-400", bgColor: "bg-red-500/20", borderColor: "border-red-500/50", icon: AlertCircle, label: "Rejected" },
    expired: { color: "text-gray-400", bgColor: "bg-gray-500/20", borderColor: "border-gray-500/50", icon: AlertCircle, label: "Expired" }
  }

  const { color, bgColor, borderColor, icon: Icon, label } = statusConfig[status]

  const [showDetails, setShowDetails] = useState(false)

  return (
    <Card className="bg-gray-800 border-gray-700 w-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {personName && (
            <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-semibold text-green-300 flex-shrink-0">
              {personName
                .split(" ")
                .filter(Boolean)
                .map(part => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-white text-sm font-semibold">{type}</CardTitle>
            {personName && (
              <p className="text-xs text-gray-400 mt-0.5">
                {personName}
              </p>
            )}
            {/* Ticket + Status Badge Row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-gray-500 font-mono">{ticketNumber}</span>
              <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs", bgColor, borderColor)}>
                <Icon className={cn("w-3 h-3", color)} />
                <span className={cn("font-medium", color)}>{label}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Submitted {submittedDate} • Last updated {lastUpdated}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(prev => !prev)}
            className="h-7 px-2 text-xs text-green-300 hover:text-green-200 hover:bg-gray-800"
          >
            {showDetails ? "Hide details" : "Show details"}
          </Button>
        </div>

        {showDetails && (
          <div className="space-y-4">
            {/* Current Stage */}
            {currentStage && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Current stage</p>
                <p className="text-sm text-white font-medium">{currentStage}</p>
              </div>
            )}

            {/* Next Action */}
            {nextAction && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-xs text-green-400 mb-1">What you should do next</p>
                <p className="text-sm text-white">{nextAction}</p>
              </div>
            )}

            {/* Estimated Completion */}
            {estimatedCompletion && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Estimated completion:</span>
                <span className="text-white font-medium">{estimatedCompletion}</span>
              </div>
            )}

            {/* Notes */}
            {notes && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-300">{notes}</p>
              </div>
            )}

            {/* Document Links */}
            {documentLinks && documentLinks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Related documents</p>
                <div className="space-y-1">
                  {documentLinks.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg bg-gray-900 hover:bg-gray-700 border border-gray-700 hover:border-green-500 transition-colors group"
                    >
                      <Download className="w-4 h-4 text-gray-400 group-hover:text-green-400" />
                      <span className="text-sm text-gray-300 group-hover:text-white flex-1">{doc.name}</span>
                      <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-green-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-row gap-2">
        <Link href={`/permits/${ticketNumber}`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-8 border-gray-700 hover:border-green-500"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            View Details
          </Button>
        </Link>
        <Button variant="outline" size="sm" className="flex-1 text-xs h-8 border-gray-700 hover:border-green-500">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Download
        </Button>
      </CardFooter>
    </Card>
  )
}

// Upload Guide Widget - Step-by-step upload instructions
interface UploadGuideWidgetProps {
  documentType: string
  currentStep?: number
  ticketNumber?: string
  steps: Array<{
    title: string
    description: string
    completed?: boolean
    action?: {
      label: string
      onClick: () => void
    }
  }>
  requirements?: string[]
  tips?: string[]
}

export function UploadGuideWidget({
  documentType,
  currentStep = 0,
  ticketNumber,
  steps,
  requirements,
  tips
}: UploadGuideWidgetProps) {
  const router = useRouter()
  const totalSteps = steps.length
  const [expanded, setExpanded] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleUploadComplete = async (files: any[]) => {
    console.log("Files uploaded from UploadGuideWidget:", files)

    if (files.length === 0) return

    try {
      // Save to database
      const { createDocument } = await import("@/lib/actions/v2/documents")

      const file = files[0]
      const result = await createDocument({
        type: documentType || "support_document",
        title: file.name,
        number: ticketNumber || undefined,
        fileUrl: file.url,
      })

      if (result.success) {
        setUploadedFileName(file.name)
        setUploadError(null)
        // Refresh if on permit page
        if (ticketNumber) {
          router.refresh()
        }
      } else {
        setUploadError(result.error || "Failed to save document")
      }
    } catch (error) {
      console.error("Error saving document from UploadGuideWidget:", error)
      setUploadError("Failed to save document")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700 w-full overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-white text-base">Upload Guide</CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                {documentType}
              </CardDescription>
              {totalSteps > 0 && (
                <p className="text-[11px] text-gray-500 mt-1">
                  Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(prev => !prev)}
            className="h-7 px-2 text-xs text-green-300 hover:text-green-200 hover:bg-gray-800"
          >
            {expanded ? "Hide steps" : "Show steps"}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
      <CardContent className="space-y-4">
        {/* Requirements */}
        {requirements && requirements.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm text-blue-400 font-medium mb-2">Required documents</p>
            <ul className="space-y-1">
              {requirements.map((req, idx) => (
                <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep
            const isCompleted = step.completed || idx < currentStep

            return (
              <div
                key={idx}
                className={cn(
                  "border rounded-lg p-3 transition-all",
                  isActive && "border-green-500 bg-green-500/10",
                  isCompleted && !isActive && "border-gray-700 bg-gray-900",
                  !isActive && !isCompleted && "border-gray-700 bg-gray-900/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                    isCompleted && !isActive && "bg-green-500/20 text-green-400",
                    isActive && "bg-green-500 text-white",
                    !isActive && !isCompleted && "bg-gray-700 text-gray-400"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-medium">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm font-medium mb-1",
                      isActive ? "text-white" : "text-gray-400"
                    )}>
                      {step.title}
                    </p>
                    {isActive && (
                      <p className="text-xs text-gray-500">{step.description}</p>
                    )}
                    {!isActive && isCompleted && (
                      <p className="text-[11px] text-gray-500">Completed</p>
                    )}
                    {step.action && isActive && (
                      <div className="mt-2">
                        <UploadButton
                          endpoint="permitDocumentUploader"
                          onClientUploadComplete={handleUploadComplete}
                          onUploadBegin={() => {
                            setIsUploading(true)
                            setUploadError(null)
                            setUploadProgress(0)
                          }}
                          onUploadError={(error: Error) => {
                            console.error("Upload error:", error)
                            setIsUploading(false)
                            setUploadError(`Upload failed: ${error.message}`)
                          }}
                          onUploadProgress={(progress) => {
                            setUploadProgress(progress)
                          }}
                          appearance={{
                            button:
                              "bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-md ut-ready:bg-green-600 ut-uploading:bg-green-700 ut-uploading:cursor-wait",
                            allowedContent: "hidden",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tips */}
        {tips && tips.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <p className="text-sm text-amber-400 font-medium mb-2">Helpful tips</p>
            <ul className="space-y-1">
              {tips.map((tip, idx) => (
                <li key={idx} className="text-xs text-gray-300">• {tip}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Upload Status */}
        {isUploading && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <div className="flex-1">
                <p className="text-xs text-blue-300 mb-1">Uploading...</p>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(uploadedFileName || uploadError) && !isUploading && (
          <div className="text-xs">
            {uploadedFileName && (
              <p className="text-green-400 flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                Uploaded: {uploadedFileName}
              </p>
            )}
            {uploadError && (
              <p className="text-red-400 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                {uploadError}
              </p>
            )}
          </div>
        )}
      </CardContent>
      )}
    </Card>
  )
}

// Process Timeline Widget - Visual timeline of process stages
interface ProcessTimelineWidgetProps {
  stages: Array<{
    name: string
    status: "completed" | "current" | "pending" | "skipped"
    date?: string
    description?: string
    duration?: string
  }>
  estimatedTotal?: string
}

export function ProcessTimelineWidget({ stages, estimatedTotal }: ProcessTimelineWidgetProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="bg-gray-800 border-gray-700 w-full overflow-hidden">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-white text-base">Process Timeline</CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Track your application progress
            </CardDescription>
          </div>
          {estimatedTotal && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Est. total</p>
              <p className="text-sm text-white font-medium">{estimatedTotal}</p>
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(prev => !prev)}
            className="h-7 px-2 text-xs text-green-300 hover:text-green-200 hover:bg-gray-800"
          >
            {expanded ? "Hide timeline" : "View full timeline"}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-gray-700" />

            {stages.map((stage, idx) => {
              const statusConfig = {
                completed: { color: "bg-green-500", textColor: "text-green-400", icon: CheckCircle },
                current: { color: "bg-green-500 animate-pulse", textColor: "text-green-400", icon: Clock },
                pending: { color: "bg-gray-600", textColor: "text-gray-500", icon: Clock },
                skipped: { color: "bg-gray-700", textColor: "text-gray-600", icon: AlertCircle }
              }

              const { color, textColor, icon: Icon } = statusConfig[stage.status]

              return (
                <div key={idx} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center z-10", color)}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>

                  {/* Stage info */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={cn("text-sm font-medium", stage.status === "current" ? "text-white" : textColor)}>
                          {stage.name}
                        </p>
                        {stage.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{stage.description}</p>
                        )}
                      </div>
                      {stage.duration && (
                        <span className="text-xs text-gray-500">{stage.duration}</span>
                      )}
                    </div>
                    {stage.date && (
                      <p className="text-xs text-gray-600 mt-1">{stage.date}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
