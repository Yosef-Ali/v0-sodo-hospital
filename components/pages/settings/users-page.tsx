"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getUsers, deleteUser } from "@/lib/actions/users"
import { NewUserDialog } from "@/components/users/new-user-dialog"
import { EditUserDialog } from "@/components/users/edit-user-dialog"
import type { User } from "@/lib/db"

export function SettingsUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch users
  const fetchUsers = async (search?: string) => {
    setIsLoading(true)
    const result = await getUsers(search)
    if (result.success && result.data) {
      setUsers(result.data)
    } else {
      toast.error("Failed to load users")
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Search handler with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchUsers(searchQuery)
      } else {
        fetchUsers()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    setIsDeleting(true)
    const result = await deleteUser(userToDelete.id)

    if (result.success) {
      toast.success("User deleted successfully!")
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      fetchUsers(searchQuery)
    } else {
      toast.error(result.error || "Failed to delete user")
    }
    setIsDeleting(false)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive"
      case "HR_MANAGER":
        return "default"
      default:
        return "secondary"
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: "Admin",
      HR_MANAGER: "HR Manager",
      HR: "HR Staff",
      LOGISTICS: "Logistics",
      FINANCE: "Finance",
      USER: "User",
    }
    return labels[role] || role
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Users & Roles</h3>
          <p className="text-sm text-gray-400">
            Manage user accounts and role assignments ({users.length} total)
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => setIsNewUserDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search users by name or email..."
          className="pl-10 bg-gray-700 border-gray-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-gray-700/50 border border-gray-600 rounded-lg">
          <p className="text-gray-400">
            {searchQuery ? "No users found matching your search" : "No users yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 flex items-center justify-between hover:border-gray-500 transition-colors"
            >
              <div>
                <h4 className="font-medium text-white">{user.name || "Unnamed User"}</h4>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={getRoleBadgeVariant(user.role)}
                  className="text-xs"
                >
                  {getRoleLabel(user.role)}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(user)}
                  className="flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(user)}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <NewUserDialog
        open={isNewUserDialogOpen}
        onOpenChange={setIsNewUserDialogOpen}
        onUserCreated={() => fetchUsers(searchQuery)}
      />

      <EditUserDialog
        user={selectedUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUserUpdated={() => fetchUsers(searchQuery)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete User?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">{userToDelete?.name}</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 border-gray-600 hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
