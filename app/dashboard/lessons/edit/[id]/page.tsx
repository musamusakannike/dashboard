"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { lessonsApi } from "@/lib/api"
import { LessonForm } from "@/components/dashboard/lesson-form"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

export default function EditLessonPage() {
  const { id } = useParams()
  const [lesson, setLesson] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLesson() {
      try {
        setIsLoading(true)
        const data = await lessonsApi.getById(id as string)
        setLesson(data)
      } catch (err) {
        console.error("Failed to fetch lesson:", err)
        setError("Failed to load lesson. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchLesson()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-zinc-800" />
          <Skeleton className="h-4 w-64 bg-zinc-800" />
        </div>
        <Skeleton className="h-[600px] w-full bg-zinc-800" />
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

  return <LessonForm initialData={lesson} isEditing />
}
