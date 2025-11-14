import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function DepartmentsLoading() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700 p-6">
            {/* Department Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Department Details */}
            <div className="space-y-3 mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-700">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="text-center">
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-5 w-12 mx-auto" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
