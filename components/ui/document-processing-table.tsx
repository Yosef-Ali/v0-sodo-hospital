"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { MoreHorizontal, Eye, Edit2, Trash2, CheckCircle, Loader2, RefreshCw, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { getPermits } from "@/lib/actions/v2/permits"
import { Skeleton } from "@/components/ui/skeleton"

interface Permit {
  permit: {
    id: string
    category: "WORK_PERMIT" | "RESIDENCE_ID" | "LICENSE" | "PIP"
    status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | "EXPIRED"
    dueDate: Date | null
    createdAt: Date
    updatedAt: Date
  }
  person: {
    id: string
    firstName: string | null
    lastName: string | null
    passportNo: string | null
  } | null
  checklist: {
    id: string
    name: string
  } | null
}

const categoryColors: Record<string, string> = {
  WORK_PERMIT: "bg-blue-500/10 text-blue-300",
  RESIDENCE_ID: "bg-purple-500/10 text-purple-300",
  LICENSE: "bg-emerald-500/10 text-emerald-300",
  PIP: "bg-orange-500/10 text-orange-300",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-300",
  SUBMITTED: "bg-sky-500/10 text-sky-300",
  APPROVED: "bg-emerald-500/10 text-emerald-300",
  REJECTED: "bg-rose-500/10 text-rose-300",
  EXPIRED: "bg-slate-500/10 text-slate-300",
}

export function DocumentProcessingTable() {
  const [permits, setPermits] = useState<Permit[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPermits()

    const refreshInterval = setInterval(() => {
      loadPermits(false)
    }, 60000)

    return () => clearInterval(refreshInterval)
  }, [])

  const loadPermits = async (showSpinner = true) => {
    if (showSpinner) {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)

    try {
      const result = await getPermits({ limit: 10 })
      if (!result.success) {
        throw new Error(result.error || "Failed to load permits")
      }
      setPermits(result.data)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to load permits")
    } finally {
      if (showSpinner) {
        setLoading(false)
      } else {
        setIsRefreshing(false)
      }
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getPersonName = (permit: Permit) => {
    if (permit.person) {
      return `${permit.person.firstName || ""} ${permit.person.lastName || ""}`.trim()
    }
    return "Unknown"
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/70 shadow-lg shadow-black/10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 p-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Document Processing Status</h3>
          <p className="mt-1 text-sm text-gray-400">Track the highest priority permit submissions in flight</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadPermits(false)}
          className="border-gray-800 bg-gray-900 text-xs font-medium text-gray-200 hover:bg-gray-800"
          disabled={isRefreshing}
        >
          {isRefreshing ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-2 h-3.5 w-3.5" />}
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-4 border-b border-red-500/20 bg-red-500/5 px-6 py-3 text-sm text-red-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" className="border-red-500/30 bg-transparent text-red-200 hover:bg-red-500/10" onClick={() => loadPermits(false)}>
            Retry
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-2 p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full bg-gray-800/80" />
          ))}
        </div>
      ) : permits.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-gray-400">
          <p>No permits match the current filters.</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 text-green-400 hover:text-green-300"
            onClick={() => loadPermits(true)}
          >
            Reload data
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">Permit Type</TableHead>
                <TableHead className="text-gray-400">Person</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Due Date</TableHead>
                <TableHead className="text-gray-400">Created</TableHead>
                <TableHead className="text-right text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permits.map((item) => {
                const dueDate = item.permit.dueDate ? new Date(item.permit.dueDate) : null
                const isDueSoon = dueDate ? dueDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 && dueDate.getTime() > Date.now() : false
                const isOverdue = dueDate ? dueDate.getTime() < Date.now() : false

                return (
                  <TableRow key={item.permit.id} className="border-gray-800 hover:bg-gray-800/60">
                    <TableCell>
                      <Badge variant="outline" className={`border-0 ${categoryColors[item.permit.category]}`}>
                        {item.permit.category.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-200">{getPersonName(item)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border-0 capitalize ${statusColors[item.permit.status]}`}>
                        {item.permit.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-sm ${isOverdue ? "text-rose-300" : isDueSoon ? "text-amber-300" : "text-gray-400"}`}>
                      {formatDate(item.permit.dueDate)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{formatDate(item.permit.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:bg-gray-800 hover:text-white"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-48 border border-gray-800 bg-gray-950/90 p-0 backdrop-blur">
                          <div className="flex flex-col">
                            <Link
                              href={`/permits/${item.permit.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 transition hover:bg-gray-900"
                            >
                              <Eye className="h-4 w-4" />
                              View details
                            </Link>
                            <Link
                              href={`/permits/${item.permit.id}/edit`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 transition hover:bg-gray-900"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit permit
                            </Link>
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-green-400 transition hover:bg-gray-900">
                              <CheckCircle className="h-4 w-4" />
                              Mark approved
                            </button>
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-400 transition hover:bg-gray-900">
                              <Trash2 className="h-4 w-4" />
                              Delete request
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
