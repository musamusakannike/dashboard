"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { lessonsApi, topicsApi, coursesApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/header"
import { AlertCircle, Plus, Trash } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LessonFormProps {
  initialData?: any
  isEditing?: boolean
  topicId?: string
}

export function LessonForm({ initialData, isEditing = false, topicId }: LessonFormProps) {
  const [courses, setCourses] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    topic: initialData?.topic || topicId || "",
    order: initialData?.order || 0,
    contents: initialData?.contents || [],
    quiz: initialData?.quiz || [],
  })
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Fetch courses
  useEffect(() => {
    async function fetchCourses() {
      try {
        setIsLoading(true)
        const data = await coursesApi.getAll()
        setCourses(data.courses || [])

        // If editing, find the course that contains the topic
        if (isEditing && initialData?.topic) {
          const topicData = await topicsApi.getById(initialData.topic)
          if (topicData.topic?.course) {
            setSelectedCourse(topicData.topic.course)
          }
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err)
        setError("Failed to load courses. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [isEditing, initialData?.topic])

  // Fetch topics when course changes
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

  // Set selected course when topicId changes (for create)
  useEffect(() => {
    async function fetchTopicCourse() {
      if (!topicId) return

      try {
        const topicData = await topicsApi.getById(topicId)
        if (topicData.topic?.course) {
          setSelectedCourse(topicData.topic.course)
        }
      } catch (err) {
        console.error("Failed to fetch topic course:", err)
      }
    }

    if (topicId && !isEditing) {
      fetchTopicCourse()
    }
  }, [topicId, isEditing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Content management
  const addContent = () => {
    setFormData((prev) => ({
      ...prev,
      contents: [
        ...prev.contents,
        {
          type: "text",
          content: "",
          order: prev.contents.length,
        },
      ],
    }))
  }

  const updateContent = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newContents = [...prev.contents]
      newContents[index] = { ...newContents[index], [field]: value }
      return { ...prev, contents: newContents }
    })
  }

  const removeContent = (index: number) => {
    setFormData((prev) => {
      const newContents = prev.contents.filter((_, i) => i !== index)
      // Update order for remaining contents
      newContents.forEach((content, i) => {
        content.order = i
      })
      return { ...prev, contents: newContents }
    })
  }

  // Quiz management
  const addQuizQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      quiz: [
        ...prev.quiz,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: "",
        },
      ],
    }))
  }

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newQuiz = [...prev.quiz]
      newQuiz[index] = { ...newQuiz[index], [field]: value }
      return { ...prev, quiz: newQuiz }
    })
  }

  const updateQuizOption = (questionIndex: number, optionIndex: number, value: string) => {
    setFormData((prev) => {
      const newQuiz = [...prev.quiz]
      const newOptions = [...newQuiz[questionIndex].options]
      newOptions[optionIndex] = value
      newQuiz[questionIndex] = { ...newQuiz[questionIndex], options: newOptions }
      return { ...prev, quiz: newQuiz }
    })
  }

  const removeQuizQuestion = (index: number) => {
    setFormData((prev) => {
      const newQuiz = prev.quiz.filter((_, i) => i !== index)
      return { ...prev, quiz: newQuiz }
    })
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
        await lessonsApi.update(initialData._id, payload)
      } else {
        await lessonsApi.create(payload)
      }

      router.push("/dashboard/lessons")
      router.refresh()
    } catch (err) {
      console.error("Failed to save lesson:", err)
      setError(err instanceof Error ? err.message : "Failed to save lesson. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={isEditing ? "Edit Lesson" : "Create Lesson"}
        description={isEditing ? "Update lesson details" : "Add a new lesson to a topic"}
      />

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="bg-zinc-900/50 border border-zinc-800">
            <TabsTrigger
              value="basic"
              className="data-[state=active]:bg-indigo-900/30 data-[state=active]:text-indigo-400"
            >
              Basic Information
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-indigo-900/30 data-[state=active]:text-indigo-400"
            >
              Lesson Content
            </TabsTrigger>
            <TabsTrigger
              value="quiz"
              className="data-[state=active]:bg-indigo-900/30 data-[state=active]:text-indigo-400"
            >
              Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card className="border-zinc-800 bg-zinc-950/50">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="course" className="text-zinc-300">
                        Course
                      </Label>
                      <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={isEditing}>
                        <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                          {courses.map((course) => (
                            <SelectItem
                              key={course._id}
                              value={course._id}
                              className="hover:bg-zinc-800 hover:text-white"
                            >
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="topic" className="text-zinc-300">
                        Topic
                      </Label>
                      <Select
                        value={formData.topic}
                        onValueChange={(value) => handleSelectChange("topic", value)}
                        disabled={isEditing || !selectedCourse || topics.length === 0}
                      >
                        <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                          {topics.map((topic) => (
                            <SelectItem
                              key={topic._id}
                              value={topic._id}
                              className="hover:bg-zinc-800 hover:text-white"
                            >
                              {topic.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                      placeholder="Lesson title"
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
                      placeholder="Lesson description"
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
                    <p className="text-xs text-zinc-500">The order in which this lesson appears in the topic</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card className="border-zinc-800 bg-zinc-950/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Lesson Content</CardTitle>
                  <Button
                    type="button"
                    onClick={addContent}
                    className="bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Content Block
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {formData.contents.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    No content blocks added yet. Click the button above to add content.
                  </div>
                ) : (
                  formData.contents.map((content, index) => (
                    <Card key={index} className="border-zinc-800 bg-zinc-900/30">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-900/30 text-indigo-400 px-2 py-1 rounded text-xs">
                              Block {index + 1}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeContent(index)}
                            className="text-zinc-400 hover:text-red-400 hover:bg-red-900/20"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-zinc-300">Type</Label>
                          <Select value={content.type} onValueChange={(value) => updateContent(index, "type", value)}>
                            <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                              <SelectItem value="text" className="hover:bg-zinc-800 hover:text-white">
                                Text
                              </SelectItem>
                              <SelectItem value="image" className="hover:bg-zinc-800 hover:text-white">
                                Image
                              </SelectItem>
                              <SelectItem value="code" className="hover:bg-zinc-800 hover:text-white">
                                Code
                              </SelectItem>
                              <SelectItem value="latex" className="hover:bg-zinc-800 hover:text-white">
                                LaTeX
                              </SelectItem>
                              <SelectItem value="link" className="hover:bg-zinc-800 hover:text-white">
                                Link
                              </SelectItem>
                              <SelectItem value="video" className="hover:bg-zinc-800 hover:text-white">
                                Video
                              </SelectItem>
                              <SelectItem value="youtubeUrl" className="hover:bg-zinc-800 hover:text-white">
                                YouTube URL
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-zinc-300">Content</Label>
                          {content.type === "text" ? (
                            <Textarea
                              value={content.content}
                              onChange={(e) => updateContent(index, "content", e.target.value)}
                              placeholder="Enter text content..."
                              rows={5}
                              className="bg-zinc-900/50 border-zinc-800 text-white resize-none"
                            />
                          ) : (
                            <Input
                              value={content.content}
                              onChange={(e) => updateContent(index, "content", e.target.value)}
                              placeholder={`Enter ${content.type} content...`}
                              className="bg-zinc-900/50 border-zinc-800 text-white"
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <Card className="border-zinc-800 bg-zinc-950/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Quiz Questions</CardTitle>
                  <Button
                    type="button"
                    onClick={addQuizQuestion}
                    className="bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {formData.quiz.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    No quiz questions added yet. Click the button above to add a question.
                  </div>
                ) : (
                  formData.quiz.map((question, index) => (
                    <Card key={index} className="border-zinc-800 bg-zinc-900/30">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-900/30 text-indigo-400 px-2 py-1 rounded text-xs">
                              Question {index + 1}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuizQuestion(index)}
                            className="text-zinc-400 hover:text-red-400 hover:bg-red-900/20"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-zinc-300">Question</Label>
                          <Input
                            value={question.question}
                            onChange={(e) => updateQuizQuestion(index, "question", e.target.value)}
                            placeholder="Enter question..."
                            className="bg-zinc-900/50 border-zinc-800 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-zinc-300">Options</Label>
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                  <input
                                    type="radio"
                                    checked={question.correctAnswer === optionIndex}
                                    onChange={() => updateQuizQuestion(index, "correctAnswer", optionIndex)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-zinc-600 bg-zinc-800"
                                  />
                                </div>
                                <Input
                                  value={option}
                                  onChange={(e) => updateQuizOption(index, optionIndex, e.target.value)}
                                  placeholder={`Option ${optionIndex + 1}`}
                                  className="bg-zinc-900/50 border-zinc-800 text-white"
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-zinc-500">Select the radio button next to the correct answer</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-zinc-300">Explanation (Optional)</Label>
                          <Textarea
                            value={question.explanation}
                            onChange={(e) => updateQuizQuestion(index, "explanation", e.target.value)}
                            placeholder="Explanation for the correct answer..."
                            rows={3}
                            className="bg-zinc-900/50 border-zinc-800 text-white resize-none"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/lessons")}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
          >
            {isSubmitting ? "Saving..." : isEditing ? "Update Lesson" : "Create Lesson"}
          </Button>
        </div>
      </form>
    </div>
  )
}
