"use client"

import { useRouter } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, LogOut, Settings } from "lucide-react"

export function UserMenu() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const user = session?.user

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-xs sm:text-sm border-gray-700 bg-gray-900/60 text-gray-200 hover:bg-gray-800 hover:text-white"
        onClick={() => signIn("google")}
        disabled={status === "loading"}
      >
        Sign in
      </Button>
    )
  }

  const name = user.name || user.email || "User"
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-2 text-xs text-gray-200 hover:bg-gray-800"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-green-600 text-[10px] text-white">
              {initials || "SH"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline max-w-[120px] truncate">{name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-gray-900 border border-gray-700 text-gray-200 min-w-[180px]"
      >
        <DropdownMenuLabel className="text-xs text-gray-300">
          Signed in as
          <div className="text-[11px] text-gray-400 truncate">{name}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem
          className="text-xs cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          <LayoutDashboard className="mr-2 h-3 w-3" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-xs cursor-pointer"
          onClick={() => router.push("/settings")}
        >
          <Settings className="mr-2 h-3 w-3" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem
          className="text-xs text-red-400 cursor-pointer focus:text-red-300"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-3 w-3" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
