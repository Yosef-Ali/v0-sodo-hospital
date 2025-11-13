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

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <p className="text-gray-400">Loading permits...</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Document Processing Status</h3>
        <p className="text-sm text-gray-400 mt-1">Track and manage permit submissions</p>
      </div>

      {permits.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-400">No permits found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <TableHead className="text-gray-400">Permit Type</TableHead>
                <TableHead className="text-gray-400">Person</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Due Date</TableHead>
                <TableHead className="text-gray-400">Created</TableHead>
                <TableHead className="text-right text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permits.map((item) => (
                <TableRow
                  key={item.permit.id}
                  className="border-gray-700 hover:bg-gray-750"
                >
                  <TableCell>
                    <Badge variant="outline" className={categoryColors[item.permit.category]}>
                      {item.permit.category.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {getPersonName(item)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[item.permit.status]}>
                      {item.permit.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {formatDate(item.permit.dueDate)}
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {formatDate(item.permit.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
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
                          <button
                            className="px-4 py-2 text-sm text-green-400 hover:bg-gray-800 flex items-center gap-2 border-b border-gray-700 w-full text-left"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            className="px-4 py-2 text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
