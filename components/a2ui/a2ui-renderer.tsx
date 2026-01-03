"use client"

/**
 * A2UI React Renderer - Complete Widget Catalog
 * Maps A2UI JSON to SODDO Hospital Customer Support + AI Enhancement widgets
 */

import React from "react"
// Customer Support Widgets
import {
  TicketVerificationWidget,
  PermitStatusWidget,
  UploadGuideWidget,
  ProcessTimelineWidget,
  ListWidget,
  QuickActionButtonsWidget,
  DocumentCardWidget,
  MetricCardWidget,
  ActionCardWidget,
} from "@/components/ui/chat-widgets"
// AI Enhancement Widgets
import {
  IntentBadge,
  AIProcessing,
  ToolCallWidget,
  ContextIndicator,
  EnhancedStatusWidget,
  DocumentInsightWidget,
  CopilotSuggestion,
} from "@/components/ui/ai-widgets"
import { cn } from "@/lib/utils"

// A2UI Widget Response type
interface A2UIWidget {
  widget: string
  props: Record<string, any>
}

interface A2UIRendererProps {
  widgets: A2UIWidget[]
  onAction?: (actionName: string, context: Record<string, any>) => void
  onVerify?: (ticketNumber: string) => void
  className?: string
}

export function A2UIRenderer({ widgets, onAction, onVerify, className }: A2UIRendererProps) {
  if (!widgets || widgets.length === 0) {
    return null
  }

  return (
    <div className={cn("a2ui-widgets", className)}>
      {widgets.map((widget, index) => (
        <A2UIWidgetComponent
          key={`widget-${index}`}
          widget={widget}
          onAction={onAction}
          onVerify={onVerify}
        />
      ))}
    </div>
  )
}

interface A2UIWidgetComponentProps {
  widget: A2UIWidget
  onAction?: (actionName: string, context: Record<string, any>) => void
  onVerify?: (ticketNumber: string) => void
}

function A2UIWidgetComponent({ widget, onAction, onVerify }: A2UIWidgetComponentProps) {
  const { widget: widgetType, props } = widget

  switch (widgetType) {
    // ============ CUSTOMER SUPPORT WIDGETS ============
    
    case "ticket-verification":
      return (
        <TicketVerificationWidget
          onSubmit={(ticketNumber) => {
            onVerify?.(ticketNumber)
            onAction?.("verify_ticket", { ticketNumber })
          }}
          placeholder={props.placeholder}
        />
      )

    case "permit-status":
      return (
        <PermitStatusWidget
          ticketNumber={props.ticketNumber}
          status={props.status}
          type={props.type}
          submittedDate={props.submittedDate}
          lastUpdated={props.lastUpdated}
          currentStage={props.currentStage}
          nextAction={props.nextAction}
          estimatedCompletion={props.estimatedCompletion}
          notes={props.notes}
          personName={props.personName}
          documentLinks={props.documentLinks}
        />
      )

    case "upload-guide":
      return (
        <UploadGuideWidget
          documentType={props.documentType}
          currentStep={props.currentStep || 0}
          ticketNumber={props.ticketNumber}
          requirements={props.requirements}
          steps={props.steps?.map((step: any) => ({
            ...step,
            action: step.completed ? undefined : {
              label: "Select File",
              onClick: () => onAction?.("upload_file", { documentType: props.documentType })
            }
          }))}
          tips={props.tips}
        />
      )

    case "process-timeline":
      return (
        <ProcessTimelineWidget
          estimatedTotal={props.estimatedTotal}
          stages={props.stages}
        />
      )

    case "task-list":
      return (
        <ListWidget
          title={props.title}
          items={props.items?.map((item: any) => ({
            title: item.title,
            subtitle: item.subtitle,
            status: item.status,
            category: item.category,
            onClick: () => onAction?.("view_item", { id: item.category })
          }))}
        />
      )

    case "quick-actions":
      return (
        <QuickActionButtonsWidget
          actions={props.actions?.map((action: any) => ({
            label: action.label,
            onClick: () => onAction?.(action.action, {})
          }))}
        />
      )

    case "document-card":
      return (
        <DocumentCardWidget
          title={props.title}
          status={props.status}
          type={props.type}
          date={props.date}
          progress={props.progress}
          actions={[
            { label: "View Details", onClick: () => onAction?.("view_document", props) }
          ]}
        />
      )

    case "metric-card":
      return (
        <MetricCardWidget
          title={props.title}
          value={props.value}
          change={props.change}
          description={props.description}
        />
      )

    case "action-card":
      return (
        <ActionCardWidget
          title={props.title}
          description={props.description}
          icon={props.icon}
          status={props.status}
          actions={props.actions?.map((action: any) => ({
            label: action.label,
            variant: action.variant,
            onClick: () => onAction?.(action.action || action.label, {})
          }))}
        />
      )

    // ============ AI ENHANCEMENT WIDGETS ============

    case "intent-badge":
      return (
        <IntentBadge
          intent={props.intent}
          confidence={props.confidence}
        />
      )

    case "ai-processing":
      return (
        <AIProcessing
          agentType={props.agentType}
          status={props.status}
        />
      )

    case "tool-call":
      return (
        <ToolCallWidget
          toolName={props.toolName}
          description={props.description}
          status={props.status}
          result={props.result}
        />
      )

    case "context-indicator":
      return (
        <ContextIndicator
          pageContext={props.pageContext}
          recentDocuments={props.recentDocuments}
          recentTasks={props.recentTasks}
        />
      )

    case "enhanced-status":
      return (
        <EnhancedStatusWidget
          title={props.title}
          status={props.status}
          progress={props.progress}
          steps={props.steps}
        />
      )

    case "document-insight":
      return (
        <DocumentInsightWidget
          documentId={props.documentId}
          title={props.title}
          status={props.status}
          aiInsight={props.aiInsight}
          suggestions={props.suggestions}
          onViewDocument={() => onAction?.("view_document", { id: props.documentId })}
        />
      )

    case "copilot-suggestion":
      return (
        <CopilotSuggestion
          title={props.title}
          description={props.description}
          actions={props.actions?.map((action: any) => ({
            label: action.label,
            onClick: () => onAction?.(action.action, {})
          }))}
        />
      )

    default:
      console.warn(`Unknown A2UI widget type: ${widgetType}`)
      return (
        <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <p className="text-sm text-gray-400">Unknown widget: {widgetType}</p>
          <pre className="text-xs text-gray-500 mt-2 overflow-auto">
            {JSON.stringify(props, null, 2)}
          </pre>
        </div>
      )
  }
}

export default A2UIRenderer
