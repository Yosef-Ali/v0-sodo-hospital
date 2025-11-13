"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { MoreHorizontal, Eye, Edit2, Trash2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { getPermits } from "@/lib/actions/v2/permits"

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
  WORK_PERMIT: "bg-blue-100 text-blue-800",
  RESIDENCE_ID: "bg-purple-100 text-purple-800",
  LICENSE: "bg-green-100 text-green-800",
  PIP: "bg-orange-100 text-orange-800",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  EXPIRED: "bg-gray-100 text-gray-800",
}

export function DocumentProcessingTable() {
  const [permits, setPermits] = useState<Permit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPermits()
  }, [])

  const loadPermits = async () => {
    setLoading(true)
    const result = await getPermits({ limit: 10 })
    if (result.success) {
      setPermits(result.data)
    }
    setLoading(false)
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
    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-medium text-white">Document Processing Status</h3>
        <p className="text-sm text-gray-400 mt-1">
          {loading ? "Loading..." : `${permits.length} documents in process`}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-750">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Permit Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Person
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {loading ? (
              // Loading skeleton rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-6 w-24 bg-gray-700" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-32 bg-gray-700" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-6 w-20 bg-gray-700" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-24 bg-gray-700" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-24 bg-gray-700" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-8 w-8 bg-gray-700 rounded-md ml-auto" />
                  </td>
                </tr>
              ))
            ) : permits.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No permits found
                </td>
              </tr>
            ) : (
              permits.map((item) => (
                <tr key={item.permit.id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className={categoryColors[item.permit.category]}>
                      {item.permit.category.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{getPersonName(item)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className={statusColors[item.permit.status]}>
                      {item.permit.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{formatDate(item.permit.dueDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{formatDate(item.permit.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-300">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-48 bg-gray-900 border-gray-700 p-0">
                        <div className="flex flex-col">
                          <Link
                            href={`/permits/${item.permit.id}`}
                            className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2 border-b border-gray-700"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Link>
                          <Link
                            href={`/permits/${item.permit.id}/edit`}
                            className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2 border-b border-gray-700"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Link>
                          <button className="px-4 py-2 text-sm text-green-400 hover:bg-gray-800 flex items-center gap-2 border-b border-gray-700 w-full text-left">
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </button>
                          <button className="px-4 py-2 text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2 w-full text-left">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination */}
      {!loading && permits.length > 0 && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-700">
          <div className="text-sm text-gray-400">Showing 1-{permits.length} of {permits.length} permits</div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-sm font-normal border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-sm font-normal border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
