/**
 * Approval Widget
 * Human-in-the-loop confirmation for sensitive AI actions
 */

"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react"
import { Button } from "./button"
import { Card } from "./card"
import { Badge } from "./badge"
import { ToolApproval } from "@/lib/openai/types"

interface ApprovalWidgetProps {
  approval: ToolApproval
  onApprove: (approvalId: string) => void
  onReject: (approvalId: string) => void
}

export function ApprovalWidget({ approval, onApprove, onReject }: ApprovalWidgetProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const formatToolName = (name: string) => {
    return name
      .replace(/_/g, " ")
      .split(" ")
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  }

  const handleApprove = async () => {
    setIsProcessing(true)
    await onApprove(approval.id)
    setIsProcessing(false)
  }

  const handleReject = async () => {
    setIsProcessing(true)
    await onReject(approval.id)
    setIsProcessing(false)
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "text-red-500 bg-red-500/10"
      case "medium":
        return "text-amber-500 bg-amber-500/10"
      case "low":
        return "text-green-500 bg-green-500/10"
      default:
        return "text-gray-500 bg-gray-500/10"
    }
  }

  return (
    <Card className="border-amber-500/50 bg-amber-500/5 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-100">Action Requires Approval</h4>
            <Badge className={getRiskColor(approval.riskLevel)}>
              {approval.riskLevel.toUpperCase()} RISK
            </Badge>
          </div>
          <p className="text-xs text-gray-400">
            Action: <span className="text-gray-200">{formatToolName(approval.toolName)}</span>
            <span className="text-[11px] text-gray-500 ml-1">({approval.toolName})</span>
          </p>
          <p className="text-sm text-gray-400">{approval.toolDescription}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 pl-8">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-300">{approval.reasoning}</p>
          </div>
        </div>

        {/* Parameters */}
        {Object.keys(approval.parameters).length > 0 && (
          <div className="bg-gray-900/50 rounded-md p-3 space-y-1">
            <p className="text-xs font-semibold text-gray-400 mb-2">Action Parameters:</p>
            {Object.entries(approval.parameters).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 text-xs">
                <span className="text-gray-500">{key}:</span>
                <span className="text-gray-300 font-mono">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pl-8 pt-2">
        <Button
          onClick={handleApprove}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Approve
        </Button>
        <Button
          onClick={handleReject}
          disabled={isProcessing}
          variant="outline"
          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          size="sm"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Reject
        </Button>
      </div>

      {isProcessing && (
        <div className="pl-8">
          <p className="text-xs text-gray-500 animate-pulse">Processing your decision...</p>
        </div>
      )}
      {!isProcessing && (
        <div className="pl-8 pt-1 space-y-0.5">
          <p className="text-[11px] text-gray-500">
            Approve: executes this change in the system.
          </p>
          <p className="text-[11px] text-gray-500">
            Reject: keeps everything as it is right now.
          </p>
        </div>
      )}
    </Card>
  )
}

interface ApprovalListWidgetProps {
  approvals: ToolApproval[]
  onApprove: (approvalId: string) => void
  onReject: (approvalId: string) => void
}

export function ApprovalListWidget({
  approvals,
  onApprove,
  onReject,
}: ApprovalListWidgetProps) {
  if (approvals.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {approvals.map(approval => (
        <ApprovalWidget
          key={approval.id}
          approval={approval}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  )
}
