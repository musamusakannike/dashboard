"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { fetchAPI } from "@/lib/api"
import { NotificationForm } from "@/components/dashboard/notification-form"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

export default function EditNotificationPage() {
  const { id } = useParams()
  const [notification, setNotification] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNotification() {
      try {
        setIsLoading(true)
        const data = await fetchAPI(`/notifications/${id}`)
        setNotification(data.data)
      } catch (err) {
        console.error("Failed to fetch notification:", err)
        setError("Failed to load notification. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchNotification()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-zinc-800" />
          <Skeleton className="h-4 w-64 bg-zinc-800" />
        </div>
        <Skeleton className="h-[400px] w-full bg-zinc-800" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-md flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    )
  }

  return <NotificationForm initialData={notification} isEditing />
}
