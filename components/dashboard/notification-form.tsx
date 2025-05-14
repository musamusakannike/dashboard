"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { fetchAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/header"
import { AlertCircle } from "lucide-react"

interface NotificationFormProps {
  initialData?: any
  isEditing?: boolean
}

export function NotificationForm({ initialData, isEditing = false }: NotificationFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    message: initialData?.message || "",
    type: initialData?.type || "info",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (isEditing && initialData?._id) {
        await fetchAPI(`/notifications/${initialData._id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        })
      } else {
        await fetchAPI("/notifications", {
          method: "POST",
          body: JSON.stringify(formData),
        })
      }

      router.push("/dashboard/notifications")
      router.refresh()
    } catch (err) {
      console.error("Failed to save notification:", err)
      setError(err instanceof Error ? err.message : "Failed to save notification. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={isEditing ? "Edit Notification" : "Create Notification"}
        description={isEditing ? "Update notification details" : "Send a new notification to users"}
      />

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-zinc-300">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Notification title"
                  required
                  className="bg-zinc-900/50 border-zinc-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-zinc-300">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Notification message"
                  rows={5}
                  required
                  className="bg-zinc-900/50 border-zinc-800 text-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-zinc-300">
                  Type
                </Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                    <SelectValue placeholder="Select notification type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectItem value="info" className="hover:bg-zinc-800 hover:text-white">
                      Info
                    </SelectItem>
                    <SelectItem value="success" className="hover:bg-zinc-800 hover:text-white">
                      Success
                    </SelectItem>
                    <SelectItem value="warning" className="hover:bg-zinc-800 hover:text-white">
                      Warning
                    </SelectItem>
                    <SelectItem value="error" className="hover:bg-zinc-800 hover:text-white">
                      Error
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/notifications")}
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
              >
                {isSubmitting ? "Saving..." : isEditing ? "Update Notification" : "Create Notification"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
