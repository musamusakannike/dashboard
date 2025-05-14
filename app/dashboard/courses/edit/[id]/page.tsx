"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { fetchAPI } from "@/lib/api"
import { CourseForm } from "@/components/dashboard/course-form"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

export default function EditCoursePage() {
  const { id } = useParams()
  const [course, setCourse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCourse() {
      try {
        setIsLoading(true)
        const data = await fetchAPI(`/courses/${id}`)
        setCourse(data.course)
      } catch (err) {
        console.error("Failed to fetch course:", err)
        setError("Failed to load course. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchCourse()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-zinc-800" />
          <Skeleton className="h-4 w-64 bg-zinc-800" />
        </div>
        <Skeleton className="h-[500px] w-full bg-zinc-800" />
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

  return <CourseForm initialData={course} isEditing />
}
