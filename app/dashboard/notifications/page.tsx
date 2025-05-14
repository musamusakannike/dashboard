"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchAPI } from "@/lib/api"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Bell, Edit, Info, MoreVertical, Trash } from "lucide-react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setIsLoading(true)
        const data = await fetchAPI("/notifications")
        setNotifications(data.notifications || [])
      } catch (err) {
        console.error("Failed to fetch notifications:", err)
        setError("Failed to load notifications. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleCreateNotification = () => {
    router.push("/dashboard/notifications/create")
  }

  const handleEditNotification = (id: string) => {
    router.push(`/dashboard/notifications/edit/${id}`)
  }

  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return
    }

    try {
      await fetchAPI(`/notifications/${id}`, { method: "DELETE" })
      setNotifications(notifications.filter((notification) => notification._id !== id))
    } catch (err) {
      console.error("Failed to delete notification:", err)
      alert("Failed to delete notification. Please try again.")
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-400" />
      case "success":
        return <Bell className="h-4 w-4 text-green-400" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <Bell className="h-4 w-4 text-blue-400" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "info":
        return <Badge className="bg-blue-900/30 text-blue-400 hover:bg-blue-900/40">Info</Badge>
      case "success":
        return <Badge className="bg-green-900/30 text-green-400 hover:bg-green-900/40">Success</Badge>
      case "warning":
        return <Badge className="bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/40">Warning</Badge>
      case "error":
        return <Badge className="bg-red-900/30 text-red-400 hover:bg-red-900/40">Error</Badge>
      default:
        return <Badge className="bg-blue-900/30 text-blue-400 hover:bg-blue-900/40">Info</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Notifications"
        description="Manage system notifications"
        action={{
          label: "Create Notification",
          onClick: handleCreateNotification,
        }}
      />

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardContent className="p-6">
          <div className="rounded-md border border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-900/50">
                <TableRow className="hover:bg-zinc-900/50 border-zinc-800">
                  <TableHead className="text-zinc-400 w-[40%]">Title</TableHead>
                  <TableHead className="text-zinc-400 w-[40%]">Message</TableHead>
                  <TableHead className="text-zinc-400">Type</TableHead>
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
                          <Skeleton className="h-5 w-48 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-64 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 rounded-md bg-zinc-800 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <TableRow key={notification._id} className="hover:bg-zinc-900/50 border-zinc-800">
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(notification.type)}
                          {notification.title}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300 truncate max-w-xs">{notification.message}</TableCell>
                      <TableCell>{getTypeBadge(notification.type)}</TableCell>
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
                              onClick={() => handleEditNotification(notification._id)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-400 hover:bg-red-900/30 hover:text-red-300 cursor-pointer"
                              onClick={() => handleDeleteNotification(notification._id)}
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
                    <TableCell colSpan={4} className="text-center text-zinc-500 py-6">
                      No notifications found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
