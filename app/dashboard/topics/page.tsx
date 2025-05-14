"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { topicsApi, coursesApi } from "@/lib/api"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Edit, Layers, MoreVertical, Search, Trash } from "lucide-react"

export default function TopicsPage() {
  const [topics, setTopics] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await coursesApi.getAll()
        setCourses(data.courses || [])

        // Select the first course by default if available
        if (data.courses && data.courses.length > 0 && !selectedCourse) {
          setSelectedCourse(data.courses[0]._id)
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err)
        setError("Failed to load courses. Please try again.")
      }
    }

    fetchCourses()
  }, [selectedCourse])

  useEffect(() => {
    async function fetchTopics() {
      if (!selectedCourse) return

      try {
        setIsLoading(true)
        const data = await topicsApi.getByCourse(selectedCourse)
        setTopics(data || [])
      } catch (err) {
        console.error("Failed to fetch topics:", err)
        setError("Failed to load topics. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (selectedCourse) {
      fetchTopics()
    }
  }, [selectedCourse])

  const handleCreateTopic = () => {
    router.push(`/dashboard/topics/create?courseId=${selectedCourse}`)
  }

  const handleEditTopic = (id: string) => {
    router.push(`/dashboard/topics/edit/${id}`)
  }

  const handleDeleteTopic = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) {
      return
    }

    try {
      await topicsApi.delete(id)
      setTopics(topics.filter((topic) => topic._id !== id))
    } catch (err) {
      console.error("Failed to delete topic:", err)
      alert("Failed to delete topic. Please try again.")
    }
  }

  const filteredTopics = topics.filter((topic) => topic.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Topics"
        description="Manage course topics and content structure"
        action={{
          label: "Create Topic",
          onClick: handleCreateTopic,
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
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-64">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
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

            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search topics..."
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
                  <TableHead className="text-zinc-400 w-[10%]">Order</TableHead>
                  <TableHead className="text-zinc-400 w-[40%]">Title</TableHead>
                  <TableHead className="text-zinc-400 w-[40%]">Description</TableHead>
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
                          <Skeleton className="h-5 w-8 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-48 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-64 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 rounded-md bg-zinc-800 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : selectedCourse ? (
                  filteredTopics.length > 0 ? (
                    filteredTopics
                      .sort((a, b) => a.order - b.order)
                      .map((topic) => (
                        <TableRow key={topic._id} className="hover:bg-zinc-900/50 border-zinc-800">
                          <TableCell className="font-medium text-white">{topic.order}</TableCell>
                          <TableCell className="font-medium text-white">
                            <div className="flex items-center gap-2">
                              <Layers className="h-4 w-4 text-indigo-400" />
                              {topic.title}
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-300 truncate max-w-xs">{topic.description}</TableCell>
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
                                  onClick={() => handleEditTopic(topic._id)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-400 hover:bg-red-900/30 hover:text-red-300 cursor-pointer"
                                  onClick={() => handleDeleteTopic(topic._id)}
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
                        No topics found for this course
                      </TableCell>
                    </TableRow>
                  )
                ) : (
                  <TableRow className="hover:bg-zinc-900/50 border-zinc-800">
                    <TableCell colSpan={4} className="text-center text-zinc-500 py-6">
                      Please select a course to view topics
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
