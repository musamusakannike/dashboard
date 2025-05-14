"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, UserCog, User, Calendar, Mail, Check, X } from "lucide-react"

interface UserDetailsProps {
  user: any
}

export function UserDetails({ user }: UserDetailsProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

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
    <div className="space-y-6 py-4">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="h-24 w-24 border-2 border-zinc-800">
          <AvatarImage src={user.profileImage || "/placeholder.svg"} />
          <AvatarFallback className="bg-indigo-900 text-indigo-200 text-2xl">
            {user.fullname?.charAt(0) || user.username?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-2 flex-1">
          <h2 className="text-2xl font-bold text-white">{user.fullname || "Unnamed User"}</h2>
          <p className="text-zinc-400">@{user.username}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {getRoleBadge(user.role)}
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
            <Badge
              variant={user.isPremium ? "default" : "secondary"}
              className={
                user.isPremium
                  ? "bg-amber-900/30 text-amber-400 hover:bg-amber-900/40"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }
            >
              {user.isPremium ? "Premium" : "Free"}
            </Badge>
            <Badge
              variant={user.isVerified ? "default" : "secondary"}
              className={
                user.isVerified
                  ? "bg-cyan-900/30 text-cyan-400 hover:bg-cyan-900/40"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }
            >
              {user.isVerified ? "Verified" : "Unverified"}
            </Badge>
          </div>
        </div>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/30">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">Email</p>
              <div className="flex items-center gap-2 text-zinc-300">
                <Mail className="h-4 w-4 text-indigo-400" />
                {user.email}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-zinc-500">Joined Date</p>
              <div className="flex items-center gap-2 text-zinc-300">
                <Calendar className="h-4 w-4 text-indigo-400" />
                {formatDate(user.createdAt || user.joinedDate)}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-zinc-500">Last Updated</p>
              <div className="flex items-center gap-2 text-zinc-300">
                <Calendar className="h-4 w-4 text-indigo-400" />
                {formatDate(user.updatedAt)}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-zinc-500">Last Login</p>
              <div className="flex items-center gap-2 text-zinc-300">
                <Calendar className="h-4 w-4 text-indigo-400" />
                {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
              </div>
            </div>
          </div>

          <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-zinc-300">
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                {user.isVerified ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <X className="h-4 w-4 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Email Verification</p>
                <p className="text-xs text-zinc-500">{user.isVerified ? "Verified" : "Not Verified"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-zinc-300">
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                {user.isPremium ? <Check className="h-4 w-4 text-green-400" /> : <X className="h-4 w-4 text-red-400" />}
              </div>
              <div>
                <p className="text-sm font-medium">Premium Status</p>
                <p className="text-xs text-zinc-500">{user.isPremium ? "Premium User" : "Free User"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-zinc-300">
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                {user.isActive !== false ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <X className="h-4 w-4 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Account Status</p>
                <p className="text-xs text-zinc-500">{user.isActive !== false ? "Active" : "Inactive"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
