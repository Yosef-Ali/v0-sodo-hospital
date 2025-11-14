import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function TasksCalendarLoading() {
  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-gray-800 border-gray-700 p-6 flex-1">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>

        {/* Calendar Days with Tasks */}
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <Card key={i} className="bg-gray-900/50 border-gray-700 p-2 h-28">
              <Skeleton className="h-5 w-8 mb-2" />
              <div className="space-y-1">
                {i % 3 === 0 && (
                  <>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </>
                )}
                {i % 5 === 0 && <Skeleton className="h-4 w-full" />}
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
}
