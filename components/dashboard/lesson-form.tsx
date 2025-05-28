"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { lessonsApi, topicsApi, coursesApi } from "@/lib/api" // Assuming these are correctly set up
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/header"
import { AlertCircle, Plus, Trash, ArrowDown, ArrowUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define types for better clarity (optional but recommended)
interface Content {
  _id?: string // Mongoose might add this
  type: "text" | "image" | "code" | "latex" | "link" | "video" | "youtubeUrl"
  content: string | Record<string, any> // Adjust as per actual content structure for different types
  order: number
}

interface ContentGroup {
  _id?: string // Mongoose might add this
  title: string
  description?: string
  contents: Content[]
  order: number
}

interface QuizQuestion {
  _id?: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface LessonFormData {
  title: string
  description: string
  topic: string
  order: number
  contentGroups: ContentGroup[]
  quiz: QuizQuestion[]
}

interface LessonFormProps {
  initialData?: any // Consider defining a more specific type for initialData
  isEditing?: boolean
  topicId?: string
}

export function LessonForm({
  initialData,
  isEditing = false,
  topicId,
}: LessonFormProps) {
  const [courses, setCourses] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [formData, setFormData] = useState<LessonFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    topic: initialData?.topic?._id || initialData?.topic || topicId || "",
    order: initialData?.order || 0,
    contentGroups: initialData?.contentGroups || [], // Updated
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

        if (isEditing && initialData?.topic) {
          const topicIdToFetch =
            typeof initialData.topic === "object"
              ? initialData.topic._id
              : initialData.topic
          const topicData = await topicsApi.getById(topicIdToFetch)
          if (topicData.topic?.course) {
            const courseId = typeof topicData.topic.course === 'object' ? topicData.topic.course._id : topicData.topic.course;
            setSelectedCourse(courseId)
          }
        } else if (topicId && !isEditing) {
            // If creating with a pre-selected topicId, find its course
            const topicData = await topicsApi.getById(topicId);
            if (topicData.topic?.course) {
                const courseId = typeof topicData.topic.course === 'object' ? topicData.topic.course._id : topicData.topic.course;
                setSelectedCourse(courseId);
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
  }, [isEditing, initialData?.topic, topicId])

  // Fetch topics when course changes
  useEffect(() => {
    async function fetchTopics() {
      if (!selectedCourse) {
        setTopics([])
        // If editing, and the form already has a topic from the selected course, don't reset it
        if (isEditing && initialData?.topic && initialData.topic.course !== selectedCourse) {
            // Do nothing or handle specific logic if course changes away from original topic's course
        } else if (!isEditing) {
             setFormData((prev) => ({ ...prev, topic: "" })) // Reset topic if course changes during creation
        }
        return
      }

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
    } else {
      setTopics([]) // Clear topics if no course is selected
    }
  }, [selectedCourse, isEditing, initialData?.topic])


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "topic") {
        // Optional: if topic changes, ensure selectedCourse matches this topic's course
        // This might be complex if topics can exist in multiple courses or if not fetched yet
    }
  }

  // --- Content Group Management ---
  const addContentGroup = () => {
    setFormData((prev) => ({
      ...prev,
      contentGroups: [
        ...prev.contentGroups,
        {
          title: `New Group ${prev.contentGroups.length + 1}`,
          description: "",
          contents: [],
          order: prev.contentGroups.length,
        },
      ],
    }))
  }

  const updateContentGroup = (
    groupIndex: number,
    field: "title" | "description",
    value: string,
  ) => {
    setFormData((prev) => {
      const newContentGroups = [...prev.contentGroups]
      newContentGroups[groupIndex] = {
        ...newContentGroups[groupIndex],
        [field]: value,
      }
      return { ...prev, contentGroups: newContentGroups }
    })
  }

  const removeContentGroup = (groupIndex: number) => {
    setFormData((prev) => {
      const newContentGroups = prev.contentGroups.filter(
        (_, i) => i !== groupIndex,
      )
      // Update order for remaining groups
      newContentGroups.forEach((group, i) => {
        group.order = i
      })
      return { ...prev, contentGroups: newContentGroups }
    })
  }

  const moveContentGroup = (groupIndex: number, direction: "up" | "down") => {
    setFormData(prev => {
        const newContentGroups = [...prev.contentGroups];
        const groupToMove = newContentGroups[groupIndex];
        const targetIndex = direction === "up" ? groupIndex - 1 : groupIndex + 1;

        if (targetIndex < 0 || targetIndex >= newContentGroups.length) {
            return prev; // Cannot move further
        }

        // Swap elements
        newContentGroups[groupIndex] = newContentGroups[targetIndex];
        newContentGroups[targetIndex] = groupToMove;

        // Update orders
        newContentGroups.forEach((group, i) => group.order = i);

        return { ...prev, contentGroups: newContentGroups };
    });
  };


  // --- Content Block Management (within a group) ---
  const addContentToGroup = (groupIndex: number) => {
    setFormData((prev) => {
      const newContentGroups = [...prev.contentGroups]
      const targetGroup = newContentGroups[groupIndex]
      targetGroup.contents = [
        ...targetGroup.contents,
        {
          type: "text",
          content: "",
          order: targetGroup.contents.length,
        },
      ]
      return { ...prev, contentGroups: newContentGroups }
    })
  }

  const updateContentInGroup = (
    groupIndex: number,
    contentIndex: number,
    field: keyof Content,
    value: any,
  ) => {
    setFormData((prev) => {
      const newContentGroups = [...prev.contentGroups]
      const targetGroup = { ...newContentGroups[groupIndex] }
      const newContents = [...targetGroup.contents]
      newContents[contentIndex] = {
        ...newContents[contentIndex],
        [field]: value,
      }
      targetGroup.contents = newContents
      newContentGroups[groupIndex] = targetGroup
      return { ...prev, contentGroups: newContentGroups }
    })
  }

  const removeContentFromGroup = (
    groupIndex: number,
    contentIndex: number,
  ) => {
    setFormData((prev) => {
      const newContentGroups = [...prev.contentGroups]
      const targetGroup = { ...newContentGroups[groupIndex] }
      let newContents = targetGroup.contents.filter(
        (_, i) => i !== contentIndex,
      )
      // Update order for remaining contents in the group
      newContents.forEach((content, i) => {
        content.order = i
      })
      targetGroup.contents = newContents
      newContentGroups[groupIndex] = targetGroup
      return { ...prev, contentGroups: newContentGroups }
    })
  }

 const moveContentInGroup = (groupIndex: number, contentIndex: number, direction: "up" | "down") => {
    setFormData(prev => {
        const newContentGroups = [...prev.contentGroups];
        const targetGroup = { ...newContentGroups[groupIndex] };
        const newContents = [...targetGroup.contents];
        const contentToMove = newContents[contentIndex];
        const targetContentIndex = direction === "up" ? contentIndex - 1 : contentIndex + 1;

        if (targetContentIndex < 0 || targetContentIndex >= newContents.length) {
            return prev; // Cannot move further
        }

        // Swap elements
        newContents[contentIndex] = newContents[targetContentIndex];
        newContents[targetContentIndex] = contentToMove;

        // Update orders
        newContents.forEach((content, i) => content.order = i);
        targetGroup.contents = newContents;
        newContentGroups[groupIndex] = targetGroup;

        return { ...prev, contentGroups: newContentGroups };
    });
};


  // --- Quiz Management (remains the same) ---
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

  const updateQuizQuestion = (
    index: number,
    field: string,
    value: any,
  ) => {
    setFormData((prev) => {
      const newQuiz = [...prev.quiz]
      newQuiz[index] = { ...newQuiz[index], [field]: value }
      return { ...prev, quiz: newQuiz }
    })
  }

  const updateQuizOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    setFormData((prev) => {
      const newQuiz = [...prev.quiz]
      const newOptions = [...newQuiz[questionIndex].options]
      newOptions[optionIndex] = value
      newQuiz[questionIndex] = {
        ...newQuiz[questionIndex],
        options: newOptions,
      }
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

    // Ensure orders are numbers and correctly set before submitting
    const payload: LessonFormData = {
      ...formData,
      order: Number(formData.order),
      contentGroups: formData.contentGroups.map((group, groupIdx) => ({
        ...group,
        order: groupIdx, // Ensure group order is sequential
        contents: group.contents.map((content, contentIdx) => ({
          ...content,
          order: contentIdx, // Ensure content order within group is sequential
        })),
      })),
      quiz: formData.quiz.map((q) => ({
        ...q,
        correctAnswer: Number(q.correctAnswer),
      })),
    }

    try {
      if (isEditing && initialData?._id) {
        await lessonsApi.update(initialData._id, payload)
      } else {
        await lessonsApi.create(payload)
      }

      router.push("/dashboard/lessons") // Or a more relevant page like the topic's page
      router.refresh() // Important for Next.js App Router to reflect changes
    } catch (err: any) {
      console.error("Failed to save lesson:", err)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to save lesson. Please try again."
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading && !courses.length) { // Show loading indicator only on initial full load
    return <div className="text-center p-8">Loading lesson form...</div>;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={isEditing ? "Edit Lesson" : "Create Lesson"}
        description={
          isEditing
            ? "Update lesson details, content, and quiz"
            : "Add a new lesson with content groups and a quiz"
        }
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
              Lesson Content Groups
            </TabsTrigger>
            <TabsTrigger
              value="quiz"
              className="data-[state=active]:bg-indigo-900/30 data-[state=active]:text-indigo-400"
            >
              Quiz
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card className="border-zinc-800 bg-zinc-950/50">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="course" className="text-zinc-300">
                        Course
                      </Label>
                      <Select
                        value={selectedCourse}
                        onValueChange={setSelectedCourse}
                        // Disable course selection if editing, or if topicId is passed (meaning course is fixed)
                        disabled={isEditing || (!!topicId && !isEditing)}
                      >
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
                        onValueChange={(value) =>
                          handleSelectChange("topic", value)
                        }
                        // Disable topic if editing (topic is fixed) or no course selected or no topics available
                        disabled={isEditing || !selectedCourse || topics.length === 0}
                      >
                        <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                          <SelectValue placeholder={!selectedCourse ? "Select a course first" : "Select a topic"} />
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
                      Lesson Title
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
                      Lesson Description
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
                      Lesson Order
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
                    <p className="text-xs text-zinc-500">
                      The order this lesson appears in the topic.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lesson Content Groups Tab */}
          <TabsContent value="content">
            <Card className="border-zinc-800 bg-zinc-950/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">
                    Content Groups
                  </CardTitle>
                  <Button
                    type="button"
                    onClick={addContentGroup}
                    className="bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Content Group
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {formData.contentGroups.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    No content groups added yet. Click the button above to add
                    a group.
                  </div>
                ) : (
                  formData.contentGroups.map((group, groupIndex) => (
                    <Card
                      key={group._id || `group-${groupIndex}`} // Use a stable key
                      className="border-zinc-700 bg-zinc-900/40"
                    >
                      <CardHeader className="pb-2 pt-4 px-4 bg-zinc-800/30 rounded-t-md">
                        <div className="flex justify-between items-center ">
                          <h4 className="text-lg font-semibold text-zinc-200">
                            Group {group.order + 1}: {group.title || "Untitled Group"}
                          </h4>
                          <div className="flex items-center gap-1">
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => moveContentGroup(groupIndex, "up")}
                                disabled={groupIndex === 0}
                                className="text-zinc-400 hover:text-sky-400 hover:bg-sky-900/20"
                                title="Move group up"
                            >
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => moveContentGroup(groupIndex, "down")}
                                disabled={groupIndex === formData.contentGroups.length - 1}
                                className="text-zinc-400 hover:text-sky-400 hover:bg-sky-900/20"
                                title="Move group down"
                            >
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeContentGroup(groupIndex)}
                                className="text-zinc-400 hover:text-red-400 hover:bg-red-900/20"
                                title="Remove group"
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor={`groupTitle-${groupIndex}`}
                            className="text-zinc-300"
                          >
                            Group Title
                          </Label>
                          <Input
                            id={`groupTitle-${groupIndex}`}
                            value={group.title}
                            onChange={(e) =>
                              updateContentGroup(
                                groupIndex,
                                "title",
                                e.target.value,
                              )
                            }
                            placeholder="Content group title (e.g., Introduction, Core Concepts)"
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`groupDescription-${groupIndex}`}
                            className="text-zinc-300"
                          >
                            Group Description (Optional)
                          </Label>
                          <Textarea
                            id={`groupDescription-${groupIndex}`}
                            value={group.description || ""}
                            onChange={(e) =>
                              updateContentGroup(
                                groupIndex,
                                "description",
                                e.target.value,
                              )
                            }
                            placeholder="Brief description of this content group"
                            rows={2}
                            className="bg-zinc-800/50 border-zinc-700 text-white resize-none"
                          />
                        </div>

                        {/* Content Blocks within the group */}
                        <div className="border-t border-zinc-700 pt-4 mt-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h5 className="text-md font-medium text-zinc-300">
                              Content Blocks for "{group.title || `Group ${group.order + 1}`}"
                            </h5>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addContentToGroup(groupIndex)}
                              className="border-sky-700/50 text-sky-400 hover:bg-sky-900/30 hover:text-sky-300"
                            >
                              <Plus className="h-3 w-3 mr-1.5" />
                              Add Block
                            </Button>
                          </div>
                          {group.contents.length === 0 ? (
                            <p className="text-sm text-zinc-500 text-center py-4">
                              No content blocks in this group yet.
                            </p>
                          ) : (
                            group.contents.map((content, contentIndex) => (
                              <Card
                                key={content._id || `content-${groupIndex}-${contentIndex}`}
                                className="border-zinc-600 bg-zinc-800/30"
                              >
                                <CardContent className="p-3 space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="bg-sky-900/40 text-sky-300 px-2 py-0.5 rounded text-xs">
                                      Block {content.order + 1}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => moveContentInGroup(groupIndex, contentIndex, "up")}
                                            disabled={contentIndex === 0}
                                            className="text-zinc-400 hover:text-amber-400 hover:bg-amber-900/20 h-7 w-7"
                                            title="Move block up"
                                        >
                                            <ArrowUp className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => moveContentInGroup(groupIndex, contentIndex, "down")}
                                            disabled={contentIndex === group.contents.length - 1}
                                            className="text-zinc-400 hover:text-amber-400 hover:bg-amber-900/20 h-7 w-7"
                                            title="Move block down"
                                        >
                                            <ArrowDown className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeContentFromGroup(groupIndex,contentIndex)}
                                            className="text-zinc-400 hover:text-red-400 hover:bg-red-900/20 h-7 w-7"
                                            title="Remove block"
                                        >
                                            <Trash className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-zinc-300">Type</Label>
                                    <Select
                                      value={content.type}
                                      onValueChange={(value) =>
                                        updateContentInGroup(
                                          groupIndex,
                                          contentIndex,
                                          "type",
                                          value,
                                        )
                                      }
                                    >
                                      <SelectTrigger className="bg-zinc-700/50 border-zinc-600 text-white">
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-300">
                                        {[
                                          "text",
                                          "image",
                                          "code",
                                          "latex",
                                          "link",
                                          "video",
                                          "youtubeUrl",
                                        ].map((type) => (
                                          <SelectItem
                                            key={type}
                                            value={type}
                                            className="hover:bg-zinc-700 hover:text-white"
                                          >
                                            {type
                                              .charAt(0)
                                              .toUpperCase() + type.slice(1)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-zinc-300">
                                      Content
                                    </Label>
                                    {content.type === "text" || content.type === "code" || content.type === "latex" ? (
                                      <Textarea
                                        value={content.content as string}
                                        onChange={(e) =>
                                          updateContentInGroup(
                                            groupIndex,
                                            contentIndex,
                                            "content",
                                            e.target.value,
                                          )
                                        }
                                        placeholder={`Enter ${content.type} content...`}
                                        rows={content.type === "code" || content.type === "latex" ? 8 : 4}
                                        className="bg-zinc-700/50 border-zinc-600 text-white resize-y font-mono text-sm"
                                      />
                                    ) : (
                                      <Input
                                        value={content.content as string}
                                        onChange={(e) =>
                                          updateContentInGroup(
                                            groupIndex,
                                            contentIndex,
                                            "content",
                                            e.target.value,
                                          )
                                        }
                                        placeholder={
                                          content.type === "image" ? "Enter image URL..." :
                                          content.type === "video" ? "Enter video file URL..." :
                                          content.type === "youtubeUrl" ? "Enter YouTube video URL..." :
                                          content.type === "link" ? "Enter link URL..." :
                                          `Enter ${content.type} content...`
                                        }
                                        className="bg-zinc-700/50 border-zinc-600 text-white"
                                      />
                                    )}
                                     {content.type === "link" && (
                                        <Input
                                            value={(content.content as Record<string, any>)?.text || ''}
                                            onChange={(e) => {
                                                const currentContent = typeof content.content === 'string' ? { url: content.content, text: '' } : { ...(content.content as Record<string, any>) };
                                                updateContentInGroup(groupIndex, contentIndex, "content", { ...currentContent, text: e.target.value });
                                            }}
                                            placeholder="Enter link display text (optional)"
                                            className="bg-zinc-700/50 border-zinc-600 text-white mt-2"
                                        />
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Tab (structure remains the same) */}
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
                    No quiz questions added yet.
                  </div>
                ) : (
                  formData.quiz.map((question, index) => (
                    <Card
                      key={question._id || `quiz-${index}`}
                      className="border-zinc-800 bg-zinc-900/30"
                    >
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="bg-indigo-900/30 text-indigo-400 px-2 py-1 rounded text-xs">
                            Question {index + 1}
                          </span>
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
                            onChange={(e) =>
                              updateQuizQuestion(
                                index,
                                "question",
                                e.target.value,
                              )
                            }
                            placeholder="Enter question..."
                            className="bg-zinc-900/50 border-zinc-800 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-zinc-300">Options</Label>
                          <div className="space-y-2">
                            {question.options.map(
                              (option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className="flex items-center gap-2"
                                >
                                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                    <input
                                      type="radio"
                                      name={`correctAnswer-${index}`}
                                      checked={
                                        question.correctAnswer === optionIndex
                                      }
                                      onChange={() =>
                                        updateQuizQuestion(
                                          index,
                                          "correctAnswer",
                                          optionIndex,
                                        )
                                      }
                                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-zinc-600 bg-zinc-800"
                                    />
                                  </div>
                                  <Input
                                    value={option}
                                    onChange={(e) =>
                                      updateQuizOption(
                                        index,
                                        optionIndex,
                                        e.target.value,
                                      )
                                    }
                                    placeholder={`Option ${optionIndex + 1}`}
                                    className="bg-zinc-900/50 border-zinc-800 text-white"
                                  />
                                </div>
                              ),
                            )}
                          </div>
                          <p className="text-xs text-zinc-500">
                            Select the radio button for the correct answer.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-zinc-300">
                            Explanation (Optional)
                          </Label>
                          <Textarea
                            value={question.explanation || ""}
                            onChange={(e) =>
                              updateQuizQuestion(
                                index,
                                "explanation",
                                e.target.value,
                              )
                            }
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
            onClick={() => router.back()} // Go back to previous page
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || (isLoading && !courses.length)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-70"
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
              ? "Update Lesson"
              : "Create Lesson"}
          </Button>
        </div>
      </form>
    </div>
  )
}