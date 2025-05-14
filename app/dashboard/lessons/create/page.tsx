"use client"

import { useSearchParams } from "next/navigation"
import { LessonForm } from "@/components/dashboard/lesson-form"

export default function CreateLessonPage() {
  const searchParams = useSearchParams()
  const topicId = searchParams.get("topicId") || undefined

  return <LessonForm topicId={topicId} />
}
