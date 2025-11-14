import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function KanbanLoading() {
  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
          {/* Kanban Columns */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-80">
              <Card className="bg-gray-800 border-gray-700 h-full flex flex-col">
                {/* Column Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-full" />
                </div>

                {/* Column Cards */}
                <div className="p-4 space-y-3 overflow-y-auto flex-1">
                  {[...Array(3)].map((_, j) => (
                    <Card key={j} className="bg-gray-900/50 border-gray-700 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-12 w-full mb-3" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
