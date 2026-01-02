import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function TeamsLoading() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 flex-1 max-w-md" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700 p-6">
            {/* Team Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 flex-1">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>

            {/* Team Description */}
            <Skeleton className="h-12 w-full mb-4" />

            {/* Team Members */}
            <div className="mb-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, j) => (
                  <Skeleton key={j} className="h-8 w-8 rounded-full border-2 border-gray-800" />
                ))}
              </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-5 w-12" />
              </div>
              <div>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-700 flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
