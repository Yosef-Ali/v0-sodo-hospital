import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function DashboardLoading() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700 p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </Card>
        ))}
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="space-y-3 mb-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-700">
              <Skeleton className="h-3 w-full mb-3" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ))}
      </div>

      {/* Document Processing Table */}
      <Card className="bg-gray-800 border-gray-700 mb-12">
        <div className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3">
            <div className="flex gap-4 pb-3 border-b border-gray-700">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 py-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Activity Table */}
      <Card className="bg-gray-800 border-gray-700">
        <div className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-700 last:border-0">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
