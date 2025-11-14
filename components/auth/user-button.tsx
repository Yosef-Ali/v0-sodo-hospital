"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import { signOut } from "next-auth/react"

interface UserButtonProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function UserButton({ user }: UserButtonProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.[0].toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
          <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600 text-white text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start text-left group-data-[collapsible=icon]:hidden">
          <span className="text-sm font-medium text-sidebar-foreground">{user.name || "User"}</span>
          <span className="text-xs text-sidebar-foreground/70">{user.email}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
        <DropdownMenuLabel className="text-gray-300">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem className="text-gray-300 focus:bg-gray-700 focus:text-white cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-gray-300 focus:bg-gray-700 focus:text-white cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-400 focus:bg-gray-700 focus:text-red-300 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
