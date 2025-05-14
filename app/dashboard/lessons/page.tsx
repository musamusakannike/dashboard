"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { lessonsApi, topicsApi, coursesApi } from "@/lib/api"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Edit, FileText, MoreVertical, Search, Trash } from "lucide-react"

export default function LessonsPage() {
  const [lessons, setLessons] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [selectedTopic, setSelectedTopic] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  // Fetch courses
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
  }, [])

  // Fetch topics when course changes
  useEffect(() => {
    async function fetchTopics() {
      if (!selectedCourse) return

      try {
        const data = await topicsApi.getByCourse(selectedCourse)
        setTopics(data || [])

        // Reset selected topic
        setSelectedTopic("")

        // Select the first topic by default if available
        if (data && data.length > 0) {
          setSelectedTopic(data[0]._id)
        }
      } catch (err) {
        console.error("Failed to fetch topics:", err)
        setError("Failed to load topics. Please try again.")
      }
    }

    if (selectedCourse) {
      fetchTopics()
    }
  }, [selectedCourse])

  // Fetch lessons when topic changes
  useEffect(() => {
    async function fetchLessons() {
      if (!selectedTopic) return

      try {
        setIsLoading(true)
        const data = await lessonsApi.getByTopic(selectedTopic)
        setLessons(data.lessons || [])
      } catch (err) {
        console.error("Failed to fetch lessons:", err)
        setError("Failed to load lessons. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (selectedTopic) {
      fetchLessons()
    } else {
      setLessons([])
      setIsLoading(false)
    }
  }, [selectedTopic])

  const handleCreateLesson = () => {
    router.push(`/dashboard/lessons/create?topicId=${selectedTopic}`)
  }

  const handleEditLesson = (id: string) => {
    router.push(`/dashboard/lessons/edit/${id}`)
  }

  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) {
      return
    }

    try {
      await lessonsApi.delete(id)
      setLessons(lessons.filter((lesson) => lesson._id !== id))
    } catch (err) {
      console.error("Failed to delete lesson:", err)
      alert("Failed to delete lesson. Please try again.")
    }
  }

  const filteredLessons = lessons.filter((lesson) => lesson.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Lessons"
        description="Manage course lessons and content"
        action={{
          label: "Create Lesson",
          onClick: handleCreateLesson,
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
                  <SelectValue placeholder="Select a course">
                    {selectedCourse && courses.find((c) => c._id === selectedCourse)?.title}
                  </SelectValue>
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

            <div className="w-full md:w-64">
              <Select
                value={selectedTopic}
                onValueChange={setSelectedTopic}
                disabled={!selectedCourse || topics.length === 0}
              >
                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                  <SelectValue placeholder="Select a topic">
                    {selectedTopic && topics.find((t) => t._id === selectedTopic)?.title}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  {topics.map((topic) => (
                    <SelectItem key={topic._id} value={topic._id} className="hover:bg-zinc-800 hover:text-white">
                      {topic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search lessons..."
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
                ) : selectedTopic ? (
                  filteredLessons.length > 0 ? (
                    filteredLessons
                      .sort((a, b) => a.order - b.order)
                      .map((lesson) => (
                        <TableRow key={lesson._id} className="hover:bg-zinc-900/50 border-zinc-800">
                          <TableCell className="font-medium text-white">{lesson.order}</TableCell>
                          <TableCell className="font-medium text-white">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-indigo-400" />
                              {lesson.title}
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-300 truncate max-w-xs">{lesson.description}</TableCell>
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
                                  onClick={() => handleEditLesson(lesson._id)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-400 hover:bg-red-900/30 hover:text-red-300 cursor-pointer"
                                  onClick={() => handleDeleteLesson(lesson._id)}
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
                        No lessons found for this topic
                      </TableCell>
                    </TableRow>
                  )
                ) : (
                  <TableRow className="hover:bg-zinc-900/50 border-zinc-800">
                    <TableCell colSpan={4} className="text-center text-zinc-500 py-6">
                      Please select a course and topic to view lessons
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
