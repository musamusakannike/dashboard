"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { usersApi } from "@/lib/api"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Edit, MoreVertical, Search, Trash, User, UserCog, Shield, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserForm } from "@/components/dashboard/user-form"
import { UserDetails } from "@/components/dashboard/user-details"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true)
        const data = await usersApi.getAll()
        let usersArray = []
        if (Array.isArray(data)) {
          usersArray = data
        } else if (data && Array.isArray(data.data)) {
          usersArray = data.data
        }
        setUsers(usersArray)
      } catch (err) {
        console.error("Failed to fetch users:", err)
        setError("Failed to load users. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setIsViewDialogOpen(true)
  }

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return
    }

    try {
      await usersApi.delete(id)
      setUsers(users?.filter((user) => user._id !== id))
    } catch (err) {
      console.error("Failed to delete user:", err)
      alert("Failed to delete user. Please try again.")
    }
  }

  const handleUserUpdate = (updatedUser: any) => {
    setUsers(users.map((user) => (user._id === updatedUser._id ? updatedUser : user)))
    setIsEditDialogOpen(false)
  }

  const filteredUsers = users?.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "superadmin":
        return (
          <Badge className="bg-purple-900/30 text-purple-400 hover:bg-purple-900/40 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Super Admin
          </Badge>
        )
      case "admin":
        return (
          <Badge className="bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/40 flex items-center gap-1">
            <UserCog className="h-3 w-3" />
            Admin
          </Badge>
        )
      default:
        return (
          <Badge className="bg-blue-900/30 text-blue-400 hover:bg-blue-900/40 flex items-center gap-1">
            <User className="h-3 w-3" />
            User
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Users" description="Manage platform users and permissions" />

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search users..."
                className="pl-9 bg-zinc-900/50 border-zinc-800 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-900/50">
                <TableRow className="hover:bg-zinc-900/50 border-zinc-800">
                  <TableHead className="text-zinc-400 w-[25%]">User</TableHead>
                  <TableHead className="text-zinc-400 w-[25%]">Email</TableHead>
                  <TableHead className="text-zinc-400 w-[15%]">Role</TableHead>
                  <TableHead className="text-zinc-400 w-[15%]">Status</TableHead>
                  <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i} className="hover:bg-zinc-900/50 border-zinc-800">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
                            <Skeleton className="h-5 w-32 bg-zinc-800" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-40 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 rounded-md bg-zinc-800 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id} className="hover:bg-zinc-900/50 border-zinc-800">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-zinc-800">
                            <AvatarImage src={user.profileImage || "/placeholder.svg"} />
                            <AvatarFallback className="bg-indigo-900 text-indigo-200">
                              {user.fullname?.charAt(0) || user.username?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">{user.fullname || "Unnamed User"}</p>
                            <p className="text-xs text-zinc-500">@{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive !== false ? "default" : "secondary"}
                          className={
                            user.isActive !== false
                              ? "bg-green-900/30 text-green-400 hover:bg-green-900/40"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          }
                        >
                          {user.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                            <DropdownMenuItem
                              className="hover:bg-zinc-800 hover:text-white cursor-pointer"
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="hover:bg-zinc-800 hover:text-white cursor-pointer"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-400 hover:bg-red-900/30 hover:text-red-300 cursor-pointer"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-zinc-900/50 border-zinc-800">
                    <TableCell colSpan={5} className="text-center text-zinc-500 py-6">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit User</DialogTitle>
            <DialogDescription className="text-zinc-400">Update user information and permissions</DialogDescription>
          </DialogHeader>
          {selectedUser && <UserForm user={selectedUser} onSave={handleUserUpdate} />}
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">User Details</DialogTitle>
            <DialogDescription className="text-zinc-400">Detailed information about the user</DialogDescription>
          </DialogHeader>
          {selectedUser && <UserDetails user={selectedUser} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
