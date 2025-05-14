"use client"

import { useSearchParams } from "next/navigation"
import { TopicForm } from "@/components/dashboard/topic-form"

export default function CreateTopicPage() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get("courseId") || undefined

  return <TopicForm courseId={courseId} />
}
