"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"

export function SettingsUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Users & Roles</h3>
          <p className="text-sm text-gray-400">Manage user accounts and role assignments</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input placeholder="Search users..." className="pl-10 bg-gray-700 border-gray-600" />
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {[
          { name: "Admin User", email: "admin@sodohospital.com", role: "ADMIN", active: true },
          { name: "HR Manager", email: "hr.manager@sodohospital.com", role: "HR_MANAGER", active: true },
          { name: "HR Staff", email: "hr@sodohospital.com", role: "HR", active: true },
          { name: "Logistics", email: "logistics@sodohospital.com", role: "LOGISTICS", active: true },
        ].map((user) => (
          <div
            key={user.email}
            className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 flex items-center justify-between hover:border-gray-500 transition-colors"
          >
            <div>
              <h4 className="font-medium text-white">{user.name}</h4>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={user.role === "ADMIN" ? "destructive" : "default"}
                className="text-xs"
              >
                {user.role}
              </Badge>
              <Badge variant={user.active ? "default" : "secondary"} className="text-xs">
                {user.active ? "Active" : "Inactive"}
              </Badge>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
