"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateUser } from "@/lib/actions/users"
import type { User } from "@/lib/db"

interface EditUserDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdated?: () => void
}

export function EditUserDialog({ user, open, onOpenChange, onUserUpdated }: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER" as "ADMIN" | "HR_MANAGER" | "HR" | "LOGISTICS" | "FINANCE" | "USER",
  })

  const roles = [
    { value: "ADMIN", label: "Admin" },
    { value: "HR_MANAGER", label: "HR Manager" },
    { value: "HR", label: "HR Staff" },
    { value: "LOGISTICS", label: "Logistics" },
    { value: "FINANCE", label: "Finance" },
    { value: "USER", label: "User" },
  ]

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email,
        password: "", // Don't pre-fill password
        role: user.role as any,
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      // Only include password if it's been changed
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      const result = await updateUser(user.id, updateData)

      if (result.success) {
        toast.success("User updated successfully!")
        onOpenChange(false)
        onUserUpdated?.()
      } else {
        toast.error(result.error || "Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Edit User</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update user details and role assignment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-gray-300">
              Name *
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="edit-email" className="text-gray-300">
              Email *
            </Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@soddohospital.com"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="edit-password" className="text-gray-300">
              New Password (Optional)
            </Label>
            <Input
              id="edit-password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Leave blank to keep current password"
              className="bg-gray-700 border-gray-600 text-white"
              minLength={6}
            />
            <p className="text-xs text-gray-500">Leave blank to keep current password</p>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="edit-role" className="text-gray-300">
              Role *
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: any) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value} className="text-white">
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-gray-700 border-gray-600 hover:bg-gray-600"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
