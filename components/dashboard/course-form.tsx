"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { fetchAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/header"
import { AlertCircle } from "lucide-react"

interface CourseFormProps {
  initialData?: any
  isEditing?: boolean
}

export function CourseForm({ initialData, isEditing = false }: CourseFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    image: initialData?.image || "",
    categories: initialData?.categories?.join(", ") || "",
    price: initialData?.price || 0,
    isFeatured: initialData?.isFeatured || false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const categories = formData.categories
        .split(",")
        .map((cat: string) => cat.trim())
        .filter((cat: string) => cat)

      const payload = {
        ...formData,
        categories,
        price: Number(formData.price),
      }

      if (isEditing && initialData?._id) {
        await fetchAPI(`/courses/${initialData._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      } else {
        await fetchAPI("/courses", {
          method: "POST",
          body: JSON.stringify(payload),
        })
      }

      router.push("/dashboard/courses")
      router.refresh()
    } catch (err) {
      console.error("Failed to save course:", err)
      setError(err instanceof Error ? err.message : "Failed to save course. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={isEditing ? "Edit Course" : "Create Course"}
        description={isEditing ? "Update course details" : "Add a new course to your platform"}
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
                  placeholder="Course title"
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
                  placeholder="Course description"
                  rows={5}
                  className="bg-zinc-900/50 border-zinc-800 text-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-zinc-300">
                  Image URL
                </Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="bg-zinc-900/50 border-zinc-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categories" className="text-zinc-300">
                  Categories
                </Label>
                <Input
                  id="categories"
                  name="categories"
                  value={formData.categories}
                  onChange={handleChange}
                  placeholder="Technology, Programming, Data Science"
                  className="bg-zinc-900/50 border-zinc-800 text-white"
                />
                <p className="text-xs text-zinc-500">Separate categories with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-zinc-300">
                  Price
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="49.99"
                  required
                  className="bg-zinc-900/50 border-zinc-800 text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleSwitchChange("isFeatured", checked)}
                />
                <Label htmlFor="isFeatured" className="text-zinc-300">
                  Featured Course
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/courses")}
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
              >
                {isSubmitting ? "Saving..." : isEditing ? "Update Course" : "Create Course"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
