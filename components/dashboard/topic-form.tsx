"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { topicsApi, coursesApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/header"
import { AlertCircle } from "lucide-react"

interface TopicFormProps {
  initialData?: any
  isEditing?: boolean
  courseId?: string
}

export function TopicForm({ initialData, isEditing = false, courseId }: TopicFormProps) {
  const [courses, setCourses] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    course: initialData?.course || courseId || "",
    order: initialData?.order || 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchCourses() {
      try {
        setIsLoading(true)
        const data = await coursesApi.getAll()
        setCourses(data.courses || [])
      } catch (err) {
        console.error("Failed to fetch courses:", err)
        setError("Failed to load courses. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

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
      const payload = {
        ...formData,
        order: Number(formData.order),
      }

      if (isEditing && initialData?._id) {
        await topicsApi.update(initialData._id, payload)
      } else {
        await topicsApi.create(payload)
      }

      router.push("/dashboard/topics")
      router.refresh()
    } catch (err) {
      console.error("Failed to save topic:", err)
      setError(err instanceof Error ? err.message : "Failed to save topic. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={isEditing ? "Edit Topic" : "Create Topic"}
        description={isEditing ? "Update topic details" : "Add a new topic to a course"}
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
                <Label htmlFor="course" className="text-zinc-300">
                  Course
                </Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => handleSelectChange("course", value)}
                  disabled={isEditing}
                >
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id} className="hover:bg-zinc-800 hover:text-white">
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-zinc-300">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Topic title"
                  required
                  className="bg-zinc-900/50 border-zinc-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-zinc-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Topic description"
                  rows={5}
                  required
                  className="bg-zinc-900/50 border-zinc-800 text-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order" className="text-zinc-300">
                  Order
                </Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="bg-zinc-900/50 border-zinc-800 text-white"
                />
                <p className="text-xs text-zinc-500">The order in which this topic appears in the course</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/topics")}
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
              >
                {isSubmitting ? "Saving..." : isEditing ? "Update Topic" : "Create Topic"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
