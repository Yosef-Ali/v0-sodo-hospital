"use client"

import { useRouter } from "next/navigation"
import { useStackApp, useUser } from "@stackframe/stack"
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
  const user = useUser()
  const app = useStackApp()
  const router = useRouter()

  if (!user) {
    return null
  }

  const name = user.displayName || user.primaryEmail || "User"
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handleSignOut = async () => {
    await app.signOut()
    router.push("/login")
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

