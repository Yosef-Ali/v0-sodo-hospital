/**
 * Enhanced AI-UI Widgets
 * Advanced widgets for AI chat interactions
 */

"use client"

import { Card } from "./card"
import { Badge } from "./badge"
import { Button } from "./button"
import { Progress } from "./progress"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Users,
  Calendar,
  ExternalLink,
  Sparkles,
  Loader2,
} from "lucide-react"

/**
 * Intent Classification Widget
 * Shows how the AI classified the user's intent
 */
interface IntentBadgeProps {
  intent: string
  confidence: number
}

export function IntentBadge({ intent, confidence }: IntentBadgeProps) {
  const getIntentColor = (intent: string) => {
    const colors: Record<string, string> = {
      document_query: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      technical_issue: "bg-red-500/10 text-red-400 border-red-500/30",
      workflow_help: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      general_inquiry: "bg-gray-500/10 text-gray-400 border-gray-500/30",
      navigation: "bg-green-500/10 text-green-400 border-green-500/30",
    }
    return colors[intent] || colors.general_inquiry
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Badge className={`${getIntentColor(intent)} border`}>
        <Sparkles className="h-3 w-3 mr-1" />
        {intent.replace("_", " ")}
      </Badge>
      <span className="text-xs text-gray-500">
        {Math.round(confidence * 100)}% confident
      </span>
    </div>
  )
}

/**
 * AI Processing Widget
 * Shows AI is processing with agent info
 */
interface AIProcessingProps {
  agentType?: string
  status?: string
}

export function AIProcessing({ agentType, status }: AIProcessingProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Loader2 className="h-4 w-4 animate-spin text-green-500" />
      <div className="space-y-0.5">
        <p className="text-sm text-gray-300">
          {status || "AI is thinking..."}
        </p>
        {agentType && (
          <p className="text-xs text-gray-500">
            Using {agentType.replace("_", " ")} agent
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Tool Call Widget
 * Shows when AI is using a tool
 */
interface ToolCallWidgetProps {
  toolName: string
  description: string
  status: "pending" | "running" | "completed" | "failed"
  result?: string
}

export function ToolCallWidget({
  toolName,
  description,
  status,
  result,
}: ToolCallWidgetProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "border-blue-500/50 bg-blue-500/5"
      case "completed":
        return "border-green-500/50 bg-green-500/5"
      case "failed":
        return "border-red-500/50 bg-red-500/5"
      default:
        return "border-gray-500/50 bg-gray-500/5"
    }
  }

  return (
    <Card className={`p-3 ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getStatusIcon()}</div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-gray-100">{toolName}</p>
          <p className="text-xs text-gray-400">{description}</p>
          {result && status === "completed" && (
            <div className="mt-2 bg-gray-900/50 rounded p-2">
              <p className="text-xs text-gray-300">{result}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

/**
 * Context Indicator Widget
 * Shows what context the AI is using
 */
interface ContextIndicatorProps {
  pageContext?: string
  recentDocuments?: number
  recentTasks?: number
}

export function ContextIndicator({
  pageContext,
  recentDocuments,
  recentTasks,
}: ContextIndicatorProps) {
  return (
    <div className="bg-gray-800/50 rounded-md p-2 space-y-1">
      <p className="text-xs font-semibold text-gray-400">Context-aware response</p>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {pageContext && (
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {pageContext}
          </span>
        )}
        {recentDocuments && recentDocuments > 0 && (
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {recentDocuments} docs
          </span>
        )}
        {recentTasks && recentTasks > 0 && (
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {recentTasks} tasks
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Enhanced Status Widget with Progress
 */
interface EnhancedStatusWidgetProps {
  title: string
  status: string
  progress?: number
  steps?: { name: string; completed: boolean }[]
}

export function EnhancedStatusWidget({
  title,
  status,
  progress,
  steps,
}: EnhancedStatusWidgetProps) {
  return (
    <Card className="p-4 bg-gray-800/50 space-y-3">
      <div>
        <h4 className="font-semibold text-gray-100 mb-1">{title}</h4>
        <p className="text-sm text-gray-400">{status}</p>
      </div>

      {progress !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {steps && steps.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400">Steps:</p>
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {step.completed ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-gray-500" />
              )}
              <span className={step.completed ? "text-gray-300" : "text-gray-500"}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

/**
 * Document Insight Widget
 * Enhanced document information with AI insights
 */
interface DocumentInsightWidgetProps {
  documentId: string
  title: string
  status: string
  aiInsight?: string
  suggestions?: string[]
  onViewDocument?: () => void
}

export function DocumentInsightWidget({
  documentId,
  title,
  status,
  aiInsight,
  suggestions,
  onViewDocument,
}: DocumentInsightWidgetProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: "text-green-400 bg-green-500/10",
      pending: "text-amber-400 bg-amber-500/10",
      rejected: "text-red-400 bg-red-500/10",
      processing: "text-blue-400 bg-blue-500/10",
    }
    return colors[status.toLowerCase()] || colors.pending
  }

  return (
    <Card className="p-4 bg-gray-800/50 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-100 mb-1">{title}</h4>
          <p className="text-xs text-gray-500 font-mono">{documentId}</p>
        </div>
        <Badge className={getStatusColor(status)}>{status}</Badge>
      </div>

      {aiInsight && (
        <div className="bg-gray-900/50 rounded-md p-3 space-y-1">
          <p className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Insight
          </p>
          <p className="text-sm text-gray-300">{aiInsight}</p>
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400">Suggestions:</p>
          <ul className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-xs text-gray-400 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onViewDocument && (
        <Button
          onClick={onViewDocument}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View Document
        </Button>
      )}
    </Card>
  )
}

/**
 * Copilot Suggestion Widget
 * Proactive AI suggestions based on context
 */
interface CopilotSuggestionProps {
  title: string
  description: string
  actions?: { label: string; onClick: () => void }[]
}

export function CopilotSuggestion({
  title,
  description,
  actions,
}: CopilotSuggestionProps) {
  return (
    <Card className="p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30 space-y-3">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-green-400 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-100 mb-1">{title}</h4>
          <p className="text-sm text-gray-300">{description}</p>
        </div>
      </div>

      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant="outline"
              size="sm"
              className="border-green-500/50 text-green-400 hover:bg-green-500/10"
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </Card>
  )
}
