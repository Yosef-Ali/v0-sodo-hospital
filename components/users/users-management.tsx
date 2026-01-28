"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, UserPlus, Mail, Shield, AlertCircle, Search, Check, MoreHorizontal, Ban, Unlock, Trash } from "lucide-react"
import { EditUserDialog } from "@/components/users/edit-user-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  active: boolean
  created_at: string
  last_sign_in: string
}

export function UsersManagement() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Create User state
  const [createName, setCreateName] = useState("")
  const [createEmail, setCreateEmail] = useState("")
  const [createPassword, setCreatePassword] = useState("")
  const [createRole, setCreateRole] = useState("USER")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteMessage, setInviteMessage] = useState<string | null>(null)

  // Edit User State
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser({
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
    })
    setIsEditOpen(true)
  }

  useEffect(() => {
    fetchUsers()
  }, [session])

  const fetchUsers = async () => {
    try {
      const { getUsers } = await import("@/lib/actions/users")
      const result = await getUsers()
      
      if (result.success && result.data) {
        // Map DB users to UserProfile interface
        const mappedUsers: UserProfile[] = result.data.map((u: any) => ({
          id: u.id,
          email: u.email,
          full_name: u.name,
          role: u.role,
          active: u.active ?? true, // Default to true if missing
          created_at: u.createdAt,
          last_sign_in: u.updatedAt // Using updatedAt as proxy for now
        }))
        setUsers(mappedUsers)
      } else {
        // Fallback or empty
        setUsers([])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteLoading(true)
    setInviteMessage(null)
    setError(null)

    try {
      const { createUser } = await import("@/lib/actions/users")
      const result = await createUser({
        name: createName,
        email: createEmail,
        password: createPassword,
        role: createRole as any
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      setInviteMessage(`User ${createName} created successfully!`)
      setCreateName("")
      setCreateEmail("")
      setCreatePassword("")
      setCreateRole("USER")
      
      // Refresh list
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setInviteLoading(false)
    }
  }

  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    try {
      const { toggleUserStatus } = await import("@/lib/actions/users")
      const result = await toggleUserStatus(userId, !currentStatus)
      
      if (result.success) {
        toast.success(result.message)
        fetchUsers()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const handleDeleteUser = (user: UserProfile) => {
    setUserToDelete({ id: user.id, name: user.full_name })
    setIsDeleteOpen(true)
  }

  const confirmDeleteUser = async (userId: string) => {
      try {
        const { deleteUser } = await import("@/lib/actions/users")
        const result = await deleteUser(userId)
        
        if (result.success) {
          toast.success("User deleted successfully")
          fetchUsers()
        } else {
          toast.error(result.error)
        }
      } catch (error) {
        toast.error("An error occurred")
      } finally {
        setIsDeleteOpen(false)
        setUserToDelete(null)
      }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">Manage users and their access to the system</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New User</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new user to the system. They will be able to log in immediately.
              </DialogDescription>
            </DialogHeader>

            {inviteMessage && (
              <Alert className="bg-green-950/50 border-green-900">
                <Check className="h-4 w-4" />
                <AlertDescription>{inviteMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name" className="text-gray-300">
                  Full Name
                </Label>
                <Input
                  id="create-name"
                  type="text"
                  placeholder="John Doe"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-email" className="text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder="user@hospital.com"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="create-password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-role" className="text-gray-300">
                  Role
                </Label>
                <Select value={createRole} onValueChange={setCreateRole}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="HR_MANAGER">HR Manager</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="LOGISTICS">Logistics</SelectItem>
                    <SelectItem value="FINANCE">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                disabled={inviteLoading}
              >
                {inviteLoading ? "Creating..." : "Create User"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-950/50 border-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="glass-card border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="mr-2 h-5 w-5 text-green-400" />
            System Users
          </CardTitle>
          <CardDescription className="text-gray-400">
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No users found</div>
            ) : (
              <div className="rounded-md border border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-800/50">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Role</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300">Last Sign In</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-gray-700 hover:bg-gray-800/50">
                        <TableCell className="text-white font-medium">{user.full_name}</TableCell>
                        <TableCell className="text-gray-300">{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.role === "ADMIN"
                                ? "border-purple-500 text-purple-400 bg-purple-950/20"
                                : user.role === "HR_MANAGER"
                                ? "border-blue-500 text-blue-400 bg-blue-950/20"
                                : "border-gray-600 text-gray-400"
                            }
                          >
                            <Shield className="mr-1 h-3 w-3" />
                            {user.role}
                          </Badge>
                        </TableCell>
                         <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.active
                                ? "border-green-500 text-green-400 bg-green-950/20"
                                : "border-red-500 text-red-400 bg-red-950/20"
                            }
                          >
                            {user.active ? (
                                <Check className="mr-1 h-3 w-3" />
                            ) : (
                                <Ban className="mr-1 h-3 w-3" />
                            )}
                            {user.active ? "Active" : "Blocked"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(user.last_sign_in).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem 
                                    onClick={() => handleEditUser(user)}
                                    className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-700" />
                                <DropdownMenuItem 
                                    onClick={() => handleToggleBlock(user.id, user.active)}
                                    className={`cursor-pointer focus:bg-gray-700 ${user.active ? 'text-amber-400 hover:text-amber-300' : 'text-green-400 hover:text-green-300'}`}
                                >
                                    {user.active ? <Ban className="mr-2 h-4 w-4" /> : <Unlock className="mr-2 h-4 w-4" />}
                                    {user.active ? "Block User" : "Unblock User"}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => handleDeleteUser(user)}
                                    className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-900/20 focus:bg-red-900/20 focus:text-red-300"
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete User
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditUserDialog 
        user={selectedUser} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        onUserUpdated={fetchUsers}
      />
      
      <Card className="glass-card border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">User Roles & Permissions</CardTitle>
          <CardDescription className="text-gray-400">
            Understanding user roles in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Badge className="bg-green-950/50 border-green-500 text-green-400">Admin</Badge>
              <div className="flex-1">
                <p className="text-white font-medium">Administrator</p>
                <p className="text-gray-400 text-sm">
                  Full access to all features including user management, system settings, and all documents
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Badge className="bg-gray-800 border-gray-600 text-gray-400">Manager</Badge>
              <div className="flex-1">
                <p className="text-white font-medium">Manager</p>
                <p className="text-gray-400 text-sm">
                  Can manage team members, approve documents, and access department-specific features
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Badge className="bg-gray-800 border-gray-600 text-gray-400">User</Badge>
              <div className="flex-1">
                <p className="text-white font-medium">User</p>
                <p className="text-gray-400 text-sm">
                  Can create and manage own documents, collaborate with team members
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the user
              <span className="font-semibold text-white"> {userToDelete?.name} </span>
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700 border-red-600"
              onClick={() => {
                if (userToDelete) {
                  confirmDeleteUser(userToDelete.id)
                }
              }}
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
