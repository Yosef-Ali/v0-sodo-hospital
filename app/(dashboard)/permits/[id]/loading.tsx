import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function PermitDetailLoading() {
  return (
    <div className="p-8">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-9 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Permit Information Card */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-7 w-24" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </Card>

          {/* Person Information Card */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="flex items-center space-x-4 mb-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-36" />
              </div>
            </div>
          </Card>

          {/* Checklist Card */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </Card>

          {/* History Card */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3 pb-4 border-b border-gray-700 last:border-0">
                  <Skeleton className="h-8 w-8 rounded-full mt-1" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>

          {/* Quick Information Card */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </Card>

          {/* Related Tasks Card */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="bg-gray-900/50 border-gray-700 p-3">
                  <div className="flex items-start justify-between mb-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-12 w-full mb-2" />
                  <div className="flex justify-between text-xs">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
