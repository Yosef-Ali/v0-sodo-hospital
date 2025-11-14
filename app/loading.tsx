import { Skeleton } from "@/components/ui/skeleton"

export default function RootLoading() {
  return (
    <div className="min-h-screen antialiased overflow-x-hidden text-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-400/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-green-400/5 via-transparent to-transparent pointer-events-none"></div>

      {/* Navigation Skeleton */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>
      </nav>

      {/* Hero Section Skeleton */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-[180px] gap-4">
          {/* Main Hero */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 row-span-2 flex flex-col pt-8 pr-8 pb-12 pl-8 justify-center">
            <Skeleton className="h-6 w-64 mb-6" />
            <Skeleton className="h-16 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-6 w-2/3 mb-8" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>

          {/* Feature Cards */}
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
