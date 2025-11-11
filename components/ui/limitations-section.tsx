"use client"

import { SYSTEM_LIMITATIONS } from "@/lib/customer-support-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertCircle } from "lucide-react"

export function LimitationsSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-400 mb-1">System Limitations</h4>
          <p className="text-sm text-gray-400">
            Please review these limitations to ensure our system meets your requirements.
            Enterprise plans offer custom limits and configurations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {SYSTEM_LIMITATIONS.map((category, idx) => (
          <Card key={idx} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                {category.category}
              </Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-transparent">
                  <TableHead className="text-gray-400">Item</TableHead>
                  <TableHead className="text-gray-400">Limitation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {category.limits.map((limit, limitIdx) => (
                  <TableRow key={limitIdx} className="border-gray-700 hover:bg-gray-700/50">
                    <TableCell className="text-gray-300 font-medium">
                      {limit.item}
                    </TableCell>
                    <TableCell className="text-white">{limit.limit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-gray-400">
          Need higher limits?{" "}
          <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
            Contact our sales team
          </span>{" "}
          for Enterprise options.
        </p>
      </div>
    </div>
  )
}
