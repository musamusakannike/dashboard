"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!token || !user) {
      router.push("/login")
    }
  }, [token, user, router])

  if (!token || !user) {
    return null
  }

  return <>{children}</>
}
