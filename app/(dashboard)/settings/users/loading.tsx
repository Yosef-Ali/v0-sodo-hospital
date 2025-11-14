import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function UsersSettingsLoading() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 flex-1 max-w-md" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Users Table */}
      <Card className="bg-gray-800 border-gray-700">
        <div className="p-6">
          <div className="space-y-3">
            {/* Table Header */}
            <div className="flex gap-4 pb-3 border-b border-gray-700">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            {/* Table Rows */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-4 py-3 items-center">
                <div className="flex items-center gap-3 w-48">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
