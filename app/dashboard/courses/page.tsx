"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchAPI } from "@/lib/api"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, MoreVertical, Search, Star, Trash } from "lucide-react"

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function fetchCourses() {
      try {
        setIsLoading(true)
        const data = await fetchAPI("/courses")
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

  const handleCreateCourse = () => {
    router.push("/dashboard/courses/create")
  }

  const handleEditCourse = (id: string) => {
    router.push(`/dashboard/courses/edit/${id}`)
  }

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return
    }

    try {
      await fetchAPI(`/courses/${id}`, { method: "DELETE" })
      setCourses(courses.filter((course) => course._id !== id))
    } catch (err) {
      console.error("Failed to delete course:", err)
      alert("Failed to delete course. Please try again.")
    }
  }

  const filteredCourses = courses.filter((course) => course.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Courses"
        description="Manage your platform courses"
        action={{
          label: "Create Course",
          onClick: handleCreateCourse,
        }}
      />

      {error && <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-md">{error}</div>}

      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search courses..."
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
                  <TableHead className="text-zinc-400 w-[50%]">Course</TableHead>
                  <TableHead className="text-zinc-400">Price</TableHead>
                  <TableHead className="text-zinc-400">Rating</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
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
                          <Skeleton className="h-5 w-16 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 rounded-md bg-zinc-800 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <TableRow key={course._id} className="hover:bg-zinc-900/50 border-zinc-800">
                      <TableCell className="font-medium text-white">{course.title}</TableCell>
                      <TableCell className="text-zinc-300">${course.price}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-zinc-300">
                            {course.ratingStats?.averageRating?.toFixed(1) || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={course.isActive ? "default" : "secondary"}
                          className={
                            course.isActive
                              ? "bg-green-900/30 text-green-400 hover:bg-green-900/40"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          }
                        >
                          {course.isActive ? "Active" : "Inactive"}
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
                              onClick={() => handleEditCourse(course._id)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-400 hover:bg-red-900/30 hover:text-red-300 cursor-pointer"
                              onClick={() => handleDeleteCourse(course._id)}
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
                      No courses found
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
