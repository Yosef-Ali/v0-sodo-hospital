import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-400/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-400/5 via-transparent to-transparent pointer-events-none"></div>

      {/* Login Card Skeleton */}
      <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-slate-700 relative z-10">
        <CardHeader className="space-y-3 pb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Login Button */}
          <Skeleton className="h-10 w-full" />

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-700"></div>
            <Skeleton className="h-4 w-24" />
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>

          {/* Google Button */}
          <Skeleton className="h-10 w-full" />
        </CardContent>

        <CardFooter className="flex justify-center pt-6 border-t border-slate-700">
          <Skeleton className="h-4 w-48" />
        </CardFooter>
      </Card>
    </div>
  )
}
