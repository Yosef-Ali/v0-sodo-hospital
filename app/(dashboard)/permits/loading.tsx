import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function PermitsLoading() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
              </div>
              {i === 0 && <Skeleton className="h-8 w-8 rounded" />}
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[200px]" />
      </div>

      {/* Permits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700 p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>

            {/* Details */}
            <div className="space-y-2">
              <div className="flex items-start">
                <Skeleton className="h-4 w-4 mr-2 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-8 w-full mt-2" />
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-7 w-16" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
